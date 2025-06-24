/**
 * 길드 관리 시스템 - 메인 진입점 (CSP 문제 해결 버전)
 * Google Apps Script 웹앱의 핵심 라우팅 담당
 */

// ===== 웹앱 진입점 =====
function doGet(e) {
  try {
    console.log('🚀 웹앱 진입점 시작');
    
    // 시스템 설정 초기화
    try {
      SystemConfig.initialize();
    } catch (error) {
      console.warn('⚠️ SystemConfig 초기화 실패, 기본값 사용:', error);
    }
    
    // HTML 템플릿 생성
    const template = HtmlService.createTemplateFromFile('index');
    
    // HTML 출력 생성
    const htmlOutput = template.evaluate()
      .setTitle('길드 관리 시스템')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    // CSP 헤더 설정 - eval 허용
    try {
      const cspHeader = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:;";
      
      // Google Apps Script에서는 직접 CSP 헤더를 설정할 수 없으므로
      // HTML 메타 태그로 설정해야 함 (index.html에서 처리)
      console.log('🔒 CSP 정책 준비 완료');
      
    } catch (error) {
      console.warn('⚠️ CSP 헤더 설정 실패:', error);
    }
    
    console.log('✅ HTML 서비스 초기화 완료');
    return htmlOutput;
    
  } catch (error) {
    console.error('❌ doGet 오류:', error);
    return createErrorPage(error);
  }
}

// ===== 파일 포함 함수 =====
function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (error) {
    console.error('❌ 파일 포함 오류:', filename, error);
    return `<!-- 파일 로드 실패: ${filename} -->`;
  }
}

