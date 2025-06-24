/**
 * ½Ã½ºÅÛ »ó¼ö Á¤ÀÇ
 * ¸ðµç ÇÏµåÄÚµùµÈ ¹®ÀÚ¿­°ú ¼ýÀÚ¸¦ Áß¾Ó °ü¸®
 */

// ===== »ç¿ëÀÚ »óÅÂ »ó¼ö =====
const USER_STATUS = {
  ACTIVE: 'È°¼º',
  INACTIVE: 'ºñÈ°¼º',
  SUSPENDED: 'Á¤Áö',
  DELETED: '»èÁ¦'
};

// ===== »ç¿ëÀÚ ±ÇÇÑ »ó¼ö =====
const USER_ROLES = {
  ADMIN: 'Y',
  SUB_ADMIN: 'S',
  MODERATOR: 'M',
  MEMBER: 'N'
};

// ===== »ç¿ëÀÚ ±ÇÇÑ ÀÌ¸§ =====
const USER_ROLE_NAMES = {
  [USER_ROLES.ADMIN]: '°ü¸®ÀÚ',
  [USER_ROLES.SUB_ADMIN]: 'ºÎ°ü¸®ÀÚ',
  [USER_ROLES.MODERATOR]: '¿î¿µÁø',
  [USER_ROLES.MEMBER]: 'ÀÏ¹ÝÈ¸¿ø'
};

// ===== º¸½º/·¹ÀÌµå »óÅÂ =====
const BOSS_STATUS = {
  ACTIVE: 'È°¼º',
  INACTIVE: 'ºñÈ°¼º',
  MAINTENANCE: 'Á¡°ËÁß'
};

// ===== ¾ÆÀÌÅÛ ÆÇ¸Å »óÅÂ =====
const SALE_STATUS = {
  UNSOLD: '¹ÌÆÇ¸Å',
  SOLD: 'ÆÇ¸Å¿Ï·á',
  RESERVED: 'ÆÇ¸Å¿¹¾à',
  CANCELLED: 'ÆÇ¸ÅÃë¼Ò'
};

// ===== °Å·¡ À¯Çü =====
const TRANSACTION_TYPES = {
  DEPOSIT: 'ÀÔ±Ý',
  WITHDRAWAL: 'Ãâ±Ý',
  ITEM_SALE: '¾ÆÀÌÅÛÆÇ¸Å',
  DISTRIBUTION: 'ÁÖ±ÞºÐ¹è',
  COMMISSION: '¼ö¼ö·á',
  ADJUSTMENT: 'Á¶Á¤'
};

// ===== ·Î±× ·¹º§ =====
const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  FATAL: 'FATAL'
};

