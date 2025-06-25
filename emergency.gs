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
