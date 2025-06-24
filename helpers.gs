/**
 * 공통 유틸리티 함수들
 * 시스템 전반에서 재사용되는 헬퍼 함수들을 제공
 */

// ===== 문자열 유틸리티 =====
const StringUtils = {
  /**
   * 문자열이 비어있는지 확인
   */
  isEmpty: function(str) {
    return !str || str.trim().length === 0;
  },
  
  /**
   * 문자열 앞뒤 공백 제거 및 null 체크
   */
  safeTrim: function(str) {
    return str ? str.toString().trim() : '';
  },
  
  /**
   * 문자열 길이 검증
   */
  isValidLength: function(str, min = 0, max = Infinity) {
    const length = str ? str.length : 0;
    return length >= min && length <= max;
  },
  
  /**
   * 닉네임 유효성 검증
   */
  isValidNickname: function(nickname) {
    if (this.isEmpty(nickname)) return false;
    return REGEX_PATTERNS.NICKNAME.test(nickname);
  },
  
  /**
   * 비밀번호 유효성 검증
   */
  isValidPassword: function(password) {
    if (this.isEmpty(password)) return false;
    return password.length >= SystemConfig.BUSINESS_RULES.PASSWORD_MIN_LENGTH;
  },
  
  /**
   * 문자열을 파스칼 케이스로 변환
   */
  toPascalCase: function(str) {
    return str.replace(/\w+/g, function(w) {
      return w[0].toUpperCase() + w.slice(1).toLowerCase();
    });
  },
  
  /**
   * 문자열을 카멜 케이스로 변환
   */
  toCamelCase: function(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  },
  
  /**
   * 이메일 유효성 검증
   */
  isValidEmail: function(email) {
    if (this.isEmpty(email)) return false;
    return REGEX_PATTERNS.EMAIL.test(email);
  },
  
  /**
   * 텍스트 자르기 (말줄임표 추가)
   */
  truncate: function(str, length = 50, suffix = '...') {
    if (!str || str.length <= length) return str;
    return str.substring(0, length) + suffix;
  }
};

