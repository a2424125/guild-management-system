/**
 * 시스템 상수 정의
 * 모든 하드코딩된 값과 열거형을 중앙 관리
 */

// ===== 정규표현식 패턴 =====
const REGEX_PATTERNS = {
  // 닉네임: 한글, 영문, 숫자 2-20자
  NICKNAME: /^[가-힣a-zA-Z0-9]{2,20}$/,
  
  // 이메일 검증
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // 비밀번호: 영문+숫자 조합 6자 이상
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/,
  
  // 한국어만
  KOREAN_ONLY: /^[가-힣\s]+$/,
  
  // 숫자만
  NUMBER_ONLY: /^\d+$/,
  
  // 금액 (숫자 + 콤마)
  CURRENCY: /^[\d,]+$/
};

// ===== 날짜 포맷 =====
const DATE_FORMATS = {
  // 기본 포맷
  FULL: 'yyyy-MM-dd HH:mm:ss',
  DATE_ONLY: 'yyyy-MM-dd',
  TIME_ONLY: 'HH:mm:ss',
  
  // 표시용 포맷
  DISPLAY_FULL: 'yyyy년 MM월 dd일 HH시 mm분',
  DISPLAY_DATE: 'yyyy년 MM월 dd일',
  DISPLAY_TIME: 'HH시 mm분',
  
  // 간소 포맷
  SHORT_DATE: 'MM/dd',
  SHORT_DATETIME: 'MM/dd HH:mm',
  
  // 시스템 로그용
  LOG_FORMAT: 'yyyy-MM-dd HH:mm:ss.SSS'
};

// ===== 로그 레벨 =====
const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  FATAL: 'FATAL'
};

// ===== 캐시 키 =====
const CACHE_KEYS = {
  // 사용자 세션
  USER_SESSION: 'user_session_',
  USER_PERMISSIONS: 'user_permissions_',
  
  // 데이터 캐시
  MEMBERS_LIST: 'members_list',
  BOSS_RECORDS: 'boss_records_',
  GUILD_FUNDS: 'guild_funds',
  WEEKLY_STATS: 'weekly_stats_',
  
  // 시스템 캐시
  SYSTEM_CONFIG: 'system_config',
  BOSS_LIST: 'boss_list',
  PERMISSIONS: 'permissions_cache'
};

// ===== 사용자 권한 =====
const USER_ROLES = {
  ADMIN: 'ADMIN',           // 최고 관리자
  GUILD_MASTER: 'GUILD_MASTER',   // 길드마스터
  OFFICER: 'OFFICER',       // 임원
  MEMBER: 'MEMBER',         // 일반 회원
  GUEST: 'GUEST'           // 게스트
};

// ===== 권한별 기능 =====
const PERMISSIONS = {
  // 회원 관리
  MEMBER_CREATE: 'MEMBER_CREATE',
  MEMBER_READ: 'MEMBER_READ',
  MEMBER_UPDATE: 'MEMBER_UPDATE',
  MEMBER_DELETE: 'MEMBER_DELETE',
  
  // 보스 기록 관리
  BOSS_RECORD_CREATE: 'BOSS_RECORD_CREATE',
  BOSS_RECORD_READ: 'BOSS_RECORD_READ',
  BOSS_RECORD_UPDATE: 'BOSS_RECORD_UPDATE',
  BOSS_RECORD_DELETE: 'BOSS_RECORD_DELETE',
  
  // 자금 관리
  FUND_READ: 'FUND_READ',
  FUND_MANAGE: 'FUND_MANAGE',
  FUND_DISTRIBUTE: 'FUND_DISTRIBUTE',
  
  // 시스템 관리
  SYSTEM_CONFIG: 'SYSTEM_CONFIG',
  USER_MANAGE: 'USER_MANAGE',
  LOG_VIEW: 'LOG_VIEW',
  
  // 통계 조회
  STATS_VIEW: 'STATS_VIEW',
  STATS_EXPORT: 'STATS_EXPORT'
};

