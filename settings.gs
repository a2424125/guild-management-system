/**
 * 시스템 설정 관리
 * 모든 시스템 설정과 환경 변수를 중앙 관리
 */

const SystemConfig = {
  // ===== 기본 시스템 정보 =====
  VERSION: '1.0.0',
  APP_NAME: '길드 관리 시스템',
  BUILD_DATE: '2025-06-24',
  
  // ===== 스프레드시트 설정 =====
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
    PERMISSIONS: '권한설정',
    SYSTEM_SETTINGS: '시스템설정',
    SYSTEM_LOGS: '시스템로그'
  },
  
  // ===== 비즈니스 로직 설정 =====
  BUSINESS_RULES: {
    // 수수료 설정
    COMMISSION_RATE: 0.08, // 8%
    
    // 세션 설정
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24시간 (밀리초)
    
    // 비밀번호 정책
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_MAX_LENGTH: 128,
    
    // 닉네임 정책
    NICKNAME_MIN_LENGTH: 2,
    NICKNAME_MAX_LENGTH: 20,
    
    // 페이징 설정
    DEFAULT_PAGE_SIZE: 50,
    MAX_PAGE_SIZE: 200,
    
    // 캐시 설정
    CACHE_DURATION: 300, // 5분 (초)
    
    // 비활성 사용자 기준
    INACTIVE_DAYS: 30,
    
    // 데이터 백업 주기
    BACKUP_INTERVAL_DAYS: 7
  },
  
  // ===== 보안 설정 =====
  SECURITY: {
    // CSP 설정
    CSP_POLICY: {
      'default-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      'font-src': ["'self'", "fonts.gstatic.com"],
      'script-src': ["'self'"],
      'img-src': ["'self'", "data:", "https:"],
      'connect-src': ["'self'"]
    },
    
    // 허용된 외부 도메인
    ALLOWED_DOMAINS: [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'cdnjs.cloudflare.com'
    ],
    
    // 관리자 기본 비밀번호
    DEFAULT_ADMIN_PASSWORD: 'Admin#2025!Safe',
    
    // 암호화 설정
    HASH_ALGORITHM: 'SHA_256'
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
      DANGER_COLOR: '#F44336'
    },
    
    // 반응형 중단점
    BREAKPOINTS: {
      MOBILE: 480,
      TABLET: 768,
      DESKTOP: 1024,
      LARGE: 1200
    },
    
    // 애니메이션 설정
    ANIMATION: {
      DURATION_FAST: 200,
      DURATION_NORMAL: 300,
      DURATION_SLOW: 500
    }
  },
  
  // ===== 로깅 설정 =====
  LOGGING: {
    ENABLED: true,
    LEVEL: 'INFO', // DEBUG, INFO, WARN, ERROR
    MAX_LOG_ENTRIES: 1000,
    RETENTION_DAYS: 30
  },
  
  // ===== 이메일 알림 설정 =====
  NOTIFICATIONS: {
    ENABLED: false,
    ADMIN_EMAIL: '',
    EMAIL_TEMPLATES: {
      WELCOME: '환영합니다! 길드 관리 시스템에 가입되었습니다.',
      PASSWORD_CHANGED: '비밀번호가 성공적으로 변경되었습니다.',
      SYSTEM_ERROR: '시스템 오류가 발생했습니다.'
    }
  },
  
  // ===== 개발/디버그 설정 =====
  DEBUG: {
    ENABLED: false,
    VERBOSE_LOGGING: false,
    SHOW_PERFORMANCE_METRICS: false,
    MOCK_DATA_ENABLED: false
  },
  
  // ===== 시스템 초기화 =====
  initialize: function() {
    try {
      console.log(`🔧 ${this.APP_NAME} v${this.VERSION} 초기화 시작`);
      
      // 설정 유효성 검증
      this.validateConfig();
      
      // 환경별 설정 적용
      this.applyEnvironmentConfig();
      
      // CSP 헤더 설정
      this.setupCSP();
      
      console.log('✅ 시스템 설정 초기화 완료');
      return true;
      
    } catch (error) {
      console.error('❌ 시스템 설정 초기화 실패:', error);
      throw error;
    }
  },
  
  // ===== 설정 유효성 검증 =====
  validateConfig: function() {
    // 필수 설정 확인
    if (!this.SPREADSHEET_ID) {
      throw new Error('SPREADSHEET_ID가 설정되지 않았습니다.');
    }
    
    // 비즈니스 룰 검증
    if (this.BUSINESS_RULES.COMMISSION_RATE < 0 || this.BUSINESS_RULES.COMMISSION_RATE > 1) {
      throw new Error('수수료율은 0~100% 사이여야 합니다.');
    }
    
    console.log('✅ 설정 유효성 검증 완료');
  },
  
  // ===== 환경별 설정 적용 =====
  applyEnvironmentConfig: function() {
    // 개발 환경 감지
    const isDevelopment = Session.getActiveUser().getEmail().includes('test') || 
                         Session.getActiveUser().getEmail().includes('dev');
    
    if (isDevelopment) {
      this.DEBUG.ENABLED = true;
      this.DEBUG.VERBOSE_LOGGING = true;
      this.LOGGING.LEVEL = 'DEBUG';
      console.log('🔧 개발 환경 설정 적용');
    }
  },
  
  // ===== CSP 설정 =====
  setupCSP: function() {
    // CSP 정책 문자열 생성
    const cspParts = [];
    for (const [directive, sources] of Object.entries(this.SECURITY.CSP_POLICY)) {
      cspParts.push(`${directive} ${sources.join(' ')}`);
    }
    
    this._cspHeader = cspParts.join('; ');
    console.log('🔒 CSP 정책 설정 완료:', this._cspHeader);
  },
  
  // ===== 설정 값 가져오기 =====
  get: function(key, defaultValue = null) {
    const keys = key.split('.');
    let value = this;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  },
  
  // ===== 설정 값 설정하기 =====
  set: function(key, value) {
    const keys = key.split('.');
    const lastKey = keys.pop();
    let obj = this;
    
    for (const k of keys) {
      if (!(k in obj)) {
        obj[k] = {};
      }
      obj = obj[k];
    }
    
    obj[lastKey] = value;
    console.log(`⚙️ 설정 업데이트: ${key} = ${value}`);
  },
  
  // ===== CSP 헤더 가져오기 =====
  getCSPHeader: function() {
    return this._cspHeader || '';
  },
  
  // ===== 설정 정보 내보내기 =====
  export: function() {
    const exportData = {
      version: this.VERSION,
      buildDate: this.BUILD_DATE,
      sheetNames: this.SHEET_NAMES,
      businessRules: this.BUSINESS_RULES,
      theme: this.UI.THEME,
      timestamp: new Date().toISOString()
    };
    
    return JSON.stringify(exportData, null, 2);
  }
};
