/**
 * 데이터베이스 유틸리티
 * Google Sheets를 데이터베이스로 사용하는 통합 관리 시스템
 * 의존성: SystemConfig, LogUtils, SecurityUtils, StringUtils, DateUtils
 */

const DatabaseUtils = {
  
  // ===== 연결 확인 =====
  checkConnection: function() {
    try {
      const spreadsheet = SpreadsheetApp.openById(SystemConfig.SPREADSHEET_ID);
      return {
        status: 'connected',
        spreadsheetName: spreadsheet.getName(),
        lastModified: spreadsheet.getLastUpdated()
      };
    } catch (error) {
      LogUtils.error('데이터베이스 연결 실패', error);
      return {
        status: 'disconnected',
        error: error.message
      };
    }
  },
  
  // ===== 시트 초기화 =====
  initializeSheets: function() {
    try {
      LogUtils.info('시트 초기화 시작');
      
      const spreadsheet = SpreadsheetApp.openById(SystemConfig.SPREADSHEET_ID);
      const sheetConfigs = [
        {
          name: SystemConfig.SHEET_NAMES.MEMBERS,
          headers: ['id', 'nickname', 'password', 'email', 'role', 'status', 'joinDate', 'lastLogin', 'createdAt', 'updatedAt']
        },
        {
          name: SystemConfig.SHEET_NAMES.BOSS_RECORDS,
          headers: ['id', 'bossId', 'bossName', 'participantId', 'participantNickname', 'participantClass', 'participationStatus', 'contribution', 'recordDate', 'notes', 'createdAt']
        },
        {
          name: SystemConfig.SHEET_NAMES.GUILD_FUNDS,
          headers: ['id', 'transactionType', 'amount', 'description', 'transactionDate', 'createdBy', 'createdAt']
        },
        {
          name: SystemConfig.SHEET_NAMES.DISTRIBUTION,
          headers: ['id', 'totalAmount', 'participantCount', 'distributionMethod', 'distributionDate', 'details', 'createdBy', 'createdAt']
        },
        {
          name: SystemConfig.SHEET_NAMES.WEEKLY_STATS,
          headers: ['weekYear', 'totalParticipants', 'totalContribution', 'averageContribution', 'topContributor', 'createdAt']
        },
        {
          name: SystemConfig.SHEET_NAMES.BOSS_LIST,
          headers: ['id', 'name', 'type', 'difficulty', 'maxParticipants', 'description', 'isActive', 'createdBy', 'createdAt', 'updatedAt']
        },
        {
          name: SystemConfig.SHEET_NAMES.CLASS_LIST,
          headers: ['id', 'name', 'type', 'description', 'isActive', 'createdBy', 'createdAt', 'updatedAt']
        },
        {
          name: SystemConfig.SHEET_NAMES.GAME_SETTINGS,
          headers: ['key', 'value', 'description', 'type', 'updatedBy', 'updatedAt']
        },
        {
          name: SystemConfig.SHEET_NAMES.PERMISSIONS,
          headers: ['role', 'permissions', 'description', 'updatedAt']
        },
        {
          name: SystemConfig.SHEET_NAMES.SYSTEM_SETTINGS,
          headers: ['key', 'value', 'description', 'updatedAt']
        },
        {
          name: SystemConfig.SHEET_NAMES.SYSTEM_LOGS,
          headers: ['timestamp', 'level', 'message', 'data', 'user']
        }
      ];
      
      sheetConfigs.forEach(config => {
        this.getOrCreateSheet(config.name, config.headers);
      });
      
      LogUtils.info('시트 초기화 완료');
      return { success: true, message: '모든 시트가 초기화되었습니다.' };
      
    } catch (error) {
      LogUtils.error('시트 초기화 오류', error);
      return { success: false, message: error.message };
    }
  },
  
  // ===== 시트 가져오기 또는 생성 =====
  getOrCreateSheet: function(sheetName, headers = []) {
    try {
      const spreadsheet = SpreadsheetApp.openById(SystemConfig.SPREADSHEET_ID);
      let sheet = spreadsheet.getSheetByName(sheetName);
      
      if (!sheet) {
        // 시트 생성
        sheet = spreadsheet.insertSheet(sheetName);
        LogUtils.info('새 시트 생성', { sheetName });
        
        // 헤더 설정
        if (headers.length > 0) {
          sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
          sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
          sheet.setFrozenRows(1);
          LogUtils.info('시트 헤더 설정 완료', { sheetName, headers });
        }
      }
      
      return sheet;
      
    } catch (error) {
      LogUtils.error('시트 생성/조회 오류', { sheetName, error });
      throw error;
    }
  },
  
  // ===== 사용자 관련 DB 함수들 =====
  
  // 닉네임으로 사용자 조회
  findUserByNickname: function(nickname) {
    try {
      const cacheKey = `user_by_nickname_${nickname}`;
      const cachedUser = CacheUtils.get(cacheKey);
      if (cachedUser) {
        return cachedUser;
      }
      
      const sheet = this.getOrCreateSheet(SystemConfig.SHEET_NAMES.MEMBERS);
      const data = sheet.getDataRange().getValues();
      
      if (data.length <= 1) return null; // 헤더만 있음
      
      const headers = data[0];
      const nicknameIndex = headers.indexOf('nickname');
      
      if (nicknameIndex === -1) {
        LogUtils.error('nickname 컬럼을 찾을 수 없음');
        return null;
      }
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][nicknameIndex] === nickname) {
          const user = this.rowToObject(headers, data[i]);
          CacheUtils.set(cacheKey, user, 300); // 5분 캐시
          return user;
        }
      }
      
      return null;
      
    } catch (error) {
      LogUtils.error('닉네임으로 사용자 조회 오류', { nickname, error });
      return null;
    }
  },
  
  // ID로 사용자 조회
  findUserById: function(id) {
    try {
      const cacheKey = `user_by_id_${id}`;
      const cachedUser = CacheUtils.get(cacheKey);
      if (cachedUser) {
        return cachedUser;
      }
      
      const sheet = this.getOrCreateSheet(SystemConfig.SHEET_NAMES.MEMBERS);
      const data = sheet.getDataRange().getValues();
      
      if (data.length <= 1) return null;
      
      const headers = data[0];
      const idIndex = headers.indexOf('id');
      
      if (idIndex === -1) {
        LogUtils.error('id 컬럼을 찾을 수 없음');
        return null;
      }
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][idIndex] === id) {
          const user = this.rowToObject(headers, data[i]);
          CacheUtils.set(cacheKey, user, 300);
          return user;
        }
      }
      
      return null;
      
    } catch (error) {
      LogUtils.error('ID로 사용자 조회 오류', { id, error });
      return null;
    }
  },
  
  // 이메일로 사용자 조회
  findUserByEmail: function(email) {
    try {
      if (StringUtils.isEmpty(email)) return null;
      
      const sheet = this.getOrCreateSheet(SystemConfig.SHEET_NAMES.MEMBERS);
      const data = sheet.getDataRange().getValues();
      
      if (data.length <= 1) return null;
      
      const headers = data[0];
      const emailIndex = headers.indexOf('email');
      
      if (emailIndex === -1) {
        LogUtils.error('email 컬럼을 찾을 수 없음');
        return null;
      }
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][emailIndex] === email) {
          return this.rowToObject(headers, data[i]);
        }
      }
      
      return null;
      
    } catch (error) {
      LogUtils.error('이메일로 사용자 조회 오류', { email, error });
      return null;
    }
  },
  
  // 역할로 사용자 조회 (첫 번째 사용자만)
  findUserByRole: function(role) {
    try {
      const sheet = this.getOrCreateSheet(SystemConfig.SHEET_NAMES.MEMBERS);
      const data = sheet.getDataRange().getValues();
      
      if (data.length <= 1) return null;
      
      const headers = data[0];
      const roleIndex = headers.indexOf('role');
      
      if (roleIndex === -1) {
        LogUtils.error('role 컬럼을 찾을 수 없음');
        return null;
      }
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][roleIndex] === role) {
          return this.rowToObject(headers, data[i]);
        }
      }
      
      return null;
      
    } catch (error) {
      LogUtils.error('역할로 사용자 조회 오류', { role, error });
      return null;
    }
  },
  
  // 사용자 저장
  saveUser: function(user) {
    try {
      LogUtils.info('사용자 저장 시작', { userId: user.id, nickname: user.nickname });
      
      const sheet = this.getOrCreateSheet(SystemConfig.SHEET_NAMES.MEMBERS);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      // 기존 사용자인지 확인
      const existingUserRowIndex = this.findUserRowIndex(sheet, 'id', user.id);
      
      if (existingUserRowIndex > 0) {
        // 기존 사용자 업데이트
        user.updatedAt = DateUtils.now();
        const rowData = this.objectToRow(headers, user);
        sheet.getRange(existingUserRowIndex, 1, 1, rowData.length).setValues([rowData]);
        LogUtils.info('기존 사용자 업데이트 완료', { userId: user.id });
      } else {
        // 새 사용자 추가
        const rowData = this.objectToRow(headers, user);
        sheet.appendRow(rowData);
        LogUtils.info('새 사용자 추가 완료', { userId: user.id });
      }
      
      // 캐시 무효화
      this.invalidateUserCache(user);
      
      return user;
      
    } catch (error) {
      LogUtils.error('사용자 저장 오류', { user, error });
      throw error;
    }
  },
  
  // 마지막 로그인 시간 업데이트
  updateLastLogin: function(userId) {
    try {
      const sheet = this.getOrCreateSheet(SystemConfig.SHEET_NAMES.MEMBERS);
      const rowIndex = this.findUserRowIndex(sheet, 'id', userId);
      
      if (rowIndex > 0) {
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const lastLoginIndex = headers.indexOf('lastLogin');
        
        if (lastLoginIndex >= 0) {
          const now = DateUtils.now();
          sheet.getRange(rowIndex, lastLoginIndex + 1).setValue(now);
          LogUtils.info('마지막 로그인 시간 업데이트', { userId, lastLogin: now });
          
          // 캐시 무효화
          CacheUtils.remove(`user_by_id_${userId}`);
          
          return true;
        }
      }
      
      return false;
      
    } catch (error) {
      LogUtils.error('마지막 로그인 시간 업데이트 오류', { userId, error });
      return false;
    }
  },
  
  // ===== 보스 기록 관련 DB 함수들 =====
  
  // 보스 기록 저장
  saveBossRecord: function(record) {
    try {
      LogUtils.info('보스 기록 저장 시작', { recordId: record.id, bossName: record.bossName });
      
      const sheet = this.getOrCreateSheet(SystemConfig.SHEET_NAMES.BOSS_RECORDS);
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      record.createdAt = DateUtils.now();
      const rowData = this.objectToRow(headers, record);
      sheet.appendRow(rowData);
      
      LogUtils.info('보스 기록 저장 완료', { recordId: record.id });
      
      // 캐시 무효화
      CacheUtils.remove(CACHE_KEYS.BOSS_RECORDS);
      
      return record;
      
    } catch (error) {
      LogUtils.error('보스 기록 저장 오류', { record, error });
      throw error;
    }
  },
  
  // 보스 기록 조회 (페이징)
  getBossRecords: function(options = {}) {
    try {
      const { 
        page = 1, 
        pageSize = SystemConfig.BUSINESS_RULES.DEFAULT_PAGE_SIZE,
        bossName = null,
        participantId = null 
      } = options;
      
      const cacheKey = `boss_records_${page}_${pageSize}_${bossName || 'all'}_${participantId || 'all'}`;
      const cached = CacheUtils.get(cacheKey);
      if (cached) {
        return cached;
      }
      
      const sheet = this.getOrCreateSheet(SystemConfig.SHEET_NAMES.BOSS_RECORDS);
      const data = sheet.getDataRange().getValues();
      
      if (data.length <= 1) {
        return { records: [], totalCount: 0, currentPage: page, totalPages: 0 };
      }
      
      const headers = data[0];
      let records = [];
      
      // 데이터 변환 및 필터링
      for (let i = 1; i < data.length; i++) {
        const record = this.rowToObject(headers, data[i]);
        
        // 필터 적용
        if (bossName && record.bossName !== bossName) continue;
        if (participantId && record.participantId !== participantId) continue;
        
        records.push(record);
      }
      
      // 정렬 (최신순)
      records.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));
      
      // 페이징
      const totalCount = records.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedRecords = records.slice(startIndex, endIndex);
      
      const result = {
        records: paginatedRecords,
        totalCount,
        currentPage: page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
      
      CacheUtils.set(cacheKey, result, 180); // 3분 캐시
      return result;
      
    } catch (error) {
      LogUtils.error('보스 기록 조회 오류', { options, error });
      return { records: [], totalCount: 0, currentPage: 1, totalPages: 0 };
    }
  },
  
  // ===== 관리자용 보스 관리 =====
  
  // 보스 생성
  createBoss: function(bossData, createdBy) {
    try {
      LogUtils.info('보스 생성 시작', { bossName: bossData.name, createdBy });
      
      const sheet = this.getOrCreateSheet(SystemConfig.SHEET_NAMES.BOSS_LIST);
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      const newBoss = {
        id: SecurityUtils.generateUUID(),
        name: StringUtils.safeTrim(bossData.name),
        type: bossData.type || BOSS_TYPES.CUSTOM,
        difficulty: bossData.difficulty || DIFFICULTY_LEVELS.NORMAL,
        maxParticipants: NumberUtils.toNumber(bossData.maxParticipants, 0),
        description: StringUtils.safeTrim(bossData.description || ''),
        isActive: bossData.isActive !== false,
        createdBy: createdBy,
        createdAt: DateUtils.now(),
        updatedAt: DateUtils.now()
      };
      
      const rowData = this.objectToRow(headers, newBoss);
      sheet.appendRow(rowData);
      
      // 캐시 무효화
      CacheUtils.remove(CACHE_KEYS.BOSS_LIST);
      
      LogUtils.info('보스 생성 완료', { bossId: newBoss.id, bossName: newBoss.name });
      return newBoss;
      
    } catch (error) {
      LogUtils.error('보스 생성 오류', { bossData, error });
      throw error;
    }
  },
  
  // 보스 목록 조회
  getBossList: function(activeOnly = true) {
    try {
      const cacheKey = `${CACHE_KEYS.BOSS_LIST}_${activeOnly}`;
      const cached = CacheUtils.get(cacheKey);
      if (cached) {
        return cached;
      }
      
      const sheet = this.getOrCreateSheet(SystemConfig.SHEET_NAMES.BOSS_LIST);
      const data = sheet.getDataRange().getValues();
      
      if (data.length <= 1) {
        return [];
      }
      
      const headers = data[0];
      const bosses = [];
      
      for (let i = 1; i < data.length; i++) {
        const boss = this.rowToObject(headers, data[i]);
        
        if (activeOnly && !boss.isActive) continue;
        
        bosses.push(boss);
      }
      
      // 이름순 정렬
      bosses.sort((a, b) => a.name.localeCompare(b.name));
      
      CacheUtils.set(cacheKey, bosses, 300);
      return bosses;
      
    } catch (error) {
      LogUtils.error('보스 목록 조회 오류', { activeOnly, error });
      return [];
    }
  },
  
  // 보스 수정
  updateBoss: function(bossId, updateData, updatedBy) {
    try {
      LogUtils.info('보스 수정 시작', { bossId, updatedBy });
      
      const sheet = this.getOrCreateSheet(SystemConfig.SHEET_NAMES.BOSS_LIST);
      const rowIndex = this.findRowIndex(sheet, 'id', bossId);
      
      if (rowIndex <= 0) {
        throw new Error('수정할 보스를 찾을 수 없습니다.');
      }
      
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const currentData = this.rowToObject(headers, sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0]);
      
      // 업데이트 데이터 병합
      const updatedBoss = ObjectUtils.merge(currentData, updateData, {
        updatedAt: DateUtils.now(),
        updatedBy: updatedBy
      });
      
      const rowData = this.objectToRow(headers, updatedBoss);
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      
      // 캐시 무효화
      CacheUtils.remove(CACHE_KEYS.BOSS_LIST);
      
      LogUtils.info('보스 수정 완료', { bossId });
      return updatedBoss;
      
    } catch (error) {
      LogUtils.error('보스 수정 오류', { bossId, updateData, error });
      throw error;
    }
  },
  
  // 보스 삭제 (비활성화)
  deleteBoss: function(bossId, deletedBy) {
    try {
      return this.updateBoss(bossId, { 
        isActive: false,
        deletedBy: deletedBy,
        deletedAt: DateUtils.now()
      }, deletedBy);
    } catch (error) {
      LogUtils.error('보스 삭제 오류', { bossId, error });
      throw error;
    }
  },
  
  // ===== 관리자용 직업/클래스 관리 =====
  
  // 직업 생성
  createClass: function(classData, createdBy) {
    try {
      LogUtils.info('직업 생성 시작', { className: classData.name, createdBy });
      
      const sheet = this.getOrCreateSheet(SystemConfig.SHEET_NAMES.CLASS_LIST);
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      const newClass = {
        id: SecurityUtils.generateUUID(),
        name: StringUtils.safeTrim(classData.name),
        type: StringUtils.safeTrim(classData.type || ''),
        description: StringUtils.safeTrim(classData.description || ''),
        isActive: classData.isActive !== false,
        createdBy: createdBy,
        createdAt: DateUtils.now(),
        updatedAt: DateUtils.now()
      };
      
      const rowData = this.objectToRow(headers, newClass);
      sheet.appendRow(rowData);
      
      // 캐시 무효화
      CacheUtils.remove('class_list');
      
      LogUtils.info('직업 생성 완료', { classId: newClass.id, className: newClass.name });
      return newClass;
      
    } catch (error) {
      LogUtils.error('직업 생성 오류', { classData, error });
      throw error;
    }
  },
  
  // 직업 목록 조회
  getClassList: function(activeOnly = true) {
    try {
      const cacheKey = `class_list_${activeOnly}`;
      const cached = CacheUtils.get(cacheKey);
      if (cached) {
        return cached;
      }
      
      const sheet = this.getOrCreateSheet(SystemConfig.SHEET_NAMES.CLASS_LIST);
      const data = sheet.getDataRange().getValues();
      
      if (data.length <= 1) {
        return [];
      }
      
      const headers = data[0];
      const classes = [];
      
      for (let i = 1; i < data.length; i++) {
        const classInfo = this.rowToObject(headers, data[i]);
        
        if (activeOnly && !classInfo.isActive) continue;
        
        classes.push(classInfo);
      }
      
      // 이름순 정렬
      classes.sort((a, b) => a.name.localeCompare(b.name));
      
      CacheUtils.set(cacheKey, classes, 300);
      return classes;
      
    } catch (error) {
      LogUtils.error('직업 목록 조회 오류', { activeOnly, error });
      return [];
    }
  },
  
  // ===== 게임 설정 관리 =====
  
  // 게임 설정 저장
  saveGameSetting: function(key, value, description = '', type = 'STRING', updatedBy) {
    try {
      LogUtils.info('게임 설정 저장', { key, value, updatedBy });
      
      const sheet = this.getOrCreateSheet(SystemConfig.SHEET_NAMES.GAME_SETTINGS);
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      // 기존 설정 확인
      const existingRowIndex = this.findRowIndex(sheet, 'key', key);
      
      const settingData = {
        key: key,
        value: value,
        description: description,
        type: type,
        updatedBy: updatedBy,
        updatedAt: DateUtils.now()
      };
      
      if (existingRowIndex > 0) {
        // 기존 설정 업데이트
        const rowData = this.objectToRow(headers, settingData);
        sheet.getRange(existingRowIndex, 1, 1, rowData.length).setValues([rowData]);
      } else {
        // 새 설정 추가
        const rowData = this.objectToRow(headers, settingData);
        sheet.appendRow(rowData);
      }
      
      // 캐시 무효화
      CacheUtils.remove('game_settings');
      
      LogUtils.info('게임 설정 저장 완료', { key });
      return settingData;
      
    } catch (error) {
      LogUtils.error('게임 설정 저장 오류', { key, value, error });
      throw error;
    }
  },
  
  // 게임 설정 조회
  getGameSetting: function(key, defaultValue = null) {
    try {
      const cacheKey = 'game_settings';
      let settings = CacheUtils.get(cacheKey);
      
      if (!settings) {
        const sheet = this.getOrCreateSheet(SystemConfig.SHEET_NAMES.GAME_SETTINGS);
        const data = sheet.getDataRange().getValues();
        
        settings = {};
        if (data.length > 1) {
          const headers = data[0];
          
          for (let i = 1; i < data.length; i++) {
            const setting = this.rowToObject(headers, data[i]);
            settings[setting.key] = setting.value;
          }
        }
        
        CacheUtils.set(cacheKey, settings, 600); // 10분 캐시
      }
      
      return settings[key] !== undefined ? settings[key] : defaultValue;
      
    } catch (error) {
      LogUtils.error('게임 설정 조회 오류', { key, error });
      return defaultValue;
    }
  },
  
  // 모든 게임 설정 조회
  getAllGameSettings: function() {
    try {
      const sheet = this.getOrCreateSheet(SystemConfig.SHEET_NAMES.GAME_SETTINGS);
      const data = sheet.getDataRange().getValues();
      
      if (data.length <= 1) {
        return {};
      }
      
      const headers = data[0];
      const settings = {};
      
      for (let i = 1; i < data.length; i++) {
        const setting = this.rowToObject(headers, data[i]);
        settings[setting.key] = setting;
      }
      
      return settings;
      
    } catch (error) {
      LogUtils.error('모든 게임 설정 조회 오류', error);
      return {};
    }
  },
  
  // 자금 거래 저장
  saveFundTransaction: function(transaction) {
    try {
      LogUtils.info('자금 거래 저장 시작', { transactionId: transaction.id, amount: transaction.amount });
      
      const sheet = this.getOrCreateSheet(SystemConfig.SHEET_NAMES.GUILD_FUNDS);
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      transaction.createdAt = DateUtils.now();
      const rowData = this.objectToRow(headers, transaction);
      sheet.appendRow(rowData);
      
      LogUtils.info('자금 거래 저장 완료', { transactionId: transaction.id });
      
      // 캐시 무효화
      CacheUtils.remove(CACHE_KEYS.GUILD_FUNDS);
      
      return transaction;
      
    } catch (error) {
      LogUtils.error('자금 거래 저장 오류', { transaction, error });
      throw error;
    }
  },
  
  // 현재 길드 자금 계산
  calculateCurrentFunds: function() {
    try {
      const cacheKey = CACHE_KEYS.GUILD_FUNDS;
      const cached = CacheUtils.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
      
      const sheet = this.getOrCreateSheet(SystemConfig.SHEET_NAMES.GUILD_FUNDS);
      const data = sheet.getDataRange().getValues();
      
      if (data.length <= 1) {
        return 0;
      }
      
      const headers = data[0];
      const typeIndex = headers.indexOf('transactionType');
      const amountIndex = headers.indexOf('amount');
      
      let totalFunds = 0;
      
      for (let i = 1; i < data.length; i++) {
        const type = data[i][typeIndex];
        const amount = NumberUtils.toNumber(data[i][amountIndex]);
        
        if (type === TRANSACTION_TYPES.INCOME) {
          totalFunds += amount;
        } else if (type === TRANSACTION_TYPES.EXPENSE || type === TRANSACTION_TYPES.DISTRIBUTION) {
          totalFunds -= amount;
        }
      }
      
      CacheUtils.set(cacheKey, totalFunds, 300);
      return totalFunds;
      
    } catch (error) {
      LogUtils.error('길드 자금 계산 오류', error);
      return 0;
    }
  },
  
  // ===== 유틸리티 함수들 =====
  
  // 행 데이터를 객체로 변환
  rowToObject: function(headers, rowData) {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = rowData[index] !== undefined ? rowData[index] : null;
    });
    return obj;
  },
  
  // 객체를 행 데이터로 변환
  objectToRow: function(headers, obj) {
    return headers.map(header => obj[header] !== undefined ? obj[header] : '');
  },
  
  // 사용자 행 인덱스 찾기
  findUserRowIndex: function(sheet, columnName, value) {
    try {
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const columnIndex = headers.indexOf(columnName);
      
      if (columnIndex === -1) return -1;
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][columnIndex] === value) {
          return i + 1; // 시트의 행 번호는 1부터 시작
        }
      }
      
      return -1;
    } catch (error) {
      LogUtils.error('사용자 행 인덱스 찾기 오류', { columnName, value, error });
      return -1;
    }
  },
  
  // 사용자 캐시 무효화
  invalidateUserCache: function(user) {
    CacheUtils.remove(`user_by_id_${user.id}`);
    CacheUtils.remove(`user_by_nickname_${user.nickname}`);
    if (user.email) {
      CacheUtils.remove(`user_by_email_${user.email}`);
    }
  },
  
  // 데이터 무결성 검증
  validateData: function(data, schema) {
    try {
      const errors = [];
      
      Object.keys(schema).forEach(field => {
        const rules = schema[field];
        const value = data[field];
        
        // 필수 필드 검증
        if (rules.required && (value === null || value === undefined || value === '')) {
          errors.push(`${field}는 필수 항목입니다.`);
        }
        
        // 타입 검증
        if (value !== null && rules.type && typeof value !== rules.type) {
          errors.push(`${field}의 타입이 올바르지 않습니다.`);
        }
        
        // 길이 검증
        if (value && rules.maxLength && value.toString().length > rules.maxLength) {
          errors.push(`${field}의 길이가 ${rules.maxLength}자를 초과합니다.`);
        }
      });
      
      return {
        isValid: errors.length === 0,
        errors: errors
      };
      
    } catch (error) {
      LogUtils.error('데이터 검증 오류', { data, schema, error });
      return {
        isValid: false,
        errors: ['데이터 검증 중 오류가 발생했습니다.']
      };
    }
  },
  
  // 백업 생성
  createBackup: function() {
    try {
      LogUtils.info('데이터 백업 시작');
      
      const sourceSpreadsheet = SpreadsheetApp.openById(SystemConfig.SPREADSHEET_ID);
      const backupName = `길드관리_백업_${DateUtils.format(DateUtils.now(), 'yyyyMMdd_HHmmss')}`;
      
      const backupSpreadsheet = sourceSpreadsheet.copy(backupName);
      
      LogUtils.info('데이터 백업 완료', { 
        backupId: backupSpreadsheet.getId(),
        backupName: backupName 
      });
      
      return {
        success: true,
        backupId: backupSpreadsheet.getId(),
        backupName: backupName
      };
      
    } catch (error) {
      LogUtils.error('데이터 백업 오류', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};
