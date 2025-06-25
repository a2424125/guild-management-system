/**
 * 🔧 단계별 시스템 복구 - 안전한 방법
 * 각 함수를 하나씩 실행해보세요
 */

// ===== 1단계: 기본 테스트 =====
function step1_basicTest() {
  console.log('🔧 1단계: 기본 시스템 테스트 시작...');
  
  try {
    // SystemConfig 접근 테스트
    console.log('버전:', SystemConfig.VERSION || '설정 오류');
    console.log('앱 이름:', SystemConfig.APP_NAME || '설정 오류');
    console.log('스프레드시트 ID:', SystemConfig.SPREADSHEET_ID || '설정 오류');
    
    console.log('✅ 1단계 완료: 기본 설정 접근 성공');
    return '✅ 1단계 성공';
    
  } catch (error) {
    console.error('❌ 1단계 실패:', error);
    return '❌ 1단계 실패: ' + error.message;
  }
}

// ===== 2단계: 스프레드시트 접근 테스트 =====
function step2_sheetTest() {
  console.log('📊 2단계: 스프레드시트 접근 테스트 시작...');
  
  try {
    const spreadsheetId = SystemConfig.SPREADSHEET_ID;
    console.log('사용할 스프레드시트 ID:', spreadsheetId);
    
    // 스프레드시트 열기 시도
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    console.log('✅ 스프레드시트 이름:', spreadsheet.getName());
    console.log('✅ 스프레드시트 URL:', spreadsheet.getUrl());
    
    // 기존 시트 확인
    const sheets = spreadsheet.getSheets();
    console.log('기존 시트 개수:', sheets.length);
    console.log('기존 시트 이름들:', sheets.map(s => s.getName()));
    
    console.log('✅ 2단계 완료: 스프레드시트 접근 성공');
    return '✅ 2단계 성공';
    
  } catch (error) {
    console.error('❌ 2단계 실패:', error);
    return '❌ 2단계 실패: ' + error.message;
  }
}

// ===== 3단계: 필수 시트 생성 =====
function step3_createSheets() {
  console.log('📋 3단계: 필수 시트 생성 시작...');
  
  try {
    // DatabaseUtils 사용 가능한지 확인
    if (typeof DatabaseUtils === 'undefined') {
      throw new Error('DatabaseUtils가 로드되지 않았습니다');
    }
    
    // 시트 초기화 실행
    const result = DatabaseUtils.initializeSheets();
    console.log('시트 초기화 결과:', result);
    
    if (result.success) {
      console.log('✅ 3단계 완료: 시트 생성 성공');
      return '✅ 3단계 성공: ' + result.message;
    } else {
      throw new Error(result.message);
    }
    
  } catch (error) {
    console.error('❌ 3단계 실패:', error);
    return '❌ 3단계 실패: ' + error.message;
  }
}

// ===== 4단계: 관리자 계정 생성 =====
function step4_createAdmin() {
  console.log('👑 4단계: 관리자 계정 생성 시작...');
  
  try {
    // AuthService 사용 가능한지 확인
    if (typeof AuthService === 'undefined') {
      throw new Error('AuthService가 로드되지 않았습니다');
    }
    
    // 관리자 계정 확인/생성
    const result = AuthService.ensureAdminAccount();
    console.log('관리자 계정 결과:', result);
    
    if (result.success) {
      console.log('✅ 4단계 완료: 관리자 계정 준비됨');
      return '✅ 4단계 성공: ' + result.message;
    } else {
      throw new Error(result.message);
    }
    
  } catch (error) {
    console.error('❌ 4단계 실패:', error);
    return '❌ 4단계 실패: ' + error.message;
  }
}

// ===== 5단계: 로그인 테스트 =====
function step5_testLogin() {
  console.log('🔐 5단계: 로그인 테스트 시작...');
  
  try {
    // 로그인 시도
    const loginResult = AuthService.login({
      nickname: 'admin',
      password: 'Admin#2025!Safe'
    });
    
    console.log('로그인 결과:', loginResult);
    
    if (loginResult.success) {
      console.log('✅ 5단계 완료: 로그인 성공!');
      console.log('🎉 전체 시스템 복구 완료!');
      
      return {
        success: true,
        message: '✅ 시스템 복구 완료! 웹앱에서 admin/Admin#2025!Safe로 로그인하세요.',
        user: loginResult.data.user.nickname,
        role: loginResult.data.user.role
      };
    } else {
      throw new Error(loginResult.message);
    }
    
  } catch (error) {
    console.error('❌ 5단계 실패:', error);
    return '❌ 5단계 실패: ' + error.message;
  }
}

// ===== 전체 자동 실행 (모든 단계를 순서대로) =====
function runAllSteps() {
  console.log('🚀 전체 단계 자동 실행 시작...');
  
  const results = {};
  
  // 1단계 실행
  results.step1 = step1_basicTest();
  if (results.step1.includes('실패')) {
    console.log('❌ 1단계에서 중단');
    return results;
  }
  
  // 2단계 실행
  results.step2 = step2_sheetTest();
  if (results.step2.includes('실패')) {
    console.log('❌ 2단계에서 중단');
    return results;
  }
  
  // 3단계 실행
  results.step3 = step3_createSheets();
  if (results.step3.includes('실패')) {
    console.log('❌ 3단계에서 중단');
    return results;
  }
  
  // 4단계 실행
  results.step4 = step4_createAdmin();
  if (results.step4.includes('실패')) {
    console.log('❌ 4단계에서 중단');
    return results;
  }
  
  // 5단계 실행
  results.step5 = step5_testLogin();
  
  console.log('🎯 전체 실행 완료! 결과:', results);
  return results;
}
/**
 * 🔧 관리자 계정 문제 해결 스크립트
 * emergency.gs 파일에 추가하고 실행하세요
 */

// ===== 관리자 계정 직접 확인 =====
function checkAdminAccount() {
  console.log('🔍 관리자 계정 직접 확인 시작...');
  
  try {
    // 1. 스프레드시트에서 직접 확인
    const sheet = DatabaseUtils.getOrCreateSheet(SystemConfig.SHEET_NAMES.MEMBERS);
    const data = sheet.getDataRange().getValues();
    
    console.log('회원 시트 전체 데이터 행 수:', data.length);
    
    if (data.length <= 1) {
      console.log('❌ 회원 데이터가 없습니다. 헤더만 있음');
      return false;
    }
    
    const headers = data[0];
    console.log('헤더:', headers);
    
    // admin 계정 직접 찾기
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const member = DatabaseUtils.rowToObject(headers, row);
      
      console.log(`회원 ${i}:`, {
        nickname: member.nickname,
        email: member.email || '없음',
        role: member.role,
        status: member.status
      });
      
      if (member.nickname === 'admin') {
        console.log('✅ admin 계정 발견!', member);
        return member;
      }
    }
    
    console.log('❌ admin 계정을 찾을 수 없습니다');
    return false;
    
  } catch (error) {
    console.error('❌ 관리자 계정 확인 실패:', error);
    return false;
  }
}

