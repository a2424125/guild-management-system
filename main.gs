/**
 * 🧪 2단계: 로그인 기능 추가 main.gs
 * 1단계 성공 확인 후, 로그인 기능을 단계적으로 추가
 */

function doGet(e) {
  console.log('🧪 2단계 로그인 기능 테스트 시작');
  console.log('실행 시간:', new Date().toISOString());
  console.log('파라미터:', JSON.stringify(e));
  
  // 메시지 파라미터 처리
  const message = (e && e.parameter && e.parameter.message) || '';
  const success = (e && e.parameter && e.parameter.success) === 'true';
  
  console.log('메시지:', message, '성공 여부:', success);
  
  const html = createLoginPage(message, success);
  
  console.log('HTML 생성 완료, 길이:', html.length);
  
  return HtmlService.createHtmlOutput(html)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setTitle('2단계 테스트 - 로그인 기능');
}

function doPost(e) {
  console.log('📨 2단계 doPost 호출됨');
  console.log('받은 파라미터:', JSON.stringify(e.parameter));
  
  try {
    const action = e.parameter.action;
    console.log('액션:', action);
    
    if (action === 'login') {
      return handleLogin(e.parameter);
    } else {
      return redirectWithMessage('알 수 없는 액션입니다.', false);
    }
    
  } catch (error) {
    console.error('❌ doPost 오류:', error);
    return redirectWithMessage('시스템 오류: ' + error.message, false);
  }
}

