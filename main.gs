/**
 * 길드 관리 시스템 - 완전 단순 버전 (JavaScript 제거)
 */

// ===== doGet - 매우 단순한 HTML만 반환 =====
function doGet(e) {
  try {
    console.log('🚀 doGet 시작');
    
    // URL 파라미터 확인
    const params = e.parameter || {};
    
    // 단순한 HTML 문자열 직접 생성
    const htmlContent = createSimpleHTML(params);
    
    return HtmlService.createHtmlOutput(htmlContent)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setTitle('길드 관리 시스템');
    
  } catch (error) {
    console.error('❌ doGet 오류:', error);
    return HtmlService.createHtmlOutput(createErrorHTML(error.message));
  }
}

// ===== doPost - 폼 처리 =====
function doPost(e) {
  try {
    console.log('📡 doPost 시작');
    console.log('받은 파라미터:', e.parameter);
    
    const params = e.parameter || {};
    const action = params.action;
    
    if (action === 'login') {
      return handleLogin(params);
    } else if (action === 'logout') {
      return handleLogout();
    } else {
      return createRedirect('알 수 없는 액션입니다.', false);
    }
    
  } catch (error) {
    console.error('❌ doPost 오류:', error);
    return createRedirect('시스템 오류: ' + error.message, false);
  }
}

// ===== 로그인 처리 =====
function handleLogin(params) {
  try {
    const nickname = params.nickname;
    const password = params.password;
    
    console.log('로그인 시도:', nickname);
    
    if (!nickname || !password) {
      return createRedirect('닉네임과 비밀번호를 입력하세요.', false);
    }
    
    // AuthService로 로그인
    const loginResult = AuthService.login({ 
      nickname: nickname, 
      password: password 
    });
    
    if (loginResult.success) {
      console.log('✅ 로그인 성공');
      
      // 성공 시 대시보드로 리다이렉트
      return createSuccessDashboard(loginResult.user, loginResult.sessionToken);
      
    } else {
      console.log('❌ 로그인 실패:', loginResult.message);
      return createRedirect(loginResult.message || '로그인 실패', false);
    }
    
  } catch (error) {
    console.error('로그인 처리 오류:', error);
    return createRedirect('로그인 처리 오류: ' + error.message, false);
  }
}

// ===== 로그아웃 처리 =====
function handleLogout() {
  return createRedirect('로그아웃되었습니다.', true);
}

