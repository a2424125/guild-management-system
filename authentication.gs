/**
 * 인증 및 권한 관리 서비스
 * 의존성: SystemConfig, SecurityUtils, StringUtils, DateUtils, CacheUtils
 */

const AuthService = {
  
  // ===== 로그인 =====
  login: function(credentials) {
    try {
      LogUtils.info('로그인 시도', { nickname: credentials.nickname });
      
      // 입력값 검증
      const validation = this.validateLoginInput(credentials);
      if (!validation.isValid) {
        return {
          success: false,
          code: RESPONSE_CODES.VALIDATION_ERROR,
          message: validation.message
        };
      }
      
      // 사용자 조회
      const user = this.findUserByNickname(credentials.nickname);
      if (!user) {
        LogUtils.warn('존재하지 않는 사용자', { nickname: credentials.nickname });
        return {
          success: false,
          code: RESPONSE_CODES.AUTHENTICATION_ERROR,
          message: MESSAGES.ERROR.INVALID_CREDENTIALS
        };
      }
      
      // 비밀번호 검증
      const hashedPassword = SecurityUtils.hashPassword(credentials.password);
      if (user.password !== hashedPassword) {
        LogUtils.warn('비밀번호 불일치', { nickname: credentials.nickname });
        return {
          success: false,
          code: RESPONSE_CODES.AUTHENTICATION_ERROR,
          message: MESSAGES.ERROR.INVALID_CREDENTIALS
        };
      }
      
      // 계정 상태 확인
      if (user.status !== 'ACTIVE') {
        LogUtils.warn('비활성 계정 로그인 시도', { nickname: credentials.nickname, status: user.status });
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: '비활성화된 계정입니다.'
        };
      }
      
      // 세션 생성
      const session = this.createSession(user);
      
      // 로그인 시간 업데이트
      this.updateLastLogin(user.id);
      
      // 로그인 이벤트 로깅
      LogUtils.info('로그인 성공', { 
        userId: user.id, 
        nickname: user.nickname,
        role: user.role 
      });
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        message: MESSAGES.SUCCESS.LOGIN,
        data: {
          user: this.sanitizeUserData(user),
          session: session,
          permissions: this.getUserPermissions(user.role)
        }
      };
      
    } catch (error) {
      LogUtils.error('로그인 오류', error);
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 회원가입 =====
  register: function(userData) {
    try {
      LogUtils.info('회원가입 시도', { nickname: userData.nickname });
      
      // 입력값 검증
      const validation = this.validateRegisterInput(userData);
      if (!validation.isValid) {
        return {
          success: false,
          code: RESPONSE_CODES.VALIDATION_ERROR,
          message: validation.message
        };
      }
      
      // 중복 확인
      const existingUser = this.findUserByNickname(userData.nickname);
      if (existingUser) {
        LogUtils.warn('중복 닉네임', { nickname: userData.nickname });
        return {
          success: false,
          code: RESPONSE_CODES.DUPLICATE_ERROR,
          message: '이미 존재하는 닉네임입니다.'
        };
      }
      
      // 이메일 중복 확인
      if (userData.email && this.findUserByEmail(userData.email)) {
        LogUtils.warn('중복 이메일', { email: userData.email });
        return {
          success: false,
          code: RESPONSE_CODES.DUPLICATE_ERROR,
          message: '이미 존재하는 이메일입니다.'
        };
      }
      
      // 사용자 데이터 생성
      const newUser = this.createUser(userData);
      
      // 데이터베이스에 저장
      const savedUser = this.saveUser(newUser);
      
      LogUtils.info('회원가입 성공', { 
        userId: savedUser.id, 
        nickname: savedUser.nickname 
      });
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        message: MESSAGES.SUCCESS.REGISTER,
        data: {
          user: this.sanitizeUserData(savedUser)
        }
      };
      
    } catch (error) {
      LogUtils.error('회원가입 오류', error);
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 로그아웃 =====
  logout: function(sessionToken) {
    try {
      if (!sessionToken) {
        return {
          success: false,
          code: RESPONSE_CODES.VALIDATION_ERROR,
          message: '세션 토큰이 필요합니다.'
        };
      }
      
      // 세션 삭제
      this.destroySession(sessionToken);
      
      LogUtils.info('로그아웃 완료', { sessionToken });
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        message: MESSAGES.SUCCESS.LOGOUT
      };
      
    } catch (error) {
      LogUtils.error('로그아웃 오류', error);
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 세션 검증 =====
  checkSession: function(sessionToken) {
    try {
      if (!sessionToken) {
        return { isValid: false, reason: 'NO_TOKEN' };
      }
      
      const cacheKey = CACHE_KEYS.USER_SESSION + sessionToken;
      const sessionData = CacheUtils.get(cacheKey);
      
      if (!sessionData) {
        return { isValid: false, reason: 'SESSION_EXPIRED' };
      }
      
      // 세션 만료 확인
      const now = DateUtils.now();
      if (now.getTime() > sessionData.expiresAt) {
        this.destroySession(sessionToken);
        return { isValid: false, reason: 'SESSION_EXPIRED' };
      }
      
      // 사용자 존재 확인
      const user = this.findUserById(sessionData.userId);
      if (!user || user.status !== 'ACTIVE') {
        this.destroySession(sessionToken);
        return { isValid: false, reason: 'USER_INACTIVE' };
      }
      
      return {
        isValid: true,
        user: this.sanitizeUserData(user),
        sessionData: sessionData
      };
      
    } catch (error) {
      LogUtils.error('세션 검증 오류', error);
      return { isValid: false, reason: 'SYSTEM_ERROR' };
    }
  },
  
  // ===== 권한 확인 =====
  checkPermission: function(userRole, requiredPermission) {
    try {
      const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
      return rolePermissions.includes(requiredPermission);
    } catch (error) {
      LogUtils.error('권한 확인 오류', error);
      return false;
    }
  },
  
  // ===== 관리자 계정 확인 =====
  ensureAdminAccount: function() {
    try {
      LogUtils.info('관리자 계정 확인 시작');
      
      const adminUser = this.findUserByRole(USER_ROLES.ADMIN);
      if (adminUser) {
        LogUtils.info('관리자 계정 존재함');
        return { success: true, message: '관리자 계정이 존재합니다.' };
      }
      
      // 기본 관리자 계정 생성
      const adminData = {
        nickname: 'admin',
        password: SystemConfig.SECURITY.DEFAULT_ADMIN_PASSWORD,
        role: USER_ROLES.ADMIN,
        email: '',
        status: 'ACTIVE'
      };
      
      const newAdmin = this.createUser(adminData);
      this.saveUser(newAdmin);
      
      LogUtils.info('기본 관리자 계정 생성 완료', { adminId: newAdmin.id });
      
      return {
        success: true,
        message: '기본 관리자 계정이 생성되었습니다.',
        data: { adminNickname: 'admin' }
      };
      
    } catch (error) {
      LogUtils.error('관리자 계정 확인 오류', error);
      return {
        success: false,
        message: '관리자 계정 확인 중 오류가 발생했습니다.'
      };
    }
  },
  
  // ===== 상태 확인 =====
  checkStatus: function() {
    try {
      const membersSheet = SpreadsheetApp.openById(SystemConfig.SPREADSHEET_ID)
        .getSheetByName(SystemConfig.SHEET_NAMES.MEMBERS);
      
      if (!membersSheet) {
        return { status: 'ERROR', message: '회원 정보 시트를 찾을 수 없습니다.' };
      }
      
      const userCount = membersSheet.getLastRow() - 1; // 헤더 제외
      
      return {
        status: 'OK',
        message: '인증 서비스가 정상 작동 중입니다.',
        data: {
          userCount: userCount,
          lastCheck: DateUtils.formatDisplay(DateUtils.now())
        }
      };
      
    } catch (error) {
      LogUtils.error('인증 서비스 상태 확인 오류', error);
      return {
        status: 'ERROR',
        message: '인증 서비스 상태 확인 중 오류가 발생했습니다.'
      };
    }
  },
  
  // ===== 내부 유틸리티 함수들 =====
  
  validateLoginInput: function(credentials) {
    if (StringUtils.isEmpty(credentials.nickname)) {
      return { isValid: false, message: '닉네임을 입력해주세요.' };
    }
    
    if (StringUtils.isEmpty(credentials.password)) {
      return { isValid: false, message: '비밀번호를 입력해주세요.' };
    }
    
    return { isValid: true };
  },
  
  validateRegisterInput: function(userData) {
    // 닉네임 검증
    if (!StringUtils.isValidNickname(userData.nickname)) {
      return { 
        isValid: false, 
        message: '닉네임은 한글/영문/숫자 2-20자여야 합니다.' 
      };
    }
    
    // 비밀번호 검증
    if (!StringUtils.isValidPassword(userData.password)) {
      return { 
        isValid: false, 
        message: `비밀번호는 ${SystemConfig.BUSINESS_RULES.PASSWORD_MIN_LENGTH}자 이상이어야 합니다.` 
      };
    }
    
    // 이메일 검증 (선택사항)
    if (userData.email && !StringUtils.isValidEmail(userData.email)) {
      return { 
        isValid: false, 
        message: '올바른 이메일 형식이 아닙니다.' 
      };
    }
    
    return { isValid: true };
  },
  
  createUser: function(userData) {
    const now = DateUtils.now();
    return {
      id: SecurityUtils.generateUUID(),
      nickname: StringUtils.safeTrim(userData.nickname),
      password: SecurityUtils.hashPassword(userData.password),
      email: StringUtils.safeTrim(userData.email || ''),
      role: userData.role || DEFAULTS.USER.ROLE,
      status: userData.status || DEFAULTS.USER.STATUS,
      joinDate: now,
      lastLogin: null,
      createdAt: now,
      updatedAt: now
    };
  },
  
  createSession: function(user) {
    const sessionToken = SecurityUtils.generateRandomString(32);
    const expiresAt = DateUtils.now().getTime() + SystemConfig.BUSINESS_RULES.SESSION_TIMEOUT;
    
    const sessionData = {
      token: sessionToken,
      userId: user.id,
      nickname: user.nickname,
      role: user.role,
      createdAt: DateUtils.now().getTime(),
      expiresAt: expiresAt
    };
    
    // 캐시에 세션 저장
    const cacheKey = CACHE_KEYS.USER_SESSION + sessionToken;
    CacheUtils.set(cacheKey, sessionData, Math.floor(SystemConfig.BUSINESS_RULES.SESSION_TIMEOUT / 1000));
    
    return {
      token: sessionToken,
      expiresAt: expiresAt
    };
  },
  
  destroySession: function(sessionToken) {
    const cacheKey = CACHE_KEYS.USER_SESSION + sessionToken;
    CacheUtils.remove(cacheKey);
  },
  
  getUserPermissions: function(role) {
    return ROLE_PERMISSIONS[role] || [];
  },
  
  sanitizeUserData: function(user) {
    return ObjectUtils.omit(user, ['password']);
  },
  
  // DB 접근 함수들 - DatabaseUtils 위임
  findUserByNickname: function(nickname) {
    return DatabaseUtils.findUserByNickname(nickname);
  },
  
  findUserByEmail: function(email) {
    return DatabaseUtils.findUserByEmail(email);
  },
  
  findUserById: function(id) {
    return DatabaseUtils.findUserById(id);
  },
  
  findUserByRole: function(role) {
    return DatabaseUtils.findUserByRole(role);
  },
  
  saveUser: function(user) {
    return DatabaseUtils.saveUser(user);
  },
  
  updateLastLogin: function(userId) {
    return DatabaseUtils.updateLastLogin(userId);
  }
};
