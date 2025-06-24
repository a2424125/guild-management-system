/**
 * 길드 관리 시스템 - 메인 진입점
 * Google Apps Script 웹앱의 핵심 라우팅 담당
 */

// ===== 웹앱 진입점 =====
function doGet(e) {
  try {
    console.log('🚀 웹앱 진입점 시작');
    
    // CSP 준수를 위한 HTML 생성 (경로 수정)
    const template = HtmlService.createTemplateFromFile('index');
    
    const htmlOutput = template.evaluate()
      .setTitle('길드 관리 시스템')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .addMetaTag('charset', 'UTF-8')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    console.log('✅ HTML 서비스 초기화 완료');
    return htmlOutput;
    
  } catch (error) {
    console.error('❌ doGet 오류:', error);
    return createErrorPage(error);
  }
}

// ===== 파일 포함 함수 (CSP 안전) =====
function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (error) {
    console.error('❌ 파일 포함 오류:', filename, error);
    return `<!-- 파일 로드 실패: ${filename} -->`;
  }
}

// ===== API 라우팅 =====
function doPost(e) {
  try {
    const action = e.parameter.action;
    const data = JSON.parse(e.parameter.data || '{}');
    
    console.log('📡 API 요청:', action, data);
    
    // 세션 토큰 추출
    const sessionToken = e.parameter.sessionToken || data.sessionToken;
    let userSession = null;
    
    // 로그인/회원가입을 제외한 모든 API는 세션 필요
    if (action !== 'login' && action !== 'register' && action !== 'healthCheck') {
      if (!sessionToken) {
        return createResponse({
          success: false,
          code: 'SESSION_REQUIRED',
          message: '로그인이 필요합니다.'
        });
      }
      
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
    }
    
    // API 라우팅
    switch (action) {
      // 인증 관련
      case 'login':
        return createResponse(AuthService.login(data));
      case 'register':
        return createResponse(AuthService.register(data));
      case 'logout':
        return createResponse(AuthService.logout(sessionToken));
      
      // 회원 관리
      case 'getMembers':
        return createResponse(MemberService.getMembers(userSession, data));
      case 'getMemberDetail':
        return createResponse(MemberService.getMemberDetail(data.memberId, userSession));
      case 'updateMember':
        return createResponse(MemberService.updateMember(data.memberId, data.updateData, userSession));
      case 'searchMembers':
        return createResponse(MemberService.searchMembers(data.searchTerm, userSession));
      
      // 보스 기록 관리
      case 'getBossRecords':
        return createResponse(BossService.getRecords(userSession, data));
      case 'createBossRecord':
        return createResponse(BossService.createRecord(data, userSession));
      case 'updateBossRecord':
        return createResponse(BossService.updateRecord(data.recordId, data.updateData, userSession));
      case 'deleteBossRecord':
        return createResponse(BossService.deleteRecord(data.recordId, userSession));
      
      // 자금 관리
      case 'getCurrentFunds':
        return createResponse(FundService.getCurrentFunds(userSession));
      case 'getTransactions':
        return createResponse(FundService.getTransactions(userSession, data));
      case 'addIncome':
        return createResponse(FundService.addIncome(data, userSession));
      case 'addExpense':
        return createResponse(FundService.addExpense(data, userSession));
      case 'distributeFunds':
        return createResponse(FundService.distributeFunds(data, userSession));
      
      // 관리자 기능
      case 'getBossList':
        return createResponse(AdminService.getBossList(userSession, data.includeInactive));
      case 'createBoss':
        return createResponse(AdminService.createBoss(data, userSession));
      case 'updateBoss':
        return createResponse(AdminService.updateBoss(data.bossId, data.updateData, userSession));
      case 'deleteBoss':
        return createResponse(AdminService.deleteBoss(data.bossId, userSession));
      case 'getClassList':
        return createResponse(AdminService.getClassList(userSession, data.includeInactive));
      case 'createClass':
        return createResponse(AdminService.createClass(data, userSession));
      
      // 통계
      case 'getWeeklyStats':
        return createResponse(BossService.generateWeeklyStats(userSession, data.weekYear));
      case 'getParticipantStats':
        return createResponse(BossService.getParticipantStatistics(userSession, data.participantId, data.period));
      
      // 시스템
      case 'healthCheck':
        return createResponse(healthCheck());
      case 'initializeSystem':
        return createResponse(initializeSystem());
      
      default:
        return createResponse({
          success: false,
          code: 'UNKNOWN_ACTION',
          message: '알 수 없는 API 액션: ' + action
        });
    }
    
  } catch (error) {
    console.error('❌ API 요청 오류:', error);
    return createResponse({ 
      success: false, 
      code: 'SYSTEM_ERROR',
      error: error.message 
    });
  }
}

