/**
 * 🧪 4단계: 실제 작동하는 단순 폼 테스트
 * 3단계 성공 코드에 실제 POST 처리만 추가
 */

function doGet(e) {
  console.log('🧪 4단계 실제 폼 테스트 시작');
  console.log('파라미터:', JSON.stringify(e));
  
  // 메시지 파라미터 처리 (매우 단순하게)
  const message = (e && e.parameter && e.parameter.msg) || '';
  
  let messageHtml = '';
  if (message) {
    messageHtml = `<div style="background: lightblue; padding: 10px; margin: 10px; border-radius: 5px;">${message}</div>`;
  }
  
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>4단계 실제 폼 테스트</title>
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
    .form-group {
      margin-bottom: 15px;
      text-align: left;
    }
    label {
      display: block;
      margin-bottom: 5px;
      color: white;
      font-weight: bold;
    }
    input {
      width: 100%;
      padding: 10px;
      border: 2px solid #ddd;
      border-radius: 5px;
      font-size: 16px;
      box-sizing: border-box;
    }
    button {
      width: 100%;
      padding: 12px;
      background: #2196F3;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
      margin-top: 10px;
    }
    button:hover {
      background: #1976D2;
    }
  </style>
</head>
<body>
  <div class="container">
    <div style="font-size: 48px; margin-bottom: 20px;">🔧</div>
    <h1>4단계: 실제 폼 테스트</h1>
    <p><strong>실제 POST 처리가 작동하는지 확인</strong></p>
    
    ${messageHtml}
    
    <div style="background: rgba(255, 255, 255, 0.2); padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h3>📊 실행 정보</h3>
      <p><strong>시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
      <p><strong>단계:</strong> 실제 폼 기능 테스트</p>
    </div>
    
    <div style="background: rgba(255, 255, 255, 0.2); padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>📝 실제 작동 폼</h3>
      <form method="POST" action="">
        <input type="hidden" name="action" value="test">
        
        <div class="form-group">
          <label for="username">사용자명:</label>
          <input type="text" id="username" name="username" value="테스트유저" required>
        </div>
        
        <div class="form-group">
          <label for="message">메시지:</label>
          <input type="text" id="message" name="message" value="안녕하세요" required>
        </div>
        
        <button type="submit">📤 전송 테스트</button>
      </form>
      
      <p style="font-size: 14px; margin-top: 15px; opacity: 0.8;">
        ⚠️ 이 폼을 전송하면 doPost 함수가 실행됩니다
      </p>
    </div>
    
    <div style="background: rgba(255, 255, 255, 0.2); padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h3>✅ 4단계 확인 사항</h3>
      <ul style="text-align: left; display: inline-block;">
        <li>✅ CSS 스타일링 (3단계 성공)</li>
        <li>✅ 실제 입력 폼</li>
        <li>🧪 POST 데이터 전송</li>
        <li>🧪 doPost 함수 실행</li>
        <li>🧪 응답 페이지 표시</li>
      </ul>
    </div>
    
    <div style="margin-top: 30px; font-size: 14px; opacity: 0.8;">
      🔧 4단계 | 다음: 복잡한 로직 테스트
    </div>
  </div>
</body>
</html>`;

  console.log('HTML 생성 완료, 길이:', html.length);
  
  return HtmlService.createHtmlOutput(html)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setTitle('4단계 테스트 - 실제 폼');
}

function doPost(e) {
  console.log('📨 4단계 doPost 실행됨');
  console.log('받은 파라미터:', JSON.stringify(e.parameter));
  
  try {
    const action = e.parameter.action;
    const username = e.parameter.username;
    const message = e.parameter.message;
    
    console.log('액션:', action);
    console.log('사용자명:', username);
    console.log('메시지:', message);
    
    if (action === 'test') {
      // 성공 페이지 직접 반환 (리다이렉트 없이)
      const successHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>4단계 POST 성공</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 50px;
      background: linear-gradient(135deg, #2196F3, #1976D2);
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
  </style>
</head>
<body>
  <div class="container">
    <div style="font-size: 80px; margin-bottom: 20px;">🎉</div>
    <h1>4단계 성공!</h1>
    <h2>POST 처리 완료</h2>
    
    <div style="background: rgba(255, 255, 255, 0.2); padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>📨 받은 데이터</h3>
      <p><strong>액션:</strong> ${action}</p>
      <p><strong>사용자명:</strong> ${username}</p>
      <p><strong>메시지:</strong> ${message}</p>
      <p><strong>처리 시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
    </div>
    
    <div style="background: rgba(255, 255, 255, 0.2); padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h3>✅ 성공한 기능들</h3>
      <ul style="text-align: left; display: inline-block;">
        <li>✅ HTML 페이지 렌더링</li>
        <li>✅ CSS 스타일링</li>
        <li>✅ 폼 데이터 전송</li>
        <li>✅ doPost 함수 실행</li>
        <li>✅ 데이터 파싱</li>
        <li>✅ 응답 페이지 생성</li>
      </ul>
    </div>
    
    <a href="${ScriptApp.getService().getUrl()}" style="display: inline-block; padding: 12px 20px; background: rgba(255,255,255,0.2); color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
      🔙 돌아가기
    </a>
    
    <div style="margin-top: 30px; font-size: 14px; opacity: 0.8;">
      🎉 4단계 완료! 기본 폼 기능 모두 정상!
    </div>
  </div>
</body>
</html>`;

      console.log('✅ POST 처리 성공, 성공 페이지 반환');
      
      return HtmlService.createHtmlOutput(successHtml)
        .setSandboxMode(HtmlService.SandboxMode.IFRAME)
        .setTitle('4단계 POST 성공');
        
    } else {
      console.log('❌ 알 수 없는 액션:', action);
      return redirectToHome('알 수 없는 액션입니다.');
    }
    
  } catch (error) {
    console.error('❌ doPost 오류:', error);
    return redirectToHome('POST 처리 오류: ' + error.message);
  }
}

// 간단한 리다이렉트 (테스트용)
function redirectToHome(msg) {
  const currentUrl = ScriptApp.getService().getUrl();
  const redirectUrl = currentUrl + '?msg=' + encodeURIComponent(msg);
  
  const redirectHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="1;url=${redirectUrl}">
  <title>리다이렉트 중...</title>
</head>
<body style="text-align: center; padding: 50px; font-family: Arial;">
  <h2>🔄 처리 중...</h2>
  <p>${msg}</p>
</body>
</html>`;
  
  return HtmlService.createHtmlOutput(redirectHtml);
}

// 수동 테스트
function test4Step() {
  console.log('🔧 4단계 수동 테스트');
  return doGet();
}
