/**
 * �ý��� ��� ����
 * ��� �ϵ��ڵ��� ���ڿ��� ���ڸ� �߾� ����
 */

// ===== ����� ���� ��� =====
const USER_STATUS = {
  ACTIVE: 'Ȱ��',
  INACTIVE: '��Ȱ��',
  SUSPENDED: '����',
  DELETED: '����'
};

// ===== ����� ���� ��� =====
const USER_ROLES = {
  ADMIN: 'Y',
  SUB_ADMIN: 'S',
  MODERATOR: 'M',
  MEMBER: 'N'
};

// ===== ����� ���� �̸� =====
const USER_ROLE_NAMES = {
  [USER_ROLES.ADMIN]: '������',
  [USER_ROLES.SUB_ADMIN]: '�ΰ�����',
  [USER_ROLES.MODERATOR]: '���',
  [USER_ROLES.MEMBER]: '�Ϲ�ȸ��'
};

// ===== ����/���̵� ���� =====
const BOSS_STATUS = {
  ACTIVE: 'Ȱ��',
  INACTIVE: '��Ȱ��',
  MAINTENANCE: '������'
};

// ===== ������ �Ǹ� ���� =====
const SALE_STATUS = {
  UNSOLD: '���Ǹ�',
  SOLD: '�ǸſϷ�',
  RESERVED: '�Ǹſ���',
  CANCELLED: '�Ǹ����'
};

// ===== �ŷ� ���� =====
const TRANSACTION_TYPES = {
  DEPOSIT: '�Ա�',
  WITHDRAWAL: '���',
  ITEM_SALE: '�������Ǹ�',
  DISTRIBUTION: '�ֱ޺й�',
  COMMISSION: '������',
  ADJUSTMENT: '����'
};

// ===== �α� ���� =====
const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  FATAL: 'FATAL'
};

// ===== �޽��� ��� =====
const MESSAGES = {
  // ���� �޽���
  SUCCESS: {
    LOGIN: '�α��εǾ����ϴ�.',
    LOGOUT: '�α׾ƿ��Ǿ����ϴ�.',
    REGISTER: 'ȸ�������� �Ϸ�Ǿ����ϴ�.',
    PASSWORD_CHANGED: '��й�ȣ�� ����Ǿ����ϴ�.',
    DATA_SAVED: '�����Ͱ� ����Ǿ����ϴ�.',
    DATA_UPDATED: '�����Ͱ� ������Ʈ�Ǿ����ϴ�.',
    DATA_DELETED: '�����Ͱ� �����Ǿ����ϴ�.',
    MEMBER_ADDED: 'ȸ���� �߰��Ǿ����ϴ�.',
    BOSS_RECORD_SAVED: '���� ���� ����� ����Ǿ����ϴ�.',
    ITEM_SOLD: '�������� �ǸŵǾ����ϴ�.',
    FUNDS_UPDATED: '��� �ڱ��� ������Ʈ�Ǿ����ϴ�.',
    DISTRIBUTION_COMPLETED: '�ֱ� �й谡 �Ϸ�Ǿ����ϴ�.',
    BACKUP_CREATED: '����� �����Ǿ����ϴ�.',
    CACHE_CLEARED: 'ĳ�ð� �ʱ�ȭ�Ǿ����ϴ�.'
  },
  
  // ���� �޽���
  ERROR: {
    // ���� ����
    INVALID_CREDENTIALS: '�г��� �Ǵ� ��й�ȣ�� ��ġ���� �ʽ��ϴ�.',
    USER_NOT_FOUND: '����ڸ� ã�� �� �����ϴ�.',
    USER_INACTIVE: '��Ȱ��ȭ�� ������Դϴ�.',
    SESSION_EXPIRED: '������ ����Ǿ����ϴ�. �ٽ� �α������ּ���.',
    PERMISSION_DENIED: '������ �����ϴ�.',
    
    // ������ ����
    REQUIRED_FIELD: '�ʼ� �׸��� �����Ǿ����ϴ�.',
    INVALID_FORMAT: '�߸��� �����Դϴ�.',
    DUPLICATE_NICKNAME: '�̹� �����ϴ� �г����Դϴ�.',
    PASSWORD_TOO_SHORT: '��й�ȣ�� 6�� �̻��̾�� �մϴ�.',
    PASSWORD_MISMATCH: '��й�ȣ�� ��ġ���� �ʽ��ϴ�.',
    NICKNAME_TOO_SHORT: '�г����� 2�� �̻��̾�� �մϴ�.',
    NICKNAME_TOO_LONG: '�г����� 20�� ���Ͽ��� �մϴ�.',
    
    // �ý��� ����
    SYSTEM_ERROR: '�ý��� ������ �߻��߽��ϴ�.',
    DATABASE_ERROR: '�����ͺ��̽� ������ �߻��߽��ϴ�.',
    NETWORK_ERROR: '��Ʈ��ũ ������ �߻��߽��ϴ�.',
    FILE_NOT_FOUND: '������ ã�� �� �����ϴ�.',
    SHEET_NOT_FOUND: '��Ʈ�� ã�� �� �����ϴ�.',
    INVALID_DATA: '�߸��� �������Դϴ�.',
    
    // ����Ͻ� ����
    INSUFFICIENT_FUNDS: '��� �ڱ��� �����մϴ�.',
    ITEM_ALREADY_SOLD: '�̹� �Ǹŵ� �������Դϴ�.',
    BOSS_RECORD_EXISTS: '�̹� ��ϵ� ���� ����Դϴ�.',
    INVALID_AMOUNT: '�߸��� �ݾ��Դϴ�.',
    FUTURE_DATE: '�̷� ��¥�� ������ �� �����ϴ�.'
  },
  
  // Ȯ�� �޽���
  CONFIRM: {
    DELETE: '���� �����Ͻðڽ��ϱ�?',
    LOGOUT: '�α׾ƿ��Ͻðڽ��ϱ�?',
    PASSWORD_CHANGE: '��й�ȣ�� �����Ͻðڽ��ϱ�?',
    MEMBER_DELETE: 'ȸ���� �����Ͻðڽ��ϱ�?',
    BOSS_RECORD_DELETE: '���� ����� �����Ͻðڽ��ϱ�?',
    DISTRIBUTION_EXECUTE: '�ֱ� �й踦 �����Ͻðڽ��ϱ�?',
    BACKUP_CREATE: '����� �����Ͻðڽ��ϱ�?',
    CACHE_CLEAR: 'ĳ�ø� �ʱ�ȭ�Ͻðڽ��ϱ�?',
    SYSTEM_RESET: '�ý����� �ʱ�ȭ�Ͻðڽ��ϱ�? �� �۾��� �ǵ��� �� �����ϴ�.'
  }
};

