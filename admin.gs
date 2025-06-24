/**
 * 관리자 전용 기능 모듈
 * 게임 설정, 보스 관리, 직업 관리 등 관리자만 접근 가능한 기능들
 * 의존성: SystemConfig, AuthService, DatabaseUtils, LogUtils
 */

const AdminService = {
  
  // ===== 보스 관리 =====
  
  // 보스 생성
  createBoss: function(bossData, userSession) {
    try {
      // 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.SYSTEM_CONFIG)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      LogUtils.info('관리자 보스 생성 요청', { 
        bossName: bossData.name, 
        adminId: userSession.userId 
      });
      
      // 입력값 검증
      const validation = this.validateBossData(bossData);
      if (!validation.isValid) {
        return {
          success: false,
          code: RESPONSE_CODES.VALIDATION_ERROR,
          message: validation.errors.join(', ')
        };
      }
      
      // 중복 확인
      const existingBoss = this.findBossByName(bossData.name);
      if (existingBoss) {
        return {
          success: false,
          code: RESPONSE_CODES.DUPLICATE_ERROR,
          message: '이미 존재하는 보스 이름입니다.'
        };
      }
      
      // 보스 생성
      const newBoss = DatabaseUtils.createBoss(bossData, userSession.userId);
      
      LogUtils.info('보스 생성 완료', { 
        bossId: newBoss.id, 
        bossName: newBoss.name,
        adminId: userSession.userId
      });
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        message: '보스가 성공적으로 생성되었습니다.',
        data: newBoss
      };
      
    } catch (error) {
      LogUtils.error('보스 생성 오류', { bossData, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // 보스 목록 조회
  getBossList: function(userSession, includeInactive = false) {
    try {
      // 기본 권한 확인 (모든 사용자가 보스 목록 조회 가능)
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.BOSS_RECORD_READ)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      const bossList = DatabaseUtils.getBossList(!includeInactive);
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        data: {
          bosses: bossList,
          totalCount: bossList.length
        }
      };
      
    } catch (error) {
      LogUtils.error('보스 목록 조회 오류', error);
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // 보스 수정
  updateBoss: function(bossId, updateData, userSession) {
    try {
      // 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.SYSTEM_CONFIG)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      LogUtils.info('관리자 보스 수정 요청', { 
        bossId, 
        adminId: userSession.userId 
      });
      
      // 입력값 검증
      const validation = this.validateBossData(updateData, false);
      if (!validation.isValid) {
        return {
          success: false,
          code: RESPONSE_CODES.VALIDATION_ERROR,
          message: validation.errors.join(', ')
        };
      }
      
      // 보스 수정
      const updatedBoss = DatabaseUtils.updateBoss(bossId, updateData, userSession.userId);
      
      LogUtils.info('보스 수정 완료', { 
        bossId, 
        adminId: userSession.userId
      });
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        message: '보스가 성공적으로 수정되었습니다.',
        data: updatedBoss
      };
      
    } catch (error) {
      LogUtils.error('보스 수정 오류', { bossId, updateData, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: error.message || MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // 보스 삭제
  deleteBoss: function(bossId, userSession) {
    try {
      // 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.SYSTEM_CONFIG)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      LogUtils.info('관리자 보스 삭제 요청', { 
        bossId, 
        adminId: userSession.userId 
      });
      
      // 보스 삭제 (비활성화)
      const deletedBoss = DatabaseUtils.deleteBoss(bossId, userSession.userId);
      
      LogUtils.info('보스 삭제 완료', { 
        bossId, 
        adminId: userSession.userId
      });
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        message: '보스가 성공적으로 삭제되었습니다.',
        data: deletedBoss
      };
      
    } catch (error) {
      LogUtils.error('보스 삭제 오류', { bossId, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: error.message || MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 직업/클래스 관리 =====
  
  // 직업 생성
  createClass: function(classData, userSession) {
    try {
      // 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.SYSTEM_CONFIG)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      LogUtils.info('관리자 직업 생성 요청', { 
        className: classData.name, 
        adminId: userSession.userId 
      });
      
      // 입력값 검증
      const validation = this.validateClassData(classData);
      if (!validation.isValid) {
        return {
          success: false,
          code: RESPONSE_CODES.VALIDATION_ERROR,
          message: validation.errors.join(', ')
        };
      }
      
      // 중복 확인
      const existingClass = this.findClassByName(classData.name);
      if (existingClass) {
        return {
          success: false,
          code: RESPONSE_CODES.DUPLICATE_ERROR,
          message: '이미 존재하는 직업 이름입니다.'
        };
      }
      
      // 직업 생성
      const newClass = DatabaseUtils.createClass(classData, userSession.userId);
      
      LogUtils.info('직업 생성 완료', { 
        classId: newClass.id, 
        className: newClass.name,
        adminId: userSession.userId
      });
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        message: '직업이 성공적으로 생성되었습니다.',
        data: newClass
      };
      
    } catch (error) {
      LogUtils.error('직업 생성 오류', { classData, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // 직업 목록 조회
  getClassList: function(userSession, includeInactive = false) {
    try {
      // 기본 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.MEMBER_READ)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      const classList = DatabaseUtils.getClassList(!includeInactive);
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        data: {
          classes: classList,
          totalCount: classList.length
        }
      };
      
    } catch (error) {
      LogUtils.error('직업 목록 조회 오류', error);
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 게임 설정 관리 =====
  
  // 게임 설정 저장
  saveGameSettings: function(settings, userSession) {
    try {
      // 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.SYSTEM_CONFIG)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      LogUtils.info('관리자 게임 설정 저장 요청', { 
        settingsCount: Object.keys(settings).length,
        adminId: userSession.userId 
      });
      
      const savedSettings = {};
      
      // 각 설정을 개별적으로 저장
      Object.keys(settings).forEach(key => {
        const setting = settings[key];
        const savedSetting = DatabaseUtils.saveGameSetting(
          key, 
          setting.value, 
          setting.description || '',
          setting.type || 'STRING',
          userSession.userId
        );
        savedSettings[key] = savedSetting;
      });
      
      LogUtils.info('게임 설정 저장 완료', { 
        settingsCount: Object.keys(savedSettings).length,
        adminId: userSession.userId
      });
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        message: '게임 설정이 성공적으로 저장되었습니다.',
        data: savedSettings
      };
      
    } catch (error) {
      LogUtils.error('게임 설정 저장 오류', { settings, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // 게임 설정 조회
  getGameSettings: function(userSession) {
    try {
      // 기본 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.MEMBER_READ)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      const settings = DatabaseUtils.getAllGameSettings();
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        data: {
          settings: settings,
          gameInfo: {
            name: DatabaseUtils.getGameSetting(GAME_SETTINGS.GAME_NAME, '게임 관리 시스템'),
            maxPartySize: NumberUtils.toNumber(DatabaseUtils.getGameSetting(GAME_SETTINGS.MAX_PARTY_SIZE, 8)),
            currencyName: DatabaseUtils.getGameSetting(GAME_SETTINGS.CURRENCY_NAME, '골드')
          }
        }
      };
      
    } catch (error) {
      LogUtils.error('게임 설정 조회 오류', error);
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 유틸리티 및 검증 함수들 =====
  
  // 보스 데이터 검증
  validateBossData: function(bossData, isCreate = true) {
    const errors = [];
    
    if (isCreate && StringUtils.isEmpty(bossData.name)) {
      errors.push('보스 이름은 필수입니다.');
    }
    
    if (bossData.name && !StringUtils.isValidLength(bossData.name, 2, 50)) {
      errors.push('보스 이름은 2-50자여야 합니다.');
    }
    
    if (bossData.type && !Object.values(BOSS_TYPES).includes(bossData.type)) {
      errors.push('올바르지 않은 보스 타입입니다.');
    }
    
    if (bossData.difficulty && !Object.values(DIFFICULTY_LEVELS).includes(bossData.difficulty)) {
      errors.push('올바르지 않은 난이도입니다.');
    }
    
    if (bossData.maxParticipants !== undefined && 
        (!NumberUtils.isNumber(bossData.maxParticipants) || bossData.maxParticipants < 0)) {
      errors.push('최대 참여자 수는 0 이상의 숫자여야 합니다.');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },
  
  // 직업 데이터 검증
  validateClassData: function(classData, isCreate = true) {
    const errors = [];
    
    if (isCreate && StringUtils.isEmpty(classData.name)) {
      errors.push('직업 이름은 필수입니다.');
    }
    
    if (classData.name && !StringUtils.isValidLength(classData.name, 2, 30)) {
      errors.push('직업 이름은 2-30자여야 합니다.');
    }
    
    if (classData.type && !StringUtils.isValidLength(classData.type, 0, 20)) {
      errors.push('직업 타입은 20자 이하여야 합니다.');
    }
    
    if (classData.description && !StringUtils.isValidLength(classData.description, 0, 200)) {
      errors.push('직업 설명은 200자 이하여야 합니다.');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },
  
  // 보스 이름으로 찾기
  findBossByName: function(name) {
    try {
      const bossList = DatabaseUtils.getBossList(false); // 모든 보스 포함
      return bossList.find(boss => boss.name === name);
    } catch (error) {
      LogUtils.error('보스 이름 검색 오류', { name, error });
      return null;
    }
  },
  
  // 직업 이름으로 찾기
  findClassByName: function(name) {
    try {
      const classList = DatabaseUtils.getClassList(false); // 모든 직업 포함
      return classList.find(classInfo => classInfo.name === name);
    } catch (error) {
      LogUtils.error('직업 이름 검색 오류', { name, error });
      return null;
    }
  }
};
