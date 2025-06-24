/**
 * 보스 기록 관리 서비스
 * 보스 참여 기록 생성, 조회, 수정, 분배 등 보스 관련 기능
 * 의존성: SystemConfig, AuthService, DatabaseUtils, LogUtils
 */

const BossService = {
  
  // ===== 보스 기록 생성 =====
  createRecord: function(recordData, userSession) {
    try {
      // 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.BOSS_RECORD_CREATE)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      LogUtils.info('보스 기록 생성 요청', { 
        bossName: recordData.bossName,
        createdBy: userSession.userId 
      });
      
      // 입력값 검증
      const validation = this.validateRecordData(recordData);
      if (!validation.isValid) {
        return {
          success: false,
          code: RESPONSE_CODES.VALIDATION_ERROR,
          message: validation.errors.join(', ')
        };
      }
      
      // 참여자들 검증
      const participantValidation = this.validateParticipants(recordData.participants);
      if (!participantValidation.isValid) {
        return {
          success: false,
          code: RESPONSE_CODES.VALIDATION_ERROR,
          message: participantValidation.errors.join(', ')
        };
      }
      
      // 보스 정보 확인
      const boss = this.findBossByName(recordData.bossName);
      if (!boss) {
        return {
          success: false,
          code: RESPONSE_CODES.NOT_FOUND,
          message: '등록되지 않은 보스입니다.'
        };
      }
      
      // 각 참여자별로 기록 생성
      const createdRecords = [];
      const baseRecord = {
        id: SecurityUtils.generateUUID(),
        bossId: boss.id,
        bossName: recordData.bossName,
        recordDate: recordData.recordDate || DateUtils.now(),
        notes: StringUtils.safeTrim(recordData.notes || '')
      };
      
      for (const participant of recordData.participants) {
        const participantRecord = {
          ...baseRecord,
          id: SecurityUtils.generateUUID(), // 각 참여자별로 고유 ID
          participantId: participant.userId,
          participantNickname: participant.nickname,
          participantClass: participant.className || '',
          participationStatus: participant.status || PARTICIPATION_STATUS.ATTENDED,
          contribution: NumberUtils.toNumber(participant.contribution, 0)
        };
        
        const savedRecord = DatabaseUtils.saveBossRecord(participantRecord);
        createdRecords.push(savedRecord);
      }
      
      LogUtils.info('보스 기록 생성 완료', { 
        bossName: recordData.bossName,
        participantCount: createdRecords.length,
        createdBy: userSession.userId
      });
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        message: '보스 기록이 성공적으로 생성되었습니다.',
        data: {
          boss: boss,
          records: createdRecords,
          summary: this.generateRecordSummary(createdRecords)
        }
      };
      
    } catch (error) {
      LogUtils.error('보스 기록 생성 오류', { recordData, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 보스 기록 조회 =====
  getRecords: function(userSession, options = {}) {
    try {
      // 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.BOSS_RECORD_READ)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      LogUtils.info('보스 기록 조회 요청', { 
        requesterId: userSession.userId,
        options 
      });
      
      const { 
        page = 1,
        pageSize = SystemConfig.BUSINESS_RULES.DEFAULT_PAGE_SIZE,
        bossName = null,
        participantId = null,
        startDate = null,
        endDate = null,
        sortBy = 'recordDate',
        sortOrder = 'DESC'
      } = options;
      
      // 데이터베이스에서 조회
      const result = DatabaseUtils.getBossRecords({
        page,
        pageSize,
        bossName,
        participantId
      });
      
      // 날짜 필터 적용
      if (startDate || endDate) {
        result.records = this.filterByDateRange(result.records, startDate, endDate);
        result.totalCount = result.records.length;
        result.totalPages = Math.ceil(result.totalCount / pageSize);
      }
      
      // 정렬 적용
      if (sortBy && result.records.length > 0) {
        result.records = this.sortRecords(result.records, sortBy, sortOrder);
      }
      
      // 추가 통계 정보
      result.statistics = this.generateRecordsStatistics(result.records);
      
      LogUtils.info('보스 기록 조회 완료', { 
        totalCount: result.totalCount,
        requesterId: userSession.userId
      });
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        data: result
      };
      
    } catch (error) {
      LogUtils.error('보스 기록 조회 오류', { options, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 보스 기록 수정 =====
  updateRecord: function(recordId, updateData, userSession) {
    try {
      // 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.BOSS_RECORD_UPDATE)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      LogUtils.info('보스 기록 수정 요청', { 
        recordId,
        updateData,
        requesterId: userSession.userId 
      });
      
      // 입력값 검증
      const validation = this.validateUpdateData(updateData);
      if (!validation.isValid) {
        return {
          success: false,
          code: RESPONSE_CODES.VALIDATION_ERROR,
          message: validation.errors.join(', ')
        };
      }
      
      // 기존 기록 찾기
      const existingRecord = this.findRecordById(recordId);
      if (!existingRecord) {
        return {
          success: false,
          code: RESPONSE_CODES.NOT_FOUND,
          message: '보스 기록을 찾을 수 없습니다.'
        };
      }
      
      // 업데이트 데이터 준비
      const updateFields = {
        ...updateData,
        updatedAt: DateUtils.now(),
        updatedBy: userSession.userId
      };
      
      // 기록 업데이트
      const updatedRecord = this.updateRecordInSheet(recordId, updateFields);
      
      LogUtils.info('보스 기록 수정 완료', { 
        recordId,
        requesterId: userSession.userId
      });
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        message: '보스 기록이 성공적으로 수정되었습니다.',
        data: updatedRecord
      };
      
    } catch (error) {
      LogUtils.error('보스 기록 수정 오류', { recordId, updateData, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 보스 기록 삭제 =====
  deleteRecord: function(recordId, userSession) {
    try {
      // 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.BOSS_RECORD_DELETE)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      LogUtils.info('보스 기록 삭제 요청', { 
        recordId,
        requesterId: userSession.userId 
      });
      
      const deletedRecord = this.deleteRecordFromSheet(recordId, userSession.userId);
      
      if (!deletedRecord) {
        return {
          success: false,
          code: RESPONSE_CODES.NOT_FOUND,
          message: '보스 기록을 찾을 수 없습니다.'
        };
      }
      
      LogUtils.info('보스 기록 삭제 완료', { 
        recordId,
        requesterId: userSession.userId
      });
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        message: '보스 기록이 성공적으로 삭제되었습니다.',
        data: deletedRecord
      };
      
    } catch (error) {
      LogUtils.error('보스 기록 삭제 오류', { recordId, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 주간 통계 생성 =====
  generateWeeklyStats: function(userSession, weekYear = null) {
    try {
      // 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.STATS_VIEW)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      if (!weekYear) {
        const now = DateUtils.now();
        weekYear = `${now.getFullYear()}-W${DateUtils.getWeekOfYear(now)}`;
      }
      
      LogUtils.info('주간 통계 생성 요청', { 
        weekYear,
        requesterId: userSession.userId 
      });
      
      // 해당 주의 기록들 조회
      const weekRecords = this.getRecordsForWeek(weekYear);
      
      if (weekRecords.length === 0) {
        return {
          success: true,
          code: RESPONSE_CODES.SUCCESS,
          data: {
            weekYear,
            totalParticipants: 0,
            totalContribution: 0,
            averageContribution: 0,
            topContributor: null,
            records: []
          }
        };
      }
      
      // 통계 계산
      const stats = this.calculateWeeklyStatistics(weekRecords);
      stats.weekYear = weekYear;
      
      // 주간 통계 저장
      this.saveWeeklyStats(stats, userSession.userId);
      
      LogUtils.info('주간 통계 생성 완료', { 
        weekYear,
        totalParticipants: stats.totalParticipants,
        requesterId: userSession.userId
      });
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        data: stats
      };
      
    } catch (error) {
      LogUtils.error('주간 통계 생성 오류', { weekYear, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 참여자별 통계 =====
  getParticipantStatistics: function(userSession, participantId = null, period = 'month') {
    try {
      // 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.STATS_VIEW)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      LogUtils.info('참여자별 통계 조회', { 
        participantId,
        period,
        requesterId: userSession.userId 
      });
      
      // 기간별 데이터 조회
      const records = this.getRecordsForPeriod(period, participantId);
      
      if (participantId) {
        // 특정 참여자 통계
        const stats = this.calculateParticipantStats(records, participantId);
        return {
          success: true,
          code: RESPONSE_CODES.SUCCESS,
          data: stats
        };
      } else {
        // 전체 참여자 순위
        const rankings = this.calculateParticipantRankings(records);
        return {
          success: true,
          code: RESPONSE_CODES.SUCCESS,
          data: {
            period,
            rankings,
            totalRecords: records.length
          }
        };
      }
      
    } catch (error) {
      LogUtils.error('참여자별 통계 조회 오류', { participantId, period, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 보스별 통계 =====
  getBossStatistics: function(userSession, bossName = null, period = 'month') {
    try {
      // 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.STATS_VIEW)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      LogUtils.info('보스별 통계 조회', { 
        bossName,
        period,
        requesterId: userSession.userId 
      });
      
      const records = this.getRecordsForPeriod(period);
      
      if (bossName) {
        // 특정 보스 통계
        const bossRecords = records.filter(r => r.bossName === bossName);
        const stats = this.calculateBossStats(bossRecords, bossName);
        return {
          success: true,
          code: RESPONSE_CODES.SUCCESS,
          data: stats
        };
      } else {
        // 전체 보스 통계
        const bossStats = this.calculateAllBossStats(records);
        return {
          success: true,
          code: RESPONSE_CODES.SUCCESS,
          data: {
            period,
            bossStatistics: bossStats,
            totalRecords: records.length
          }
        };
      }
      
    } catch (error) {
      LogUtils.error('보스별 통계 조회 오류', { bossName, period, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 내부 유틸리티 함수들 =====
  
  // 기록 데이터 검증
  validateRecordData: function(recordData) {
    const errors = [];
    
    if (StringUtils.isEmpty(recordData.bossName)) {
      errors.push('보스 이름은 필수입니다.');
    }
    
    if (!recordData.participants || !Array.isArray(recordData.participants) || 
        recordData.participants.length === 0) {
      errors.push('참여자 정보는 필수입니다.');
    }
    
    if (recordData.recordDate && !DateUtils.isValid(new Date(recordData.recordDate))) {
      errors.push('올바른 날짜 형식이 아닙니다.');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },
  
  // 참여자 검증
  validateParticipants: function(participants) {
    const errors = [];
    
    if (!participants || participants.length === 0) {
      errors.push('최소 1명의 참여자가 필요합니다.');
      return { isValid: false, errors };
    }
    
    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      
      if (StringUtils.isEmpty(participant.userId)) {
        errors.push(`참여자 ${i + 1}: 사용자 ID가 필요합니다.`);
      }
      
      if (StringUtils.isEmpty(participant.nickname)) {
        errors.push(`참여자 ${i + 1}: 닉네임이 필요합니다.`);
      }
      
      if (participant.contribution !== undefined && 
          !NumberUtils.isNumber(participant.contribution)) {
        errors.push(`참여자 ${i + 1}: 기여도는 숫자여야 합니다.`);
      }
      
      if (participant.status && 
          !Object.values(PARTICIPATION_STATUS).includes(participant.status)) {
        errors.push(`참여자 ${i + 1}: 올바르지 않은 참여 상태입니다.`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },
  
  // 업데이트 데이터 검증
  validateUpdateData: function(updateData) {
    const errors = [];
    
    if (updateData.participationStatus && 
        !Object.values(PARTICIPATION_STATUS).includes(updateData.participationStatus)) {
      errors.push('올바르지 않은 참여 상태입니다.');
    }
    
    if (updateData.contribution !== undefined && 
        !NumberUtils.isNumber(updateData.contribution)) {
      errors.push('기여도는 숫자여야 합니다.');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },
  
  // 보스 이름으로 찾기
  findBossByName: function(bossName) {
    const bossList = DatabaseUtils.getBossList(true);
    return bossList.find(boss => boss.name === bossName);
  },
  
  // 기록 요약 생성
  generateRecordSummary: function(records) {
    const totalParticipants = records.length;
    const totalContribution = records.reduce((sum, record) => 
      sum + NumberUtils.toNumber(record.contribution), 0
    );
    const averageContribution = totalParticipants > 0 ? 
      Math.round(totalContribution / totalParticipants) : 0;
    
    return {
      totalParticipants,
      totalContribution,
      averageContribution,
      recordDate: records[0]?.recordDate
    };
  },
  
  // 기록 통계 생성
  generateRecordsStatistics: function(records) {
    const bossGroups = ArrayUtils.groupBy(records, 'bossName');
    const participantGroups = ArrayUtils.groupBy(records, 'participantNickname');
    
    return {
      totalRecords: records.length,
      uniqueBosses: Object.keys(bossGroups).length,
      uniqueParticipants: Object.keys(participantGroups).length,
      totalContribution: records.reduce((sum, r) => sum + NumberUtils.toNumber(r.contribution), 0),
      averageContribution: records.length > 0 ? 
        Math.round(records.reduce((sum, r) => sum + NumberUtils.toNumber(r.contribution), 0) / records.length) : 0
    };
  },
  
  // 날짜 범위로 필터링
  filterByDateRange: function(records, startDate, endDate) {
    return records.filter(record => {
      const recordDate = new Date(record.recordDate);
      if (startDate && recordDate < new Date(startDate)) return false;
      if (endDate && recordDate > new Date(endDate)) return false;
      return true;
    });
  },
  
  // 기록 정렬
  sortRecords: function(records, sortBy, sortOrder = 'DESC') {
    return records.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      // 날짜 정렬
      if (sortBy === 'recordDate') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      // 숫자 정렬
      if (sortBy === 'contribution') {
        aVal = NumberUtils.toNumber(aVal);
        bVal = NumberUtils.toNumber(bVal);
      }
      
      if (sortOrder === 'DESC') {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
      } else {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      }
    });
  },
  
  // 주간 기록 조회
  getRecordsForWeek: function(weekYear) {
    // 실제 구현에서는 데이터베이스에서 해당 주의 기록들을 조회
    const allRecords = DatabaseUtils.getBossRecords({ pageSize: 1000 }).records;
    
    return allRecords.filter(record => {
      const recordDate = new Date(record.recordDate);
      const recordWeekYear = `${recordDate.getFullYear()}-W${DateUtils.getWeekOfYear(recordDate)}`;
      return recordWeekYear === weekYear;
    });
  },
  
  // 기간별 기록 조회
  getRecordsForPeriod: function(period, participantId = null) {
    const now = DateUtils.now();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = DateUtils.addDays(now, -7);
        break;
      case 'month':
        startDate = DateUtils.addDays(now, -30);
        break;
      case 'year':
        startDate = DateUtils.addDays(now, -365);
        break;
      default:
        startDate = DateUtils.addDays(now, -30);
    }
    
    const allRecords = DatabaseUtils.getBossRecords({ 
      pageSize: 1000,
      participantId 
    }).records;
    
    return allRecords.filter(record => 
      new Date(record.recordDate) >= startDate
    );
  },
  
  // 주간 통계 계산
  calculateWeeklyStatistics: function(records) {
    const participantGroups = ArrayUtils.groupBy(records, 'participantNickname');
    const participantStats = Object.keys(participantGroups).map(nickname => {
      const userRecords = participantGroups[nickname];
      const totalContribution = userRecords.reduce((sum, r) => 
        sum + NumberUtils.toNumber(r.contribution), 0
      );
      
      return {
        nickname,
        participationCount: userRecords.length,
        totalContribution
      };
    });
    
    // 기여도순 정렬
    participantStats.sort((a, b) => b.totalContribution - a.totalContribution);
    
    const totalParticipants = Object.keys(participantGroups).length;
    const totalContribution = records.reduce((sum, r) => 
      sum + NumberUtils.toNumber(r.contribution), 0
    );
    
    return {
      totalParticipants,
      totalContribution,
      averageContribution: totalParticipants > 0 ? 
        Math.round(totalContribution / totalParticipants) : 0,
      topContributor: participantStats[0] || null,
      participantStats
    };
  },
  
  // 주간 통계 저장
  saveWeeklyStats: function(stats, createdBy) {
    try {
      const sheet = DatabaseUtils.getOrCreateSheet(SystemConfig.SHEET_NAMES.WEEKLY_STATS);
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      const statsData = {
        weekYear: stats.weekYear,
        totalParticipants: stats.totalParticipants,
        totalContribution: stats.totalContribution,
        averageContribution: stats.averageContribution,
        topContributor: stats.topContributor ? stats.topContributor.nickname : '',
        createdAt: DateUtils.now()
      };
      
      const rowData = DatabaseUtils.objectToRow(headers, statsData);
      sheet.appendRow(rowData);
      
      LogUtils.info('주간 통계 저장 완료', { weekYear: stats.weekYear });
      
    } catch (error) {
      LogUtils.error('주간 통계 저장 오류', { stats, error });
    }
  },
  
  // 기타 구현할 함수들 (간소화)
  findRecordById: function(recordId) {
    // 실제 구현 필요
    return null;
  },
  
  updateRecordInSheet: function(recordId, updateFields) {
    // 실제 구현 필요
    return null;
  },
  
  deleteRecordFromSheet: function(recordId, deletedBy) {
    // 실제 구현 필요
    return null;
  },
  
  calculateParticipantStats: function(records, participantId) {
    // 실제 구현 필요
    return {};
  },
  
  calculateParticipantRankings: function(records) {
    // 실제 구현 필요
    return [];
  },
  
  calculateBossStats: function(records, bossName) {
    // 실제 구현 필요
    return {};
  },
  
  calculateAllBossStats: function(records) {
    // 실제 구현 필요
    return {};
  }
};