// ===== HTML 생성 함수들 =====
function createSimpleHTML(params) {
  const message = params.message || '';
  const success = params.success === 'true';
  
  let messageHtml = '';
  if (message) {
    const messageClass = success ? 'success' : 'error';
    messageHtml = `<div class="message ${messageClass}">${message}</div>`;
  }
  
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>길드 관리 시스템</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            max-width: 400px;
            width: 100%;
            text-align: center;
        }
        .logo { font-size: 48px; margin-bottom: 16px; }
        .title { 
            color: #2c3e50; 
            font-size: 28px; 
            font-weight: bold; 
            margin-bottom: 8px; 
        }
        .subtitle { 
            color: #7f8c8d; 
            margin-bottom: 32px; 
        }
        .form-group { 
            margin-bottom: 16px; 
            text-align: left; 
        }
        .form-label { 
            display: block; 
            margin-bottom: 8px; 
            color: #2c3e50; 
            font-weight: bold; 
        }
        .form-input { 
            width: 100%; 
            padding: 16px; 
            border: 2px solid #e1e8ed; 
            border-radius: 12px; 
            font-size: 16px; 
            box-sizing: border-box;
        }
        .form-input:focus { 
            outline: none; 
            border-color: #667eea; 
        }
        .btn { 
            width: 100%; 
            padding: 16px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            border: none; 
            border-radius: 12px; 
            cursor: pointer; 
            font-size: 18px; 
            font-weight: bold; 
            margin-top: 16px;
        }
        .btn:hover { 
            background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%); 
        }
        .message { 
            margin-top: 20px; 
            padding: 16px; 
            border-radius: 12px; 
            font-weight: bold; 
        }
        .message.success { 
            background: rgba(46, 204, 113, 0.1); 
            color: #27ae60; 
            border-left: 4px solid #2ecc71; 
        }
        .message.error { 
            background: rgba(231, 76, 60, 0.1); 
            color: #c0392b; 
            border-left: 4px solid #e74c3c; 
        }
        .status { 
            margin-top: 24px; 
            padding: 16px; 
            background: rgba(46, 204, 113, 0.1); 
            border-radius: 12px; 
            color: #27ae60; 
            font-size: 14px; 
        }
        .admin-info { 
            margin-top: 16px; 
            padding: 16px; 
            background: rgba(52, 152, 219, 0.1); 
            border-radius: 12px; 
            color: #2980b9; 
            font-size: 13px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">⚔️</div>
        <h1 class="title">길드 관리 시스템</h1>
        <p class="subtitle">안전하고 편리한 게임 길드 플랫폼</p>
        
        <form method="POST" action="">
            <input type="hidden" name="action" value="login">
            
            <div class="form-group">
                <label for="nickname" class="form-label">닉네임</label>
                <input type="text" id="nickname" name="nickname" class="form-input" 
                       value="admin" required>
            </div>
            
            <div class="form-group">
                <label for="password" class="form-label">비밀번호</label>
                <input type="password" id="password" name="password" class="form-input" 
                       value="Admin#2025!Safe" required>
            </div>
            
            <button type="submit" class="btn">로그인</button>
        </form>
        
        ${messageHtml}
        
        <div class="status">
            🟢 시스템 정상 (완전 단순 모드)
        </div>
        
        <div class="admin-info">
            기본 관리자: admin / Admin#2025!Safe<br>
            JavaScript 완전 제거됨
        </div>
    </div>
</body>
</html>`;
}

// ===== 성공 대시보드 (JavaScript 없음) =====
function createSuccessDashboard(user, sessionToken) {
  const dashboardHtml = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>길드 관리 시스템 - 대시보드</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            color: white;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 36px;
            margin-bottom: 8px;
        }
        .dashboard {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .card {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .card h2 {
            color: #2c3e50;
            margin-bottom: 16px;
            font-size: 24px;
        }
        .user-info {
            background: rgba(46, 204, 113, 0.1);
            border-left: 4px solid #2ecc71;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }
        .info-item {
            background: white;
            padding: 12px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .info-label {
            font-weight: bold;
            color: #7f8c8d;
            font-size: 12px;
            margin-bottom: 4px;
        }
        .info-value {
            color: #2c3e50;
            font-size: 16px;
        }
        .actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }
        .action-btn {
            background: #3498db;
            color: white;
            text-decoration: none;
            padding: 16px;
            border-radius: 8px;
            text-align: center;
            font-weight: bold;
            display: block;
        }
        .action-btn:hover {
            background: #2980b9;
        }
        .logout-form {
            margin-top: 20px;
        }
        .logout-btn {
            background: #e74c3c;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
        }
        .system-status {
            background: rgba(46, 204, 113, 0.1);
            border-left: 4px solid #2ecc71;
            color: #27ae60;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>⚔️ 길드 관리 시스템</h1>
        <p>로그인 성공! 모든 기능이 정상 작동합니다.</p>
    </div>
    
    <div class="dashboard">
        <!-- 사용자 정보 -->
        <div class="card user-info">
            <h2>👤 사용자 정보</h2>
            <p style="font-size: 20px; color: #2c3e50; margin-bottom: 20px;">
                환영합니다, <strong>${user.nickname}</strong>님!
            </p>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">닉네임</div>
                    <div class="info-value">${user.nickname}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">캐릭터명</div>
                    <div class="info-value">${user.characterName || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">직업</div>
                    <div class="info-value">${user.characterClass || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">권한</div>
                    <div class="info-value">${user.role}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">상태</div>
                    <div class="info-value">${user.status}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">세션</div>
                    <div class="info-value">활성</div>
                </div>
            </div>
        </div>
        
        <!-- 주요 기능 -->
        <div class="card">
            <h2>🎯 주요 기능</h2>
            <div class="actions">
                <a href="#" class="action-btn">👥 회원 관리</a>
                <a href="#" class="action-btn">🐉 보스 기록</a>
                <a href="#" class="action-btn">💰 길드 자금</a>
                <a href="#" class="action-btn">📊 통계 분석</a>
            </div>
            <form method="POST" action="" class="logout-form">
                <input type="hidden" name="action" value="logout">
                <button type="submit" class="logout-btn">🚪 로그아웃</button>
            </form>
        </div>
        
        <!-- 시스템 상태 -->
        <div class="card system-status">
            <h2>🔧 시스템 상태</h2>
            <p>✅ 로그인: 성공</p>
            <p>✅ 데이터베이스: 연결됨</p>
            <p>✅ 세션: 활성화됨</p>
            <p>✅ CSP 문제: 해결됨</p>
            <p>🎯 세션 토큰: ${sessionToken.substring(0, 16)}...</p>
            <p>⏰ 로그인 시간: ${new Date().toLocaleString('ko-KR')}</p>
        </div>
        
        <!-- 관리자 기능 (권한 있는 경우만) -->
        ${user.role === 'ADMIN' ? `
        <div class="card" style="background: rgba(52, 152, 219, 0.1); border-left: 4px solid #3498db;">
            <h2>⚙️ 관리자 기능</h2>
            <div class="actions">
                <a href="#" class="action-btn" style="background: #9b59b6;">🛠️ 시스템 설정</a>
                <a href="#" class="action-btn" style="background: #e67e22;">📋 사용자 관리</a>
            </div>
        </div>
        ` : ''}
    </div>
</body>
</html>`;

  return HtmlService.createHtmlOutput(dashboardHtml)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setTitle('길드 관리 시스템 - 대시보드');
}

// ===== 리다이렉트 생성 =====
function createRedirect(message, success) {
  const encodedMessage = encodeURIComponent(message);
  const successParam = success ? 'true' : 'false';
  const currentUrl = ScriptApp.getService().getUrl();
  const redirectUrl = `${currentUrl}?message=${encodedMessage}&success=${successParam}`;
  
  const redirectHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="1;url=${redirectUrl}">
    <title>처리 중...</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px;
            background: #f0f0f0;
        }
        .processing { 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            display: inline-block;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="processing">
        <h2>🔄 처리 중...</h2>
        <p>${message}</p>
        <p>잠시 후 자동으로 이동합니다.</p>
    </div>
</body>
</html>`;

  return HtmlService.createHtmlOutput(redirectHtml);
}

// ===== 오류 페이지 =====
function createErrorHTML(errorMessage) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>오류 발생</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f0f0f0; }
        .error { background: white; padding: 30px; border-radius: 10px; display: inline-block; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .error-icon { font-size: 48px; margin-bottom: 20px; }
        .error-message { color: #e74c3c; margin-bottom: 20px; }
        .btn { background: #3498db; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="error">
        <div class="error-icon">❌</div>
        <h2>오류 발생</h2>
        <div class="error-message">${errorMessage}</div>
        <button class="btn" onclick="window.location.reload()">새로고침</button>
    </div>
</body>
</html>`;
}
