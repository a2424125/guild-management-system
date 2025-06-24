/**
 * 길드 관리 시스템 - 메인 진입점
 * Google Apps Script 웹앱의 핵심 라우팅 담당
 */

// ===== 웹앱 진입점 =====
function doGet(e) {
  try {
    console.log('🚀 웹앱 진입점 시작');
    
    // CSP 준수를 위한 HTML 생성
    const template = HtmlService.createTemplateFromFile('frontend/index');
    
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
    
    switch (action) {
      case 'login':
        return createResponse(AuthService.login(data));
      case 'register':
        return createResponse(AuthService.register(data));
      case 'getMembers':
        return createResponse(MemberService.getMembers());
      case 'getBossRecords':
        return createResponse(BossService.getRecords(data));
      case 'getStatistics':
        return createResponse(StatisticsService.getStatistics(data));
      default:
        throw new Error('알 수 없는 API 액션: ' + action);
    }
    
  } catch (error) {
    console.error('❌ API 요청 오류:', error);
    return createResponse({ success: false, error: error.message });
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
      <title>시스템 오류</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex; 
          justify-content: center; 
          align-items: center; 
          min-height: 100vh; 
          margin: 0; 
          background: #f5f5f5;
        }
        .error-container { 
          text-align: center; 
          background: white; 
          padding: 40px; 
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          max-width: 500px;
        }
        .error-icon { 
          font-size: 64px; 
          margin-bottom: 20px; 
        }
        .error-title { 
          color: #dc3545; 
          margin-bottom: 16px; 
        }
        .error-message { 
          color: #6c757d; 
          margin-bottom: 24px; 
        }
        .retry-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
        }
        .retry-button:hover { 
          background: #0056b3; 
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h1 class="error-title">시스템 오류가 발생했습니다</h1>
        <p class="error-message">
          길드 관리 시스템을 초기화하는 중 문제가 발생했습니다.<br>
          잠시 후 다시 시도해주세요.
        </p>
        <p class="error-details" style="font-size: 12px; color: #999;">
          오류 내용: ${error.message || '알 수 없는 오류'}
        </p>
        <button class="retry-button" onclick="location.reload()">
          다시 시도
        </button>
      </div>
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
    return { success: true, message: '시스템이 성공적으로 초기화되었습니다.' };
    
  } catch (error) {
    console.error('❌ 시스템 초기화 오류:', error);
    return { success: false, message: error.message };
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
    LoggingService.logError(error);
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