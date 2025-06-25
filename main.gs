/**
 * 🧪 3단계: CSS 복잡성 테스트
 * 1단계 성공 코드에 CSS만 조금씩 추가해서 문제점 찾기
 */

function doGet(e) {
  console.log('🧪 3단계 CSS 테스트 시작');
  console.log('실행 시간:', new Date().toISOString());
  
  // 1단계 성공 코드를 베이스로 CSS만 조금 추가
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3단계 CSS 테스트</title>
  <style>
    /* 1단계와 동일한 기본 스타일 */
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
    
    /* 새로 추가되는 스타일들 - 하나씩 테스트 */
    .form-group {
      margin-bottom: 20px;
      text-align: left;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: white;
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
  </style>
</head>
<body>
  <div class="container">
    <div style="font-size: 48px; margin-bottom: 20px;">🎯</div>
    <h1>3단계: CSS 테스트</h1>
    <p><strong>CSS 복잡성이 문제인지 확인 중...</strong></p>
    
    <div style="background: rgba(255, 255, 255, 0.2); padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h3>📊 테스트 정보</h3>
      <p><strong>실행 시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
      <p><strong>단계:</strong> CSS 복잡성 테스트</p>
    </div>
    
    <!-- 매우 단순한 폼 추가 -->
    <div style="background: rgba(255, 255, 255, 0.2); padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>🧪 단순 폼 테스트</h3>
      <div class="form-group">
        <label for="test-input">테스트 입력:</label>
        <input type="text" id="test-input" value="테스트" readonly>
      </div>
      <p style="font-size: 14px; margin-top: 10px;">
        ⚠️ 이 폼이 보인다면 CSS는 문제없음
      </p>
    </div>
    
    <div style="background: rgba(255, 255, 255, 0.2); padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h3>✅ 확인 사항</h3>
      <ul style="text-align: left; display: inline-block;">
        <li>✅ 기본 CSS 스타일</li>
        <li>✅ 그라디언트 배경</li>
        <li>✅ 폼 관련 CSS</li>
        <li>✅ 복합 선택자</li>
      </ul>
    </div>
    
    <div style="margin-top: 30px; font-size: 14px; opacity: 0.8;">
      🎯 3단계 완료 | 다음: 폼 기능 테스트
    </div>
  </div>
</body>
</html>`;

  console.log('HTML 생성 완료, 길이:', html.length);
  
  return HtmlService.createHtmlOutput(html)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setTitle('3단계 테스트 - CSS 복잡성');
}

function doPost(e) {
  console.log('📨 3단계 doPost - 아직 사용 안함');
  return doGet(e);
}

// 수동 테스트
function test3Step() {
  console.log('🔧 3단계 수동 테스트');
  return doGet();
}
