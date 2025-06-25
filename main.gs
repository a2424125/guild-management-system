/**
 * 🧪 1단계: 극단적 단순화 main.gs
 * 기존 main.gs 파일의 모든 내용을 삭제하고 이 코드로 완전 교체하세요
 * 목적: Google Apps Script 자체에 문제가 있는지 확인
 */

function doGet(e) {
  console.log('🧪 1단계 극단적 단순화 doGet 실행됨');
  console.log('실행 시간:', new Date().toISOString());
  console.log('사용자:', Session.getActiveUser().getEmail());
  console.log('파라미터:', JSON.stringify(e));
  
  // 가장 단순한 HTML 생성
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>1단계 테스트</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 50px;
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
      margin: 0;
    }
    .container {
      background: rgba(255, 255, 255, 0.1);
      padding: 30px;
      border-radius: 15px;
      display: inline-block;
      backdrop-filter: blur(10px);
    }
    .success {
      font-size: 48px;
      margin-bottom: 20px;
    }
    .info {
      background: rgba(255, 255, 255, 0.2);
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="success">🎉</div>
    <h1>1단계 성공!</h1>
    <p><strong>Google Apps Script가 정상 작동합니다!</strong></p>
    
    <div class="info">
      <h3>📊 실행 정보</h3>
      <p><strong>실행 시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
      <p><strong>사용자:</strong> ${Session.getActiveUser().getEmail()}</p>
      <p><strong>시간대:</strong> ${Session.getScriptTimeZone()}</p>
    </div>
    
    <div class="info">
      <h3>✅ 확인된 사항</h3>
      <ul style="text-align: left; display: inline-block;">
        <li>✅ doGet 함수 정상 실행</li>
        <li>✅ HtmlService 정상 작동</li>
        <li>✅ HTML 생성 성공</li>
        <li>✅ 백엔드 완전 정상</li>
      </ul>
    </div>
    
    <div class="info">
      <h3>🔍 이 페이지가 보인다면</h3>
      <p>백색화면 문제는 <strong>코드 복잡성</strong> 때문입니다!</p>
      <p>단계적으로 기능을 추가하면서 문제점을 찾아보겠습니다.</p>
    </div>
    
    <div style="margin-top: 30px; font-size: 14px; opacity: 0.8;">
      🧪 1단계 테스트 완료 | 다음: 로그인 기능 추가
    </div>
  </div>
</body>
</html>`;

  console.log('HTML 생성 완료, 길이:', html.length);
  
  try {
    const output = HtmlService.createHtmlOutput(html)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setTitle('1단계 테스트 - 극단적 단순화');
    
    console.log('✅ HtmlService 객체 생성 성공');
    return output;
    
  } catch (error) {
    console.error('❌ HtmlService 생성 실패:', error);
    
    // 완전 폴백 - ContentService 사용
    return ContentService
      .createTextOutput(`
        <h1>HtmlService 오류 발생</h1>
        <p>오류: ${error.message}</p>
        <p>시간: ${new Date().toLocaleString()}</p>
      `)
      .setMimeType(ContentService.MimeType.HTML);
  }
}

function doPost(e) {
  console.log('📨 1단계 doPost 호출됨');
  return doGet(e);
}

// 수동 테스트용 함수
function test1Step() {
  console.log('🔧 1단계 수동 테스트 시작');
  const result = doGet();
  console.log('결과 타입:', typeof result);
  console.log('결과 존재:', !!result);
  return result;
}

// 현재 배포 상태 확인
function checkDeployment() {
  try {
    const url = ScriptApp.getService().getUrl();
    console.log('📍 현재 웹앱 URL:', url);
    console.log('📍 URL 타입:', url.includes('/dev') ? '개발 모드' : '실제 배포');
    return {
      url: url,
      type: url.includes('/dev') ? 'DEVELOPMENT' : 'PRODUCTION',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ 배포 상태 확인 실패:', error);
    return { error: error.message };
  }
}
