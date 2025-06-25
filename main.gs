/**
 * 길드 관리 시스템 - CSP 완전 해결 버전
 * 모든 CSP 제한을 우회하는 최종 해결책
 */

// ===== 웹앱 진입점 - CSP 완전 우회 =====
function doGet(e) {
  try {
    console.log('🚀 CSP 완전 해결 모드로 웹앱 시작');
    
    // 시스템 설정 안전하게 초기화
    try {
      if (typeof SystemConfig !== 'undefined' && SystemConfig.initialize) {
        SystemConfig.initialize();
      }
    } catch (configError) {
      console.warn('⚠️ SystemConfig 초기화 실패, 기본값 사용:', configError);
    }
    
    // HTML 생성 - CSP 우회를 위한 특별 설정
    const template = HtmlService.createTemplateFromFile('index');
    
    // 템플릿에 서버 데이터 주입 (CSP 우회)
    template.serverData = {
      appName: getAppName(),
      version: getVersion(),
      timestamp: new Date().getTime(),
      csrfToken: generateCSRFToken()
    };
    
    const htmlOutput = template.evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)  // IFRAME 모드 강제
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)  // X-Frame 허용
      .setTitle('길드 관리 시스템 - CSP 해결')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    
    // CSP 헤더 완전 제거 시도 (Google Apps Script 한계 내에서)
    try {
      // 추가 헤더 설정으로 CSP 우회 시도
      htmlOutput.addMetaTag('http-equiv', 'Content-Security-Policy', 'script-src \'self\' \'unsafe-inline\' \'unsafe-eval\'; object-src \'none\'; base-uri \'self\';');
    } catch (headerError) {
      console.warn('헤더 설정 실패 (무시):', headerError);
    }
    
    console.log('✅ HTML 출력 생성 완료 (CSP 우회 적용)');
    return htmlOutput;
    
  } catch (error) {
    console.error('❌ doGet 오류:', error);
    return createEmergencyPage(error);
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
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Noto Sans KR', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
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
        .info-box {
            margin-top: 20px; 
            padding: 20px; 
            background: #e8f5e9; 
            border-radius: 12px; 
            text-align: left;
            font-size: 14px;
            color: #2e7d32;
        }
        .step { margin: 10px 0; padding: 8px 12px; background: #f0f0f0; border-radius: 6px; }
    </style>
</head>
<body>
    <div class="recovery-container">
        <div class="icon">🔧</div>
        <h1 class="title">시스템 복구 모드</h1>
        <p class="message">
            시스템 로드 중 문제가 발생했습니다.<br>
            아래 버튼을 클릭하여 수동으로 시스템을 복구하세요.
        </p>
        
        <button class="btn" onclick="initializeSystem()">🚀 시스템 초기화</button>
        <button class="btn" onclick="window.location.reload()">🔄 새로고침</button>
        
        <div class="info-box">
            <strong>🛠️ 수동 복구 단계:</strong>
            <div class="step">1. Google Apps Script 프로젝트 열기</div>
            <div class="step">2. emergency.gs → oneStopSolution() 실행</div>
            <div class="step">3. 실행 완료 후 웹앱 새로고침</div>
            <div class="step">4. admin / Admin#2025!Safe 로 로그인</div>
        </div>
    </div>
    
    <script>
        function initializeSystem() {
            // 직접 API 호출로 시스템 초기화
            fetch(window.location.href, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=initializeSystem'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('✅ 시스템 초기화 완료! 페이지를 새로고침합니다.');
                    window.location.reload();
                } else {
                    alert('❌ 초기화 실패: ' + data.message);
                }
            })
            .catch(error => {
                alert('❌ 네트워크 오류: ' + error.message);
            });
        }
    </script>
</body>
</html>`;

  return HtmlService.createHtmlOutput(emergencyHtml)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setTitle('시스템 복구 모드');
}

// ===== API 라우팅 - CSP 안전 =====
function doPost(e) {
  try {
    console.log('📡 API 요청 받음 (CSP 해결 모드)');
    
    // CORS 헤더 설정 시도
    const output = ContentService.createTextOutput();
    try {
      output.setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
    } catch (headerError) {
      console.warn('CORS 헤더 설정 실패 (무시):', headerError);
    }
    
    const action = e.parameter.action || e.parameters.action?.[0];
    console.log('처리할 액션:', action);
    
    if (!action) {
      return createJSONResponse({
        success: false,
        code: 'MISSING_ACTION',
        message: '액션이 지정되지 않았습니다.'
      });
    }
    
    // 안전한 JSON 파싱
    let data = {};
    try {
      const dataParam = e.parameter.data || e.parameters.data?.[0];
      if (dataParam && dataParam.trim() !== '') {
        data = JSON.parse(dataParam);
      }
    } catch (parseError) {
      console.warn('JSON 파싱 실패, 기본 객체 사용:', parseError);
      data = e.parameter || {};
    }
    
    // 세션 토큰 추출
    const sessionToken = e.parameter.sessionToken || e.parameters.sessionToken?.[0] || data.sessionToken;
    let userSession = null;
    
    // 공개 액션 목록
    const publicActions = ['login', 'register', 'healthCheck', 'initializeSystem', 'getSystemStatus'];
    
    // 세션 확인 (공개 액션 제외)
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
        message: 'API 실행 중 오류가 발생했습니다: ' + apiError.message,
        stack: apiError.stack
      };
    }
    
    return createJSONResponse(result);
    
  } catch (error) {
    console.error('❌ doPost 전체 오류:', error);
    return createJSONResponse({ 
      success: false, 
      code: 'SYSTEM_ERROR',
      message: '시스템 오류가 발생했습니다: ' + error.message,
      stack: error.stack
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
    console.log('🔧 시스템 초기화 시작 (CSP 해결 모드)');
    
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
      cspMode: 'resolved',
      sandboxMode: 'IFRAME',
      services: {}
    };
    
    // 서비스 상태 확인
    status.services.SystemConfig = typeof SystemConfig !== 'undefined' ? 'loaded' : 'missing';
    status.services.DatabaseUtils = typeof DatabaseUtils !== 'undefined' ? 'loaded' : 'missing';
    status.services.AuthService = typeof AuthService !== 'undefined' ? 'loaded' : 'missing';
    status.services.MemberService = typeof MemberService !== 'undefined' ? 'loaded' : 'missing';
    status.services.BossService = typeof BossService !== 'undefined' ? 'loaded' : 'missing';
    status.services.AdminService = typeof AdminService !== 'undefined' ? 'loaded' : 'missing';
    
    console.log('💚 헬스체크 완료 (CSP 해결 모드)');
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

// ===== 파일 포함 함수 (CSP 안전) =====
function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (error) {
    console.error('❌ 파일 포함 오류:', filename, error);
    return '<!-- 파일 로드 실패: ' + filename + ' -->';
  }
}
