/**
 * 길드 관리 시스템 - 수정된 main.gs (doPost 오류 해결)
 */

// ===== 웹앱 진입점 =====
function doGet(e) {
  try {
    console.log('🚀 웹앱 시작 - doGet 호출됨');
    
    // 시스템 설정 초기화
    try {
      if (typeof SystemConfig !== 'undefined' && SystemConfig.initialize) {
        SystemConfig.initialize();
      }
    } catch (configError) {
      console.warn('⚠️ SystemConfig 초기화 실패:', configError);
    }
    
    // HTML 생성
    const template = HtmlService.createTemplateFromFile('index');
    
    // 서버 데이터 주입
    template.serverData = {
      appName: getAppName(),
      version: getVersion(),
      timestamp: new Date().getTime(),
      csrfToken: generateCSRFToken()
    };
    
    const htmlOutput = template.evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .setTitle('길드 관리 시스템');
    
    console.log('✅ HTML 출력 생성 완료');
    return htmlOutput;
    
  } catch (error) {
    console.error('❌ doGet 오류:', error);
    return createEmergencyPage(error);
  }
}

// ===== API 라우팅 - 오류 수정됨 =====
function doPost(e) {
  try {
    console.log('📡 doPost 호출됨');
    console.log('받은 파라미터:', e);
    
    // 안전한 파라미터 추출
    let action, data, sessionToken;
    
    try {
      // parameter 객체가 존재하는지 확인
      if (e && e.parameter) {
        action = e.parameter.action;
        sessionToken = e.parameter.sessionToken;
        
        // data 파라미터 안전하게 파싱
        if (e.parameter.data) {
          try {
            data = JSON.parse(e.parameter.data);
          } catch (parseError) {
            console.warn('JSON 파싱 실패, 원본 사용:', parseError);
            data = e.parameter.data;
          }
        }
      }
      // parameters 배열 형태인 경우 처리
      else if (e && e.parameters) {
        action = e.parameters.action ? e.parameters.action[0] : null;
        sessionToken = e.parameters.sessionToken ? e.parameters.sessionToken[0] : null;
        
        if (e.parameters.data && e.parameters.data[0]) {
          try {
            data = JSON.parse(e.parameters.data[0]);
          } catch (parseError) {
            data = e.parameters.data[0];
          }
        }
      }
      
      console.log('추출된 값들:');
      console.log('- action:', action);
      console.log('- sessionToken:', sessionToken ? '존재함' : '없음');
      console.log('- data:', data);
      
    } catch (paramError) {
      console.error('파라미터 추출 오류:', paramError);
      return createJSONResponse({
        success: false,
        code: 'PARAMETER_ERROR',
        message: '요청 파라미터를 읽을 수 없습니다: ' + paramError.message
      });
    }
    
    // 액션 확인
    if (!action) {
      return createJSONResponse({
        success: false,
        code: 'MISSING_ACTION',
        message: '액션이 지정되지 않았습니다.'
      });
    }
    
    // 기본 data 객체 설정
    if (!data || typeof data !== 'object') {
      data = {};
    }
    
    console.log('처리할 액션:', action);
    
    // 공개 액션 목록 (세션 불필요)
    const publicActions = ['login', 'register', 'healthCheck', 'initializeSystem', 'getSystemStatus'];
    
    // 세션 확인 (공개 액션 제외)
    let userSession = null;
    if (!publicActions.includes(action)) {
      if (!sessionToken) {
        return createJSONResponse({
          success: false,
          code: 'SESSION_REQUIRED',
          message: '로그인이 필요합니다.'
        });
      }
      
      try {
        if (typeof AuthService !== 'undefined' && AuthService.checkSession) {
          const sessionCheck = AuthService.checkSession(sessionToken);
          if (!sessionCheck.isValid) {
            return createJSONResponse({
              success: false,
              code: 'SESSION_INVALID',
              message: '세션이 만료되었습니다. 다시 로그인해주세요.'
            });
          }
          
          userSession = {
            userId: sessionCheck.sessionData.userId,
            nickname: sessionCheck.sessionData.nickname,
            role: sessionCheck.sessionData.role,
            token: sessionToken
          };
        }
      } catch (sessionError) {
        console.error('세션 확인 오류:', sessionError);
        return createJSONResponse({
          success: false,
          code: 'SESSION_ERROR',
          message: '세션 확인 중 오류가 발생했습니다.'
        });
      }
    }
    
    // API 라우팅 실행
    let result;
    try {
      result = routeApiCall(action, data, userSession);
    } catch (apiError) {
      console.error('API 실행 오류:', apiError);
      result = {
        success: false,
        code: 'API_ERROR',
        message: 'API 실행 중 오류가 발생했습니다: ' + apiError.message
      };
    }
    
    return createJSONResponse(result);
    
  } catch (error) {
    console.error('❌ doPost 전체 오류:', error);
    return createJSONResponse({ 
      success: false, 
      code: 'SYSTEM_ERROR',
      message: '시스템 오류가 발생했습니다: ' + error.message
    });
  }
}

