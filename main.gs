/**
 * 🧪 5단계: AuthService 호출 테스트
 * 4단계 성공 코드에 AuthService만 조심스럽게 추가
 */

function doGet(e) {
  console.log('🧪 5단계 AuthService 테스트 시작');
  
  const message = (e && e.parameter && e.parameter.msg) || '';
  
  let messageHtml = '';
  if (message) {
    messageHtml = `<div style="background: lightcoral; padding: 10px; margin: 10px; border-radius: 5px; color: white;">${message}</div>`;
  }
  
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>5단계 AuthService 테스트</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 50px;
      background: linear-gradient(135deg, #FF6B6B, #ee5a52);
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
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
      margin-top: 10px;
    }
    button:hover { background: #45a049; }
  </style>
</head>
<body>
  <div class="container">
    <div style="font-size: 48px; margin-bottom: 20px;">🔐</div>
    <h1>5단계: AuthService 테스트</h1>
    <p><strong>실제 인증 시스템 호출 테스트</strong></p>
    
    ${messageHtml}
    
    <div style="background: rgba(255, 255, 255, 0.2); padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h3>📊 테스트 정보</h3>
      <p><strong>시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
      <p><strong>목표:</strong> AuthService.login() 호출</p>
      <p><strong>위험도:</strong> 높음 (복잡한 로직)</p>
    </div>
    
    <div style="background: rgba(255, 255, 255, 0.2); padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>🔐 실제 로그인 테스트</h3>
      <form method="POST" action="">
        <input type="hidden" name="action" value="realLogin">
        
        <div class="form-group">
          <label for="nickname">닉네임:</label>
          <input type="text" id="nickname" name="nickname" value="admin" required>
        </div>
        
        <div class="form-group">
          <label for="password">비밀번호:</label>
          <input type="password" id="password" name="password" value="Admin#2025!Safe" required>
        </div>
        
        <button type="submit">🚀 실제 로그인 테스트</button>
      </form>
      
      <p style="font-size: 14px; margin-top: 15px; opacity: 0.8;">
        ⚠️ 이제 AuthService.login()이 실행됩니다!
      </p>
    </div>
    
    <div style="background: rgba(255, 255, 255, 0.2); padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h3>🧪 5단계 확인 사항</h3>
      <ul style="text-align: left; display: inline-block;">
        <li>✅ 기본 폼 기능 (4단계 성공)</li>
        <li>🔥 AuthService.login() 호출</li>
        <li>🔥 DatabaseUtils 접근</li>
        <li>🔥 스프레드시트 읽기</li>
        <li>🔥 비밀번호 해시 검증</li>
      </ul>
    </div>
    
    <div style="margin-top: 30px; font-size: 14px; opacity: 0.8;">
      ⚠️ 5단계: 핵심 문제 발견 단계
    </div>
  </div>
</body>
</html>`;

  console.log('HTML 생성 완료, 길이:', html.length);
  
  return HtmlService.createHtmlOutput(html)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setTitle('5단계 - AuthService 테스트');
}

function doPost(e) {
  console.log('📨 5단계 doPost - 실제 AuthService 호출');
  console.log('받은 파라미터:', JSON.stringify(e.parameter));
  
  try {
    const action = e.parameter.action;
    
    if (action === 'realLogin') {
      console.log('🔥 실제 AuthService.login() 호출 시작');
      
      // 🔥 여기서 실제 AuthService를 호출합니다 - 문제가 있다면 여기서 발생할 것입니다!
      const loginResult = AuthService.login({
        nickname: e.parameter.nickname,
        password: e.parameter.password
      });
      
      console.log('🎯 AuthService.login() 완료:', loginResult ? loginResult.success : 'null');
      
      if (loginResult && loginResult.success) {
        // 성공 시
        const successHtml = `<!DOCTYPE html>
<html><body style="text-align: center; padding: 50px; background: #4CAF50; color: white; font-family: Arial;">
  <h1>🎉 5단계 성공!</h1>
  <h2>AuthService.login() 정상 작동!</h2>
  <p>사용자: ${loginResult.data.user.nickname}</p>
  <p>권한: ${loginResult.data.user.role}</p>
  <p>시간: ${new Date().toLocaleString('ko-KR')}</p>
  <div style="background: rgba(255,255,255,0.2); padding: 20px; margin: 20px; border-radius: 10px;">
    <h3>✅ 성공한 복잡한 기능들</h3>
    <p>✅ AuthService.login() 실행</p>
    <p>✅ DatabaseUtils.findUserByNickname()</p>
    <p>✅ 비밀번호 해시 검증</p>
    <p>✅ 세션 생성</p>
  </div>
  <a href="${ScriptApp.getService().getUrl()}" style="color: white;">돌아가기</a>
</body></html>`;
        
        return HtmlService.createHtmlOutput(successHtml);
        
      } else {
        // 실패 시
        const errorMsg = loginResult ? loginResult.message : '로그인 함수 실행 실패';
        return redirectToHome('로그인 실패: ' + errorMsg);
      }
      
    } else {
      return redirectToHome('알 수 없는 액션: ' + action);
    }
    
  } catch (error) {
    console.error('❌ 5단계 doPost 오류:', error);
    console.error('오류 스택:', error.stack);
    
    // 매우 상세한 오류 정보 반환
    return redirectToHome('AuthService 오류: ' + error.message + ' (라인: ' + error.stack + ')');
  }
}

// 간단한 리다이렉트
function redirectToHome(msg) {
  const currentUrl = ScriptApp.getService().getUrl();
  const redirectUrl = currentUrl + '?msg=' + encodeURIComponent(msg);
  
  const redirectHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta http-equiv="refresh" content="2;url=${redirectUrl}"></head>
<body style="text-align: center; padding: 50px; font-family: Arial; background: #ff6b6b; color: white;">
  <h2>🔄 처리 중...</h2><p>${msg}</p><p>2초 후 자동 이동...</p>
</body></html>`;
  
  return HtmlService.createHtmlOutput(redirectHtml);
}
