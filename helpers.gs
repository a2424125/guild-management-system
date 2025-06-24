/**
 * 공통 유틸리티 함수들 (CSP 완전 호환 버전)
 * 시스템 전반에서 재사용되는 헬퍼 함수들을 제공
 * eval() 및 동적 코드 실행 완전 제거
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
   * 닉네임 유효성 검증 - CSP 안전
   */
  isValidNickname: function(nickname) {
    if (this.isEmpty(nickname)) return false;
    // 정규식 직접 사용 - eval 없음
    return /^[가-힣a-zA-Z0-9]{2,20}$/.test(nickname);
  },
  
  /**
   * 비밀번호 유효성 검증
   */
  isValidPassword: function(password) {
    if (this.isEmpty(password)) return false;
    // SystemConfig 안전 접근
    const minLength = (typeof SystemConfig !== 'undefined' && 
                      SystemConfig.BUSINESS_RULES && 
                      SystemConfig.BUSINESS_RULES.PASSWORD_MIN_LENGTH) ? 
                      SystemConfig.BUSINESS_RULES.PASSWORD_MIN_LENGTH : 6;
    return password.length >= minLength;
  },
  
  /**
   * 문자열을 파스칼 케이스로 변환 - CSP 안전
   */
  toPascalCase: function(str) {
    if (!str) return '';
    return str.replace(/\w+/g, function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
  },
  
  /**
   * 문자열을 카멜 케이스로 변환 - CSP 안전
   */
  toCamelCase: function(str) {
    if (!str) return '';
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  },
  
  /**
   * 이메일 유효성 검증 - CSP 안전
   */
  isValidEmail: function(email) {
    if (this.isEmpty(email)) return false;
    // 정규식 직접 사용
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  
  /**
   * 텍스트 자르기 (말줄임표 추가)
   */
  truncate: function(str, length, suffix) {
    length = length || 50;
    suffix = suffix || '...';
    if (!str || str.length <= length) return str;
    return str.substring(0, length) + suffix;
  },
  
  /**
   * HTML 이스케이프 - CSP 안전
   */
  escapeHtml: function(text) {
    if (!text) return '';
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(char) {
      return escapeMap[char] || char;
    });
  },
  
  /**
   * 문자열에서 숫자만 추출
   */
  extractNumbers: function(str) {
    if (!str) return '';
    return str.replace(/[^0-9]/g, '');
  },
  
  /**
   * 문자열 포함 여부 확인 (대소문자 무시)
   */
  containsIgnoreCase: function(str, searchStr) {
    if (!str || !searchStr) return false;
    return str.toLowerCase().indexOf(searchStr.toLowerCase()) !== -1;
  }
};

