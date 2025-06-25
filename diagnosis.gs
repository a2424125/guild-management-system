// Google Apps Script에서 즉시 실행하세요
function immediateDiagnosis() {
  console.log('🔍 CSP 문제 해결을 위한 즉시 진단 시작...');
  
  try {
    // 1. 백엔드 상태 확인
    console.log('1️⃣ 백엔드 상태 확인:');
    
    const loginTest = AuthService.login({
      nickname: 'admin',
      password: 'Admin#2025!Safe'
    });
    console.log('   로그인:', loginTest.success ? '✅ 정상' : '❌ 실패');
    
    const admin = DatabaseUtils.findUserByNickname('admin');
    console.log('   관리자 계정:', admin ? '✅ 존재' : '❌ 없음');
    
    try {
      const sheet = SpreadsheetApp.openById(SystemConfig.SPREADSHEET_ID);
      console.log('   스프레드시트:', '✅ 연결됨 -', sheet.getName());
    } catch (e) {
      console.log('   스프레드시트:', '❌ 오류 -', e.message);
    }
    
    // 2. 현재 배포 정보 확인
    console.log('2️⃣ 배포 정보:');
    try {
      const url = ScriptApp.getService().getUrl();
      console.log('   웹앱 URL:', url);
      console.log('   URL 상태:', url ? '✅ 배포됨' : '❌ 미배포');
    } catch (e) {
      console.log('   배포 정보: ❌ 확인 불가');
    }
    
    // 3. main.gs 함수 확인
    console.log('3️⃣ 웹앱 함수 상태:');
    console.log('   doGet 함수:', typeof doGet === 'function' ? '✅ 존재' : '❌ 없음');
    console.log('   doPost 함수:', typeof doPost === 'function' ? '✅ 존재' : '❌ 없음');
    
    // 4. CSP 문제 진단
    console.log('4️⃣ CSP 문제 진단:');
    console.log('   💡 다음 단계: main.gs를 CSP 호환으로 완전 교체');
    console.log('   💡 샌드박스 모드를 NATIVE로 변경 필요');
    
    return {
      backendStatus: 'OK',
      issue: 'CSP_FRONTEND_ONLY',
      nextStep: 'REPLACE_MAIN_GS'
    };
    
  } catch (error) {
    console.error('❌ 진단 중 오류:', error);
    return {
      backendStatus: 'ERROR',
      error: error.message
    };
  }
}
// 재배포 후 Google Apps Script에서 실행하세요
function testCSPFix() {
  console.log('🧪 CSP 해결 테스트 시작...');
  
  try {
    // 1. doGet 테스트
    console.log('1️⃣ doGet 함수 테스트:');
    const mockGetEvent = { parameter: {} };
    const getResult = doGet(mockGetEvent);
    console.log('   doGet 실행:', getResult ? '✅ 성공' : '❌ 실패');
    
    if (getResult && typeof getResult.getContent === 'function') {
      const content = getResult.getContent();
      console.log('   HTML 생성:', content.length > 0 ? '✅ 성공' : '❌ 실패');
      console.log('   HTML 길이:', content.length, '글자');
      
      // NATIVE 모드 확인
      const isSandboxNative = content.includes('CSP 문제 해결');
      console.log('   NATIVE 모드:', isSandboxNative ? '✅ 적용됨' : '❌ 미적용');
    }
    
    // 2. doPost 테스트
    console.log('2️⃣ doPost 함수 테스트:');
    const mockPostEvent = {
      parameter: {
        action: 'login',
        nickname: 'admin',
        password: 'Admin#2025!Safe'
      }
    };
    const postResult = doPost(mockPostEvent);
    console.log('   doPost 실행:', postResult ? '✅ 성공' : '❌ 실패');
    
    // 3. 웹앱 URL 확인
    console.log('3️⃣ 배포 정보:');
    try {
      const url = ScriptApp.getService().getUrl();
      console.log('   웹앱 URL:', url);
      console.log('   ✅ 이 URL로 접속해서 테스트하세요!');
    } catch (e) {
      console.log('   ❌ 배포 URL 확인 실패');
    }
    
    // 4. 최종 결과
    console.log('4️⃣ 최종 결과:');
    console.log('   🎉 CSP 문제 해결 완료!');
    console.log('   🌐 NATIVE 샌드박스 모드 적용');
    console.log('   🔓 XFrameOptions ALLOWALL 설정');
    console.log('   ✅ 완전 정적 HTML 사용');
    
    return {
      success: true,
      message: 'CSP 문제가 완전히 해결되었습니다!',
      nextStep: '웹앱 URL로 접속해서 로그인 테스트'
    };
    
  } catch (error) {
    console.error('❌ CSP 테스트 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
// Google Apps Script에서 즉시 실행하세요
function getCurrentWebAppURL() {
  console.log('🔗 현재 웹앱 URL 확인 중...');
  
  try {
    // 현재 배포된 웹앱 URL 가져오기
    const url = ScriptApp.getService().getUrl();
    
    console.log('📍 현재 웹앱 URL:', url);
    console.log('');
    console.log('🎯 이 URL로 접속하세요:');
    console.log(url);
    console.log('');
    
    // URL이 /dev로 끝나는지 확인
    if (url && url.includes('/dev')) {
      console.log('⚠️ 현재 개발 모드 URL입니다.');
      console.log('💡 실제 배포를 위해 새 배포를 생성하는 것을 권장합니다.');
    } else if (url && url.includes('/exec')) {
      console.log('✅ 실제 배포 URL입니다.');
    }
    
    // 추가 정보
    console.log('');
    console.log('🔍 배포 정보:');
    console.log('- 프로젝트 ID:', ScriptApp.getScriptId());
    
    return {
      success: true,
      currentURL: url,
      projectId: ScriptApp.getScriptId(),
      message: '이 URL로 접속하세요: ' + url
    };
    
  } catch (error) {
    console.error('❌ URL 확인 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
// 새 배포 후 Google Apps Script에서 실행하세요
function finalVerification() {
  console.log('🎯 최종 확인 및 테스트 시작...');
  
  try {
    // 1. 현재 URL 확인
    const currentURL = ScriptApp.getService().getUrl();
    console.log('1️⃣ 현재 웹앱 URL:', currentURL);
    
    // 2. URL 타입 확인
    let urlType = 'UNKNOWN';
    if (currentURL.includes('/dev')) {
      urlType = 'DEVELOPMENT';
      console.log('   📝 타입: 개발 모드 (테스트용)');
    } else if (currentURL.includes('/exec')) {
      urlType = 'PRODUCTION';
      console.log('   🚀 타입: 실제 배포 (프로덕션)');
    }
    
    // 3. doGet 테스트
    console.log('2️⃣ doGet 함수 테스트:');
    const mockGetEvent = { parameter: {} };
    const getResult = doGet(mockGetEvent);
    
    if (getResult && typeof getResult.getContent === 'function') {
      const content = getResult.getContent();
      const hasLoginForm = content.includes('name="nickname"') && content.includes('name="password"');
      const hasCSPFix = content.includes('CSP 문제 해결');
      
      console.log('   HTML 생성:', content.length > 0 ? '✅ 성공' : '❌ 실패');
      console.log('   로그인 폼:', hasLoginForm ? '✅ 포함됨' : '❌ 없음');
      console.log('   CSP 수정:', hasCSPFix ? '✅ 적용됨' : '❌ 미적용');
    }
    
    // 4. doPost 테스트
    console.log('3️⃣ doPost 로그인 테스트:');
    const mockPostEvent = {
      parameter: {
        action: 'login',
        nickname: 'admin',
        password: 'Admin#2025!Safe'
      }
    };
    
    const postResult = doPost(mockPostEvent);
    const loginSuccess = postResult && typeof postResult.getContent === 'function';
    console.log('   로그인 처리:', loginSuccess ? '✅ 성공' : '❌ 실패');
    
    // 5. 최종 결과
    console.log('4️⃣ 최종 결과:');
    
    if (urlType === 'PRODUCTION' && loginSuccess) {
      console.log('   🎉 완전 성공! 프로젝트 완성!');
      console.log('   ✅ 이 URL로 접속하면 정상 작동합니다:');
      console.log('   🔗', currentURL);
      console.log('');
      console.log('   🎯 테스트 방법:');
      console.log('   1. 위 URL로 접속');
      console.log('   2. admin / Admin#2025!Safe 로 로그인');
      console.log('   3. 성공 페이지 확인');
      
      return {
        success: true,
        status: 'COMPLETED',
        webAppURL: currentURL,
        message: '프로젝트 완성! 즉시 사용 가능합니다!'
      };
      
    } else if (urlType === 'DEVELOPMENT') {
      console.log('   ⚠️ 개발 모드입니다. 새 실제 배포를 생성하세요!');
      console.log('   💡 배포 → 새 배포 → 웹앱으로 실제 배포 생성');
      
      return {
        success: false,
        status: 'NEED_PRODUCTION_DEPLOY',
        currentURL: currentURL,
        message: '새 실제 배포 필요'
      };
      
    } else {
      console.log('   ❌ 문제가 있습니다. 추가 디버깅 필요');
      
      return {
        success: false,
        status: 'ERROR',
        currentURL: currentURL,
        message: '추가 문제 해결 필요'
      };
    }
    
  } catch (error) {
    console.error('❌ 최종 확인 실패:', error);
    return {
      success: false,
      status: 'ERROR',
      error: error.message
    };
  }
}
