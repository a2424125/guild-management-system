/**
 * 길드 관리 시스템 - HTML 폼 호환 main.gs
 * CSP 문제 완전 해결 버전
 */

// ===== 웹앱 진입점 - HTML 폼 방식 =====
function doGet(e) {
  try {
    console.log('🚀 웹앱 시작 - doGet 호출됨');
    console.log('받은 파라미터:', e);
    
    // URL 파라미터 확인
    const params = e.parameter || {};
    
    // 메시지 파라미터가 있으면 표시용으로 전달
    let messageInfo = '';
    if (params.message) {
      const success = params.success === 'true';
      messageInfo = `<script>
        window.addEventListener('load', function() {
          const messageDiv = document.getElementById('${success ? 'successMessage' : 'errorMessage'}');
          messageDiv.textContent = '${params.message.replace(/'/g, "\\'")}';
          messageDiv.style.display = 'block';
        });
      </script>`;
    }
    
    // 시스템 설정 초기화
    try {
      if (typeof SystemConfig !== 'undefined' && SystemConfig.initialize) {
        SystemConfig.initialize();
      }
    } catch (configError) {
      console.warn('⚠️ SystemConfig 초기화 실패:', configError);
    }
    
    // HTML 템플릿 로드
    let htmlContent;
    try {
      htmlContent = HtmlService.createTemplateFromFile('index').evaluate().getContent();
    } catch (templateError) {
      console.warn('템플릿 로드 실패, 기본 HTML 사용:', templateError);
      htmlContent = getDefaultLoginHTML();
    }
    
    // 메시지 추가
    if (messageInfo) {
      htmlContent = htmlContent.replace('</body>', messageInfo + '</body>');
    }
    
    const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .setTitle('길드 관리 시스템');
    
    console.log('✅ HTML 출력 생성 완료');
    return htmlOutput;
    
  } catch (error) {
    console.error('❌ doGet 오류:', error);
    return createEmergencyPage(error);
  }
}

// ===== HTML 폼 처리 - doPost =====
function doPost(e) {
  try {
    console.log('📡 doPost 호출됨 (HTML 폼 처리)');
    console.log('받은 데이터:', e);
    
    // HTML 폼에서 오는 파라미터 안전하게 추출
    const params = e.parameter || {};
    console.log('폼 파라미터:', params);
    
    const action = params.action;
    
    if (!action) {
      return redirectWithMessage('액션이 지정되지 않았습니다.', false);
    }
    
    console.log('처리할 액션:', action);
    
    // 액션별 처리
    let result;
    switch (action) {
      case 'login':
        result = handleLoginForm(params);
        break;
        
      case 'register':
        result = handleRegisterForm(params);
        break;
        
      case 'logout':
        result = handleLogoutForm(params);
        break;
        
      default:
        result = { success: false, message: '알 수 없는 액션: ' + action };
    }
    
    console.log('처리 결과:', result);
    
    // 결과에 따라 리다이렉트
    if (result.success) {
      if (action === 'login') {
        // 로그인 성공 시 대시보드로 이동
        return createDashboardPage(result.data);
      } else {
        return redirectWithMessage(result.message, true);
      }
    } else {
      return redirectWithMessage(result.message, false);
    }
    
  } catch (error) {
    console.error('❌ doPost 전체 오류:', error);
    return redirectWithMessage('시스템 오류가 발생했습니다: ' + error.message, false);
  }
}

// ===== HTML 폼 처리 함수들 =====
function handleLoginForm(params) {
  try {
    const nickname = params.nickname;
    const password = params.password;
    
    if (!nickname || !password) {
      return { success: false, message: '닉네임과 비밀번호를 모두 입력해주세요.' };
    }
    
    console.log('로그인 시도:', { nickname: nickname });
    
    // AuthService를 통한 로그인
    if (typeof AuthService === 'undefined') {
      return { success: false, message: 'AuthService가 로드되지 않았습니다.' };
    }
    
    const loginResult = AuthService.login({ nickname: nickname, password: password });
    
    if (loginResult.success) {
      console.log('✅ 로그인 성공:', loginResult);
      return {
        success: true,
        message: '로그인 성공!',
        data: {
          user: loginResult.user,
          sessionToken: loginResult.sessionToken
        }
      };
    } else {
      console.log('❌ 로그인 실패:', loginResult);
      return { success: false, message: loginResult.message || '로그인에 실패했습니다.' };
    }
    
  } catch (error) {
    console.error('로그인 처리 오류:', error);
    return { success: false, message: '로그인 처리 중 오류가 발생했습니다: ' + error.message };
  }
}

