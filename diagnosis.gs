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