// ===== 응답 생성 유틸리티 =====
function createResponse(data) {
  const response = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // CORS 헤더 추가
  response.addHeader('Access-Control-Allow-Origin', '*');
  response.addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.addHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  return response;
}

// ===== 오류 페이지 생성 =====
function createErrorPage(error) {
  const errorHtml = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>시스템 오류 - 길드 관리 시스템</title>
      <style>
        body { 
          font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
          display: flex; 
          justify-content: center; 
          align-items: center; 
          min-height: 100vh; 
          margin: 0; 
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
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
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
        .error-details {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 12px;
          color: #666;
          margin-bottom: 20px;
          word-break: break-all;
        }
        .action-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .retry-button, .setup-button {
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }
        .retry-button {
          background: #3498db;
          color: white;
        }
        .retry-button:hover { 
          background: #2980b9;
          transform: translateY(-2px);
        }
        .setup-button {
          background: #2ecc71;
          color: white;
        }
        .setup-button:hover {
          background: #27ae60;
          transform: translateY(-2px);
        }
        .help-text {
          margin-top: 20px;
          font-size: 12px;
          color: #95a5a6;
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <div class="error-icon">🛠️</div>
        <h1 class="error-title">시스템 초기화가 필요합니다</h1>
        <p class="error-message">
          길드 관리 시스템을 처음 실행하시는군요!<br>
          아래 버튼을 클릭하여 시스템을 초기화해주세요.
        </p>
        <div class="error-details">
          오류 내용: ${error.message || '알 수 없는 오류'}<br>
          해결방법: HTML 파일 이름을 'index'로 확인하고 시스템 초기화 실행
        </div>
        <div class="action-buttons">
          <button class="retry-button" onclick="location.reload()">
            🔄 다시 시도
          </button>
          <button class="setup-button" onclick="initSystem()">
            ⚙️ 시스템 초기화
          </button>
        </div>
        <p class="help-text">
          💡 도움말: HTML 파일명이 'index'인지 확인하고, SPREADSHEET_ID가 올바르게 설정되었는지 확인하세요.
        </p>
      </div>
      
      <script>
        async function initSystem() {
          try {
            const response = await fetch(window.location.href, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: 'action=initializeSystem&data={}'
            });
            
            const result = await response.json();
            
            if (result.success) {
              alert('✅ 시스템이 성공적으로 초기화되었습니다!');
              location.reload();
            } else {
              alert('❌ 초기화 실패: ' + result.message);
            }
          } catch (error) {
            alert('❌ 초기화 중 오류: ' + error.message);
          }
        }
      </script>
    </body>
    </html>
  `;
  
  return HtmlService.createHtmlOutput(errorHtml);
}

// ===== 시스템 초기화 =====
function initializeSystem() {
  try {
    console.log('🔧 시스템 초기화 시작');
    
    // 설정 초기화
    SystemConfig.initialize();
    
    // 필수 시트 생성
    DatabaseUtils.initializeSheets();
    
    // 관리자 계정 확인
    AuthService.ensureAdminAccount();
    
    console.log('✅ 시스템 초기화 완료');
    return { 
      success: true, 
      message: '시스템이 성공적으로 초기화되었습니다.',
      adminAccount: {
        nickname: 'admin',
        password: 'Admin#2025!Safe'
      }
    };
    
  } catch (error) {
    console.error('❌ 시스템 초기화 오류:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
}

// ===== 헬스체크 =====
function healthCheck() {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      system: 'online',
      database: DatabaseUtils.checkConnection(),
      auth: AuthService.checkStatus(),
      version: SystemConfig.VERSION
    };
    
    console.log('💚 헬스체크 완료:', status);
    return { success: true, status };
    
  } catch (error) {
    console.error('❤️‍🩹 헬스체크 실패:', error);
    return { success: false, error: error.message };
  }
}

// ===== 전역 오류 핸들러 =====
function onError(error) {
  console.error('🚨 전역 오류:', error);
  
  // 오류 로깅 (선택사항)
  try {
    LogUtils.error('전역 오류 발생', error);
  } catch (logError) {
    console.error('로깅 실패:', logError);
  }
  
  return {
    success: false,
    error: {
      message: error.message || '알 수 없는 오류가 발생했습니다.',
      timestamp: new Date().toISOString()
    }
  };
}