// ===== API 라우팅 함수 =====
function routeApiCall(action, data, userSession) {
  console.log('🔄 API 라우팅:', action);
  
  try {
    switch (action) {
      // 시스템 관련
      case 'healthCheck':
        return healthCheck();
      case 'initializeSystem':
        return initializeSystem();
      case 'getSystemStatus':
        return getSystemStatus();
      
      // 인증 관련
      case 'login':
        return routeAuthService('login', data);
      case 'register':
        return routeAuthService('register', data);
      case 'logout':
        return routeAuthService('logout', userSession ? userSession.token : null);
      
      // 회원 관리
      case 'getMembers':
        return routeMemberService('getMembers', userSession, data);
      case 'getMemberDetail':
        return routeMemberService('getMemberDetail', data.memberId, userSession);
      case 'updateMember':
        return routeMemberService('updateMember', data.memberId, data.updateData, userSession);
      case 'searchMembers':
        return routeMemberService('searchMembers', data.searchTerm, userSession);
      
      // 보스 기록
      case 'getBossRecords':
        return routeBossService('getRecords', userSession, data);
      case 'createBossRecord':
        return routeBossService('createRecord', data, userSession);
      case 'updateBossRecord':
        return routeBossService('updateRecord', data.recordId, data.updateData, userSession);
      case 'deleteBossRecord':
        return routeBossService('deleteRecord', data.recordId, userSession);
      
      // 관리자 기능
      case 'getBossList':
        return routeAdminService('getBossList', userSession, data.includeInactive);
      case 'createBoss':
        return routeAdminService('createBoss', data, userSession);
      case 'updateBoss':
        return routeAdminService('updateBoss', data.bossId, data.updateData, userSession);
      case 'deleteBoss':
        return routeAdminService('deleteBoss', data.bossId, userSession);
      case 'getClassList':
        return routeAdminService('getClassList', userSession, data.includeInactive);
      case 'createClass':
        return routeAdminService('createClass', data, userSession);
      
      // 통계
      case 'getWeeklyStats':
        return routeBossService('generateWeeklyStats', userSession, data.weekYear);
      case 'getParticipantStats':
        return routeBossService('getParticipantStatistics', userSession, data.participantId, data.period);
      
      default:
        console.warn('알 수 없는 액션:', action);
        return {
          success: false,
          code: 'UNKNOWN_ACTION',
          message: '알 수 없는 API 액션: ' + action
        };
    }
  } catch (routingError) {
    console.error('라우팅 오류:', routingError);
    return {
      success: false,
      code: 'ROUTING_ERROR',
      message: '라우팅 중 오류가 발생했습니다: ' + routingError.message
    };
  }
}