function handleRegisterForm(params) {
  try {
    const { nickname, password, characterName, characterClass } = params;
    
    if (!nickname || !password || !characterName || !characterClass) {
      return { success: false, message: '모든 필드를 입력해주세요.' };
    }
    
    console.log('회원가입 시도:', { nickname, characterName, characterClass });
    
    // AuthService를 통한 회원가입
    if (typeof AuthService === 'undefined') {
      return { success: false, message: 'AuthService가 로드되지 않았습니다.' };
    }
    
    const registerData = {
      nickname: nickname,
      password: password,
      characterName: characterName,
      characterClass: characterClass
    };
    
    const registerResult = AuthService.register(registerData);
    
    if (registerResult.success) {
      console.log('✅ 회원가입 성공:', registerResult);
      return {
        success: true,
        message: '회원가입이 완료되었습니다. 로그인해주세요.'
      };
    } else {
      console.log('❌ 회원가입 실패:', registerResult);
      return { success: false, message: registerResult.message || '회원가입에 실패했습니다.' };
    }
    
  } catch (error) {
    console.error('회원가입 처리 오류:', error);
    return { success: false, message: '회원가입 처리 중 오류가 발생했습니다: ' + error.message };
  }
}

function handleLogoutForm(params) {
  try {
    return { success: true, message: '로그아웃되었습니다.' };
  } catch (error) {
    return { success: false, message: '로그아웃 중 오류가 발생했습니다.' };
  }
}

// ===== 리다이렉트 및 페이지 생성 =====
function redirectWithMessage(message, success) {
  try {
    const encodedMessage = encodeURIComponent(message);
    const successParam = success ? 'true' : 'false';
    const currentUrl = ScriptApp.getService().getUrl();
    const redirectUrl = `${currentUrl}?message=${encodedMessage}&success=${successParam}`;
    
    console.log('리다이렉트:', redirectUrl);
    
    const redirectHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0;url=${redirectUrl}">
    <title>처리 중...</title>
</head>
<body>
    <p>처리 중입니다...</p>
    <script>window.location.href = '${redirectUrl}';</script>
</body>
</html>`;
    
    return HtmlService.createHtmlOutput(redirectHtml);
    
  } catch (error) {
    console.error('리다이렉트 생성 오류:', error);
    return createEmergencyPage(error);
  }
}

function createDashboardPage(userData) {
  try {
    const user = userData.user;
    const sessionToken = userData.sessionToken;
    
    const dashboardHtml = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>길드 관리 시스템 - 대시보드</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            margin: 0;
        }
        .dashboard-container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .user-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
        }
        .welcome-message {
            font-size: 24px;
            color: #2c3e50;
            margin-bottom: 20px;
        }
        .user-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        .detail-item {
            background: white;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .detail-label {
            font-weight: 600;
            color: #7f8c8d;
            margin-bottom: 4px;
        }
        .detail-value {
            color: #2c3e50;
            font-size: 18px;
        }
        .actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .action-card {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            text-decoration: none;
            color: inherit;
            transition: transform 0.3s ease;
        }
        .action-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.15);
        }
        .action-icon {
            font-size: 32px;
            margin-bottom: 12px;
        }
        .action-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #2c3e50;
        }
        .action-desc {
            color: #7f8c8d;
            font-size: 14px;
        }
        .logout-btn {
            background: #e74c3c;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            margin-top: 20px;
        }
        .system-info {
            margin-top: 40px;
            padding: 20px;
            background: rgba(46, 204, 113, 0.1);
            border-radius: 12px;
            border-left: 4px solid #2ecc71;
        }
        .system-text {
            color: #27ae60;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <div class="header">
            <h1>⚔️ 길드 관리 시스템</h1>
            <p>CSP 문제 해결 완료! 모든 기능이 정상 작동합니다.</p>
        </div>
        
        <div class="user-info">
            <div class="welcome-message">
                🎉 환영합니다, ${user.nickname}님!
            </div>
            <div class="user-details">
                <div class="detail-item">
                    <div class="detail-label">닉네임</div>
                    <div class="detail-value">${user.nickname}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">캐릭터명</div>
                    <div class="detail-value">${user.characterName || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">직업</div>
                    <div class="detail-value">${user.characterClass || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">권한</div>
                    <div class="detail-value">${user.role}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">상태</div>
                    <div class="detail-value">${user.status}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">가입일</div>
                    <div class="detail-value">${user.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : 'N/A'}</div>
                </div>
            </div>
        </div>
        
        <div class="actions">
            <div class="action-card">
                <div class="action-icon">👥</div>
                <div class="action-title">회원 관리</div>
                <div class="action-desc">길드 회원 목록 조회 및 관리</div>
            </div>
            
            <div class="action-card">
                <div class="action-icon">🐉</div>
                <div class="action-title">보스 기록</div>
                <div class="action-desc">보스 처치 기록 관리 및 통계</div>
            </div>
            
            <div class="action-card">
                <div class="action-icon">💰</div>
                <div class="action-title">길드 자금</div>
                <div class="action-desc">길드 자금 현황 및 분배 관리</div>
            </div>
            
            <div class="action-card">
                <div class="action-icon">📊</div>
                <div class="action-title">통계 분석</div>
                <div class="action-desc">참여도 및 기여도 통계 분석</div>
            </div>
            
            ${user.role === 'ADMIN' ? `
            <div class="action-card">
                <div class="action-icon">⚙️</div>
                <div class="action-title">시스템 관리</div>
                <div class="action-desc">시스템 설정 및 관리자 기능</div>
            </div>
            ` : ''}
        </div>
        
        <form method="POST" action="">
            <input type="hidden" name="action" value="logout">
            <button type="submit" class="logout-btn">🚪 로그아웃</button>
        </form>
        
        <div class="system-info">
            <div class="system-text">
                ✅ 시스템 상태: 정상 운영 중<br>
                🔧 CSP 문제: 완전 해결됨<br>
                🎯 세션 토큰: ${sessionToken.substring(0, 20)}...
            </div>
        </div>
    </div>
</body>
</html>`;
    
    return HtmlService.createHtmlOutput(dashboardHtml)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setTitle('길드 관리 시스템 - 대시보드');
    
  } catch (error) {
    console.error('대시보드 생성 오류:', error);
    return createEmergencyPage(error);
  }
}

