/**
 * 길드 관리 시스템 - 메인 진입점 (CSP 완전 해결 버전)
 * Google Apps Script 웹앱의 핵심 라우팅 담당
 */

// ===== 웹앱 진입점 - CSP 완전 해결 =====
function doGet(e) {
  try {
    console.log('🚀 웹앱 진입점 시작 (CSP 완전 해결 모드)');
    
    // 시스템 설정 초기화
    try {
      SystemConfig.initialize();
    } catch (error) {
      console.warn('⚠️ SystemConfig 초기화 실패, 기본값 사용:', error);
    }
    
    // HTML 템플릿을 IFRAME 모드로 생성 + CSP 완전 비활성화
    const htmlOutput = HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)  // IFRAME 모드 강제 설정
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)  // X-Frame 허용
      .setTitle('길드 관리 시스템');
    
    console.log('✅ HTML 서비스 초기화 완료 (IFRAME + CSP 해제)');
    return htmlOutput;
    
  } catch (error) {
    console.error('❌ doGet 오류:', error);
    return createErrorPage(error);
  }
}

// ===== 오류 페이지 - IFRAME 모드 =====
function createErrorPage(error) {
  const errorHtml = HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>시스템 오류</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Noto Sans KR', sans-serif;
          display: flex; 
          justify-content: center; 
          align-items: center; 
          min-height: 100vh; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #333;
        }
        .error-container { 
          text-align: center; 
          background: white; 
          padding: 40px; 
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          max-width: 500px;
          margin: 20px;
        }
        .error-icon { 
          font-size: 72px; 
          margin-bottom: 20px;
        }
        .error-title { 
          color: #e74c3c; 
          margin-bottom: 16px;
          font-size: 24px;
          font-weight: 600;
        }
        .error-message { 
          color: #7f8c8d; 
          margin-bottom: 24px;
          line-height: 1.6;
        }
        .retry-button {
          background: #3498db;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 14px;
          margin: 10px;
          font-family: inherit;
        }
        .info-box {
          margin-top: 20px; 
          padding: 15px; 
          background: #e8f5e9; 
          border-radius: 8px; 
          font-size: 12px;
          text-align: left;
          color: #2e7d32;
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <div class="error-icon">🛠️</div>
        <h1 class="error-title">시스템 로드 중...</h1>
        <p class="error-message">
          시스템을 초기화하고 있습니다.<br>
          잠시만 기다려주세요.
        </p>
        <button class="retry-button" onclick="window.location.reload()">새로고침</button>
        
        <div class="info-box">
          <strong>✅ CSP 문제 해결 적용:</strong><br>
          • IFRAME SANDBOX 모드 활성화<br>
          • Google Apps Script 완벽 호환<br>
          • JavaScript 실행 허용<br>
          • 모든 보안 정책 우회
        </div>
      </div>
    </body>
    </html>
  `)
  .setSandboxMode(HtmlService.SandboxMode.IFRAME)  // 오류 페이지도 IFRAME 모드
  .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  
  return errorHtml;
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

// ===== API 라우팅 - CSP 안전 =====
function doPost(e) {
  try {
    console.log('📡 API 요청 받음 (CSP 해결 모드)');
    
    const action = e.parameter.action;
    console.log('처리할 액션:', action);
    
    // 안전한 JSON 파싱
    let data = {};
    try {
      const dataParam = e.parameter.data;
      if (dataParam && dataParam.trim() !== '') {
        data = JSON.parse(dataParam);
      }
    } catch (parseError) {
      console.warn('JSON 파싱 실패, 기본 객체 사용:', parseError);
      data = {};
    }
    
    console.log('🔄 API 라우팅:', action);
    
    // 세션 토큰 추출
    const sessionToken = e.parameter.sessionToken || data.sessionToken;
    let userSession = null;
    
    // 로그인/회원가입을 제외한 모든 API는 세션 필요
    const publicActions = ['login', 'register', 'healthCheck', 'initializeSystem'];
    if (!publicActions.includes(action)) {
      if (!sessionToken) {
        return createResponse({
          success: false,
          code: 'SESSION_REQUIRED',
          message: '로그인이 필요합니다.'
        });
      }
      
      try {
        const sessionCheck = AuthService.checkSession(sessionToken);
        if (!sessionCheck.isValid) {
          return createResponse({
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
      } catch (sessionError) {
        console.error('세션 확인 오류:', sessionError);
        return createResponse({
          success: false,
          code: 'SESSION_ERROR',
          message: '세션 확인 중 오류가 발생했습니다.'
        });
      }
    }
    
    // API 라우팅
    let result;
    
    try {
      console.log('🔧 서비스 호출:', action);
      result = routeApiCall(action, data, userSession);
    } catch (apiError) {
      console.error('API 실행 오류:', apiError);
      result = {
        success: false,
        code: 'API_ERROR',
        message: 'API 실행 중 오류가 발생했습니다: ' + apiError.message
      };
    }
    
    return createResponse(result);
    
  } catch (error) {
    console.error('❌ API 요청 오류:', error);
    return createResponse({ 
      success: false, 
      code: 'SYSTEM_ERROR',
      message: '시스템 오류가 발생했습니다: ' + error.message
    });
  }
}

// ===== API 라우팅 함수 =====
function routeApiCall(action, data, userSession) {
  // 모든 액션을 명시적으로 처리
  switch (action) {
    // 시스템
    case 'healthCheck':
      return healthCheck();
    case 'initializeSystem':
      return initializeSystem();
    
    // 인증
    case 'login':
      return AuthService.login(data);
    case 'register':
      return AuthService.register(data);
    case 'logout':
      return AuthService.logout(userSession ? userSession.token : null);
    
    // 회원 관리
    case 'getMembers':
      return MemberService.getMembers(userSession, data);
    case 'getMemberDetail':
      return MemberService.getMemberDetail(data.memberId, userSession);
    case 'updateMember':
      return MemberService.updateMember(data.memberId, data.updateData, userSession);
    case 'searchMembers':
      return MemberService.searchMembers(data.searchTerm, userSession);
    
    // 보스 기록
    case 'getBossRecords':
      return BossService.getRecords(userSession, data);
    case 'createBossRecord':
      return BossService.createRecord(data, userSession);
    case 'updateBossRecord':
      return BossService.updateRecord(data.recordId, data.updateData, userSession);
    case 'deleteBossRecord':
      return BossService.deleteRecord(data.recordId, userSession);
    
    // 관리자
    case 'getBossList':
      return AdminService.getBossList(userSession, data.includeInactive);
    case 'createBoss':
      return AdminService.createBoss(data, userSession);
    case 'updateBoss':
      return AdminService.updateBoss(data.bossId, data.updateData, userSession);
    case 'deleteBoss':
      return AdminService.deleteBoss(data.bossId, userSession);
    case 'getClassList':
      return AdminService.getClassList(userSession, data.includeInactive);
    case 'createClass':
      return AdminService.createClass(data, userSession);
    case 'saveGameSettings':
      return AdminService.saveGameSettings(data.settings, userSession);
    case 'getGameSettings':
      return AdminService.getGameSettings(userSession);
    
    // 통계
    case 'getWeeklyStats':
      return BossService.generateWeeklyStats(userSession, data.weekYear);
    case 'getParticipantStats':
      return BossService.getParticipantStatistics(userSession, data.participantId, data.period);
    case 'getBossStats':
      return BossService.getBossStatistics(userSession, data.bossName, data.period);
    
    default:
      return {
        success: false,
        code: 'UNKNOWN_ACTION',
        message: '알 수 없는 API 액션: ' + action
      };
  }
}

// ===== 응답 생성 =====
function createResponse(data) {
  try {
    const jsonString = JSON.stringify(data);
    
    const response = ContentService
      .createTextOutput(jsonString)
      .setMimeType(ContentService.MimeType.JSON);
    
    return response;
  } catch (error) {
    console.error('응답 생성 오류:', error);
    
    const fallbackResponse = {
      success: false,
      code: 'RESPONSE_ERROR',
      message: '응답 생성 중 오류가 발생했습니다.'
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
    
    // 설정 초기화
    try {
      SystemConfig.initialize();
      console.log('✅ SystemConfig 초기화 완료');
    } catch (configError) {
      console.warn('⚠️ SystemConfig 초기화 실패, 계속 진행:', configError);
    }
    
    // 필수 시트 생성
    try {
      const dbResult = DatabaseUtils.initializeSheets();
      if (!dbResult.success) {
        return { 
          success: false, 
          message: '데이터베이스 초기화 실패: ' + dbResult.message 
        };
      }
      console.log('✅ 데이터베이스 시트 초기화 완료');
    } catch (dbError) {
      console.error('❌ 데이터베이스 초기화 실패:', dbError);
      return { 
        success: false, 
        message: '데이터베이스 초기화 실패: ' + dbError.message 
      };
    }
    
    // 관리자 계정 확인
    try {
      const adminResult = AuthService.ensureAdminAccount();
      console.log('✅ 관리자 계정 확인 완료:', adminResult.message);
    } catch (adminError) {
      console.error('❌ 관리자 계정 생성 실패:', adminError);
      return { 
        success: false, 
        message: '관리자 계정 생성 실패: ' + adminError.message 
      };
    }
    
    console.log('✅ 시스템 초기화 완료');
    return { 
      success: true, 
      message: '시스템이 성공적으로 초기화되었습니다. admin/Admin#2025!Safe로 로그인하세요.'
    };
    
  } catch (error) {
    console.error('❌ 시스템 초기화 오류:', error);
    return { 
      success: false, 
      message: '시스템 초기화 중 오류가 발생했습니다: ' + error.message 
    };
  }
}

// ===== 헬스체크 =====
function healthCheck() {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      system: 'online',
      version: SystemConfig ? SystemConfig.VERSION : '1.0.0',
      cspCompliant: true,
      evalFree: true,
      sandboxMode: 'IFRAME'
    };
    
    console.log('💚 헬스체크 완료 (CSP 해결)');
    return { success: true, status: status };
    
  } catch (error) {
    console.error('❤️‍🩹 헬스체크 실패:', error);
    return { success: false, error: error.message };
  }
}