// ===== 안전한 서비스 호출 함수들 =====
function routeAuthService(method, ...args) {
  try {
    if (typeof AuthService !== 'undefined' && AuthService[method]) {
      return AuthService[method].apply(AuthService, args);
    } else {
      throw new Error('AuthService가 로드되지 않았습니다.');
    }
  } catch (error) {
    console.error('AuthService 호출 오류:', error);
    return { success: false, message: 'AuthService 오류: ' + error.message };
  }
}

function routeMemberService(method, ...args) {
  try {
    if (typeof MemberService !== 'undefined' && MemberService[method]) {
      return MemberService[method].apply(MemberService, args);
    } else {
      throw new Error('MemberService가 로드되지 않았습니다.');
    }
  } catch (error) {
    console.error('MemberService 호출 오류:', error);
    return { success: false, message: 'MemberService 오류: ' + error.message };
  }
}

function routeBossService(method, ...args) {
  try {
    if (typeof BossService !== 'undefined' && BossService[method]) {
      return BossService[method].apply(BossService, args);
    } else {
      throw new Error('BossService가 로드되지 않았습니다.');
    }
  } catch (error) {
    console.error('BossService 호출 오류:', error);
    return { success: false, message: 'BossService 오류: ' + error.message };
  }
}

function routeAdminService(method, ...args) {
  try {
    if (typeof AdminService !== 'undefined' && AdminService[method]) {
      return AdminService[method].apply(AdminService, args);
    } else {
      throw new Error('AdminService가 로드되지 않았습니다.');
    }
  } catch (error) {
    console.error('AdminService 호출 오류:', error);
    return { success: false, message: 'AdminService 오류: ' + error.message };
  }
}

// ===== JSON 응답 생성 =====
function createJSONResponse(data) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    
    return ContentService
      .createTextOutput(jsonString)
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('JSON 응답 생성 오류:', error);
    
    const fallbackResponse = {
      success: false,
      code: 'RESPONSE_ERROR',
      message: '응답 생성 중 오류가 발생했습니다.',
      originalError: error.message
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(fallbackResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== 시스템 초기화 =====
function initializeSystem() {
  try {
    console.log('🔧 시스템 초기화 시작');
    
    const results = {
      timestamp: new Date().toISOString(),
      steps: {}
    };
    
    // 1단계: 설정 초기화
    try {
      if (typeof SystemConfig !== 'undefined' && SystemConfig.initialize) {
        SystemConfig.initialize();
        results.steps.config = { success: true, message: 'SystemConfig 초기화 완료' };
      } else {
        results.steps.config = { success: false, message: 'SystemConfig 없음' };
      }
    } catch (configError) {
      results.steps.config = { success: false, message: configError.message };
    }
    
    // 2단계: 데이터베이스 초기화
    try {
      if (typeof DatabaseUtils !== 'undefined' && DatabaseUtils.initializeSheets) {
        const dbResult = DatabaseUtils.initializeSheets();
        results.steps.database = dbResult;
      } else {
        results.steps.database = { success: false, message: 'DatabaseUtils 없음' };
      }
    } catch (dbError) {
      results.steps.database = { success: false, message: dbError.message };
    }
    
    // 3단계: 관리자 계정 생성
    try {
      if (typeof AuthService !== 'undefined' && AuthService.ensureAdminAccount) {
        const adminResult = AuthService.ensureAdminAccount();
        results.steps.admin = adminResult;
      } else {
        results.steps.admin = { success: false, message: 'AuthService 없음' };
      }
    } catch (adminError) {
      results.steps.admin = { success: false, message: adminError.message };
    }
    
    // 결과 판정
    const allSuccess = Object.values(results.steps).every(step => step.success);
    
    console.log('🎯 시스템 초기화 결과:', results);
    
    return { 
      success: allSuccess, 
      message: allSuccess ? 
        '시스템이 성공적으로 초기화되었습니다. admin/Admin#2025!Safe로 로그인하세요.' :
        '일부 초기화가 실패했습니다. 결과를 확인하세요.',
      details: results
    };
    
  } catch (error) {
    console.error('❌ 시스템 초기화 전체 오류:', error);
    return { 
      success: false, 
      message: '시스템 초기화 중 심각한 오류가 발생했습니다: ' + error.message,
      error: error.stack
    };
  }
}

// ===== 헬스체크 =====
function healthCheck() {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      system: 'online',
      version: getVersion(),
      services: {}
    };
    
    // 서비스 상태 확인
    status.services.SystemConfig = typeof SystemConfig !== 'undefined' ? 'loaded' : 'missing';
    status.services.DatabaseUtils = typeof DatabaseUtils !== 'undefined' ? 'loaded' : 'missing';
    status.services.AuthService = typeof AuthService !== 'undefined' ? 'loaded' : 'missing';
    status.services.MemberService = typeof MemberService !== 'undefined' ? 'loaded' : 'missing';
    status.services.BossService = typeof BossService !== 'undefined' ? 'loaded' : 'missing';
    status.services.AdminService = typeof AdminService !== 'undefined' ? 'loaded' : 'missing';
    
    console.log('💚 헬스체크 완료');
    return { success: true, status: status };
    
  } catch (error) {
    console.error('❤️‍🩹 헬스체크 실패:', error);
    return { success: false, error: error.message, stack: error.stack };
  }
}