// ===== �ν�Ʈ��ũ ���� ��� =====
const LOSTARK_SERVERS = [
  '�����', '�Ǹ���', '�Ƹ�', 'ī����', 'ī���ν�', 
  '�ƺ근����', 'ī��', '�ϳ���', '����', '�ٸ�ĭ', 
  '������ũ', '��Ű�峪', '�׸���', 'Ű����'
];

// ===== �ν�Ʈ��ũ ���� ��� =====
const LOSTARK_JOBS = {
  WARRIOR: {
    name: '����',
    jobs: ['����Ŀ', '��Ʈ���̾�', '���ε�', 'Ȧ������Ʈ', '�����̾�']
  },
  MARTIAL_ARTIST: {
    name: '������',
    jobs: ['��Ʋ������', '��������', '�����', 'â����', '��Ʈ����Ŀ', '�극��Ŀ']
  },
  GUNNER: {
    name: '�ǳ�',
    jobs: ['�ǽ�����', '�Ƹ�Ƽ��Ʈ', '��������', '������', 'ȣũ����', '��ī����']
  },
  MAGE: {
    name: '������',
    jobs: ['�ٵ�', '���ӳ�', '�Ƹ�ī��', '�Ҽ�����']
  },
  ASSASSIN: {
    name: '�ϻ���',
    jobs: ['���̵�', '�����', '����', '�ҿ�����']
  },
  SPECIALIST: {
    name: '����ȸ���Ʈ',
    jobs: ['��ȭ��', '������']
  }
};

// ===== ������ ���� =====
const JOB_COLORS = {
  // ����
  '����Ŀ': '#E53E3E',
  '��Ʈ���̾�': '#C53030',
  '���ε�': '#9B2C2C',
  'Ȧ������Ʈ': '#742A2A',
  '�����̾�': '#E53E3E',
  
  // ������
  '��Ʋ������': '#DD6B20',
  '��������': '#C05621',
  '�����': '#9C4221',
  'â����': '#7B341E',
  '��Ʈ����Ŀ': '#DD6B20',
  '�극��Ŀ': '#C05621',
  
  // �ǳ�
  '�ǽ�����': '#38A169',
  '�Ƹ�Ƽ��Ʈ': '#2F855A',
  '��������': '#276749',
  '������': '#22543D',
  'ȣũ����': '#1A202C',
  '��ī����': '#38A169',
  
  // ������
  '�ٵ�': '#3182CE',
  '���ӳ�': '#2B6CB0',
  '�Ƹ�ī��': '#2C5282',
  '�Ҽ�����': '#2A4365',
  
  // �ϻ���
  '���̵�': '#805AD5',
  '�����': '#6B46C1',
  '����': '#553C9A',
  '�ҿ�����': '#44337A',
  
  // ����ȸ���Ʈ
  '��ȭ��': '#D69E2E',
  '������': '#00B5D8'
};