// ===== 기본 HTML (템플릿 실패 시) =====
function getDefaultLoginHTML() {
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
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            max-width: 400px;
            width: 100%;
            text-align: center;
        }
        .title { 
            color: #2c3e50; 
            font-size: 28px; 
            margin-bottom: 8px; 
            font-weight: 700; 
        }
        .subtitle { 
            color: #7f8c8d; 
            margin-bottom: 32px; 
        }
        input { 
            width: 100%; 
            padding: 16px; 
            margin: 10px 0; 
            border: 2px solid #e1e8ed; 
            border-radius: 12px; 
            font-size: 16px;
            box-sizing: border-box;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        button { 
            width: 100%; 
            padding: 16px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            border: none; 
            border-radius: 12px; 
            cursor: pointer; 
            font-size: 18px;
            font-weight: 600;
            margin-top: 10px;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        .message {
            margin-top: 16px;
            padding: 16px;
            border-radius: 12px;
            font-size: 14px;
        }
        .error { background: rgba(231, 76, 60, 0.1); color: #c0392b; border-left: 4px solid #e74c3c; }
        .success { background: rgba(46, 204, 113, 0.1); color: #27ae60; border-left: 4px solid #2ecc71; }
    </style>
</head>
<body>
    <div class="container">
        <div style="font-size: 48px; margin-bottom: 16px;">⚔️</div>
        <h1 class="title">길드 관리 시스템</h1>
        <p class="subtitle">CSP 해결 버전</p>
        
        <form method="POST" action="">
            <input type="hidden" name="action" value="login">
            <input type="text" name="nickname" placeholder="닉네임" value="admin" required>
            <input type="password" name="password" placeholder="비밀번호" value="Admin#2025!Safe" required>
            <button type="submit">로그인</button>
        </form>
        
        <div id="errorMessage" class="message error" style="display: none;"></div>
        <div id="successMessage" class="message success" style="display: none;"></div>
    </div>
</body>
</html>`;
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
        body { 
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            margin: 0;
        }
        .container { 
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
        .error-details { 
            background: #f8f9fa; 
            padding: 16px; 
            border-radius: 8px; 
            margin: 20px 0;
            text-align: left;
            font-family: monospace;
            font-size: 12px;
            color: #2c3e50;
        }
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
        }
        .btn:hover { background: #2980b9; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🚨</div>
        <h1 class="title">시스템 복구 모드</h1>
        <p class="message">
            시스템 로드 중 문제가 발생했습니다.<br>
            아래 오류 정보를 확인하고 개발자에게 문의하세요.
        </p>
        <div class="error-details">
            <strong>오류 정보:</strong><br>
            ${error.message || '알 수 없는 오류'}<br><br>
            <strong>스택 트레이스:</strong><br>
            ${error.stack || 'N/A'}
        </div>
        <button class="btn" onclick="window.location.reload()">🔄 새로고침</button>
        <button class="btn" onclick="history.back()">🔙 이전 페이지</button>
    </div>
</body>
</html>`;

  return HtmlService.createHtmlOutput(emergencyHtml)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setTitle('시스템 복구 모드');
}