// ===== 시스템 상태 조회 =====
function getSystemStatus() {
  try {
    if (typeof SystemConfig !== 'undefined' && SystemConfig.getSystemStatus) {
      return {
        success: true,
        data: SystemConfig.getSystemStatus()
      };
    } else {
      return {
        success: false,
        message: 'SystemConfig.getSystemStatus를 사용할 수 없습니다.'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: '시스템 상태 조회 실패: ' + error.message
    };
  }
}

// ===== 긴급 복구 페이지 =====
function createEmergencyPage(error) {
  const emergencyHtml = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>시스템 복구 모드</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Noto Sans KR', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            margin: 0;
        }
        .recovery-container { 
            background: white; 
            padding: 40px; 
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            max-width: 600px;
            width: 100%;
            text-align: center;
        }
        .icon { font-size: 64px; margin-bottom: 20px; }
        .title { color: #2c3e50; font-size: 28px; font-weight: 700; margin-bottom: 16px; }
        .message { color: #7f8c8d; margin-bottom: 24px; line-height: 1.6; }
        .btn { 
            background: #3498db; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 25px; 
            cursor: pointer; 
            font-size: 16px; 
            margin: 10px;
            font-family: inherit;
            transition: background 0.3s ease;
        }
        .btn:hover { background: #2980b9; }
    </style>
</head>
<body>
    <div class="recovery-container">
        <div class="icon">🔧</div>
        <h1 class="title">시스템 복구 모드</h1>
        <p class="message">
            시스템 로드 중 문제가 발생했습니다.<br>
            관리자에게 문의하거나 재배포를 진행하세요.
        </p>
        <button class="btn" onclick="window.location.reload()">🔄 새로고침</button>
    </div>
</body>
</html>`;

  return HtmlService.createHtmlOutput(emergencyHtml)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setTitle('시스템 복구 모드');
}

// ===== 유틸리티 함수들 =====
function getAppName() {
  try {
    return (typeof SystemConfig !== 'undefined' && SystemConfig.APP_NAME) ? 
      SystemConfig.APP_NAME : '길드 관리 시스템';
  } catch (error) {
    return '길드 관리 시스템';
  }
}

function getVersion() {
  try {
    return (typeof SystemConfig !== 'undefined' && SystemConfig.VERSION) ? 
      SystemConfig.VERSION : '1.0.0';
  } catch (error) {
    return '1.0.0';
  }
}

function generateCSRFToken() {
  try {
    return Utilities.getUuid();
  } catch (error) {
    return 'csrf-' + Math.random().toString(36).substr(2, 9);
  }
}

// ===== 파일 포함 함수 =====
function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (error) {
    console.error('❌ 파일 포함 오류:', filename, error);
    return '<!-- 파일 로드 실패: ' + filename + ' -->';
  }
}