// ===== ¸Þ½ÃÁö »ó¼ö =====
const MESSAGES = {
  // ¼º°ø ¸Þ½ÃÁö
  SUCCESS: {
    LOGIN: '·Î±×ÀÎµÇ¾ú½À´Ï´Ù.',
    LOGOUT: '·Î±×¾Æ¿ôµÇ¾ú½À´Ï´Ù.',
    REGISTER: 'È¸¿ø°¡ÀÔÀÌ ¿Ï·áµÇ¾ú½À´Ï´Ù.',
    PASSWORD_CHANGED: 'ºñ¹Ð¹øÈ£°¡ º¯°æµÇ¾ú½À´Ï´Ù.',
    DATA_SAVED: 'µ¥ÀÌÅÍ°¡ ÀúÀåµÇ¾ú½À´Ï´Ù.',
    DATA_UPDATED: 'µ¥ÀÌÅÍ°¡ ¾÷µ¥ÀÌÆ®µÇ¾ú½À´Ï´Ù.',
    DATA_DELETED: 'µ¥ÀÌÅÍ°¡ »èÁ¦µÇ¾ú½À´Ï´Ù.',
    MEMBER_ADDED: 'È¸¿øÀÌ Ãß°¡µÇ¾ú½À´Ï´Ù.',
    BOSS_RECORD_SAVED: 'º¸½º Âü¿© ±â·ÏÀÌ ÀúÀåµÇ¾ú½À´Ï´Ù.',
    ITEM_SOLD: '¾ÆÀÌÅÛÀÌ ÆÇ¸ÅµÇ¾ú½À´Ï´Ù.',
    FUNDS_UPDATED: '±æµå ÀÚ±ÝÀÌ ¾÷µ¥ÀÌÆ®µÇ¾ú½À´Ï´Ù.',
    DISTRIBUTION_COMPLETED: 'ÁÖ±Þ ºÐ¹è°¡ ¿Ï·áµÇ¾ú½À´Ï´Ù.',
    BACKUP_CREATED: '¹é¾÷ÀÌ »ý¼ºµÇ¾ú½À´Ï´Ù.',
    CACHE_CLEARED: 'Ä³½Ã°¡ ÃÊ±âÈ­µÇ¾ú½À´Ï´Ù.'
  },
  
  // ¿À·ù ¸Þ½ÃÁö
  ERROR: {
    // ÀÎÁõ °ü·Ã
    INVALID_CREDENTIALS: '´Ð³×ÀÓ ¶Ç´Â ºñ¹Ð¹øÈ£°¡ ÀÏÄ¡ÇÏÁö ¾Ê½À´Ï´Ù.',
    USER_NOT_FOUND: '»ç¿ëÀÚ¸¦ Ã£À» ¼ö ¾ø½À´Ï´Ù.',
    USER_INACTIVE: 'ºñÈ°¼ºÈ­µÈ »ç¿ëÀÚÀÔ´Ï´Ù.',
    SESSION_EXPIRED: '¼¼¼ÇÀÌ ¸¸·áµÇ¾ú½À´Ï´Ù. ´Ù½Ã ·Î±×ÀÎÇØÁÖ¼¼¿ä.',
    PERMISSION_DENIED: '±ÇÇÑÀÌ ¾ø½À´Ï´Ù.',
    
    // µ¥ÀÌÅÍ °ËÁõ
    REQUIRED_FIELD: 'ÇÊ¼ö Ç×¸ñÀÌ ´©¶ôµÇ¾ú½À´Ï´Ù.',
    INVALID_FORMAT: 'Àß¸øµÈ Çü½ÄÀÔ´Ï´Ù.',
    DUPLICATE_NICKNAME: 'ÀÌ¹Ì Á¸ÀçÇÏ´Â ´Ð³×ÀÓÀÔ´Ï´Ù.',
    PASSWORD_TOO_SHORT: 'ºñ¹Ð¹øÈ£´Â 6ÀÚ ÀÌ»óÀÌ¾î¾ß ÇÕ´Ï´Ù.',
    PASSWORD_MISMATCH: 'ºñ¹Ð¹øÈ£°¡ ÀÏÄ¡ÇÏÁö ¾Ê½À´Ï´Ù.',
    NICKNAME_TOO_SHORT: '´Ð³×ÀÓÀº 2ÀÚ ÀÌ»óÀÌ¾î¾ß ÇÕ´Ï´Ù.',
    NICKNAME_TOO_LONG: '´Ð³×ÀÓÀº 20ÀÚ ÀÌÇÏ¿©¾ß ÇÕ´Ï´Ù.',
    
    // ½Ã½ºÅÛ ¿À·ù
    SYSTEM_ERROR: '½Ã½ºÅÛ ¿À·ù°¡ ¹ß»ýÇß½À´Ï´Ù.',
    DATABASE_ERROR: 'µ¥ÀÌÅÍº£ÀÌ½º ¿À·ù°¡ ¹ß»ýÇß½À´Ï´Ù.',
    NETWORK_ERROR: '³×Æ®¿öÅ© ¿À·ù°¡ ¹ß»ýÇß½À´Ï´Ù.',
    FILE_NOT_FOUND: 'ÆÄÀÏÀ» Ã£À» ¼ö ¾ø½À´Ï´Ù.',
    SHEET_NOT_FOUND: '½ÃÆ®¸¦ Ã£À» ¼ö ¾ø½À´Ï´Ù.',
    INVALID_DATA: 'Àß¸øµÈ µ¥ÀÌÅÍÀÔ´Ï´Ù.',
    
    // ºñÁî´Ï½º ·ÎÁ÷
    INSUFFICIENT_FUNDS: '±æµå ÀÚ±ÝÀÌ ºÎÁ·ÇÕ´Ï´Ù.',
    ITEM_ALREADY_SOLD: 'ÀÌ¹Ì ÆÇ¸ÅµÈ ¾ÆÀÌÅÛÀÔ´Ï´Ù.',
    BOSS_RECORD_EXISTS: 'ÀÌ¹Ì µî·ÏµÈ º¸½º ±â·ÏÀÔ´Ï´Ù.',
    INVALID_AMOUNT: 'Àß¸øµÈ ±Ý¾×ÀÔ´Ï´Ù.',
    FUTURE_DATE: '¹Ì·¡ ³¯Â¥´Â ¼±ÅÃÇÒ ¼ö ¾ø½À´Ï´Ù.'
  },
  
  // È®ÀÎ ¸Þ½ÃÁö
  CONFIRM: {
    DELETE: 'Á¤¸» »èÁ¦ÇÏ½Ã°Ú½À´Ï±î?',
    LOGOUT: '·Î±×¾Æ¿ôÇÏ½Ã°Ú½À´Ï±î?',
    PASSWORD_CHANGE: 'ºñ¹Ð¹øÈ£¸¦ º¯°æÇÏ½Ã°Ú½À´Ï±î?',
    MEMBER_DELETE: 'È¸¿øÀ» »èÁ¦ÇÏ½Ã°Ú½À´Ï±î?',
    BOSS_RECORD_DELETE: 'º¸½º ±â·ÏÀ» »èÁ¦ÇÏ½Ã°Ú½À´Ï±î?',
    DISTRIBUTION_EXECUTE: 'ÁÖ±Þ ºÐ¹è¸¦ ½ÇÇàÇÏ½Ã°Ú½À´Ï±î?',
    BACKUP_CREATE: '¹é¾÷À» »ý¼ºÇÏ½Ã°Ú½À´Ï±î?',
    CACHE_CLEAR: 'Ä³½Ã¸¦ ÃÊ±âÈ­ÇÏ½Ã°Ú½À´Ï±î?',
    SYSTEM_RESET: '½Ã½ºÅÛÀ» ÃÊ±âÈ­ÇÏ½Ã°Ú½À´Ï±î? ÀÌ ÀÛ¾÷Àº µÇµ¹¸± ¼ö ¾ø½À´Ï´Ù.'
  }
};