// ===== 역할별 권한 매핑 =====
const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    // 모든 권한
    ...Object.values(PERMISSIONS)
  ],
  
  [USER_ROLES.GUILD_MASTER]: [
    PERMISSIONS.MEMBER_READ,
    PERMISSIONS.MEMBER_UPDATE,
    PERMISSIONS.BOSS_RECORD_CREATE,
    PERMISSIONS.BOSS_RECORD_READ,
    PERMISSIONS.BOSS_RECORD_UPDATE,
    PERMISSIONS.FUND_READ,
    PERMISSIONS.FUND_MANAGE,
    PERMISSIONS.FUND_DISTRIBUTE,
    PERMISSIONS.STATS_VIEW,
    PERMISSIONS.STATS_EXPORT
  ],
  
  [USER_ROLES.OFFICER]: [
    PERMISSIONS.MEMBER_READ,
    PERMISSIONS.BOSS_RECORD_CREATE,
    PERMISSIONS.BOSS_RECORD_READ,
    PERMISSIONS.BOSS_RECORD_UPDATE,
    PERMISSIONS.FUND_READ,
    PERMISSIONS.STATS_VIEW
  ],
  
  [USER_ROLES.MEMBER]: [
    PERMISSIONS.MEMBER_READ,
    PERMISSIONS.BOSS_RECORD_READ,
    PERMISSIONS.FUND_READ,
    PERMISSIONS.STATS_VIEW
  ],
  
  [USER_ROLES.GUEST]: [
    PERMISSIONS.MEMBER_READ,
    PERMISSIONS.STATS_VIEW
  ]
};

// ===== 보스 관련 (범용) =====
const BOSS_TYPES = {
  RAID: 'RAID',
  DUNGEON: 'DUNGEON', 
  WORLD: 'WORLD',
  EVENT: 'EVENT',
  CUSTOM: 'CUSTOM'
};

// ===== 난이도 (범용) =====
const DIFFICULTY_LEVELS = {
  VERY_EASY: 'VERY_EASY',
  EASY: 'EASY',
  NORMAL: 'NORMAL', 
  HARD: 'HARD',
  VERY_HARD: 'VERY_HARD',
  EXTREME: 'EXTREME',
  CUSTOM: 'CUSTOM'
};

// ===== 게임 설정 타입 =====
const GAME_SETTINGS = {
  GAME_NAME: 'GAME_NAME',
  MAX_PARTY_SIZE: 'MAX_PARTY_SIZE',
  CURRENCY_NAME: 'CURRENCY_NAME',
  TIMEZONE: 'TIMEZONE',
  CUSTOM_FIELDS: 'CUSTOM_FIELDS'
};

// ===== 참여 상태 =====
const PARTICIPATION_STATUS = {
  ATTENDED: 'ATTENDED',      // 참여
  ABSENT: 'ABSENT',          // 불참
  LATE: 'LATE',              // 지각
  EARLY_LEAVE: 'EARLY_LEAVE' // 조퇴
};

// ===== 자금 거래 유형 =====
const TRANSACTION_TYPES = {
  INCOME: 'INCOME',           // 수입
  EXPENSE: 'EXPENSE',         // 지출
  DISTRIBUTION: 'DISTRIBUTION', // 분배
  ADJUSTMENT: 'ADJUSTMENT'    // 조정
};

// ===== 분배 방식 =====
const DISTRIBUTION_METHODS = {
  EQUAL: 'EQUAL',                    // 균등 분배
  PARTICIPATION_BASED: 'PARTICIPATION_BASED', // 참여도 기반
  CONTRIBUTION_BASED: 'CONTRIBUTION_BASED',   // 기여도 기반
  CUSTOM: 'CUSTOM'                   // 커스텀
};

// ===== HTTP 상태 코드 =====
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500
};

// ===== API 응답 코드 =====
const RESPONSE_CODES = {
  SUCCESS: 'SUCCESS',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',
  SYSTEM_ERROR: 'SYSTEM_ERROR'
};