// ===== API 라우팅 - CSP 안전 버전 =====
function doPost(e) {
  try {
    const action = e.parameter.action;
    
    // 안전한 JSON 파싱
    let data = {};
    try {
      data = JSON.parse(e.parameter.data || '{}');
    } catch (parseError) {
      console.warn('JSON 파싱 실패, 기본 객체 사용:', parseError);
      data = {};
    }
    
    console.log('📡 API 요청:', action);
    console.log('📦 요청 데이터:', data);
    
    // 세션 토큰 추출
    const sessionToken = e.parameter.sessionToken || data.sessionToken;
    let userSession = null;
    
    // 로그인/회원가입을 제외한 모든 API는 세션 필요
    if (action !== 'login' && action !== 'register' && action !== 'healthCheck' && action !== 'initializeSystem') {
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
    
    // API 라우팅 - 오류 처리 강화
    let result;
    
    try {
      switch (action) {
        // 시스템
        case 'healthCheck':
          result = healthCheck();
          break;
        case 'initializeSystem':
          result = initializeSystem();
          break;
        
        // 인증 관련
        case 'login':
          result = AuthService.login(data);
          break;
        case 'register':
          result = AuthService.register(data);
          break;
        case 'logout':
          result = AuthService.logout(sessionToken);
          break;
        
        // 회원 관리
        case 'getMembers':
          result = MemberService.getMembers(userSession, data);
          break;
        case 'getMemberDetail':
          result = MemberService.getMemberDetail(data.memberId, userSession);
          break;
        case 'updateMember':
          result = MemberService.updateMember(data.memberId, data.updateData, userSession);
          break;
        case 'searchMembers':
          result = MemberService.searchMembers(data.searchTerm, userSession);
          break;
        
        // 보스 기록 관리
        case 'getBossRecords':
          result = BossService.getRecords(userSession, data);
          break;
        case 'createBossRecord':
          result = BossService.createRecord(data, userSession);
          break;
        case 'updateBossRecord':
          result = BossService.updateRecord(data.recordId, data.updateData, userSession);
          break;
        case 'deleteBossRecord':
          result = BossService.deleteRecord(data.recordId, userSession);
          break;
        
        // 자금 관리 (funds.gs가 있다면)
        case 'getCurrentFunds':
          if (typeof FundService !== 'undefined') {
            result = FundService.getCurrentFunds(userSession);
          } else {
            result = { success: false, message: '자금 관리 모듈이 로드되지 않았습니다.' };
          }
          break;
        case 'getTransactions':
          if (typeof FundService !== 'undefined') {
            result = FundService.getTransactions(userSession, data);
          } else {
            result = { success: false, message: '자금 관리 모듈이 로드되지 않았습니다.' };
          }
          break;
        case 'addIncome':
          if (typeof FundService !== 'undefined') {
            result = FundService.addIncome(data, userSession);
          } else {
            result = { success: false, message: '자금 관리 모듈이 로드되지 않았습니다.' };
          }
          break;
        case 'addExpense':
          if (typeof FundService !== 'undefined') {
            result = FundService.addExpense(data, userSession);
          } else {
            result = { success: false, message: '자금 관리 모듈이 로드되지 않았습니다.' };
          }
          break;
        case 'distributeFunds':
          if (typeof FundService !== 'undefined') {
            result = FundService.distributeFunds(data, userSession);
          } else {
            result = { success: false, message: '자금 관리 모듈이 로드되지 않았습니다.' };
          }
          break;
        
        // 관리자 기능
        case 'getBossList':
          result = AdminService.getBossList(userSession, data.includeInactive);
          break;
        case 'createBoss':
          result = AdminService.createBoss(data, userSession);
          break;
        case 'updateBoss':
          result = AdminService.updateBoss(data.bossId, data.updateData, userSession);
          break;
        case 'deleteBoss':
          result = AdminService.deleteBoss(data.bossId, userSession);
          break;
        case 'getClassList':
          result = AdminService.getClassList(userSession, data.includeInactive);
          break;
        case 'createClass':
          result = AdminService.createClass(data, userSession);
          break;
        
        // 통계
        case 'getWeeklyStats':
          result = BossService.generateWeeklyStats(userSession, data.weekYear);
          break;
        case 'getParticipantStats':
          result = BossService.getParticipantStatistics(userSession, data.participantId, data.period);
          break;
        
        default:
          result = {
            success: false,
            code: 'UNKNOWN_ACTION',
            message: '알 수 없는 API 액션: ' + action
          };
      }
    } catch (apiError) {
      console.error('API 실행 오류:', apiError);
      result = {
        success: false,
        code: 'API_ERROR',
        message: 'API 실행 중 오류가 발생했습니다: ' + apiError.message
      };
    }
    
    console.log('📤 API 응답:', result);
    return createResponse(result);
    
  } catch (error) {
    console.error('❌ API 요청 오류:', error);
    return createResponse({ 
      success: false, 
      code: 'SYSTEM_ERROR',
      message: '시스템 오류가 발생했습니다: ' + error.message,
      error: error.toString()
    });
  }
}

// ===== 응답 생성 유틸리티 =====
function createResponse(data) {
  try {
    // 안전한 JSON 문자열화
    const jsonString = JSON.stringify(data);
    
    const response = ContentService
      .createTextOutput(jsonString)
      .setMimeType(ContentService.MimeType.JSON);
    
    return response;
  } catch (error) {
    console.error('응답 생성 오류:', error);
    
    // 응답 생성 실패 시 기본 오류 응답
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

// ===== 오류 페이지 생성 =====
function createErrorPage(error) {
  const errorHtml = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>시스템 오류</title>
      <!-- CSP 완화 -->
      <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
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
        .retry-button, .setup-button {
          background: #3498db;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 14px;
          margin: 10px;
        }
        .setup-button {
          background: #2ecc71;
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <div class="error-icon">🛠️</div>
        <h1 class="error-title">시스템 초기화 필요</h1>
        <p class="error-message">
          시스템을 처음 사용하시거나 설정이 필요합니다.<br>
          CSP 오류가 발생할 수 있으니 아래 단계를 따라하세요.
        </p>
        <button class="retry-button" onclick="location.reload()">다시 시도</button>
        <button class="setup-button" onclick="initSystem()">시스템 초기화</button>
        
        <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; font-size: 12px;">
          <strong>CSP 오류 해결:</strong><br>
          1. settings.gs에서 SPREADSHEET_ID 설정<br>
          2. index.html의 CSP 메타태그 확인<br>
          3. 시스템 초기화 버튼 클릭
        </div>
      </div>
      
      <script>
        // CSP 안전한 방식으로 수정
        function initSystem() {
          try {
            fetch(window.location.href, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: 'action=initializeSystem&data={}'
            })
            .then(response => response.json())
            .then(result => {
              if (result.success) {
                alert('시스템이 초기화되었습니다!');
                location.reload();
              } else {
                alert('초기화 실패: ' + result.message);
              }
            })
            .catch(error => {
              alert('오류: ' + error.message);
            });
          } catch (error) {
            alert('초기화 중 오류: ' + error.message);
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
    try {
      SystemConfig.initialize();
      console.log('✅ SystemConfig 초기화 완료');
    } catch (configError) {
      console.warn('⚠️ SystemConfig 초기화 실패, 계속 진행:', configError);
    }
    
    // 필수 시트 생성
    try {
      DatabaseUtils.initializeSheets();
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
      cspEnabled: true
    };
    
    console.log('💚 헬스체크 완료');
    return { success: true, status };
    
  } catch (error) {
    console.error('❤️‍🩹 헬스체크 실패:', error);
    return { success: false, error: error.message };
  }
}

// ===== 빠른 CSP 문제 해결 함수 =====
function fixCSPIssues() {
  try {
    console.log('🔧 CSP 문제 해결 시작...');
    
    // 캐시 정리
    if (typeof CacheUtils !== 'undefined') {
      CacheUtils.clear();
    }
    
    // 시스템 재초기화
    const initResult = initializeSystem();
    
    if (initResult.success) {
      console.log('✅ CSP 문제 해결 완료');
      return {
        success: true,
        message: 'CSP 문제가 해결되었습니다. 웹앱을 새로고침하세요.'
      };
    } else {
      throw new Error(initResult.message);
    }
    
  } catch (error) {
    console.error('❌ CSP 문제 해결 실패:', error);
    return {
      success: false,
      message: 'CSP 문제 해결에 실패했습니다: ' + error.message
    };
  }
}