// ===== 숫자 유틸리티 =====
const NumberUtils = {
  /**
   * 숫자 포맷팅 (천단위 콤마)
   */
  format: function(num) {
    if (typeof num !== 'number') {
      num = parseFloat(num) || 0;
    }
    return new Intl.NumberFormat('ko-KR').format(num);
  },
  
  /**
   * 통화 포맷팅
   */
  formatCurrency: function(num, currency = '원') {
    return this.format(num) + currency;
  },
  
  /**
   * 숫자인지 확인
   */
  isNumber: function(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },
  
  /**
   * 안전한 숫자 변환
   */
  toNumber: function(value, defaultValue = 0) {
    const num = parseFloat(value);
    return this.isNumber(num) ? num : defaultValue;
  },
  
  /**
   * 범위 내 숫자인지 확인
   */
  inRange: function(num, min, max) {
    return num >= min && num <= max;
  },
  
  /**
   * 퍼센트 계산
   */
  toPercent: function(value, total, decimals = 1) {
    if (total === 0) return 0;
    const percent = (value / total) * 100;
    return Math.round(percent * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },
  
  /**
   * 수수료 계산
   */
  calculateCommission: function(amount, rate = SystemConfig.BUSINESS_RULES.COMMISSION_RATE) {
    return Math.round(amount * rate);
  },
  
  /**
   * 실수령액 계산
   */
  calculateNetAmount: function(grossAmount, commissionRate = SystemConfig.BUSINESS_RULES.COMMISSION_RATE) {
    const commission = this.calculateCommission(grossAmount, commissionRate);
    return grossAmount - commission;
  }
};

// ===== 날짜 유틸리티 =====
const DateUtils = {
  /**
   * 현재 한국 시간 반환
   */
  now: function() {
    return new Date();
  },
  
  /**
   * 날짜 포맷팅
   */
  format: function(date, format = DATE_FORMATS.FULL) {
    if (!date) return '';
    if (typeof date === 'string') date = new Date(date);
    return Utilities.formatDate(date, 'GMT+9', format);
  },
  
  /**
   * 표시용 날짜 포맷
   */
  formatDisplay: function(date) {
    return this.format(date, DATE_FORMATS.DISPLAY_FULL);
  },
  
  /**
   * 상대 시간 계산 (예: "3일 전")
   */
  getRelativeTime: function(date) {
    if (!date) return '';
    if (typeof date === 'string') date = new Date(date);
    
    const now = this.now();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
    return `${Math.floor(diffDays / 365)}년 전`;
  },
  
  /**
   * 주차 계산
   */
  getWeekOfYear: function(date = this.now()) {
    if (typeof date === 'string') date = new Date(date);
    return parseInt(Utilities.formatDate(date, 'GMT+9', 'w'));
  },
  
  /**
   * 날짜 더하기
   */
  addDays: function(date, days) {
    if (typeof date === 'string') date = new Date(date);
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },
  
  /**
   * 날짜 차이 계산 (일 단위)
   */
  diffInDays: function(date1, date2) {
    if (typeof date1 === 'string') date1 = new Date(date1);
    if (typeof date2 === 'string') date2 = new Date(date2);
    
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },
  
  /**
   * 미래 날짜인지 확인
   */
  isFuture: function(date) {
    if (typeof date === 'string') date = new Date(date);
    return date > this.now();
  },
  
  /**
   * 유효한 날짜인지 확인
   */
  isValid: function(date) {
    return date instanceof Date && !isNaN(date);
  }
};

// ===== 배열 유틸리티 =====
const ArrayUtils = {
  /**
   * 배열이 비어있는지 확인
   */
  isEmpty: function(arr) {
    return !Array.isArray(arr) || arr.length === 0;
  },
  
  /**
   * 안전한 배열 변환
   */
  toArray: function(value) {
    if (Array.isArray(value)) return value;
    if (value == null) return [];
    return [value];
  },
  
  /**
   * 중복 제거
   */
  unique: function(arr) {
    return [...new Set(arr)];
  },
  
  /**
   * 배열을 청크로 나누기
   */
  chunk: function(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },
  
  /**
   * 배열에서 랜덤 요소 선택
   */
  random: function(arr) {
    if (this.isEmpty(arr)) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  },
  
  /**
   * 배열 셞플
   */
  shuffle: function(arr) {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },
  
  /**
   * 그룹화
   */
  groupBy: function(arr, key) {
    return arr.reduce((groups, item) => {
      const group = typeof key === 'function' ? key(item) : item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }
};

// ===== 객체 유틸리티 =====
const ObjectUtils = {
  /**
   * 객체가 비어있는지 확인
   */
  isEmpty: function(obj) {
    return !obj || Object.keys(obj).length === 0;
  },
  
  /**
   * 깊은 복사
   */
  deepClone: function(obj) {
    return JSON.parse(JSON.stringify(obj));
  },
  
  /**
   * 안전한 속성 접근
   */
  get: function(obj, path, defaultValue = null) {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result == null || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result !== undefined ? result : defaultValue;
  },
  
  /**
   * 속성 설정
   */
  set: function(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = obj;
    
    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
  },
  
  /**
   * 객체 병합
   */
  merge: function(target, ...sources) {
    if (!target) target = {};
    
    sources.forEach(source => {
      if (source && typeof source === 'object') {
        Object.assign(target, source);
      }
    });
    
    return target;
  },
  
  /**
   * 특정 키만 선택
   */
  pick: function(obj, keys) {
    const result = {};
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  },
  
  /**
   * 특정 키 제외
   */
  omit: function(obj, keys) {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  }
};

// ===== 보안 유틸리티 =====
const SecurityUtils = {
  /**
   * 비밀번호 해시화
   */
  hashPassword: function(password) {
    const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
    return Utilities.base64Encode(hash);
  },
  
  /**
   * 랜덤 문자열 생성
   */
  generateRandomString: function(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  /**
   * UUID 생성
   */
  generateUUID: function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
  
  /**
   * 입력값 이스케이프 (XSS 방지)
   */
  escapeHtml: function(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  },
  
  /**
   * SQL 인젝션 방지를 위한 문자열 이스케이프
   */
  escapeSql: function(str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function(char) {
      switch (char) {
        case "\0": return "\\0";
        case "\x08": return "\\b";
        case "\x09": return "\\t";
        case "\x1a": return "\\z";
        case "\n": return "\\n";
        case "\r": return "\\r";
        case "\"":
        case "'":
        case "\\":
        case "%": return "\\" + char;
        default: return char;
      }
    });
  }
};

// ===== 캐시 유틸리티 =====
const CacheUtils = {
  /**
   * 캐시에서 데이터 가져오기
   */
  get: function(key) {
    try {
      const cache = CacheService.getScriptCache();
      const data = cache.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('캐시 읽기 실패:', key, error);
      return null;
    }
  },
  
  /**
   * 캐시에 데이터 저장
   */
  set: function(key, data, expirationInSeconds = SystemConfig.BUSINESS_RULES.CACHE_DURATION) {
    try {
      const cache = CacheService.getScriptCache();
      cache.put(key, JSON.stringify(data), expirationInSeconds);
      return true;
    } catch (error) {
      console.warn('캐시 저장 실패:', key, error);
      return false;
    }
  },
  
  /**
   * 캐시에서 데이터 삭제
   */
  remove: function(key) {
    try {
      const cache = CacheService.getScriptCache();
      cache.remove(key);
      return true;
    } catch (error) {
      console.warn('캐시 삭제 실패:', key, error);
      return false;
    }
  },
  
  /**
   * 모든 캐시 삭제
   */
  clear: function() {
    try {
      const cache = CacheService.getScriptCache();
      cache.removeAll(Object.values(CACHE_KEYS));
      console.log('✅ 모든 캐시 삭제 완료');
      return true;
    } catch (error) {
      console.error('❌ 캐시 삭제 실패:', error);
      return false;
    }
  },
  
  /**
   * 캐시 또는 함수 실행 결과 반환
   */
  getOrSet: function(key, fetchFunction, expirationInSeconds = SystemConfig.BUSINESS_RULES.CACHE_DURATION) {
    let data = this.get(key);
    
    if (data === null) {
      data = fetchFunction();
      if (data !== null && data !== undefined) {
        this.set(key, data, expirationInSeconds);
      }
    }
    
    return data;
  }
};

// ===== 로깅 유틸리티 =====
const LogUtils = {
  /**
   * 로그 기록
   */
  log: function(level, message, data = null) {
    if (!SystemConfig.LOGGING.ENABLED) return;
    
    const timestamp = DateUtils.format(DateUtils.now());
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };
    
    // 콘솔 출력
    console.log(`[${timestamp}] ${level}: ${message}`, data || '');
    
    // 필요시 시트에 로그 저장
    if (level === LOG_LEVELS.ERROR || level === LOG_LEVELS.FATAL) {
      this.saveToSheet(logEntry);
    }
  },
  
  /**
   * 디버그 로그
   */
  debug: function(message, data = null) {
    if (SystemConfig.LOGGING.LEVEL === LOG_LEVELS.DEBUG) {
      this.log(LOG_LEVELS.DEBUG, message, data);
    }
  },
  
  /**
   * 정보 로그
   */
  info: function(message, data = null) {
    this.log(LOG_LEVELS.INFO, message, data);
  },
  
  /**
   * 경고 로그
   */
  warn: function(message, data = null) {
    this.log(LOG_LEVELS.WARN, message, data);
  },
  
  /**
   * 오류 로그
   */
  error: function(message, data = null) {
    this.log(LOG_LEVELS.ERROR, message, data);
  },
  
  /**
   * 치명적 오류 로그
   */
  fatal: function(message, data = null) {
    this.log(LOG_LEVELS.FATAL, message, data);
  },
  
  /**
   * 시트에 로그 저장
   */
  saveToSheet: function(logEntry) {
    try {
      const sheet = DatabaseUtils.getOrCreateSheet(SystemConfig.SHEET_NAMES.SYSTEM_LOGS, [
        '시간', '레벨', '메시지', '데이터', '사용자'
      ]);
      
      const user = Session.getActiveUser().getEmail();
      sheet.appendRow([
        logEntry.timestamp,
        logEntry.level,
        logEntry.message,
        JSON.stringify(logEntry.data),
        user
      ]);
      
    } catch (error) {
      console.error('로그 저장 실패:', error);
    }
  }
};

// ===== 성능 측정 유틸리티 =====
const PerformanceUtils = {
  timers: {},
  
  /**
   * 타이머 시작
   */
  start: function(name) {
    this.timers[name] = new Date().getTime();
  },
  
  /**
   * 타이머 종료 및 시간 반환
   */
  end: function(name) {
    if (!(name in this.timers)) {
      console.warn('타이머를 찾을 수 없음:', name);
      return 0;
    }
    
    const duration = new Date().getTime() - this.timers[name];
    delete this.timers[name];
    
    if (SystemConfig.DEBUG.SHOW_PERFORMANCE_METRICS) {
      console.log(`⏱️ ${name}: ${duration}ms`);
    }
    
    return duration;
  },
  
  /**
   * 함수 실행 시간 측정
   */
  measure: function(name, func) {
    this.start(name);
    const result = func();
    this.end(name);
    return result;
  }
};