// ===== ·Î½ºÆ®¾ÆÅ© ¼­¹ö ¸ñ·Ï =====
const LOSTARK_SERVERS = [
  '·çÆä¿Â', '½Ç¸®¾È', '¾Æ¸¸', 'Ä«¸¶ÀÎ', 'Ä«Á¦·Î½º', 
  '¾Æºê·¼½´µå', 'Ä«´Ü', '´Ï³ªºê', 'º£¸¥', '¹Ù¸£Ä­', 
  'ÅäÅäÀÌÅ©', '¿¡Å°µå³ª', '³×¸®¾Æ', 'Å°¸®´Ù'
];

// ===== ·Î½ºÆ®¾ÆÅ© Á÷¾÷ ¸ñ·Ï =====
const LOSTARK_JOBS = {
  WARRIOR: {
    name: 'Àü»ç',
    jobs: ['¹ö¼­Ä¿', 'µð½ºÆ®·ÎÀÌ¾î', '¿ö·Îµå', 'È¦¸®³ªÀÌÆ®', '½½·¹ÀÌ¾î']
  },
  MARTIAL_ARTIST: {
    name: '¹«µµ°¡',
    jobs: ['¹èÆ²¸¶½ºÅÍ', 'ÀÎÆÄÀÌÅÍ', '±â°ø»ç', 'Ã¢¼ú»ç', '½ºÆ®¶óÀÌÄ¿', 'ºê·¹ÀÌÄ¿']
  },
  GUNNER: {
    name: '°Ç³Ê',
    jobs: ['°Ç½½¸µ¾î', '¾Æ¸£Æ¼½ºÆ®', 'µ¥ºôÇåÅÍ', 'ºí·¡½ºÅÍ', 'È£Å©¾ÆÀÌ', '½ºÄ«¿ìÅÍ']
  },
  MAGE: {
    name: '¸¶¹ý»ç',
    jobs: ['¹Ùµå', '¼­¸Ó³Ê', '¾Æ¸£Ä«³ª', '¼Ò¼­¸®½º']
  },
  ASSASSIN: {
    name: '¾Ï»ìÀÚ',
    jobs: ['ºí·¹ÀÌµå', 'µ¥¸ð´Ð', '¸®ÆÛ', '¼Ò¿ïÀÌÅÍ']
  },
  SPECIALIST: {
    name: '½ºÆä¼È¸®½ºÆ®',
    jobs: ['µµÈ­°¡', '±â»ó¼ú»ç']
  }
};