// ===== 숫자 유틸리티 =====
const NumberUtils = {
  /**
   * 숫자 포맷팅 (천단위 콤마) - CSP 안전
   */
  format: function(num) {
    if (typeof num !== 'number') {
      num = parseFloat(num) || 0;
    }
    // Intl.NumberFormat 사용 - eval 없음
    try {
      return new Intl.NumberFormat('ko-KR').format(num);
    } catch (e) {
      // 폴백: 수동 콤마 추가
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  },
  
  /**
   * 통화 포맷팅
   */
  formatCurrency: function(num, currency) {
    currency = currency || '원';
    return this.format(num) + currency;
  },
  
  /**
   * 숫자인지 확인 - CSP 안전
   */
  isNumber: function(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },
  
  /**
   * 안전한 숫자 변환
   */
  toNumber: function(value, defaultValue) {
    defaultValue = defaultValue || 0;
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
  toPercent: function(value, total, decimals) {
    decimals = decimals || 1;
    if (total === 0) return 0;
    const percent = (value / total) * 100;
    return Math.round(percent * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },
  
  /**
   * 수수료 계산 - CSP 안전
   */
  calculateCommission: function(amount, rate) {
    // 기본 수수료율 안전하게 가져오기
    if (!rate) {
      rate = (typeof SystemConfig !== 'undefined' && 
              SystemConfig.BUSINESS_RULES && 
              SystemConfig.BUSINESS_RULES.COMMISSION_RATE) ? 
              SystemConfig.BUSINESS_RULES.COMMISSION_RATE : 0.08;
    }
    return Math.round(amount * rate);
  },
  
  /**
   * 실수령액 계산
   */
  calculateNetAmount: function(grossAmount, commissionRate) {
    const commission = this.calculateCommission(grossAmount, commissionRate);
    return grossAmount - commission;
  },
  
  /**
   * 숫자 반올림 (소수점 지정)
   */
  round: function(num, decimals) {
    decimals = decimals || 0;
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },
  
  /**
   * 랜덤 숫자 생성
   */
  random: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
   * 날짜 포맷팅 - CSP 안전
   */
  format: function(date, format) {
    if (!date) return '';
    if (typeof date === 'string') date = new Date(date);
    
    // 기본 포맷
    format = format || 'yyyy-MM-dd HH:mm:ss';
    
    try {
      // Utilities.formatDate 사용 (Google Apps Script 내장)
      return Utilities.formatDate(date, 'GMT+9', format);
    } catch (e) {
      // 폴백: 수동 포맷팅
      return this.manualFormat(date, format);
    }
  },
  
  /**
   * 수동 날짜 포맷팅 - CSP 안전
   */
  manualFormat: function(date, format) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return format
      .replace('yyyy', year)
      .replace('MM', month)
      .replace('dd', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },
  
  /**
   * 표시용 날짜 포맷
   */
  formatDisplay: function(date) {
    return this.format(date, 'yyyy년 MM월 dd일 HH시 mm분');
  },
  
  /**
   * 상대 시간 계산 (예: "3일 전") - CSP 안전
   */
  getRelativeTime: function(date) {
    if (!date) return '';
    if (typeof date === 'string') date = new Date(date);
    
    const now = this.now();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return diffDays + '일 전';
    if (diffDays < 30) return Math.floor(diffDays / 7) + '주 전';
    if (diffDays < 365) return Math.floor(diffDays / 30) + '개월 전';
    return Math.floor(diffDays / 365) + '년 전';
  },
  
  /**
   * 주차 계산 - CSP 안전
   */
  getWeekOfYear: function(date) {
    date = date || this.now();
    if (typeof date === 'string') date = new Date(date);
    
    try {
      return parseInt(Utilities.formatDate(date, 'GMT+9', 'w'));
    } catch (e) {
      // 폴백: 수동 계산
      const start = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor((date - start) / (24 * 60 * 60 * 1000));
      return Math.ceil(days / 7);
    }
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
  },
  
  /**
   * 날짜 범위 내인지 확인
   */
  isInRange: function(date, startDate, endDate) {
    if (typeof date === 'string') date = new Date(date);
    if (typeof startDate === 'string') startDate = new Date(startDate);
    if (typeof endDate === 'string') endDate = new Date(endDate);
    
    return date >= startDate && date <= endDate;
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
   * 중복 제거 - CSP 안전
   */
  unique: function(arr) {
    if (!Array.isArray(arr)) return [];
    
    // Set 사용 (ES6+)
    try {
      return Array.from(new Set(arr));
    } catch (e) {
      // 폴백: 수동 중복 제거
      const result = [];
      for (let i = 0; i < arr.length; i++) {
        if (result.indexOf(arr[i]) === -1) {
          result.push(arr[i]);
        }
      }
      return result;
    }
  },
  
  /**
   * 배열을 청크로 나누기
   */
  chunk: function(arr, size) {
    if (!Array.isArray(arr)) return [];
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
   * 배열 셔플 - CSP 안전
   */
  shuffle: function(arr) {
    if (!Array.isArray(arr)) return [];
    const result = arr.slice(); // 복사본 생성
    
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      // 교환
      const temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }
    return result;
  },
  
  /**
   * 그룹화 - CSP 안전
   */
  groupBy: function(arr, keyOrFunction) {
    if (!Array.isArray(arr)) return {};
    
    const groups = {};
    
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      let key;
      
      if (typeof keyOrFunction === 'function') {
        key = keyOrFunction(item);
      } else {
        key = item[keyOrFunction];
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    }
    
    return groups;
  },
  
  /**
   * 배열 평탄화
   */
  flatten: function(arr) {
    if (!Array.isArray(arr)) return [];
    
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      if (Array.isArray(arr[i])) {
        result.push.apply(result, this.flatten(arr[i]));
      } else {
        result.push(arr[i]);
      }
    }
    return result;
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
   * 깊은 복사 - CSP 안전 (JSON 방식)
   */
  deepClone: function(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      // 폴백: 얕은 복사
      return this.shallowClone(obj);
    }
  },
  
  /**
   * 얕은 복사
   */
  shallowClone: function(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = obj[key];
      }
    }
    return cloned;
  },
  
  /**
   * 안전한 속성 접근 - CSP 안전
   */
  get: function(obj, path, defaultValue) {
    defaultValue = defaultValue || null;
    
    if (!obj || !path) return defaultValue;
    
    const keys = path.split('.');
    let result = obj;
    
    for (let i = 0; i < keys.length; i++) {
      if (result == null || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[keys[i]];
    }
    
    return result !== undefined ? result : defaultValue;
  },
  
  /**
   * 속성 설정 - CSP 안전
   */
  set: function(obj, path, value) {
    if (!obj || !path) return;
    
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = obj;
    
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
  },
  
  /**
   * 객체 병합 - CSP 안전
   */
  merge: function(target) {
    if (!target) target = {};
    
    // arguments를 배열로 변환
    const sources = Array.prototype.slice.call(arguments, 1);
    
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      if (source && typeof source === 'object') {
        for (const key in source) {
          if (source.hasOwnProperty(key)) {
            target[key] = source[key];
          }
        }
      }
    }
    
    return target;
  },
  
  /**
   * 특정 키만 선택
   */
  pick: function(obj, keys) {
    if (!obj || !Array.isArray(keys)) return {};
    
    const result = {};
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result;
  },
  
  /**
   * 특정 키 제외
   */
  omit: function(obj, keys) {
    if (!obj) return {};
    if (!Array.isArray(keys)) return obj;
    
    const result = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && keys.indexOf(key) === -1) {
        result[key] = obj[key];
      }
    }
    return result;
  },
  
  /**
   * 객체의 키-값 순회
   */
  forEach: function(obj, callback) {
    if (!obj || typeof callback !== 'function') return;
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        callback(obj[key], key, obj);
      }
    }
  }
};