// ===== ���� ��� =====
const BOSS_LIST = [
  '��ź', '���Ű��', '��ũ����ư', '�ƺ근����', '�ϸ���ĭ', 
  'ī���', '���ž', 'ī��', '��Ű�峪', '������',
  'ȥ���� ���ž', 'Ʈ���ÿ�', '����'
];

// ===== ������ ��� =====
const ITEM_LIST = [
  '������ ��', '������ ��', '�ĸ��� ��', '������ ��', 'ī���� ��',
  '�ź��� ����', '��ȥ�� ����', '���μ�', '�����Ƽ ����',
  '�׼�����', '����', '��', '���'
];

// ===== HTTP ���� �ڵ� =====
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// ===== ���Խ� ���� =====
const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NICKNAME: /^[��-�Ra-zA-Z0-9_-]{2,20}$/,
  PASSWORD: /^.{6,}$/,
  PHONE: /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/,
  NUMBER: /^\d+$/,
  CURRENCY: /^\d{1,3}(,\d{3})*$/
};

// ===== ��¥ ���� =====
const DATE_FORMATS = {
  FULL: 'yyyy-MM-dd HH:mm:ss',
  DATE_ONLY: 'yyyy-MM-dd',
  TIME_ONLY: 'HH:mm:ss',
  DISPLAY: 'MM�� dd��',
  DISPLAY_FULL: 'yyyy�� MM�� dd��',
  ISO: 'yyyy-MM-ddTHH:mm:ss.SSSZ'
};

// ===== ��� �Ⱓ =====
const STATISTICS_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly'
};

// ===== ���� ���� =====
const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc'
};

// ===== ������ ũ�� �ɼ� =====
const PAGE_SIZES = [10, 25, 50, 100];

// ===== ĳ�� Ű =====
const CACHE_KEYS = {
  MEMBERS: 'guild_members',
  BOSS_STATISTICS: 'boss_statistics',
  GUILD_BALANCE: 'guild_balance',
  USER_SESSION: 'user_session_',
  BOSS_RECORDS: 'boss_records',
  STATISTICS: 'statistics_',
  SYSTEM_STATUS: 'system_status'
};

// ===== �̺�Ʈ Ÿ�� =====
const EVENT_TYPES = {
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_REGISTER: 'user_register',
  PASSWORD_CHANGE: 'password_change',
  MEMBER_ADDED: 'member_added',
  MEMBER_UPDATED: 'member_updated',
  MEMBER_DELETED: 'member_deleted',
  BOSS_RECORD_ADDED: 'boss_record_added',
  ITEM_SOLD: 'item_sold',
  FUNDS_UPDATED: 'funds_updated',
  DISTRIBUTION_EXECUTED: 'distribution_executed',
  SYSTEM_ERROR: 'system_error',
  DATA_BACKUP: 'data_backup'
};

// ===== CSS Ŭ���� �̸� =====
const CSS_CLASSES = {
  // ���� ����
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DISABLED: 'disabled',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
  WARNING: 'warning',
  
  // ������Ʈ
  MODAL: 'modal',
  TOOLTIP: 'tooltip',
  DROPDOWN: 'dropdown',
  TAB: 'tab',
  CARD: 'card',
  BUTTON: 'btn',
  FORM: 'form',
  TABLE: 'table',
  
  // ���̾ƿ�
  CONTAINER: 'container',
  ROW: 'row',
  COLUMN: 'col',
  SIDEBAR: 'sidebar',
  NAVBAR: 'navbar',
  CONTENT: 'content'
};

// ===== ������ �̸� (Material Icons) =====
const ICONS = {
  // �⺻
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'delete',
  SAVE: 'save',
  CANCEL: 'cancel',
  SEARCH: 'search',
  FILTER: 'filter_list',
  SORT: 'sort',
  REFRESH: 'refresh',
  
  // �׺���̼�
  HOME: 'home',
  BACK: 'arrow_back',
  FORWARD: 'arrow_forward',
  UP: 'keyboard_arrow_up',
  DOWN: 'keyboard_arrow_down',
  
  // �����
  PERSON: 'person',
  PEOPLE: 'people',
  ACCOUNT: 'account_circle',
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // ����
  CHECK: 'check',
  CLOSE: 'close',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info',
  SUCCESS: 'check_circle',
  
  // ���
  SETTINGS: 'settings',
  HELP: 'help',
  NOTIFICATION: 'notifications',
  EMAIL: 'email',
  PHONE: 'phone',
  
  // ���� ����
  GAME: 'sports_esports',
  TROPHY: 'emoji_events',
  SHIELD: 'shield',
  SWORD: 'casino',
  
  // ����
  MONEY: 'attach_money',
  WALLET: 'account_balance_wallet',
  CHART: 'bar_chart',
  TREND: 'trending_up'
};