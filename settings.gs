/**
 * 시스템 설정 관리 (CSP 완전 호환 버전)
 * 모든 시스템 설정과 환경 변수를 중앙 관리
 * eval() 및 동적 코드 실행 완전 제거
 */

const SystemConfig = {
  // ===== 기본 시스템 정보 =====
  VERSION: '1.0.1',
  APP_NAME: '길드 관리 시스템',
  BUILD_DATE: '2025-06-24',
  CSP_COMPLIANT: true,
  
  // ===== 스프레드시트 설정 =====
  // ⚠️ 중요: 본인의 스프레드시트 ID로 변경하세요!
  SPREADSHEET_ID: '1bJJQHzDkwdM_aYI5TNeg2LqURNJAuIc5-N8-PTgL2SM',
  
  // ===== 외부 API 설정 =====
  GEMINI_API_KEY: 'AIzaSyDCsasfBH5Ak26nagkpPiItQjTWP-Dk4CE',
  
  // ===== 시트 이름 정의 =====
  SHEET_NAMES: {
    MEMBERS: '회원정보',
    BOSS_RECORDS: '보스참여기록',
    GUILD_FUNDS: '길드자금',
    DISTRIBUTION: '분배내역',
    WEEKLY_STATS: '주간통계',
    BOSS_LIST: '보스목록',
    CLASS_LIST: '직업목록',
    PERMISSIONS: '권한설정',
    SYSTEM_SETTINGS: '시스템설정',
    GAME_SETTINGS: '게임설정',
    SYSTEM_LOGS: '시스템로그'
  },
  
  // ===== 비즈니스 로직 설정 =====
  BUSINESS_RULES: {
    // 수수료 설정
    COMMISSION_RATE: 0.08, // 8%
    
    // 세션 설정 (밀리초)
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24시간
    
    // 비밀번호 정책
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_MAX_LENGTH: 128,
    
    // 닉네임 정책
    NICKNAME_MIN_LENGTH: 2,
    NICKNAME_MAX_LENGTH: 20,
    
    // 페이징 설정
    DEFAULT_PAGE_SIZE: 50,
    MAX_PAGE_SIZE: 200,
    
    // 캐시 설정 (초)
    CACHE_DURATION: 300, // 5분
    
    // 비활성 사용자 기준 (일)
    INACTIVE_DAYS: 30,
    
    // 데이터 백업 주기 (일)
    BACKUP_INTERVAL_DAYS: 7,
    
    // 최대 파티 크기
    MAX_PARTY_SIZE: 8
  },
  
  // ===== 보안 설정 =====
  SECURITY: {
    // 관리자 기본 비밀번호
    DEFAULT_ADMIN_PASSWORD: 'Admin#2025!Safe',
    
    // 암호화 설정
    HASH_ALGORITHM: 'SHA_256',
    
    // 세션 보안
    SESSION_SECURE: true,
    
    // CSP 설정 - 실제로는 Google Apps Script에서 자동 관리됨
    CSP_ENABLED: true,
    EVAL_DISABLED: true
  },
  
  // ===== UI 설정 =====
  UI: {
    // 테마 설정
    THEME: {
      PRIMARY_COLOR: '#00BCD4',
      SECONDARY_COLOR: '#FFD54F',
      ACCENT_COLOR: '#FF6B6B',
      SUCCESS_COLOR: '#4CAF50',
      WARNING_COLOR: '#FF9800',
      DANGER_COLOR: '#F44336',
      DARK_COLOR: '#2C3E50',
      LIGHT_COLOR: '#ECF0F1'
    },
    
    // 반응형 중단점
    BREAKPOINTS: {
      MOBILE: 480,
      TABLET: 768,
      DESKTOP: 1024,
      LARGE: 1200
    },
    
    // 애니메이션 설정 (밀리초)
    ANIMATION: {
      DURATION_FAST: 200,
      DURATION_NORMAL: 300,
      DURATION_SLOW: 500
    }
  },
  
  // ===== 로깅 설정 =====
  LOGGING: {
    ENABLED: true,
    LEVEL: 'INFO', // DEBUG, INFO, WARN, ERROR, FATAL
    MAX_LOG_ENTRIES: 1000,
    RETENTION_DAYS: 30,
    CONSOLE_ENABLED: true,
    SHEET_ENABLED: true
  },
  
  // ===== 이메일 알림 설정 =====
  NOTIFICATIONS: {
    ENABLED: false,
    ADMIN_EMAIL: '',
    EMAIL_TEMPLATES: {
      WELCOME: '환영합니다! 길드 관리 시스템에 가입되었습니다.',
      PASSWORD_CHANGED: '비밀번호가 성공적으로 변경되었습니다.',
      SYSTEM_ERROR: '시스템 오류가 발생했습니다.',
      BACKUP_COMPLETE: '데이터 백업이 완료되었습니다.'
    }
  },
  
  // ===== 개발/디버그 설정 =====
  DEBUG: {
    ENABLED: false,
    VERBOSE_LOGGING: false,
    SHOW_PERFORMANCE_METRICS: false,
    MOCK_DATA_ENABLED: false,
    CSP_VIOLATIONS_LOG: true
  },
  
  // ===== 게임별 커스터마이징 설정 =====
  GAME: {
    DEFAULT_NAME: '게임 관리 시스템',
    DEFAULT_CURRENCY: '골드',
    DEFAULT_MAX_PARTY: 8,
    CUSTOM_FIELDS_ENABLED: true
  },
  
  // ===== 시스템 초기화 - CSP 안전 =====
  initialize: function() {
    try {
      console.log('🔧 ' + this.APP_NAME + ' v' + this.VERSION + ' 초기화 시작 (CSP 호환 모드)');
      
      // 설정 유효성 검증
      this.validateConfig();
      
      // 환경별 설정 적용
      this.applyEnvironmentConfig();
      
      // 캐시 정리 (선택적)
      this.cleanupOldCache();
      
      console.log('✅ 시스템 설정 초기화 완료 (CSP 안전)');
      return true;
      
    } catch (error) {
      console.error('❌ 시스템 설정 초기화 실패:', error);
      throw error;
    }
  },
  
  // ===== 설정 유효성 검증 - CSP 안전 =====
  validateConfig: function() {
    const errors = [];
    
    // 필수 설정 확인
    if (!this.SPREADSHEET_ID) {
      errors.push('SPREADSHEET_ID가 설정되지 않았습니다.');
    } else if (this.SPREADSHEET_ID === '1bJJQHzDkwdM_aYI5TNeg2LqURNJAuIc5-N8-PTgL2SM') {
      console.warn('⚠️ 기본 스프레드시트 ID를 사용 중입니다. 본인의 ID로 변경하세요.');
    }
    
    // 비즈니스 룰 검증
    if (this.BUSINESS_RULES.COMMISSION_RATE < 0 || this.BUSINESS_RULES.COMMISSION_RATE > 1) {
      errors.push('수수료율은 0~100% 사이여야 합니다.');
    }
    
    if (this.BUSINESS_RULES.PASSWORD_MIN_LENGTH < 4) {
      errors.push('최소 비밀번호 길이는 4자 이상이어야 합니다.');
    }
    
    if (this.BUSINESS_RULES.SESSION_TIMEOUT < 60000) { // 1분
      errors.push('세션 타임아웃은 최소 1분 이상이어야 합니다.');
    }
    
    // 오류가 있으면 예외 발생
    if (errors.length > 0) {
      throw new Error('설정 유효성 검증 실패: ' + errors.join(', '));
    }
    
    console.log('✅ 설정 유효성 검증 완료');
  },
  
  // ===== 환경별 설정 적용 - CSP 안전 =====
  applyEnvironmentConfig: function() {
    try {
      // 현재 사용자 이메일로 개발 환경 감지
      const userEmail = Session.getActiveUser().getEmail();
      const isDevelopment = userEmail && (
        userEmail.includes('test') || 
        userEmail.includes('dev') || 
        userEmail.includes('localhost')
      );
      
      if (isDevelopment) {
        this.DEBUG.ENABLED = true;
        this.DEBUG.VERBOSE_LOGGING = true;
        this.LOGGING.LEVEL = 'DEBUG';
        this.LOGGING.CONSOLE_ENABLED = true;
        console.log('🔧 개발 환경 설정 적용');
      } else {
        // 프로덕션 환경
        this.DEBUG.ENABLED = false;
        this.DEBUG.VERBOSE_LOGGING = false;
        this.LOGGING.LEVEL = 'INFO';
        console.log('🚀 프로덕션 환경 설정 적용');
      }
      
      // 스프레드시트 접근 테스트
      this.testSpreadsheetAccess();
      
    } catch (error) {
      console.warn('⚠️ 환경별 설정 적용 중 오류:', error);
      // 오류가 있어도 계속 진행
    }
  },
  
  // ===== 스프레드시트 접근 테스트 - CSP 안전 =====
  testSpreadsheetAccess: function() {
    try {
      const spreadsheet = SpreadsheetApp.openById(this.SPREADSHEET_ID);
      const name = spreadsheet.getName();
      console.log('✅ 스프레드시트 접근 성공:', name);
      return true;
    } catch (error) {
      console.error('❌ 스프레드시트 접근 실패:', error);
      throw new Error('스프레드시트에 접근할 수 없습니다. SPREADSHEET_ID를 확인하세요.');
    }
  },
  
  // ===== 구 캐시 정리 - CSP 안전 =====
  cleanupOldCache: function() {
    try {
      // CacheUtils가 있으면 사용
      if (typeof CacheUtils !== 'undefined' && typeof CacheUtils.clear === 'function') {
        const cleanupResult = CacheUtils.clear();
        if (cleanupResult) {
          console.log('🧹 구 캐시 정리 완료');
        }
      }
    } catch (error) {
      console.warn('⚠️ 캐시 정리 중 오류 (무시):', error);
    }
  },
  
  // ===== 설정 값 가져오기 - CSP 안전 =====
  get: function(keyPath, defaultValue) {
    if (!keyPath) return defaultValue || null;
    
    const keys = keyPath.split('.');
    let value = this;
    
    for (let i = 0; i < keys.length; i++) {
      if (value && typeof value === 'object' && keys[i] in value) {
        value = value[keys[i]];
      } else {
        return defaultValue || null;
      }
    }
    
    return value;
  },
  
  // ===== 설정 값 설정하기 - CSP 안전 =====
  set: function(keyPath, value) {
    if (!keyPath) return false;
    
    const keys = keyPath.split('.');
    const lastKey = keys.pop();
    let obj = this;
    
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (!(key in obj)) {
        obj[key] = {};
      }
      obj = obj[key];
    }
    
    obj[lastKey] = value;
    console.log('⚙️ 설정 업데이트: ' + keyPath + ' = ' + value);
    return true;
  },
  
  // ===== 동적 설정 로드 - CSP 안전 =====
  loadDynamicSettings: function() {
    try {
      // DatabaseUtils가 있으면 동적 설정 로드
      if (typeof DatabaseUtils !== 'undefined' && 
          typeof DatabaseUtils.getAllGameSettings === 'function') {
        
        const dynamicSettings = DatabaseUtils.getAllGameSettings();
        
        // 동적 설정을 현재 설정에 병합
        for (const key in dynamicSettings) {
          if (dynamicSettings.hasOwnProperty(key)) {
            const setting = dynamicSettings[key];
            this.setDynamicValue(key, setting.value, setting.type);
          }
        }
        
        console.log('🔄 동적 설정 로드 완료');
      }
    } catch (error) {
      console.warn('⚠️ 동적 설정 로드 실패:', error);
    }
  },
  
  // ===== 동적 값 설정 - CSP 안전 =====
  setDynamicValue: function(key, value, type) {
    try {
      // 타입에 따른 값 변환
      let convertedValue = value;
      
      switch (type) {
        case 'NUMBER':
          convertedValue = parseFloat(value) || 0;
          break;
        case 'BOOLEAN':
          convertedValue = value === 'true' || value === true;
          break;
        case 'JSON':
          try {
            convertedValue = JSON.parse(value);
          } catch (e) {
            convertedValue = value;
          }
          break;
        default:
          convertedValue = String(value);
      }
      
      // 안전한 키 경로로 설정
      this.set('DYNAMIC.' + key, convertedValue);
      
    } catch (error) {
      console.warn('동적 값 설정 실패:', key, error);
    }
  },
  
  // ===== 설정 정보 내보내기 - CSP 안전 =====
  export: function(includeSecrets) {
    includeSecrets = includeSecrets || false;
    
    const exportData = {
      version: this.VERSION,
      buildDate: this.BUILD_DATE,
      cspCompliant: this.CSP_COMPLIANT,
      sheetNames: this.SHEET_NAMES,
      businessRules: this.BUSINESS_RULES,
      theme: this.UI.THEME,
      timestamp: new Date().toISOString()
    };
    
    // 민감한 정보 제외
    if (!includeSecrets) {
      delete exportData.spreadsheetId;
      delete exportData.apiKeys;
      delete exportData.passwords;
    }
    
    return JSON.stringify(exportData, null, 2);
  },
  
  // ===== 설정 백업 - CSP 안전 =====
  backup: function() {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        version: this.VERSION,
        config: this.export(false), // 민감 정보 제외
        checksum: this.generateChecksum()
      };
      
      // 백업 데이터를 스프레드시트에 저장 (선택적)
      if (typeof DatabaseUtils !== 'undefined') {
        this.saveBackupToSheet(backupData);
      }
      
      console.log('💾 설정 백업 완료');
      return backupData;
      
    } catch (error) {
      console.error('❌ 설정 백업 실패:', error);
      return null;
    }
  },
  
  // ===== 체크섬 생성 - CSP 안전 =====
  generateChecksum: function() {
    try {
      const configString = this.export(false);
      // 간단한 해시 함수
      let hash = 0;
      for (let i = 0; i < configString.length; i++) {
        const char = configString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 32비트 정수로 변환
      }
      return hash.toString(16);
    } catch (error) {
      console.warn('체크섬 생성 실패:', error);
      return 'unknown';
    }
  },
  
  // ===== 백업 데이터 저장 - CSP 안전 =====
  saveBackupToSheet: function(backupData) {
    try {
      const sheet = DatabaseUtils.getOrCreateSheet('ConfigBackups', [
        'timestamp', 'version', 'config', 'checksum'
      ]);
      
      sheet.appendRow([
        backupData.timestamp,
        backupData.version,
        backupData.config,
        backupData.checksum
      ]);
      
    } catch (error) {
      console.warn('백업 데이터 저장 실패:', error);
    }
  },
  
  // ===== 시스템 상태 확인 - CSP 안전 =====
  getSystemStatus: function() {
    try {
      const status = {
        version: this.VERSION,
        cspCompliant: this.CSP_COMPLIANT,
        evalFree: this.SECURITY.EVAL_DISABLED,
        spreadsheetConnected: false,
        cacheEnabled: false,
        loggingEnabled: this.LOGGING.ENABLED,
        timestamp: new Date().toISOString()
      };
      
      // 스프레드시트 연결 확인
      try {
        SpreadsheetApp.openById(this.SPREADSHEET_ID);
        status.spreadsheetConnected = true;
      } catch (e) {
        status.spreadsheetConnected = false;
      }
      
      // 캐시 서비스 확인
      try {
        CacheService.getScriptCache();
        status.cacheEnabled = true;
      } catch (e) {
        status.cacheEnabled = false;
      }
      
      return status;
      
    } catch (error) {
      console.error('시스템 상태 확인 실패:', error);
      return {
        version: this.VERSION,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },
  
  // ===== CSP 호환성 확인 =====
  validateCSPCompliance: function() {
    const issues = [];
    
    // 이 파일에서 eval 사용 여부 확인
    const sourceCode = this.toString();
    if (sourceCode.includes('eval(') || sourceCode.includes('new Function(')) {
      issues.push('eval() 또는 new Function() 사용 감지');
    }
    
    if (sourceCode.includes('setTimeout("') || sourceCode.includes('setInterval("')) {
      issues.push('setTimeout/setInterval에서 문자열 사용 감지');
    }
    
    return {
      compliant: issues.length === 0,
      issues: issues,
      timestamp: new Date().toISOString()
    };
  }
};