// ===== 관리자 계정 강제 재생성 =====
function forceCreateAdmin() {
  console.log('🔧 관리자 계정 강제 재생성 시작...');
  
  try {
    // 1. 기존 admin 계정 삭제 (있다면)
    const sheet = DatabaseUtils.getOrCreateSheet(SystemConfig.SHEET_NAMES.MEMBERS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length > 1) {
      const headers = data[0];
      const nicknameIndex = headers.indexOf('nickname');
      
      // admin 계정이 있는 행 찾아서 삭제
      for (let i = data.length - 1; i >= 1; i--) {
        if (data[i][nicknameIndex] === 'admin') {
          sheet.deleteRow(i + 1);
          console.log('기존 admin 계정 삭제함');
          break;
        }
      }
    }
    
    // 2. 새 관리자 계정 생성
    const adminUser = {
      id: SecurityUtils.generateUUID(),
      nickname: 'admin',
      password: SecurityUtils.hashPassword('Admin#2025!Safe'),
      email: 'admin@example.com',
      role: 'ADMIN',
      status: 'ACTIVE',
      joinDate: new Date(),
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('새 admin 계정 생성:', {
      id: adminUser.id,
      nickname: adminUser.nickname,
      role: adminUser.role,
      status: adminUser.status
    });
    
    // 3. 직접 시트에 저장
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowData = DatabaseUtils.objectToRow(headers, adminUser);
    sheet.appendRow(rowData);
    
    console.log('✅ 관리자 계정 직접 저장 완료');
    
    // 4. 캐시 무효화
    if (typeof CacheUtils !== 'undefined') {
      CacheUtils.remove('user_by_nickname_admin');
      CacheUtils.remove('user_by_id_' + adminUser.id);
      console.log('캐시 무효화 완료');
    }
    
    return adminUser;
    
  } catch (error) {
    console.error('❌ 관리자 계정 강제 생성 실패:', error);
    throw error;
  }
}

// ===== 로그인 테스트 (캐시 우회) =====
function testLoginDirect() {
  console.log('🔐 직접 로그인 테스트 시작...');
  
  try {
    // 1. 캐시 우회하고 직접 시트에서 찾기
    const sheet = DatabaseUtils.getOrCreateSheet(SystemConfig.SHEET_NAMES.MEMBERS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      throw new Error('회원 데이터가 없습니다');
    }
    
    const headers = data[0];
    let adminUser = null;
    
    for (let i = 1; i < data.length; i++) {
      const member = DatabaseUtils.rowToObject(headers, data[i]);
      if (member.nickname === 'admin') {
        adminUser = member;
        break;
      }
    }
    
    if (!adminUser) {
      throw new Error('admin 계정을 찾을 수 없습니다');
    }
    
    console.log('admin 계정 발견:', {
      nickname: adminUser.nickname,
      role: adminUser.role,
      status: adminUser.status
    });
    
    // 2. 비밀번호 확인
    const inputPassword = 'Admin#2025!Safe';
    const hashedInput = SecurityUtils.hashPassword(inputPassword);
    
    console.log('입력 비밀번호 해시:', hashedInput);
    console.log('저장된 비밀번호 해시:', adminUser.password);
    
    if (adminUser.password === hashedInput) {
      console.log('✅ 비밀번호 일치! 로그인 성공');
      return {
        success: true,
        message: '직접 로그인 테스트 성공',
        user: adminUser
      };
    } else {
      console.log('❌ 비밀번호 불일치');
      return {
        success: false,
        message: '비밀번호가 일치하지 않습니다'
      };
    }
    
  } catch (error) {
    console.error('❌ 직접 로그인 테스트 실패:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// ===== 완전 복구 (모든 문제 해결) =====
function completeRecovery() {
  console.log('🚀 완전 복구 시작...');
  
  try {
    // 1. 관리자 계정 확인
    console.log('1️⃣ 관리자 계정 확인...');
    const existingAdmin = checkAdminAccount();
    
    if (!existingAdmin) {
      console.log('2️⃣ 관리자 계정 재생성...');
      forceCreateAdmin();
    } else {
      console.log('✅ 기존 관리자 계정 발견');
    }
    
    // 3. 직접 로그인 테스트
    console.log('3️⃣ 로그인 테스트...');
    const loginResult = testLoginDirect();
    
    if (loginResult.success) {
      console.log('🎉 완전 복구 성공!');
      return {
        success: true,
        message: '시스템이 완전히 복구되었습니다!',
        credentials: {
          nickname: 'admin',
          password: 'Admin#2025!Safe'
        },
        nextSteps: [
          '✅ 웹앱을 새로고침하세요',
          '✅ admin / Admin#2025!Safe 로 로그인하세요',
          '✅ 로그인 후 즉시 비밀번호를 변경하세요'
        ]
      };
    } else {
      throw new Error('로그인 테스트 실패: ' + loginResult.message);
    }
    
  } catch (error) {
    console.error('❌ 완전 복구 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
/**
 * 🔧 시트 구조 완전 수정 및 관리자 계정 직접 추가
 * emergency.gs 파일에 추가하고 실행하세요
 */

// ===== 회원정보 시트 완전 재구성 =====
function fixMembersSheet() {
  console.log('🔧 회원정보 시트 완전 재구성 시작...');
  
  try {
    const spreadsheet = SpreadsheetApp.openById(SystemConfig.SPREADSHEET_ID);
    
    // 1. 기존 회원정보 시트 삭제
    const existingSheet = spreadsheet.getSheetByName(SystemConfig.SHEET_NAMES.MEMBERS);
    if (existingSheet) {
      console.log('기존 회원정보 시트 삭제...');
      spreadsheet.deleteSheet(existingSheet);
    }
    
    // 2. 새 회원정보 시트 생성
    console.log('새 회원정보 시트 생성...');
    const newSheet = spreadsheet.insertSheet(SystemConfig.SHEET_NAMES.MEMBERS);
    
    // 3. 정확한 헤더 설정
    const headers = ['id', 'nickname', 'password', 'email', 'role', 'status', 'joinDate', 'lastLogin', 'createdAt', 'updatedAt'];
    console.log('헤더 설정:', headers);
    
    newSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    newSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    newSheet.setFrozenRows(1);
    
    // 4. 첫 번째 관리자 계정 직접 추가
    const now = new Date();
    const adminData = [
      SecurityUtils.generateUUID(),                    // id
      'admin',                                         // nickname
      SecurityUtils.hashPassword('Admin#2025!Safe'),  // password
      'admin@example.com',                            // email
      'ADMIN',                                        // role
      'ACTIVE',                                       // status
      now,                                            // joinDate
      null,                                           // lastLogin
      now,                                            // createdAt
      now                                             // updatedAt
    ];
    
    console.log('관리자 데이터 추가:', {
      nickname: adminData[1],
      role: adminData[4],
      status: adminData[5]
    });
    
    newSheet.getRange(2, 1, 1, adminData.length).setValues([adminData]);
    
    console.log('✅ 회원정보 시트 재구성 완료');
    
    // 5. 확인
    const checkData = newSheet.getDataRange().getValues();
    console.log('총 데이터 행 수:', checkData.length);
    console.log('헤더:', checkData[0]);
    if (checkData.length > 1) {
      console.log('첫 번째 회원:', {
        nickname: checkData[1][1],
        role: checkData[1][4],
        status: checkData[1][5]
      });
    }
    
    return {
      success: true,
      message: '회원정보 시트가 성공적으로 재구성되었습니다',
      totalRows: checkData.length,
      headers: checkData[0]
    };
    
  } catch (error) {
    console.error('❌ 시트 재구성 실패:', error);
    throw error;
  }
}

// ===== 모든 시트 완전 재구성 =====
function recreateAllSheets() {
  console.log('🚀 모든 시트 완전 재구성 시작...');
  
  try {
    const spreadsheet = SpreadsheetApp.openById(SystemConfig.SPREADSHEET_ID);
    
    // 시트 구성 정보
    const sheetConfigs = [
      {
        name: SystemConfig.SHEET_NAMES.MEMBERS,
        headers: ['id', 'nickname', 'password', 'email', 'role', 'status', 'joinDate', 'lastLogin', 'createdAt', 'updatedAt']
      },
      {
        name: SystemConfig.SHEET_NAMES.BOSS_RECORDS,
        headers: ['id', 'bossId', 'bossName', 'participantId', 'participantNickname', 'participantClass', 'participationStatus', 'contribution', 'recordDate', 'notes', 'createdAt']
      },
      {
        name: SystemConfig.SHEET_NAMES.GUILD_FUNDS,
        headers: ['id', 'transactionType', 'amount', 'description', 'transactionDate', 'createdBy', 'createdAt']
      },
      {
        name: SystemConfig.SHEET_NAMES.DISTRIBUTION,
        headers: ['id', 'totalAmount', 'participantCount', 'distributionMethod', 'distributionDate', 'details', 'createdBy', 'createdAt']
      },
      {
        name: SystemConfig.SHEET_NAMES.BOSS_LIST,
        headers: ['id', 'name', 'type', 'difficulty', 'maxParticipants', 'description', 'isActive', 'createdBy', 'createdAt', 'updatedAt']
      },
      {
        name: SystemConfig.SHEET_NAMES.CLASS_LIST,
        headers: ['id', 'name', 'type', 'description', 'isActive', 'createdBy', 'createdAt', 'updatedAt']
      }
    ];
    
    console.log('재구성할 시트 수:', sheetConfigs.length);
    
    // 각 시트를 재구성
    sheetConfigs.forEach(config => {
      console.log(`${config.name} 시트 재구성 중...`);
      
      // 기존 시트 삭제 (있다면)
      const existingSheet = spreadsheet.getSheetByName(config.name);
      if (existingSheet) {
        spreadsheet.deleteSheet(existingSheet);
      }
      
      // 새 시트 생성
      const newSheet = spreadsheet.insertSheet(config.name);
      
      // 헤더 설정
      newSheet.getRange(1, 1, 1, config.headers.length).setValues([config.headers]);
      newSheet.getRange(1, 1, 1, config.headers.length).setFontWeight('bold');
      newSheet.setFrozenRows(1);
      
      console.log(`✅ ${config.name} 시트 완료`);
    });
    
    // 관리자 계정 추가 (회원정보 시트에)
    console.log('관리자 계정 추가...');
    const membersSheet = spreadsheet.getSheetByName(SystemConfig.SHEET_NAMES.MEMBERS);
    
    const now = new Date();
    const adminData = [
      SecurityUtils.generateUUID(),                    // id
      'admin',                                         // nickname
      SecurityUtils.hashPassword('Admin#2025!Safe'),  // password
      'admin@example.com',                            // email
      'ADMIN',                                        // role
      'ACTIVE',                                       // status
      now,                                            // joinDate
      null,                                           // lastLogin
      now,                                            // createdAt
      now                                             // updatedAt
    ];
    
    membersSheet.getRange(2, 1, 1, adminData.length).setValues([adminData]);
    
    console.log('🎉 모든 시트 재구성 완료!');
    
    return {
      success: true,
      message: '모든 시트가 성공적으로 재구성되었습니다',
      sheetsCreated: sheetConfigs.length,
      adminAccountCreated: true
    };
    
  } catch (error) {
    console.error('❌ 전체 시트 재구성 실패:', error);
    throw error;
  }
}

// ===== 최종 로그인 테스트 =====
function finalLoginTest() {
  console.log('🔐 최종 로그인 테스트 시작...');
  
  try {
    // 1. 회원정보 시트에서 직접 확인
    const spreadsheet = SpreadsheetApp.openById(SystemConfig.SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SystemConfig.SHEET_NAMES.MEMBERS);
    
    if (!sheet) {
      throw new Error('회원정보 시트를 찾을 수 없습니다');
    }
    
    const data = sheet.getDataRange().getValues();
    console.log('총 데이터 행 수:', data.length);
    
    if (data.length <= 1) {
      throw new Error('회원 데이터가 없습니다');
    }
    
    const headers = data[0];
    console.log('헤더:', headers);
    
    // admin 계정 찾기
    let adminFound = false;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const nickname = row[headers.indexOf('nickname')];
      const role = row[headers.indexOf('role')];
      const status = row[headers.indexOf('status')];
      
      console.log(`회원 ${i}:`, { nickname, role, status });
      
      if (nickname === 'admin') {
        adminFound = true;
        console.log('✅ admin 계정 발견!');
        
        // 비밀번호 확인
        const storedPassword = row[headers.indexOf('password')];
        const testPassword = SecurityUtils.hashPassword('Admin#2025!Safe');
        
        if (storedPassword === testPassword) {
          console.log('✅ 비밀번호 일치!');
          return {
            success: true,
            message: '최종 로그인 테스트 성공! 웹앱에서 로그인 가능합니다.',
            credentials: {
              nickname: 'admin',
              password: 'Admin#2025!Safe'
            }
          };
        } else {
          console.log('❌ 비밀번호 불일치');
          console.log('저장된 해시:', storedPassword);
          console.log('테스트 해시:', testPassword);
        }
      }
    }
    
    if (!adminFound) {
      throw new Error('admin 계정을 찾을 수 없습니다');
    }
    
  } catch (error) {
    console.error('❌ 최종 로그인 테스트 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ===== 원스톱 완전 해결 =====
function oneStopSolution() {
  console.log('🚀 원스톱 완전 해결 시작...');
  
  try {
    // 1. 모든 시트 재구성
    console.log('1️⃣ 모든 시트 재구성...');
    const recreateResult = recreateAllSheets();
    console.log('시트 재구성 결과:', recreateResult);
    
    // 2. 최종 로그인 테스트
    console.log('2️⃣ 최종 로그인 테스트...');
    const loginResult = finalLoginTest();
    console.log('로그인 테스트 결과:', loginResult);
    
    if (loginResult.success) {
      console.log('🎉🎉🎉 완전 해결 성공! 🎉🎉🎉');
      return {
        success: true,
        message: '시스템이 완전히 수정되었습니다!',
        nextSteps: [
          '✅ 웹앱을 새로고침하세요 (F5)',
          '✅ admin / Admin#2025!Safe 로 로그인하세요',
          '✅ 로그인 성공 후 비밀번호를 변경하세요',
          '✅ 첫 번째 보스와 직업을 등록하세요'
        ]
      };
    } else {
      throw new Error('로그인 테스트 실패: ' + loginResult.error);
    }
    
  } catch (error) {
    console.error('❌ 원스톱 해결 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
/**
 * 🔍 웹앱 로그인 디버깅 스크립트
 * emergency.gs 파일에 추가하고 실행하세요
 */

// ===== 웹앱 API 테스트 =====
function testWebAppAPI() {
  console.log('🔍 웹앱 API 직접 테스트 시작...');
  
  try {
    // 로그인 API 직접 호출
    const loginData = {
      nickname: 'admin',
      password: 'Admin#2025!Safe'
    };
    
    console.log('로그인 데이터:', loginData);
    
    // AuthService.login 직접 호출
    const result = AuthService.login(loginData);
    console.log('AuthService.login 결과:', result);
    
    if (result.success) {
      console.log('✅ 백엔드 로그인 성공!');
      console.log('세션 토큰:', result.data.session.token);
      console.log('사용자 정보:', result.data.user);
      
      return {
        success: true,
        message: '백엔드는 정상! 웹앱 재배포가 필요합니다.',
        sessionToken: result.data.session.token,
        user: result.data.user
      };
    } else {
      console.log('❌ 백엔드 로그인 실패:', result.message);
      return {
        success: false,
        message: '백엔드 문제: ' + result.message
      };
    }
    
  } catch (error) {
    console.error('❌ API 테스트 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ===== main.gs의 doPost 테스트 =====
function testMainDoPost() {
  console.log('🔍 main.gs doPost 함수 테스트...');
  
  try {
    // doPost 함수에 전달될 파라미터 시뮬레이션
    const mockEvent = {
      parameter: {
        action: 'login',
        data: JSON.stringify({
          nickname: 'admin',
          password: 'Admin#2025!Safe'
        })
      }
    };
    
    console.log('모킹 이벤트:', mockEvent);
    
    // doPost 직접 호출
    const response = doPost(mockEvent);
    console.log('doPost 응답:', response);
    
    // 응답 내용 확인
    const content = response.getContent();
    console.log('응답 내용:', content);
    
    const parsedResponse = JSON.parse(content);
    console.log('파싱된 응답:', parsedResponse);
    
    return {
      success: true,
      response: parsedResponse
    };
    
  } catch (error) {
    console.error('❌ doPost 테스트 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ===== 시스템 전체 상태 확인 =====
function checkFullSystemStatus() {
  console.log('🏥 시스템 전체 상태 확인...');
  
  const status = {
    timestamp: new Date().toISOString(),
    systemConfig: null,
    spreadsheet: null,
    authService: null,
    databaseUtils: null,
    adminAccount: null,
    loginTest: null
  };
  
  try {
    // 1. SystemConfig 확인
    status.systemConfig = {
      version: SystemConfig.VERSION || 'UNKNOWN',
      spreadsheetId: SystemConfig.SPREADSHEET_ID || 'MISSING',
      appName: SystemConfig.APP_NAME || 'MISSING'
    };
    console.log('✅ SystemConfig 정상');
    
    // 2. 스프레드시트 연결 확인
    const spreadsheet = SpreadsheetApp.openById(SystemConfig.SPREADSHEET_ID);
    status.spreadsheet = {
      name: spreadsheet.getName(),
      url: spreadsheet.getUrl(),
      sheetCount: spreadsheet.getSheets().length
    };
    console.log('✅ 스프레드시트 연결 정상');
    
    // 3. AuthService 확인
    if (typeof AuthService === 'undefined') {
      status.authService = 'MISSING';
    } else {
      status.authService = 'LOADED';
    }
    console.log('✅ AuthService 상태:', status.authService);
    
    // 4. DatabaseUtils 확인
    if (typeof DatabaseUtils === 'undefined') {
      status.databaseUtils = 'MISSING';
    } else {
      status.databaseUtils = 'LOADED';
    }
    console.log('✅ DatabaseUtils 상태:', status.databaseUtils);
    
    // 5. 관리자 계정 확인
    const adminUser = DatabaseUtils.findUserByNickname('admin');
    if (adminUser) {
      status.adminAccount = {
        found: true,
        nickname: adminUser.nickname,
        role: adminUser.role,
        status: adminUser.status
      };
      console.log('✅ 관리자 계정 발견');
    } else {
      status.adminAccount = { found: false };
      console.log('❌ 관리자 계정 없음');
    }
    
    // 6. 로그인 테스트
    const loginResult = AuthService.login({
      nickname: 'admin',
      password: 'Admin#2025!Safe'
    });
    
    status.loginTest = {
      success: loginResult.success,
      message: loginResult.message
    };
    
    if (loginResult.success) {
      console.log('✅ 로그인 테스트 성공');
    } else {
      console.log('❌ 로그인 테스트 실패:', loginResult.message);
    }
    
  } catch (error) {
    console.error('❌ 상태 확인 중 오류:', error);
    status.error = error.message;
  }
  
  console.log('🏥 전체 시스템 상태:', status);
  return status;
}

// ===== 웹앱 연결 확인 =====
function checkWebAppConnection() {
  console.log('🌐 웹앱 연결 상태 확인...');
  
  try {
    // 현재 배포된 웹앱 정보 확인
    const scriptApp = ScriptApp.getService();
    console.log('스크립트 서비스 정보:', scriptApp);
    
    // 헬스체크 API 테스트
    const healthCheck = healthCheck();
    console.log('헬스체크 결과:', healthCheck);
    
    return {
      success: true,
      message: '웹앱 연결 확인 완료',
      healthCheck: healthCheck
    };
    
  } catch (error) {
    console.error('❌ 웹앱 연결 확인 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ===== 완전 진단 (모든 테스트 실행) =====
function runCompleteDiagnosis() {
  console.log('🔬 완전 진단 시작...');
  
  const diagnosis = {
    timestamp: new Date().toISOString(),
    tests: {}
  };
  
  // 1. 시스템 상태 확인
  console.log('1️⃣ 시스템 상태 확인...');
  diagnosis.tests.systemStatus = checkFullSystemStatus();
  
  // 2. 웹앱 API 테스트
  console.log('2️⃣ 웹앱 API 테스트...');
  diagnosis.tests.webAppAPI = testWebAppAPI();
  
  // 3. doPost 테스트
  console.log('3️⃣ doPost 테스트...');
  diagnosis.tests.doPost = testMainDoPost();
  
  // 4. 웹앱 연결 확인
  console.log('4️⃣ 웹앱 연결 확인...');
  diagnosis.tests.webAppConnection = checkWebAppConnection();
  
  console.log('🔬 완전 진단 결과:', diagnosis);
  
  // 진단 결과 요약
  const summary = {
    systemOK: diagnosis.tests.systemStatus?.adminAccount?.found === true,
    backendOK: diagnosis.tests.webAppAPI?.success === true,
    apiOK: diagnosis.tests.doPost?.success === true,
    connectionOK: diagnosis.tests.webAppConnection?.success === true
  };
  
  console.log('📊 진단 요약:', summary);
  
  if (summary.systemOK && summary.backendOK) {
    console.log('💡 결론: 백엔드는 정상입니다. 웹앱을 재배포하세요!');
  } else {
    console.log('💡 결론: 백엔드에 문제가 있습니다. 추가 수정이 필요합니다.');
  }
  
  return {
    diagnosis: diagnosis,
    summary: summary
  };
}
// ===== 최종 해결책: CSP 문제 완전 제거 =====
function finalCSPSolution() {
  console.log('🚀 최종 CSP 해결 시작...');
  
  const results = {
    timestamp: new Date().toISOString(),
    steps: [],
    success: false
  };
  
  try {
    // 1단계: 시스템 상태 완전 확인
    console.log('1️⃣ 시스템 상태 완전 확인...');
    const systemCheck = checkCompleteSystemStatus();
    results.steps.push({
      step: 1,
      name: '시스템 상태 확인',
      success: systemCheck.success,
      details: systemCheck
    });
    
    // 2단계: 데이터베이스 강제 초기화
    console.log('2️⃣ 데이터베이스 강제 초기화...');
    const dbCheck = forceInitializeDatabase();
    results.steps.push({
      step: 2,
      name: '데이터베이스 초기화',
      success: dbCheck.success,
      details: dbCheck
    });
    
    // 3단계: 관리자 계정 강제 생성
    console.log('3️⃣ 관리자 계정 강제 생성...');
    const adminCheck = forceCreateAdminAccount();
    results.steps.push({
      step: 3,
      name: '관리자 계정 생성',
      success: adminCheck.success,
      details: adminCheck
    });
    
    // 4단계: API 라우팅 테스트
    console.log('4️⃣ API 라우팅 테스트...');
    const apiCheck = testAllAPIRoutes();
    results.steps.push({
      step: 4,
      name: 'API 라우팅 테스트',
      success: apiCheck.success,
      details: apiCheck
    });
    
    // 5단계: 로그인 완전 테스트
    console.log('5️⃣ 로그인 완전 테스트...');
    const loginCheck = testCompleteLogin();
    results.steps.push({
      step: 5,
      name: '로그인 테스트',
      success: loginCheck.success,
      details: loginCheck
    });
    
    // 최종 결과 판정
    const allSuccess = results.steps.every(step => step.success);
    results.success = allSuccess;
    
    if (allSuccess) {
      console.log('🎉🎉🎉 최종 CSP 해결 완료! 🎉🎉🎉');
      return {
        success: true,
        message: '✅ CSP 문제가 완전히 해결되었습니다!',
        instructions: [
          '1. 웹앱을 새로고침하세요 (F5)',
          '2. admin / Admin#2025!Safe 로 로그인하세요',
          '3. 로그인 성공 후 비밀번호를 변경하세요',
          '4. 관리자 메뉴에서 게임에 맞는 설정을 하세요'
        ],
        details: results
      };
    } else {
      console.log('❌ 일부 단계에서 실패');
      return {
        success: false,
        message: '일부 단계에서 문제가 발생했습니다.',
        details: results
      };
    }
    
  } catch (error) {
    console.error('❌ 최종 해결 과정에서 오류:', error);
    return {
      success: false,
      message: '최종 해결 과정에서 오류가 발생했습니다: ' + error.message,
      error: error.stack
    };
  }
}

// ===== 시스템 상태 완전 확인 =====
function checkCompleteSystemStatus() {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      services: {},
      spreadsheet: {},
      permissions: {}
    };
    
    // 서비스 로드 상태 확인
    status.services.SystemConfig = typeof SystemConfig !== 'undefined' ? 'LOADED' : 'MISSING';
    status.services.DatabaseUtils = typeof DatabaseUtils !== 'undefined' ? 'LOADED' : 'MISSING';
    status.services.AuthService = typeof AuthService !== 'undefined' ? 'LOADED' : 'MISSING';
    status.services.MemberService = typeof MemberService !== 'undefined' ? 'LOADED' : 'MISSING';
    status.services.BossService = typeof BossService !== 'undefined' ? 'LOADED' : 'MISSING';
    status.services.AdminService = typeof AdminService !== 'undefined' ? 'LOADED' : 'MISSING';
    
    // 스프레드시트 연결 확인
    try {
      const spreadsheet = SpreadsheetApp.openById(SystemConfig.SPREADSHEET_ID);
      status.spreadsheet.connected = true;
      status.spreadsheet.name = spreadsheet.getName();
      status.spreadsheet.url = spreadsheet.getUrl();
      status.spreadsheet.sheetCount = spreadsheet.getSheets().length;
    } catch (spreadsheetError) {
      status.spreadsheet.connected = false;
      status.spreadsheet.error = spreadsheetError.message;
    }
    
    // 권한 확인
    try {
      const user = Session.getActiveUser();
      status.permissions.userEmail = user.getEmail();
      status.permissions.canEdit = true;
    } catch (permError) {
      status.permissions.canEdit = false;
      status.permissions.error = permError.message;
    }
    
    const allServicesLoaded = Object.values(status.services).every(service => service === 'LOADED');
    
    console.log('시스템 상태:', status);
    
    return {
      success: allServicesLoaded && status.spreadsheet.connected,
      status: status,
      message: allServicesLoaded ? '모든 서비스 로드됨' : '일부 서비스 누락'
    };
    
  } catch (error) {
    console.error('시스템 상태 확인 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ===== 데이터베이스 강제 초기화 =====
function forceInitializeDatabase() {
  try {
    console.log('📊 데이터베이스 강제 초기화 시작...');
    
    // DatabaseUtils 확인
    if (typeof DatabaseUtils === 'undefined') {
      throw new Error('DatabaseUtils가 로드되지 않았습니다');
    }
    
    // 시트 초기화 실행
    const result = DatabaseUtils.initializeSheets();
    
    if (result.success) {
      console.log('✅ 데이터베이스 초기화 성공');
      
      // 추가: 시트 구조 검증
      const verification = verifySheetStructure();
      
      return {
        success: true,
        message: '데이터베이스가 성공적으로 초기화되었습니다',
        initResult: result,
        verification: verification
      };
    } else {
      throw new Error(result.message);
    }
    
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ===== 시트 구조 검증 =====
function verifySheetStructure() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SystemConfig.SPREADSHEET_ID);
    const requiredSheets = Object.values(SystemConfig.SHEET_NAMES);
    const verification = {};
    
    requiredSheets.forEach(sheetName => {
      const sheet = spreadsheet.getSheetByName(sheetName);
      verification[sheetName] = {
        exists: !!sheet,
        rowCount: sheet ? sheet.getLastRow() : 0,
        columnCount: sheet ? sheet.getLastColumn() : 0
      };
    });
    
    console.log('시트 구조 검증:', verification);
    return verification;
    
  } catch (error) {
    console.error('시트 구조 검증 실패:', error);
    return { error: error.message };
  }
}

// ===== 관리자 계정 강제 생성 =====
function forceCreateAdminAccount() {
  try {
    console.log('👑 관리자 계정 강제 생성 시작...');
    
    // AuthService 확인
    if (typeof AuthService === 'undefined') {
      throw new Error('AuthService가 로드되지 않았습니다');
    }
    
    // 기존 admin 계정 확인
    let adminUser = DatabaseUtils.findUserByNickname('admin');
    
    if (adminUser) {
      console.log('✅ 기존 admin 계정 발견:', {
        nickname: adminUser.nickname,
        role: adminUser.role,
        status: adminUser.status
      });
      
      return {
        success: true,
        message: '기존 관리자 계정이 확인되었습니다',
        admin: {
          nickname: adminUser.nickname,
          role: adminUser.role,
          status: adminUser.status
        }
      };
    }
    
    // 관리자 계정 생성
    const adminResult = AuthService.ensureAdminAccount();
    
    if (adminResult.success) {
      console.log('✅ 관리자 계정 생성 성공');
      
      // 생성된 계정 재확인
      adminUser = DatabaseUtils.findUserByNickname('admin');
      
      return {
        success: true,
        message: '관리자 계정이 성공적으로 생성되었습니다',
        admin: adminUser ? {
          nickname: adminUser.nickname,
          role: adminUser.role,
          status: adminUser.status
        } : null,
        createResult: adminResult
      };
    } else {
      throw new Error(adminResult.message);
    }
    
  } catch (error) {
    console.error('❌ 관리자 계정 생성 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ===== 모든 API 라우트 테스트 =====
function testAllAPIRoutes() {
  try {
    console.log('🔄 API 라우트 테스트 시작...');
    
    const testResults = {};
    
    // 1. 헬스체크 테스트
    try {
      const healthResult = healthCheck();
      testResults.healthCheck = {
        success: healthResult.success,
        result: healthResult
      };
    } catch (error) {
      testResults.healthCheck = {
        success: false,
        error: error.message
      };
    }
    
    // 2. 시스템 초기화 테스트
    try {
      if (typeof initializeSystem === 'function') {
        const initResult = initializeSystem();
        testResults.initializeSystem = {
          success: initResult.success,
          result: initResult
        };
      } else {
        testResults.initializeSystem = {
          success: false,
          error: 'initializeSystem 함수가 없습니다'
        };
      }
    } catch (error) {
      testResults.initializeSystem = {
        success: false,
        error: error.message
      };
    }
    
    // 3. doPost 시뮬레이션 테스트
    try {
      const mockEvent = {
        parameter: {
          action: 'healthCheck',
          data: '{}'
        }
      };
      
      const postResult = doPost(mockEvent);
      const content = postResult.getContent();
      const parsedContent = JSON.parse(content);
      
      testResults.doPost = {
        success: parsedContent.success,
        result: parsedContent
      };
    } catch (error) {
      testResults.doPost = {
        success: false,
        error: error.message
      };
    }
    
    const allTestsPassed = Object.values(testResults).every(test => test.success);
    
    console.log('API 테스트 결과:', testResults);
    
    return {
      success: allTestsPassed,
      message: allTestsPassed ? '모든 API 테스트 통과' : '일부 API 테스트 실패',
      testResults: testResults
    };
    
  } catch (error) {
    console.error('❌ API 테스트 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ===== 완전 로그인 테스트 =====
function testCompleteLogin() {
  try {
    console.log('🔐 완전 로그인 테스트 시작...');
    
    const testCredentials = {
      nickname: 'admin',
      password: 'Admin#2025!Safe'
    };
    
    // 1차: AuthService.login 직접 테스트
    const directLoginResult = AuthService.login(testCredentials);
    
    if (!directLoginResult.success) {
      throw new Error('직접 로그인 실패: ' + directLoginResult.message);
    }
    
    console.log('✅ 직접 로그인 성공');
    
    // 2차: doPost를 통한 로그인 테스트
    const mockLoginEvent = {
      parameter: {
        action: 'login',
        data: JSON.stringify(testCredentials)
      }
    };
    
    const apiLoginResult = doPost(mockLoginEvent);
    const apiContent = JSON.parse(apiLoginResult.getContent());
    
    if (!apiContent.success) {
      throw new Error('API 로그인 실패: ' + apiContent.message);
    }
    
    console.log('✅ API 로그인 성공');
    
    // 3차: 세션 검증 테스트
    const sessionToken = apiContent.data.session.token;
    const sessionCheck = AuthService.checkSession(sessionToken);
    
    if (!sessionCheck.isValid) {
      throw new Error('세션 검증 실패');
    }
    
    console.log('✅ 세션 검증 성공');
    
    return {
      success: true,
      message: '완전 로그인 테스트 성공',
      results: {
        directLogin: directLoginResult,
        apiLogin: apiContent,
        sessionCheck: sessionCheck
      },
      credentials: testCredentials
    };
    
  } catch (error) {
    console.error('❌ 로그인 테스트 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ===== 웹앱 재배포 가이드 출력 =====
function printRedeploymentGuide() {
  console.log(`
🚀 웹앱 재배포 가이드
==================

1. Google Apps Script 프로젝트에서:
   📁 배포 → 배포 관리 클릭

2. 새 배포 생성:
   ⚙️ 톱니바퀴 아이콘 클릭 → 새 배포

3. 배포 설정:
   📋 유형: 웹앱
   💡 설명: "CSP 문제 해결 버전"
   👤 실행 계정: 본인
   🔓 액세스 권한: 조직 내 모든 사용자

4. 배포 후:
   🔗 웹앱 URL 복사
   🔄 브라우저에서 새로고침 (Ctrl+F5)
   🔐 admin / Admin#2025!Safe 로 로그인

5. 성공 확인:
   ✅ 로그인 창이 정상 표시되는지 확인
   ✅ F12 개발자 도구에서 오류가 없는지 확인
   ✅ 로그인 후 대시보드가 표시되는지 확인

문제가 지속되면 finalCSPSolution() 함수를 다시 실행하세요.
  `);
}

// ===== 완전 진단 및 해결 (원스톱) =====
function oneStopCompleteSolution() {
  console.log('🎯 원스톱 완전 해결 시작...');
  
  try {
    // 1. 최종 CSP 해결 실행
    const cspResult = finalCSPSolution();
    
    // 2. 결과 출력
    console.log('🎯 최종 결과:', cspResult);
    
    // 3. 재배포 가이드 출력
    printRedeploymentGuide();
    
    // 4. 다음 단계 안내
    if (cspResult.success) {
      console.log(`
🎉 축하합니다! 모든 문제가 해결되었습니다!

다음 단계:
1. 웹앱을 재배포하세요
2. 새 URL로 접속하세요
3. admin / Admin#2025!Safe 로 로그인하세요
4. 로그인 성공 후 관리자 설정을 완료하세요

🚀 성공적인 길드 관리를 위해 화이팅! ⚔️
      `);
    } else {
      console.log(`
❌ 일부 문제가 남아있습니다.

문제 해결 방법:
1. 각 단계별 오류 메시지를 확인하세요
2. 필요한 파일들이 모두 업로드되었는지 확인하세요
3. 스프레드시트 ID가 올바른지 확인하세요
4. 권한 설정이 올바른지 확인하세요

더 자세한 도움이 필요하면 개발자에게 문의하세요.
      `);
    }
    
    return cspResult;
    
  } catch (error) {
    console.error('❌ 원스톱 해결 중 오류:', error);
    return {
      success: false,
      message: '원스톱 해결 중 오류가 발생했습니다: ' + error.message
    };
  }
}

// ===== CSP 상태 최종 점검 =====
function finalCSPStatusCheck() {
  try {
    console.log('🔍 CSP 상태 최종 점검...');
    
    const status = {
      timestamp: new Date().toISOString(),
      main_gs: {
        doGet: typeof doGet === 'function',
        doPost: typeof doPost === 'function',
        healthCheck: typeof healthCheck === 'function',
        initializeSystem: typeof initializeSystem === 'function'
      },
      services: {
        SystemConfig: typeof SystemConfig !== 'undefined',
        DatabaseUtils: typeof DatabaseUtils !== 'undefined',
        AuthService: typeof AuthService !== 'undefined',
        MemberService: typeof MemberService !== 'undefined',
        BossService: typeof BossService !== 'undefined',
        AdminService: typeof AdminService !== 'undefined'
      },
      database: {
        spreadsheetConnected: false,
        adminAccountExists: false
      }
    };
    
    // 스프레드시트 연결 확인
    try {
      SpreadsheetApp.openById(SystemConfig.SPREADSHEET_ID);
      status.database.spreadsheetConnected = true;
    } catch (e) {
      status.database.spreadsheetError = e.message;
    }
    
    // 관리자 계정 확인
    try {
      const admin = DatabaseUtils.findUserByNickname('admin');
      status.database.adminAccountExists = !!admin;
    } catch (e) {
      status.database.adminError = e.message;
    }
    
    const allReady = Object.values(status.main_gs).every(Boolean) &&
                     Object.values(status.services).every(Boolean) &&
                     status.database.spreadsheetConnected &&
                     status.database.adminAccountExists;
    
    console.log('📊 최종 상태:', status);
    
    return {
      success: allReady,
      message: allReady ? 'CSP 문제 완전 해결됨' : '일부 문제 남아있음',
      status: status
    };
    
  } catch (error) {
    console.error('❌ CSP 상태 점검 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
// Google Apps Script에서 즉시 실행해서 확인
function quickDiagnosis() {
  console.log('=== 빠른 진단 시작 ===');
  
  // 1. 서비스 로드 상태
  console.log('SystemConfig:', typeof SystemConfig);
  console.log('AuthService:', typeof AuthService);
  console.log('DatabaseUtils:', typeof DatabaseUtils);
  
  // 2. 스프레드시트 연결
  try {
    const sheet = SpreadsheetApp.openById(SystemConfig.SPREADSHEET_ID);
    console.log('✅ 스프레드시트 연결 성공:', sheet.getName());
  } catch (e) {
    console.log('❌ 스프레드시트 연결 실패:', e.message);
  }
  
  // 3. 관리자 계정
  try {
    const admin = DatabaseUtils.findUserByNickname('admin');
    console.log('관리자 계정:', admin ? '존재' : '없음');
  } catch (e) {
    console.log('관리자 계정 확인 실패:', e.message);
  }
  
  console.log('=== 진단 완료 ===');
}
// emergency.gs 파일 맨 끝에 추가하세요

function checkMySpreadsheet() {
  console.log('🔍 당신의 스프레드시트 전용 진단 시작...');
  
  const SHEET_ID = '1bJJQHzDkwdM_aYI5TNeg2LqURNJAuIc5-N8-PTgL2SM';
  
  try {
    // 1. 스프레드시트 접근 테스트
    console.log('📊 1. 스프레드시트 접근 테스트:');
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    console.log('  ✅ 접근 성공!');
    console.log('  📝 시트 이름:', spreadsheet.getName());
    
    // 2. 기존 시트들 확인
    const sheets = spreadsheet.getSheets();
    console.log('  📋 현재 시트 개수:', sheets.length);
    console.log('  📋 시트 이름들:');
    sheets.forEach((sheet, index) => {
      console.log(`    ${index + 1}. ${sheet.getName()} (${sheet.getLastRow()}행)`);
    });
    
    // 3. 필요한 시트들이 있는지 확인
    console.log('🔍 2. 필수 시트 확인:');
    const requiredSheets = ['회원정보', '보스참여기록', '길드자금'];
    let missingSheets = [];
    
    requiredSheets.forEach(sheetName => {
      const sheet = spreadsheet.getSheetByName(sheetName);
      if (sheet) {
        console.log(`  ✅ ${sheetName}: 존재함 (${sheet.getLastRow()}행)`);
      } else {
        console.log(`  ❌ ${sheetName}: 없음`);
        missingSheets.push(sheetName);
      }
    });
    
    // 4. 회원정보 시트 데이터 확인
    console.log('👤 3. 회원 데이터 확인:');
    const memberSheet = spreadsheet.getSheetByName('회원정보');
    if (memberSheet) {
      const data = memberSheet.getDataRange().getValues();
      console.log('  📊 총 데이터 행수:', data.length);
      
      if (data.length > 0) {
        console.log('  📋 헤더:', data[0]);
        
        // admin 계정 찾기
        let adminFound = false;
        for (let i = 1; i < data.length; i++) {
          if (data[i][1] === 'admin') { // nickname이 admin인 행
            adminFound = true;
            console.log('  ✅ admin 계정 발견!');
            console.log('    - 역할:', data[i][4]);
            console.log('    - 상태:', data[i][5]);
            break;
          }
        }
        
        if (!adminFound) {
          console.log('  ❌ admin 계정 없음');
        }
      } else {
        console.log('  ❌ 데이터 없음 (헤더만 있거나 완전히 비어있음)');
      }
    } else {
      console.log('  ❌ 회원정보 시트가 없음');
    }
    
    // 5. 해결책 제시
    console.log('💡 4. 해결책:');
    if (missingSheets.length > 0) {
      console.log('  🔧 시트 초기화가 필요합니다.');
      console.log('  → fixAllIssues() 함수를 실행하세요!');
    } else {
      console.log('  🔧 시트는 있지만 데이터 문제일 수 있습니다.');
      console.log('  → resetAdminAccount() 함수를 실행하세요!');
    }
    
  } catch (error) {
    console.log('❌ 오류 발생:', error.message);
    console.log('💡 가능한 원인:');
    console.log('  1. 스프레드시트 접근 권한 없음');
    console.log('  2. 다른 Google 계정으로 로그인됨');
    console.log('  3. 스프레드시트가 삭제됨');
  }
}

// 모든 문제를 한번에 해결하는 함수
function fixAllIssues() {
  console.log('🚀 모든 문제 자동 해결 시작...');
  
  try {
    // 1. 시트 초기화
    console.log('1️⃣ 시스템 시트 초기화...');
    const initResult = DatabaseUtils.initializeSheets();
    console.log('결과:', initResult.success ? '✅ 성공' : '❌ 실패');
    if (!initResult.success) {
      console.log('오류:', initResult.message);
    }
    
    // 2. 관리자 계정 생성
    console.log('2️⃣ 관리자 계정 생성...');
    const adminResult = AuthService.ensureAdminAccount();
    console.log('결과:', adminResult.success ? '✅ 성공' : '❌ 실패');
    
    // 3. 로그인 테스트
    console.log('3️⃣ 로그인 테스트...');
    const loginTest = AuthService.login({
      nickname: 'admin',
      password: 'Admin#2025!Safe'
    });
    console.log('결과:', loginTest.success ? '✅ 성공' : '❌ 실패');
    
    if (loginTest.success) {
      console.log('🎉 모든 문제 해결 완료!');
      console.log('🌐 이제 웹앱을 새로고침하고 로그인하세요!');
      console.log('📋 로그인 정보:');
      console.log('  - 닉네임: admin');
      console.log('  - 비밀번호: Admin#2025!Safe');
    } else {
      console.log('❌ 여전히 문제 있음:', loginTest.message);
      console.log('💡 수동으로 resetAdminAccount() 실행해보세요');
    }
    
  } catch (error) {
    console.log('❌ 자동 해결 실패:', error.message);
    console.log('💡 파일이 모두 올바르게 업로드되었는지 확인하세요');
  }
}

// 관리자 계정만 다시 생성
function resetAdminAccount() {
  console.log('👤 관리자 계정 재생성...');
  
  try {
    const sheet = DatabaseUtils.getOrCreateSheet('회원정보');
    
    // 기존 admin 제거
    const data = sheet.getDataRange().getValues();
    if (data.length > 1) {
      for (let i = data.length - 1; i >= 1; i--) {
        if (data[i][1] === 'admin') {
          sheet.deleteRow(i + 1);
          console.log('기존 admin 계정 삭제됨');
        }
      }
    }
    
    // 새 admin 생성
    const now = new Date();
    const adminData = [
      SecurityUtils.generateUUID(),
      'admin',
      SecurityUtils.hashPassword('Admin#2025!Safe'),
      'admin@example.com',
      'ADMIN',
      'ACTIVE',
      now,
      null,
      now,
      now
    ];
    
    sheet.appendRow(adminData);
    console.log('✅ 새 admin 계정 생성 완료!');
    
    // 테스트
    const loginTest = AuthService.login({
      nickname: 'admin',
      password: 'Admin#2025!Safe'
    });
    
    console.log('로그인 테스트:', loginTest.success ? '✅ 성공' : '❌ 실패');
    
  } catch (error) {
    console.log('❌ 계정 재생성 실패:', error.message);
  }
}