// ===== 메시지 템플릿 =====
const MESSAGES = {
  // 성공 메시지
  SUCCESS: {
    LOGIN: '로그인되었습니다.',
    LOGOUT: '로그아웃되었습니다.',
    REGISTER: '회원가입이 완료되었습니다.',
    UPDATE: '정보가 업데이트되었습니다.',
    DELETE: '삭제되었습니다.',
    CREATE: '생성되었습니다.'
  },
  
  // 오류 메시지
  ERROR: {
    INVALID_CREDENTIALS: '아이디 또는 비밀번호가 올바르지 않습니다.',
    PERMISSION_DENIED: '권한이 없습니다.',
    NOT_FOUND: '요청한 데이터를 찾을 수 없습니다.',
    DUPLICATE_ENTRY: '이미 존재하는 데이터입니다.',
    VALIDATION_FAILED: '입력값이 올바르지 않습니다.',
    SYSTEM_ERROR: '시스템 오류가 발생했습니다.',
    SESSION_EXPIRED: '세션이 만료되었습니다.'
  },
  
  // 검증 메시지
  VALIDATION: {
    REQUIRED: '필수 입력 항목입니다.',
    INVALID_FORMAT: '올바른 형식이 아닙니다.',
    TOO_SHORT: '너무 짧습니다.',
    TOO_LONG: '너무 깁니다.',
    INVALID_RANGE: '허용 범위를 벗어났습니다.'
  }
};

// ===== 시스템 이벤트 =====
const SYSTEM_EVENTS = {
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_REGISTER: 'USER_REGISTER',
  BOSS_RECORD_CREATED: 'BOSS_RECORD_CREATED',
  FUND_DISTRIBUTED: 'FUND_DISTRIBUTED',
  SYSTEM_ERROR: 'SYSTEM_ERROR'
};

// ===== UI 상수 =====
const UI_CONSTANTS = {
  // 모달 크기
  MODAL_SIZES: {
    SMALL: { width: 400, height: 300 },
    MEDIUM: { width: 600, height: 400 },
    LARGE: { width: 800, height: 600 },
    EXTRA_LARGE: { width: 1000, height: 700 }
  },
  
  // 테이블 설정
  TABLE: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    COLUMN_MIN_WIDTH: 80,
    COLUMN_MAX_WIDTH: 300
  },
  
  // 폼 설정
  FORM: {
    INPUT_MAX_LENGTH: 255,
    TEXTAREA_MAX_LENGTH: 1000,
    SELECT_MAX_OPTIONS: 50
  }
};

// ===== 기본값 =====
const DEFAULTS = {
  // 사용자 기본값
  USER: {
    ROLE: USER_ROLES.MEMBER,
    STATUS: 'ACTIVE',
    JOIN_DATE: () => new Date(),
    LAST_LOGIN: null
  },
  
  // 보스 기록 기본값
  BOSS_RECORD: {
    PARTICIPATION: PARTICIPATION_STATUS.ATTENDED,
    CONTRIBUTION: 0,
    NOTES: ''
  },
  
  // 페이징 기본값
  PAGINATION: {
    PAGE: 1,
    SIZE: 20,
    SORT: 'created_date',
    ORDER: 'DESC'
  }
};

// ===== 검증 규칙 =====
const VALIDATION_RULES = {
  NICKNAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 20,
    PATTERN: REGEX_PATTERNS.NICKNAME,
    REQUIRED: true
  },
  
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
    PATTERN: REGEX_PATTERNS.PASSWORD,
    REQUIRED: true
  },
  
  EMAIL: {
    MAX_LENGTH: 255,
    PATTERN: REGEX_PATTERNS.EMAIL,
    REQUIRED: false
  },
  
  BOSS_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    REQUIRED: true
  },
  
  AMOUNT: {
    MIN: 0,
    MAX: Number.MAX_SAFE_INTEGER,
    REQUIRED: true
  }
};