// 로그인 페이지 생성
function createLoginPage(message, success) {
  let messageHtml = '';
  if (message) {
    const bgColor = success ? '#d4edda' : '#f8d7da';
    const textColor = success ? '#155724' : '#721c24';
    const borderColor = success ? '#c3e6cb' : '#f5c6cb';
    
    messageHtml = `
      <div style="background:${bgColor}; color:${textColor}; padding:15px; margin:20px 0; border-radius:8px; border:1px solid ${borderColor};">
        ${escapeHtml(message)}
      </div>
    `;
  }
  
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>2단계 테스트 - 로그인</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 20px;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 400px;
      text-align: center;
    }
    .logo {
      font-size: 60px;
      margin-bottom: 20px;
    }
    h1 {
      color: #2c3e50;
      margin-bottom: 10px;
      font-size: 24px;
    }
    .subtitle {
      color: #7f8c8d;
      margin-bottom: 30px;
      font-size: 14px;
    }
    .form-group {
      margin-bottom: 20px;
      text-align: left;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #2c3e50;
      font-size: 14px;
    }
    input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e1e8ed;
      border-radius: 8px;
      font-size: 16px;
      background: white;
      box-sizing: border-box;
    }
    input:focus {
      outline: none;
      border-color: #667eea;
    }
    .btn {
      width: 100%;
      padding: 14px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 10px;
    }
    .btn:hover {
      opacity: 0.9;
    }
    .status {
      background: #e8f5e8;
      border-left: 4px solid #28a745;
      padding: 15px;
      margin-top: 25px;
      border-radius: 4px;
      text-align: left;
      font-size: 13px;
      color: #155724;
    }
    .step-info {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 15px;
      margin-top: 15px;
      border-radius: 4px;
      text-align: left;
      font-size: 12px;
      color: #1565c0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">⚔️</div>
    <h1>2단계 테스트</h1>
    <p class="subtitle">로그인 기능 추가</p>
    
    ${messageHtml}
    
    <form method="POST" action="">
      <input type="hidden" name="action" value="login">
      
      <div class="form-group">
        <label for="nickname">닉네임</label>
        <input type="text" id="nickname" name="nickname" value="admin" required>
      </div>
      
      <div class="form-group">
        <label for="password">비밀번호</label>
        <input type="password" id="password" name="password" value="Admin#2025!Safe" required>
      </div>
      
      <button type="submit" class="btn">🚀 로그인 테스트</button>
    </form>
    
    <div class="status">
      🟢 1단계: 성공 완료<br>
      🧪 2단계: 로그인 폼 추가<br>
      ✅ doGet: 정상 작동<br>
      🔄 doPost: 테스트 중
    </div>
    
    <div class="step-info">
      📅 테스트 시간: ${new Date().toLocaleString('ko-KR')}<br>
      👤 기본 계정: admin / Admin#2025!Safe<br>
      🎯 목표: 단계적 기능 추가로 문제점 발견
    </div>
  </div>
</body>
</html>`;
}

// 로그인 처리 (단순화된 버전)
function handleLogin(params) {
  console.log('🔐 2단계 로그인 처리 시작');
  
  const nickname = params.nickname;
  const password = params.password;
  
  console.log('닉네임:', nickname);
  console.log('비밀번호 길이:', password ? password.length : 0);
  
  // 매우 단순한 로그인 검증
  if (!nickname || !password) {
    return redirectWithMessage('닉네임과 비밀번호를 입력하세요.', false);
  }
  
  if (nickname === 'admin' && password === 'Admin#2025!Safe') {
    console.log('✅ 로그인 성공');
    return createSuccessPage();
  } else {
    console.log('❌ 로그인 실패');
    return redirectWithMessage('닉네임 또는 비밀번호가 올바르지 않습니다.', false);
  }
}

// 성공 페이지 생성
function createSuccessPage() {
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>로그인 성공</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #4CAF50, #45a049);
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .success-container {
      background: rgba(255, 255, 255, 0.1);
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      backdrop-filter: blur(10px);
      max-width: 500px;
      width: 100%;
    }
    .icon { font-size: 80px; margin-bottom: 20px; }
    h1 { margin-bottom: 20px; font-size: 28px; }
    .info {
      background: rgba(255, 255, 255, 0.2);
      padding: 20px;
      border-radius: 10px;
      margin: 20px 0;
    }
    .btn {
      background: #dc3545;
      color: white;
      padding: 12px 25px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 20px;
    }
    .btn:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="success-container">
    <div class="icon">🎉</div>
    <h1>2단계 성공!</h1>
    
    <div class="info">
      <h3>✅ 확인된 기능들</h3>
      <p>✅ HTML 페이지 렌더링</p>
      <p>✅ POST 폼 데이터 처리</p>
      <p>✅ 로그인 로직 실행</p>
      <p>✅ 페이지 간 이동</p>
    </div>
    
    <div class="info">
      <p><strong>로그인 시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
      <p><strong>계정:</strong> admin</p>
      <p><strong>상태:</strong> 테스트 성공</p>
    </div>
    
    <form method="POST" action="">
      <input type="hidden" name="action" value="logout">
      <button type="submit" class="btn">🚪 로그아웃 (다시 테스트)</button>
    </form>
    
    <div style="margin-top: 20px; font-size: 14px; opacity: 0.8;">
      🎯 2단계 완료! 다음: 백엔드 서비스 연결
    </div>
  </div>
</body>
</html>`;

  return HtmlService.createHtmlOutput(html)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

// 메시지와 함께 리다이렉트
function redirectWithMessage(message, success) {
  console.log('🔄 리다이렉트:', message);
  
  const currentUrl = ScriptApp.getService().getUrl();
  const encodedMessage = encodeURIComponent(message);
  const successParam = success ? 'true' : 'false';
  
  const redirectHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="2;url=${currentUrl}?message=${encodedMessage}&success=${successParam}">
  <title>처리 중...</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 50px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
    }
    .processing {
      background: rgba(255, 255, 255, 0.1);
      padding: 40px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }
  </style>
</head>
<body>
  <div class="processing">
    <h2>🔄 처리 중...</h2>
    <p>${escapeHtml(message)}</p>
    <p>잠시 후 자동으로 이동합니다...</p>
  </div>
</body>
</html>`;
  
  return HtmlService.createHtmlOutput(redirectHtml)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

// HTML 이스케이프
function escapeHtml(text) {
  if (!text) return '';
  return text.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 수동 테스트 함수들
function test2Step() {
  console.log('🔧 2단계 수동 테스트');
  return doGet();
}

function testLogin() {
  console.log('🔧 로그인 테스트');
  return handleLogin({
    nickname: 'admin',
    password: 'Admin#2025!Safe'
  });
}