// ===== 보안 유틸리티 =====
const SecurityUtils = {
  /**
   * 비밀번호 해시화 - CSP 안전
   */
  hashPassword: function(password) {
    try {
      const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
      return Utilities.base64Encode(hash);
    } catch (e) {
      // 폴백: 간단한 해시
      return this.simpleHash(password);
    }
  },
  
  /**
   * 간단한 해시 함수 (폴백용)
   */
  simpleHash: function(str) {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32비트 정수로 변환
    }
    return hash.toString();
  },
  
  /**
   * 랜덤 문자열 생성 - CSP 안전
   */
  generateRandomString: function(length) {
    length = length || 16;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  /**
   * UUID 생성 - CSP 안전
   */
  generateUUID: function() {
    // UUID v4 패턴
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
  
  /**
   * 입력값 이스케이프 (XSS 방지) - CSP 안전
   */
  escapeHtml: function(text) {
    if (!text) return '';
    
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, function(match) {
      return escapeMap[match];
    });
  },
  
  /**
   * SQL 인젝션 방지를 위한 문자열 이스케이프
   */
  escapeSql: function(str) {
    if (!str) return '';
    
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
  },
  
  /**
   * 안전한 비교 (타이밍 공격 방지)
   */
  safeCompare: function(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
      return false;
    }
    
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }
};