// ===== Á÷¾÷º° »ö»ó =====
const JOB_COLORS = {
  // Àü»ç
  '¹ö¼­Ä¿': '#E53E3E',
  'µð½ºÆ®·ÎÀÌ¾î': '#C53030',
  '¿ö·Îµå': '#9B2C2C',
  'È¦¸®³ªÀÌÆ®': '#742A2A',
  '½½·¹ÀÌ¾î': '#E53E3E',
  
  // ¹«µµ°¡
  '¹èÆ²¸¶½ºÅÍ': '#DD6B20',
  'ÀÎÆÄÀÌÅÍ': '#C05621',
  '±â°ø»ç': '#9C4221',
  'Ã¢¼ú»ç': '#7B341E',
  '½ºÆ®¶óÀÌÄ¿': '#DD6B20',
  'ºê·¹ÀÌÄ¿': '#C05621',
  
  // °Ç³Ê
  '°Ç½½¸µ¾î': '#38A169',
  '¾Æ¸£Æ¼½ºÆ®': '#2F855A',
  'µ¥ºôÇåÅÍ': '#276749',
  'ºí·¡½ºÅÍ': '#22543D',
  'È£Å©¾ÆÀÌ': '#1A202C',
  '½ºÄ«¿ìÅÍ': '#38A169',
  
  // ¸¶¹ý»ç
  '¹Ùµå': '#3182CE',
  '¼­¸Ó³Ê': '#2B6CB0',
  '¾Æ¸£Ä«³ª': '#2C5282',
  '¼Ò¼­¸®½º': '#2A4365',
  
  // ¾Ï»ìÀÚ
  'ºí·¹ÀÌµå': '#805AD5',
  'µ¥¸ð´Ð': '#6B46C1',
  '¸®ÆÛ': '#553C9A',
  '¼Ò¿ïÀÌÅÍ': '#44337A',
  
  // ½ºÆä¼È¸®½ºÆ®
  'µµÈ­°¡': '#D69E2E',
  '±â»ó¼ú»ç': '#00B5D8'
};

// ===== º¸½º ¸ñ·Ï =====
const BOSS_LIST = [
  '¹ßÅº', 'ºñ¾ÆÅ°½º', 'ÄíÅ©¼¼ÀÌÆ°', '¾Æºê·¼½´µå', 'ÀÏ¸®¾ÆÄ­', 
  'Ä«¾ç°Ö', '»ó¾ÆÅ¾', 'Ä«¸à', '¿¡Å°µå³ª', 'º£È÷¸ð½º',
  'È¥µ·ÀÇ »ó¾ÆÅ¾', 'Æ®¸®½Ã¿Â', 'Äí¸£ÀÜ'
];

// ===== ¾ÆÀÌÅÛ ¸ñ·Ï =====
const ITEM_LIST = [
  '¸¶¼öÀÇ »À', '±¤±âÀÇ µ¹', 'ÆÄ¸êÀÇ µ¹', 'Áú¼­ÀÇ µ¹', 'Ä«¿À½º µ¹',
  '½ÅºñÇÑ º¸¼®', '¿µÈ¥ÀÇ °áÁ¤', '°¢ÀÎ¼­', '¾îºô¸®Æ¼ ½ºÅæ',
  '¾×¼¼¼­¸®', '¹«±â', '¹æ¾î±¸', '°ñµå'
];

// ===== HTTP »óÅÂ ÄÚµå =====
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// ===== Á¤±Ô½Ä ÆÐÅÏ =====
const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NICKNAME: /^[°¡-ÆRa-zA-Z0-9_-]{2,20}$/,
  PASSWORD: /^.{6,}$/,
  PHONE: /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/,
  NUMBER: /^\d+$/,
  CURRENCY: /^\d{1,3}(,\d{3})*$/
};

