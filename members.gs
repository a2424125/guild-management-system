/**
 * 회원 관리 서비스
 * 회원 정보 조회, 수정, 통계 등 회원 관련 기능
 * 의존성: SystemConfig, AuthService, DatabaseUtils, LogUtils
 */

const MemberService = {
  
  // ===== 회원 목록 조회 =====
  getMembers: function(userSession, options = {}) {
    try {
      // 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.MEMBER_READ)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      LogUtils.info('회원 목록 조회 요청', { 
        requesterId: userSession.userId,
        options 
      });
      
      const { 
        page = 1,
        pageSize = SystemConfig.BUSINESS_RULES.DEFAULT_PAGE_SIZE,
        role = null,
        status = 'ACTIVE',
        searchTerm = null
      } = options;
      
      // 캐시 키 생성
      const cacheKey = `${CACHE_KEYS.MEMBERS_LIST}_${page}_${pageSize}_${role || 'all'}_${status}_${searchTerm || 'all'}`;
      const cached = CacheUtils.get(cacheKey);
      if (cached) {
        return {
          success: true,
          code: RESPONSE_CODES.SUCCESS,
          data: cached
        };
      }
      
      const sheet = DatabaseUtils.getOrCreateSheet(SystemConfig.SHEET_NAMES.MEMBERS);
      const data = sheet.getDataRange().getValues();
      
      if (data.length <= 1) {
        return {
          success: true,
          code: RESPONSE_CODES.SUCCESS,
          data: {
            members: [],
            totalCount: 0,
            currentPage: page,
            totalPages: 0
          }
        };
      }
      
      const headers = data[0];
      let members = [];
      
      // 데이터 변환 및 필터링
      for (let i = 1; i < data.length; i++) {
        const member = DatabaseUtils.rowToObject(headers, data[i]);
        
        // 비밀번호 제거
        delete member.password;
        
        // 필터 적용
        if (status && member.status !== status) continue;
        if (role && member.role !== role) continue;
        if (searchTerm && !this.matchesSearchTerm(member, searchTerm)) continue;
        
        // 추가 정보 계산
        member.isActive = member.status === 'ACTIVE';
        member.daysSinceJoin = DateUtils.diffInDays(member.joinDate, DateUtils.now());
        member.lastLoginFormatted = member.lastLogin ? 
          DateUtils.getRelativeTime(member.lastLogin) : '없음';
        
        members.push(member);
      }
      
      // 정렬 (최근 가입순)
      members.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));
      
      // 페이징
      const totalCount = members.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedMembers = members.slice(startIndex, endIndex);
      
      const result = {
        members: paginatedMembers,
        totalCount,
        currentPage: page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        summary: this.generateMemberSummary(members)
      };
      
      // 캐시 저장
      CacheUtils.set(cacheKey, result, 180);
      
      LogUtils.info('회원 목록 조회 완료', { 
        totalCount,
        requesterId: userSession.userId
      });
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        data: result
      };
      
    } catch (error) {
      LogUtils.error('회원 목록 조회 오류', { options, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 회원 상세 정보 조회 =====
  getMemberDetail: function(memberId, userSession) {
    try {
      // 권한 확인 (본인 또는 읽기 권한)
      const canRead = userSession.userId === memberId || 
        AuthService.checkPermission(userSession.role, PERMISSIONS.MEMBER_READ);
      
      if (!canRead) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      LogUtils.info('회원 상세 정보 조회', { 
        memberId,
        requesterId: userSession.userId 
      });
      
      const member = DatabaseUtils.findUserById(memberId);
      if (!member) {
        return {
          success: false,
          code: RESPONSE_CODES.NOT_FOUND,
          message: '회원을 찾을 수 없습니다.'
        };
      }
      
      // 비밀번호 제거
      const sanitizedMember = AuthService.sanitizeUserData(member);
      
      // 추가 통계 정보
      const memberStats = this.getMemberStatistics(memberId);
      
      const result = {
        member: sanitizedMember,
        statistics: memberStats,
        permissions: AuthService.getUserPermissions(member.role)
      };
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        data: result
      };
      
    } catch (error) {
      LogUtils.error('회원 상세 정보 조회 오류', { memberId, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 회원 정보 수정 =====
  updateMember: function(memberId, updateData, userSession) {
    try {
      // 권한 확인 (본인 또는 수정 권한)
      const canUpdate = userSession.userId === memberId || 
        AuthService.checkPermission(userSession.role, PERMISSIONS.MEMBER_UPDATE);
      
      if (!canUpdate) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      LogUtils.info('회원 정보 수정 요청', { 
        memberId,
        updateData: ObjectUtils.omit(updateData, ['password']),
        requesterId: userSession.userId 
      });
      
      // 입력값 검증
      const validation = this.validateUpdateData(updateData, userSession.userId === memberId);
      if (!validation.isValid) {
        return {
          success: false,
          code: RESPONSE_CODES.VALIDATION_ERROR,
          message: validation.errors.join(', ')
        };
      }
      
      // 기존 회원 정보 확인
      const existingMember = DatabaseUtils.findUserById(memberId);
      if (!existingMember) {
        return {
          success: false,
          code: RESPONSE_CODES.NOT_FOUND,
          message: '회원을 찾을 수 없습니다.'
        };
      }
      
      // 닉네임 중복 확인 (변경하는 경우)
      if (updateData.nickname && updateData.nickname !== existingMember.nickname) {
        const duplicateUser = DatabaseUtils.findUserByNickname(updateData.nickname);
        if (duplicateUser && duplicateUser.id !== memberId) {
          return {
            success: false,
            code: RESPONSE_CODES.DUPLICATE_ERROR,
            message: '이미 사용중인 닉네임입니다.'
          };
        }
      }
      
      // 이메일 중복 확인 (변경하는 경우)
      if (updateData.email && updateData.email !== existingMember.email) {
        const duplicateUser = DatabaseUtils.findUserByEmail(updateData.email);
        if (duplicateUser && duplicateUser.id !== memberId) {
          return {
            success: false,
            code: RESPONSE_CODES.DUPLICATE_ERROR,
            message: '이미 사용중인 이메일입니다.'
          };
        }
      }
      
      // 업데이트 데이터 준비
      const updateFields = ObjectUtils.omit(updateData, ['id', 'joinDate', 'createdAt']);
      
      // 비밀번호 해시화 (변경하는 경우)
      if (updateFields.password) {
        updateFields.password = SecurityUtils.hashPassword(updateFields.password);
      }
      
      updateFields.updatedAt = DateUtils.now();
      
      // 데이터 업데이트
      const updatedMember = ObjectUtils.merge(existingMember, updateFields);
      DatabaseUtils.saveUser(updatedMember);
      
      LogUtils.info('회원 정보 수정 완료', { 
        memberId,
        requesterId: userSession.userId
      });
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        message: '회원 정보가 성공적으로 수정되었습니다.',
        data: {
          member: AuthService.sanitizeUserData(updatedMember)
        }
      };
      
    } catch (error) {
      LogUtils.error('회원 정보 수정 오류', { memberId, updateData, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 회원 비활성화 =====
  deactivateMember: function(memberId, userSession) {
    try {
      // 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.MEMBER_DELETE)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      // 자기 자신은 비활성화 불가
      if (userSession.userId === memberId) {
        return {
          success: false,
          code: RESPONSE_CODES.VALIDATION_ERROR,
          message: '자기 자신은 비활성화할 수 없습니다.'
        };
      }
      
      LogUtils.info('회원 비활성화 요청', { 
        memberId,
        requesterId: userSession.userId 
      });
      
      const result = this.updateMember(memberId, { 
        status: 'INACTIVE',
        deactivatedBy: userSession.userId,
        deactivatedAt: DateUtils.now()
      }, userSession);
      
      if (result.success) {
        result.message = '회원이 성공적으로 비활성화되었습니다.';
        
        // 해당 사용자의 모든 세션 무효화
        this.invalidateUserSessions(memberId);
        
        LogUtils.info('회원 비활성화 완료', { 
          memberId,
          requesterId: userSession.userId
        });
      }
      
      return result;
      
    } catch (error) {
      LogUtils.error('회원 비활성화 오류', { memberId, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 회원 통계 =====
  getMemberStatistics: function(memberId) {
    try {
      // 보스 참여 기록 통계
      const bossRecords = DatabaseUtils.getBossRecords({ participantId: memberId });
      const totalBossRecords = bossRecords.totalCount;
      
      // 최근 활동 (최근 30일)
      const recentDate = DateUtils.addDays(DateUtils.now(), -30);
      const recentRecords = bossRecords.records.filter(record => 
        new Date(record.recordDate) >= recentDate
      );
      
      // 기여도 계산
      const totalContribution = bossRecords.records.reduce((sum, record) => 
        sum + NumberUtils.toNumber(record.contribution), 0
      );
      
      const averageContribution = totalBossRecords > 0 ? 
        Math.round(totalContribution / totalBossRecords) : 0;
      
      return {
        totalParticipations: totalBossRecords,
        recentParticipations: recentRecords.length,
        totalContribution: totalContribution,
        averageContribution: averageContribution,
        lastActivity: bossRecords.records.length > 0 ? 
          DateUtils.getRelativeTime(bossRecords.records[0].recordDate) : '없음'
      };
      
    } catch (error) {
      LogUtils.error('회원 통계 조회 오류', { memberId, error });
      return {
        totalParticipations: 0,
        recentParticipations: 0,
        totalContribution: 0,
        averageContribution: 0,
        lastActivity: '없음'
      };
    }
  },
  
  // ===== 회원 요약 정보 생성 =====
  generateMemberSummary: function(members) {
    const summary = {
      totalMembers: members.length,
      activeMembers: members.filter(m => m.status === 'ACTIVE').length,
      roleDistribution: {},
      recentJoins: members.filter(m => 
        DateUtils.diffInDays(m.joinDate, DateUtils.now()) <= 7
      ).length
    };
    
    // 역할별 분포
    members.forEach(member => {
      summary.roleDistribution[member.role] = 
        (summary.roleDistribution[member.role] || 0) + 1;
    });
    
    return summary;
  },
  
  // ===== 회원 검색 =====
  searchMembers: function(searchTerm, userSession) {
    try {
      // 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.MEMBER_READ)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      if (StringUtils.isEmpty(searchTerm) || searchTerm.length < 2) {
        return {
          success: false,
          code: RESPONSE_CODES.VALIDATION_ERROR,
          message: '검색어는 2글자 이상 입력해주세요.'
        };
      }
      
      LogUtils.info('회원 검색 요청', { 
        searchTerm,
        requesterId: userSession.userId 
      });
      
      return this.getMembers(userSession, { 
        searchTerm,
        pageSize: 50 // 검색 시 더 많은 결과 반환
      });
      
    } catch (error) {
      LogUtils.error('회원 검색 오류', { searchTerm, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 비활성 회원 조회 =====
  getInactiveMembers: function(userSession, daysSinceLastLogin = 30) {
    try {
      // 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.MEMBER_READ)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      LogUtils.info('비활성 회원 조회', { 
        daysSinceLastLogin,
        requesterId: userSession.userId 
      });
      
      const cutoffDate = DateUtils.addDays(DateUtils.now(), -daysSinceLastLogin);
      
      const sheet = DatabaseUtils.getOrCreateSheet(SystemConfig.SHEET_NAMES.MEMBERS);
      const data = sheet.getDataRange().getValues();
      
      if (data.length <= 1) {
        return {
          success: true,
          code: RESPONSE_CODES.SUCCESS,
          data: { inactiveMembers: [], totalCount: 0 }
        };
      }
      
      const headers = data[0];
      const inactiveMembers = [];
      
      for (let i = 1; i < data.length; i++) {
        const member = DatabaseUtils.rowToObject(headers, data[i]);
        
        // 활성 회원만 확인
        if (member.status !== 'ACTIVE') continue;
        
        // 마지막 로그인이 없거나 기준일보다 이전인 경우
        if (!member.lastLogin || new Date(member.lastLogin) < cutoffDate) {
          delete member.password;
          member.daysSinceLastLogin = member.lastLogin ? 
            DateUtils.diffInDays(member.lastLogin, DateUtils.now()) : 
            DateUtils.diffInDays(member.joinDate, DateUtils.now());
          
          inactiveMembers.push(member);
        }
      }
      
      // 비활성 기간순 정렬
      inactiveMembers.sort((a, b) => b.daysSinceLastLogin - a.daysSinceLastLogin);
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        data: {
          inactiveMembers,
          totalCount: inactiveMembers.length,
          criteria: `${daysSinceLastLogin}일 이상 미접속`
        }
      };
      
    } catch (error) {
      LogUtils.error('비활성 회원 조회 오류', { daysSinceLastLogin, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 내부 유틸리티 함수들 =====
  
  // 검색어 매칭
  matchesSearchTerm: function(member, searchTerm) {
    const term = searchTerm.toLowerCase();
    return (
      member.nickname.toLowerCase().includes(term) ||
      member.email.toLowerCase().includes(term) ||
      member.role.toLowerCase().includes(term)
    );
  },
  
  // 업데이트 데이터 검증
  validateUpdateData: function(updateData, isSelfUpdate = false) {
    const errors = [];
    
    // 닉네임 검증
    if (updateData.nickname && !StringUtils.isValidNickname(updateData.nickname)) {
      errors.push('닉네임은 한글/영문/숫자 2-20자여야 합니다.');
    }
    
    // 이메일 검증
    if (updateData.email && !StringUtils.isValidEmail(updateData.email)) {
      errors.push('올바른 이메일 형식이 아닙니다.');
    }
    
    // 비밀번호 검증
    if (updateData.password && !StringUtils.isValidPassword(updateData.password)) {
      errors.push(`비밀번호는 ${SystemConfig.BUSINESS_RULES.PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`);
    }
    
    // 본인 수정이 아닌 경우 역할/상태 변경 제한
    if (!isSelfUpdate) {
      if (updateData.role && !Object.values(USER_ROLES).includes(updateData.role)) {
        errors.push('올바르지 않은 역할입니다.');
      }
    } else {
      // 본인은 역할/상태 변경 불가
      if (updateData.role || updateData.status) {
        errors.push('본인의 역할이나 상태는 변경할 수 없습니다.');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },
  
  // 사용자 세션 무효화
  invalidateUserSessions: function(userId) {
    try {
      // 캐시에서 해당 사용자의 세션들을 찾아서 삭제
      // 실제 구현에서는 세션 저장 방식에 따라 다를 수 있음
      LogUtils.info('사용자 세션 무효화', { userId });
    } catch (error) {
      LogUtils.error('세션 무효화 오류', { userId, error });
    }
  }
};