// ===== 캐시 유틸리티 =====
const CacheUtils = {
  /**
   * 캐시에서 데이터 가져오기 - CSP 안전
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
   * 캐시에 데이터 저장 - CSP 안전
   */
  set: function(key, data, expirationInSeconds) {
    // 기본 캐시 지속시간 안전하게 가져오기
    if (!expirationInSeconds) {
      expirationInSeconds = (typeof SystemConfig !== 'undefined' && 
                            SystemConfig.BUSINESS_RULES && 
                            SystemConfig.BUSINESS_RULES.CACHE_DURATION) ? 
                            SystemConfig.BUSINESS_RULES.CACHE_DURATION : 300;
    }
    
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
   * 모든 캐시 삭제 - CSP 안전
   */
  clear: function() {
    try {
      const cache = CacheService.getScriptCache();
      
      // CACHE_KEYS가 정의되어 있다면 사용
      if (typeof CACHE_KEYS !== 'undefined') {
        const keys = [];
        for (const key in CACHE_KEYS) {
          if (CACHE_KEYS.hasOwnProperty(key)) {
            keys.push(CACHE_KEYS[key]);
          }
        }
        cache.removeAll(keys);
      }
      
      console.log('✅ 캐시 삭제 완료');
      return true;
    } catch (error) {
      console.error('❌ 캐시 삭제 실패:', error);
      return false;
    }
  },
  
  /**
   * 캐시 또는 함수 실행 결과 반환
   */
  getOrSet: function(key, fetchFunction, expirationInSeconds) {
    let data = this.get(key);
    
    if (data === null && typeof fetchFunction === 'function') {
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
   * 로그 기록 - CSP 안전
   */
  log: function(level, message, data) {
    // 로깅 활성화 확인
    const loggingEnabled = (typeof SystemConfig !== 'undefined' && 
                           SystemConfig.LOGGING && 
                           SystemConfig.LOGGING.ENABLED) ? 
                           SystemConfig.LOGGING.ENABLED : true;
    
    if (!loggingEnabled) return;
    
    const timestamp = DateUtils.format(DateUtils.now());
    const logEntry = {
      timestamp: timestamp,
      level: level,
      message: message,
      data: data || null
    };
    
    // 콘솔 출력
    console.log('[' + timestamp + '] ' + level + ': ' + message, data || '');
    
    // 중요한 로그는 시트에 저장
    if (level === 'ERROR' || level === 'FATAL') {
      this.saveToSheet(logEntry);
    }
  },
  
  /**
   * 디버그 로그
   */
  debug: function(message, data) {
    const debugEnabled = (typeof SystemConfig !== 'undefined' && 
                         SystemConfig.LOGGING && 
                         SystemConfig.LOGGING.LEVEL === 'DEBUG') ? true : false;
    
    if (debugEnabled) {
      this.log('DEBUG', message, data);
    }
  },
  
  /**
   * 정보 로그
   */
  info: function(message, data) {
    this.log('INFO', message, data);
  },
  
  /**
   * 경고 로그
   */
  warn: function(message, data) {
    this.log('WARN', message, data);
  },
  
  /**
   * 오류 로그
   */
  error: function(message, data) {
    this.log('ERROR', message, data);
  },
  
  /**
   * 치명적 오류 로그
   */
  fatal: function(message, data) {
    this.log('FATAL', message, data);
  },
  
  /**
   * 시트에 로그 저장 - CSP 안전
   */
  saveToSheet: function(logEntry) {
    try {
      // DatabaseUtils가 있는 경우에만 시도
      if (typeof DatabaseUtils !== 'undefined' && 
          typeof DatabaseUtils.getOrCreateSheet === 'function') {
        
        const sheetName = (typeof SystemConfig !== 'undefined' && 
                          SystemConfig.SHEET_NAMES && 
                          SystemConfig.SHEET_NAMES.SYSTEM_LOGS) ? 
                          SystemConfig.SHEET_NAMES.SYSTEM_LOGS : 'SystemLogs';
        
        const sheet = DatabaseUtils.getOrCreateSheet(sheetName, [
          'timestamp', 'level', 'message', 'data', 'user'
        ]);
        
        const user = Session.getActiveUser().getEmail();
        sheet.appendRow([
          logEntry.timestamp,
          logEntry.level,
          logEntry.message,
          JSON.stringify(logEntry.data),
          user
        ]);
      }
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
    
    // 성능 메트릭 표시 옵션 확인
    const showMetrics = (typeof SystemConfig !== 'undefined' && 
                        SystemConfig.DEBUG && 
                        SystemConfig.DEBUG.SHOW_PERFORMANCE_METRICS) ? 
                        SystemConfig.DEBUG.SHOW_PERFORMANCE_METRICS : false;
    
    if (showMetrics) {
      console.log('⏱️ ' + name + ': ' + duration + 'ms');
    }
    
    return duration;
  },
  
  /**
   * 함수 실행 시간 측정 - CSP 안전
   */
  measure: function(name, func) {
    if (typeof func !== 'function') {
      throw new Error('measure 함수에는 실행할 함수가 필요합니다.');
    }
    
    this.start(name);
    const result = func();
    this.end(name);
    return result;
  }
};