// ===== ³¯Â¥ Çü½Ä =====
const DATE_FORMATS = {
  FULL: 'yyyy-MM-dd HH:mm:ss',
  DATE_ONLY: 'yyyy-MM-dd',
  TIME_ONLY: 'HH:mm:ss',
  DISPLAY: 'MM¿ù ddÀÏ',
  DISPLAY_FULL: 'yyyy³â MM¿ù ddÀÏ',
  ISO: 'yyyy-MM-ddTHH:mm:ss.SSSZ'
};

// ===== Åë°è ±â°£ =====
const STATISTICS_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly'
};

// ===== Á¤·Ä ¹æÇâ =====
const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc'
};

// ===== ÆäÀÌÁö Å©±â ¿É¼Ç =====
const PAGE_SIZES = [10, 25, 50, 100];

// ===== Ä³½Ã Å° =====
const CACHE_KEYS = {
  MEMBERS: 'guild_members',
  BOSS_STATISTICS: 'boss_statistics',
  GUILD_BALANCE: 'guild_balance',
  USER_SESSION: 'user_session_',
  BOSS_RECORDS: 'boss_records',
  STATISTICS: 'statistics_',
  SYSTEM_STATUS: 'system_status'
};

// ===== ÀÌº¥Æ® Å¸ÀÔ =====
const EVENT_TYPES = {
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_REGISTER: 'user_register',
  PASSWORD_CHANGE: 'password_change',
  MEMBER_ADDED: 'member_added',
  MEMBER_UPDATED: 'member_updated',
  MEMBER_DELETED: 'member_deleted',
  BOSS_RECORD_ADDED: 'boss_record_added',
  ITEM_SOLD: 'item_sold',
  FUNDS_UPDATED: 'funds_updated',
  DISTRIBUTION_EXECUTED: 'distribution_executed',
  SYSTEM_ERROR: 'system_error',
  DATA_BACKUP: 'data_backup'
};

// ===== CSS Å¬·¡½º ÀÌ¸§ =====
const CSS_CLASSES = {
  // »óÅÂ °ü·Ã
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DISABLED: 'disabled',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
  WARNING: 'warning',
  
  // ÄÄÆ÷³ÍÆ®
  MODAL: 'modal',
  TOOLTIP: 'tooltip',
  DROPDOWN: 'dropdown',
  TAB: 'tab',
  CARD: 'card',
  BUTTON: 'btn',
  FORM: 'form',
  TABLE: 'table',
  
  // ·¹ÀÌ¾Æ¿ô
  CONTAINER: 'container',
  ROW: 'row',
  COLUMN: 'col',
  SIDEBAR: 'sidebar',
  NAVBAR: 'navbar',
  CONTENT: 'content'
};

// ===== ¾ÆÀÌÄÜ ÀÌ¸§ (Material Icons) =====
const ICONS = {
  // ±âº»
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'delete',
  SAVE: 'save',
  CANCEL: 'cancel',
  SEARCH: 'search',
  FILTER: 'filter_list',
  SORT: 'sort',
  REFRESH: 'refresh',
  
  // ³×ºñ°ÔÀÌ¼Ç
  HOME: 'home',
  BACK: 'arrow_back',
  FORWARD: 'arrow_forward',
  UP: 'keyboard_arrow_up',
  DOWN: 'keyboard_arrow_down',
  
  // »ç¿ëÀÚ
  PERSON: 'person',
  PEOPLE: 'people',
  ACCOUNT: 'account_circle',
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // »óÅÂ
  CHECK: 'check',
  CLOSE: 'close',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info',
  SUCCESS: 'check_circle',
  
  // ±â´É
  SETTINGS: 'settings',
  HELP: 'help',
  NOTIFICATION: 'notifications',
  EMAIL: 'email',
  PHONE: 'phone',
  
  // °ÔÀÓ °ü·Ã
  GAME: 'sports_esports',
  TROPHY: 'emoji_events',
  SHIELD: 'shield',
  SWORD: 'casino',
  
  // ±ÝÀ¶
  MONEY: 'attach_money',
  WALLET: 'account_balance_wallet',
  CHART: 'bar_chart',
  TREND: 'trending_up'
};