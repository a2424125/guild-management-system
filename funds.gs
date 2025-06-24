/**
 * 자금 관리 서비스
 * 길드 자금 관리, 분배, 거래 내역 등 자금 관련 기능
 * 의존성: SystemConfig, AuthService, DatabaseUtils, LogUtils
 */

const FundService = {
  
  // ===== 현재 자금 조회 =====
  getCurrentFunds: function(userSession) {
    try {
      // 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.FUND_READ)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      LogUtils.info('현재 자금 조회 요청', { 
        requesterId: userSession.userId 
      });
      
      const currentAmount = DatabaseUtils.calculateCurrentFunds();
      
      // 최근 거래 내역 조회
      const recentTransactions = this.getRecentTransactions(10);
      
      // 월간 통계
      const monthlyStats = this.getMonthlyStats();
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        data: {
          currentAmount: currentAmount,
          formattedAmount: NumberUtils.formatCurrency(currentAmount),
          recentTransactions: recentTransactions,
          monthlyStats: monthlyStats,
          lastUpdated: DateUtils.formatDisplay(DateUtils.now())
        }
      };
      
    } catch (error) {
      LogUtils.error('현재 자금 조회 오류', error);
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 거래 내역 조회 =====
  getTransactions: function(userSession, options = {}) {
    try {
      // 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.FUND_READ)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      const { 
        page = 1,
        pageSize = SystemConfig.BUSINESS_RULES.DEFAULT_PAGE_SIZE,
        transactionType = null,
        startDate = null,
        endDate = null,
        sortBy = 'transactionDate',
        sortOrder = 'DESC'
      } = options;
      
      LogUtils.info('거래 내역 조회 요청', { 
        requesterId: userSession.userId,
        options 
      });
      
      const sheet = DatabaseUtils.getOrCreateSheet(SystemConfig.SHEET_NAMES.GUILD_FUNDS);
      const data = sheet.getDataRange().getValues();
      
      if (data.length <= 1) {
        return {
          success: true,
          code: RESPONSE_CODES.SUCCESS,
          data: {
            transactions: [],
            totalCount: 0,
            currentPage: page,
            totalPages: 0
          }
        };
      }
      
      const headers = data[0];
      let transactions = [];
      
      // 데이터 변환 및 필터링
      for (let i = 1; i < data.length; i++) {
        const transaction = DatabaseUtils.rowToObject(headers, data[i]);
        
        // 타입 필터
        if (transactionType && transaction.transactionType !== transactionType) continue;
        
        // 날짜 필터
        if (startDate && new Date(transaction.transactionDate) < new Date(startDate)) continue;
        if (endDate && new Date(transaction.transactionDate) > new Date(endDate)) continue;
        
        // 표시용 데이터 추가
        transaction.formattedAmount = NumberUtils.formatCurrency(transaction.amount);
        transaction.formattedDate = DateUtils.formatDisplay(transaction.transactionDate);
        transaction.typeDisplay = this.getTransactionTypeDisplay(transaction.transactionType);
        
        transactions.push(transaction);
      }
      
      // 정렬
      transactions = this.sortTransactions(transactions, sortBy, sortOrder);
      
      // 페이징
      const totalCount = transactions.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedTransactions = transactions.slice(startIndex, endIndex);
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        data: {
          transactions: paginatedTransactions,
          totalCount,
          currentPage: page,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          summary: this.calculateTransactionSummary(transactions)
        }
      };
      
    } catch (error) {
      LogUtils.error('거래 내역 조회 오류', { options, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 수입 기록 =====
  addIncome: function(incomeData, userSession) {
    try {
      // 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.FUND_MANAGE)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      LogUtils.info('수입 기록 요청', { 
        amount: incomeData.amount,
        createdBy: userSession.userId 
      });
      
      // 입력값 검증
      const validation = this.validateTransactionData(incomeData, TRANSACTION_TYPES.INCOME);
      if (!validation.isValid) {
        return {
          success: false,
          code: RESPONSE_CODES.VALIDATION_ERROR,
          message: validation.errors.join(', ')
        };
      }
      
      // 거래 기록 생성
      const transaction = {
        id: SecurityUtils.generateUUID(),
        transactionType: TRANSACTION_TYPES.INCOME,
        amount: NumberUtils.toNumber(incomeData.amount),
        description: StringUtils.safeTrim(incomeData.description),
        transactionDate: incomeData.transactionDate || DateUtils.now(),
        createdBy: userSession.userId
      };
      
      // 데이터베이스에 저장
      const savedTransaction = DatabaseUtils.saveFundTransaction(transaction);
      
      // 캐시 무효화
      CacheUtils.remove(CACHE_KEYS.GUILD_FUNDS);
      
      LogUtils.info('수입 기록 완료', { 
        transactionId: savedTransaction.id,
        amount: savedTransaction.amount,
        createdBy: userSession.userId
      });
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        message: '수입이 성공적으로 기록되었습니다.',
        data: {
          transaction: savedTransaction,
          newBalance: DatabaseUtils.calculateCurrentFunds()
        }
      };
      
    } catch (error) {
      LogUtils.error('수입 기록 오류', { incomeData, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 지출 기록 =====
  addExpense: function(expenseData, userSession) {
    try {
      // 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.FUND_MANAGE)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      LogUtils.info('지출 기록 요청', { 
        amount: expenseData.amount,
        createdBy: userSession.userId 
      });
      
      // 입력값 검증
      const validation = this.validateTransactionData(expenseData, TRANSACTION_TYPES.EXPENSE);
      if (!validation.isValid) {
        return {
          success: false,
          code: RESPONSE_CODES.VALIDATION_ERROR,
          message: validation.errors.join(', ')
        };
      }
      
      // 잔액 확인
      const currentFunds = DatabaseUtils.calculateCurrentFunds();
      const expenseAmount = NumberUtils.toNumber(expenseData.amount);
      
      if (currentFunds < expenseAmount) {
        return {
          success: false,
          code: RESPONSE_CODES.VALIDATION_ERROR,
          message: `잔액이 부족합니다. (현재 잔액: ${NumberUtils.formatCurrency(currentFunds)})`
        };
      }
      
      // 거래 기록 생성
      const transaction = {
        id: SecurityUtils.generateUUID(),
        transactionType: TRANSACTION_TYPES.EXPENSE,
        amount: expenseAmount,
        description: StringUtils.safeTrim(expenseData.description),
        transactionDate: expenseData.transactionDate || DateUtils.now(),
        createdBy: userSession.userId
      };
      
      // 데이터베이스에 저장
      const savedTransaction = DatabaseUtils.saveFundTransaction(transaction);
      
      // 캐시 무효화
      CacheUtils.remove(CACHE_KEYS.GUILD_FUNDS);
      
      LogUtils.info('지출 기록 완료', { 
        transactionId: savedTransaction.id,
        amount: savedTransaction.amount,
        createdBy: userSession.userId
      });
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        message: '지출이 성공적으로 기록되었습니다.',
        data: {
          transaction: savedTransaction,
          newBalance: DatabaseUtils.calculateCurrentFunds()
        }
      };
      
    } catch (error) {
      LogUtils.error('지출 기록 오류', { expenseData, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 자금 분배 =====
  distributeFunds: function(distributionData, userSession) {
    try {
      // 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.FUND_DISTRIBUTE)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      LogUtils.info('자금 분배 요청', { 
        totalAmount: distributionData.totalAmount,
        method: distributionData.method,
        createdBy: userSession.userId 
      });
      
      // 입력값 검증
      const validation = this.validateDistributionData(distributionData);
      if (!validation.isValid) {
        return {
          success: false,
          code: RESPONSE_CODES.VALIDATION_ERROR,
          message: validation.errors.join(', ')
        };
      }
      
      // 잔액 확인
      const currentFunds = DatabaseUtils.calculateCurrentFunds();
      const totalAmount = NumberUtils.toNumber(distributionData.totalAmount);
      
      if (currentFunds < totalAmount) {
        return {
          success: false,
          code: RESPONSE_CODES.VALIDATION_ERROR,
          message: `분배할 금액이 현재 잔액을 초과합니다. (현재 잔액: ${NumberUtils.formatCurrency(currentFunds)})`
        };
      }
      
      // 분배 계산
      const distributionResult = this.calculateDistribution(distributionData);
      if (!distributionResult.success) {
        return distributionResult;
      }
      
      // 분배 기록 생성
      const distribution = {
        id: SecurityUtils.generateUUID(),
        totalAmount: totalAmount,
        participantCount: distributionResult.participants.length,
        distributionMethod: distributionData.method,
        distributionDate: distributionData.distributionDate || DateUtils.now(),
        details: JSON.stringify(distributionResult.participants),
        createdBy: userSession.userId
      };
      
      // 분배 내역 저장
      this.saveDistribution(distribution);
      
      // 지출로 기록
      const expenseTransaction = {
        id: SecurityUtils.generateUUID(),
        transactionType: TRANSACTION_TYPES.DISTRIBUTION,
        amount: totalAmount,
        description: `자금 분배 (${distributionData.method}) - ${distributionResult.participants.length}명`,
        transactionDate: distribution.distributionDate,
        createdBy: userSession.userId
      };
      
      DatabaseUtils.saveFundTransaction(expenseTransaction);
      
      // 캐시 무효화
      CacheUtils.remove(CACHE_KEYS.GUILD_FUNDS);
      
      LogUtils.info('자금 분배 완료', { 
        distributionId: distribution.id,
        totalAmount: totalAmount,
        participantCount: distributionResult.participants.length,
        createdBy: userSession.userId
      });
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        message: `${distributionResult.participants.length}명에게 총 ${NumberUtils.formatCurrency(totalAmount)}이 분배되었습니다.`,
        data: {
          distribution: distribution,
          participants: distributionResult.participants,
          newBalance: DatabaseUtils.calculateCurrentFunds(),
          transaction: expenseTransaction
        }
      };
      
    } catch (error) {
      LogUtils.error('자금 분배 오류', { distributionData, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 분배 내역 조회 =====
  getDistributions: function(userSession, options = {}) {
    try {
      // 권한 확인
      if (!AuthService.checkPermission(userSession.role, PERMISSIONS.FUND_READ)) {
        return {
          success: false,
          code: RESPONSE_CODES.AUTHORIZATION_ERROR,
          message: MESSAGES.ERROR.PERMISSION_DENIED
        };
      }
      
      const { 
        page = 1,
        pageSize = SystemConfig.BUSINESS_RULES.DEFAULT_PAGE_SIZE
      } = options;
      
      LogUtils.info('분배 내역 조회 요청', { 
        requesterId: userSession.userId,
        options 
      });
      
      const sheet = DatabaseUtils.getOrCreateSheet(SystemConfig.SHEET_NAMES.DISTRIBUTION);
      const data = sheet.getDataRange().getValues();
      
      if (data.length <= 1) {
        return {
          success: true,
          code: RESPONSE_CODES.SUCCESS,
          data: {
            distributions: [],
            totalCount: 0,
            currentPage: page,
            totalPages: 0
          }
        };
      }
      
      const headers = data[0];
      let distributions = [];
      
      // 데이터 변환
      for (let i = 1; i < data.length; i++) {
        const distribution = DatabaseUtils.rowToObject(headers, data[i]);
        
        // 상세 정보 파싱
        try {
          distribution.participantDetails = JSON.parse(distribution.details || '[]');
        } catch (e) {
          distribution.participantDetails = [];
        }
        
        // 표시용 데이터 추가
        distribution.formattedAmount = NumberUtils.formatCurrency(distribution.totalAmount);
        distribution.formattedDate = DateUtils.formatDisplay(distribution.distributionDate);
        distribution.methodDisplay = this.getDistributionMethodDisplay(distribution.distributionMethod);
        
        distributions.push(distribution);
      }
      
      // 최신순 정렬
      distributions.sort((a, b) => new Date(b.distributionDate) - new Date(a.distributionDate));
      
      // 페이징
      const totalCount = distributions.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedDistributions = distributions.slice(startIndex, endIndex);
      
      return {
        success: true,
        code: RESPONSE_CODES.SUCCESS,
        data: {
          distributions: paginatedDistributions,
          totalCount,
          currentPage: page,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
      
    } catch (error) {
      LogUtils.error('분배 내역 조회 오류', { options, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: MESSAGES.ERROR.SYSTEM_ERROR
      };
    }
  },
  
  // ===== 내부 유틸리티 함수들 =====
  
  // 거래 데이터 검증
  validateTransactionData: function(transactionData, type) {
    const errors = [];
    
    if (!NumberUtils.isNumber(transactionData.amount)) {
      errors.push('올바른 금액을 입력해주세요.');
    } else {
      const amount = NumberUtils.toNumber(transactionData.amount);
      if (amount <= 0) {
        errors.push('금액은 0보다 커야 합니다.');
      }
      if (amount > 999999999) {
        errors.push('금액이 너무 큽니다.');
      }
    }
    
    if (StringUtils.isEmpty(transactionData.description)) {
      errors.push('거래 설명은 필수입니다.');
    } else if (!StringUtils.isValidLength(transactionData.description, 1, 200)) {
      errors.push('거래 설명은 1-200자여야 합니다.');
    }
    
    if (transactionData.transactionDate && !DateUtils.isValid(new Date(transactionData.transactionDate))) {
      errors.push('올바른 날짜 형식이 아닙니다.');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },
  
  // 분배 데이터 검증
  validateDistributionData: function(distributionData) {
    const errors = [];
    
    if (!NumberUtils.isNumber(distributionData.totalAmount)) {
      errors.push('올바른 분배 금액을 입력해주세요.');
    } else {
      const amount = NumberUtils.toNumber(distributionData.totalAmount);
      if (amount <= 0) {
        errors.push('분배 금액은 0보다 커야 합니다.');
      }
    }
    
    if (!distributionData.method || !Object.values(DISTRIBUTION_METHODS).includes(distributionData.method)) {
      errors.push('올바른 분배 방식을 선택해주세요.');
    }
    
    if (!distributionData.participants || !Array.isArray(distributionData.participants) || 
        distributionData.participants.length === 0) {
      errors.push('분배 대상자를 선택해주세요.');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },
  
  // 분배 계산
  calculateDistribution: function(distributionData) {
    try {
      const totalAmount = NumberUtils.toNumber(distributionData.totalAmount);
      const participants = distributionData.participants;
      const method = distributionData.method;
      
      let result = [];
      
      switch (method) {
        case DISTRIBUTION_METHODS.EQUAL:
          // 균등 분배
          const equalAmount = Math.floor(totalAmount / participants.length);
          result = participants.map(p => ({
            userId: p.userId,
            nickname: p.nickname,
            amount: equalAmount,
            percentage: Math.round((equalAmount / totalAmount) * 100)
          }));
          break;
          
        case DISTRIBUTION_METHODS.PARTICIPATION_BASED:
          // 참여도 기반 분배
          const totalParticipation = participants.reduce((sum, p) => sum + (p.participationCount || 1), 0);
          result = participants.map(p => {
            const participationCount = p.participationCount || 1;
            const amount = Math.floor((participationCount / totalParticipation) * totalAmount);
            return {
              userId: p.userId,
              nickname: p.nickname,
              amount: amount,
              participationCount: participationCount,
              percentage: Math.round((amount / totalAmount) * 100)
            };
          });
          break;
          
        case DISTRIBUTION_METHODS.CONTRIBUTION_BASED:
          // 기여도 기반 분배
          const totalContribution = participants.reduce((sum, p) => sum + (p.contribution || 0), 0);
          if (totalContribution === 0) {
            return {
              success: false,
              code: RESPONSE_CODES.VALIDATION_ERROR,
              message: '기여도 정보가 없어 분배할 수 없습니다.'
            };
          }
          
          result = participants.map(p => {
            const contribution = p.contribution || 0;
            const amount = Math.floor((contribution / totalContribution) * totalAmount);
            return {
              userId: p.userId,
              nickname: p.nickname,
              amount: amount,
              contribution: contribution,
              percentage: Math.round((amount / totalAmount) * 100)
            };
          });
          break;
          
        case DISTRIBUTION_METHODS.CUSTOM:
          // 커스텀 분배
          result = participants.map(p => ({
            userId: p.userId,
            nickname: p.nickname,
            amount: NumberUtils.toNumber(p.customAmount || 0),
            percentage: Math.round((NumberUtils.toNumber(p.customAmount || 0) / totalAmount) * 100)
          }));
          break;
          
        default:
          return {
            success: false,
            code: RESPONSE_CODES.VALIDATION_ERROR,
            message: '지원하지 않는 분배 방식입니다.'
          };
      }
      
      return {
        success: true,
        participants: result
      };
      
    } catch (error) {
      LogUtils.error('분배 계산 오류', { distributionData, error });
      return {
        success: false,
        code: RESPONSE_CODES.SYSTEM_ERROR,
        message: '분배 계산 중 오류가 발생했습니다.'
      };
    }
  },
  
  // 최근 거래 내역 조회
  getRecentTransactions: function(limit = 10) {
    try {
      const sheet = DatabaseUtils.getOrCreateSheet(SystemConfig.SHEET_NAMES.GUILD_FUNDS);
      const data = sheet.getDataRange().getValues();
      
      if (data.length <= 1) return [];
      
      const headers = data[0];
      const transactions = [];
      
      for (let i = 1; i < data.length; i++) {
        const transaction = DatabaseUtils.rowToObject(headers, data[i]);
        transaction.formattedAmount = NumberUtils.formatCurrency(transaction.amount);
        transaction.formattedDate = DateUtils.formatDisplay(transaction.transactionDate);
        transaction.typeDisplay = this.getTransactionTypeDisplay(transaction.transactionType);
        transactions.push(transaction);
      }
      
      // 최신순 정렬 후 제한
      transactions.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
      return transactions.slice(0, limit);
      
    } catch (error) {
      LogUtils.error('최근 거래 내역 조회 오류', error);
      return [];
    }
  },
  
  // 월간 통계
  getMonthlyStats: function() {
    try {
      const now = DateUtils.now();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const sheet = DatabaseUtils.getOrCreateSheet(SystemConfig.SHEET_NAMES.GUILD_FUNDS);
      const data = sheet.getDataRange().getValues();
      
      if (data.length <= 1) {
        return { income: 0, expense: 0, net: 0 };
      }
      
      const headers = data[0];
      let monthlyIncome = 0;
      let monthlyExpense = 0;
      
      for (let i = 1; i < data.length; i++) {
        const transaction = DatabaseUtils.rowToObject(headers, data[i]);
        const transactionDate = new Date(transaction.transactionDate);
        
        if (transactionDate >= monthStart) {
          if (transaction.transactionType === TRANSACTION_TYPES.INCOME) {
            monthlyIncome += NumberUtils.toNumber(transaction.amount);
          } else {
            monthlyExpense += NumberUtils.toNumber(transaction.amount);
          }
        }
      }
      
      return {
        income: monthlyIncome,
        expense: monthlyExpense,
        net: monthlyIncome - monthlyExpense,
        formattedIncome: NumberUtils.formatCurrency(monthlyIncome),
        formattedExpense: NumberUtils.formatCurrency(monthlyExpense),
        formattedNet: NumberUtils.formatCurrency(monthlyIncome - monthlyExpense)
      };
      
    } catch (error) {
      LogUtils.error('월간 통계 조회 오류', error);
      return { income: 0, expense: 0, net: 0 };
    }
  },
  
  // 거래 유형 표시명
  getTransactionTypeDisplay: function(type) {
    const typeMap = {
      [TRANSACTION_TYPES.INCOME]: '수입',
      [TRANSACTION_TYPES.EXPENSE]: '지출',
      [TRANSACTION_TYPES.DISTRIBUTION]: '분배',
      [TRANSACTION_TYPES.ADJUSTMENT]: '조정'
    };
    return typeMap[type] || type;
  },
  
  // 분배 방식 표시명
  getDistributionMethodDisplay: function(method) {
    const methodMap = {
      [DISTRIBUTION_METHODS.EQUAL]: '균등 분배',
      [DISTRIBUTION_METHODS.PARTICIPATION_BASED]: '참여도 기반',
      [DISTRIBUTION_METHODS.CONTRIBUTION_BASED]: '기여도 기반',
      [DISTRIBUTION_METHODS.CUSTOM]: '커스텀'
    };
    return methodMap[method] || method;
  },
  
  // 거래 정렬
  sortTransactions: function(transactions, sortBy, sortOrder) {
    return transactions.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'transactionDate') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (sortBy === 'amount') {
        aVal = NumberUtils.toNumber(aVal);
        bVal = NumberUtils.toNumber(bVal);
      }
      
      if (sortOrder === 'DESC') {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
      } else {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      }
    });
  },
  
  // 거래 요약 계산
  calculateTransactionSummary: function(transactions) {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalDistribution = 0;
    
    transactions.forEach(t => {
      const amount = NumberUtils.toNumber(t.amount);
      switch (t.transactionType) {
        case TRANSACTION_TYPES.INCOME:
          totalIncome += amount;
          break;
        case TRANSACTION_TYPES.EXPENSE:
          totalExpense += amount;
          break;
        case TRANSACTION_TYPES.DISTRIBUTION:
          totalDistribution += amount;
          break;
      }
    });
    
    return {
      totalIncome,
      totalExpense,
      totalDistribution,
      netAmount: totalIncome - totalExpense - totalDistribution,
      formattedIncome: NumberUtils.formatCurrency(totalIncome),
      formattedExpense: NumberUtils.formatCurrency(totalExpense),
      formattedDistribution: NumberUtils.formatCurrency(totalDistribution)
    };
  },
  
  // 분배 저장
  saveDistribution: function(distribution) {
    try {
      const sheet = DatabaseUtils.getOrCreateSheet(SystemConfig.SHEET_NAMES.DISTRIBUTION);
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      distribution.createdAt = DateUtils.now();
      const rowData = DatabaseUtils.objectToRow(headers, distribution);
      sheet.appendRow(rowData);
      
      LogUtils.info('분배 내역 저장 완료', { distributionId: distribution.id });
      return distribution;
      
    } catch (error) {
      LogUtils.error('분배 내역 저장 오류', { distribution, error });
      throw error;
    }
  }
};
