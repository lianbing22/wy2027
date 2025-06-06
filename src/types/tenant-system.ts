// 租户类型枚举
export enum TenantType {
  INDIVIDUAL = 'individual',    // 个人
  FAMILY = 'family',           // 家庭
  STUDENT = 'student',         // 学生
  BUSINESS = 'business',       // 企业
  STARTUP = 'startup',         // 初创公司
  CORPORATION = 'corporation',  // 大公司
  PROFESSIONAL = 'professional', // 专业人士
  ELDERLY = 'elderly',         // 老年人
  COUPLE = 'couple'            // 情侣/夫妇
}

// 租户状态枚举
export enum TenantStatus {
  ACTIVE = 'active',            // 活跃
  INACTIVE = 'inactive',        // 不活跃
  MOVING_OUT = 'moving_out',    // 准备搬出
  OVERDUE = 'overdue',          // 逾期
  SUSPENDED = 'suspended'       // 暂停
}

// 租户性格特征
export enum PersonalityTrait {
  FRIENDLY = 'friendly',        // 友好
  QUIET = 'quiet',             // 安静
  SOCIAL = 'social',           // 社交
  DEMANDING = 'demanding',      // 苛刻
  EASYGOING = 'easygoing',     // 随和
  PERFECTIONIST = 'perfectionist', // 完美主义
  PARTY_LOVER = 'party_lover',  // 聚会爱好者
  WORKAHOLIC = 'workaholic',    // 工作狂
  NOISE_LEVEL = 'noise_level',  // 噪音水平
  CLEANLINESS = 'cleanliness',  // 清洁度
  STABILITY = 'stability',      // 稳定性
  ADVENTUROUS = 'adventurous',  // 冒险精神
  SOCIABILITY = 'sociability',  // 社交能力
  HELPFULNESS = 'helpfulness',  // 乐于助人
  OPTIMISM = 'optimism',        // 乐观主义
  DEMANDINGNESS = 'demandingness', // 要求苛刻
  ADAPTABILITY = 'adaptability' // 适应能力
}

// 租户偏好
export interface TenantPreferences {
  propertyType: PropertyType[];
  minArea: number;
  maxArea: number;
  maxRent: number;
  preferredFloor: 'low' | 'middle' | 'high' | 'any';
  needsParking: boolean;
  petFriendly: boolean;
  smokingAllowed: boolean;
  preferredFacilities: string[];
  locationPreferences: {
    nearSchool: boolean;
    nearTransport: boolean;
    nearShopping: boolean;
    quietArea: boolean;
  };
  quietEnvironment?: number;  // 新增属性以匹配TenantService的使用
}

// 租户财务信息
export interface TenantFinancials {
  monthlyIncome: number;
  creditScore: number;          // 信用评分 (300-850)
  paymentHistory: PaymentRecord[];
  securityDeposit: number;
  outstandingBalance: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'check';
}

// 支付记录
export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  type: 'rent' | 'deposit' | 'utilities' | 'maintenance' | 'penalty';
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  method: string;
  notes?: string;
}

// 租户互动记录
export interface TenantInteraction {
  id: string;
  date: string;
  type: 'complaint' | 'request' | 'compliment' | 'inquiry' | 'emergency';
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  response?: string;
  responseDate?: string;
  satisfactionRating?: number;  // 1-5
}

// 租户关系网络
export interface TenantRelationship {
  tenantId: string;
  relationshipType: 'friend' | 'neutral' | 'conflict' | 'romantic' | 'business';
  strength: number;             // 关系强度 (-100 到 100)
  interactions: number;         // 互动次数
  lastInteractionDate: string;
  notes?: string;
}

// 租户生活模式
export interface LifestylePattern {
  workSchedule: {
    workDays: number[];         // 工作日 (0-6, 0=周日)
    workHours: {
      start: string;            // HH:MM
      end: string;              // HH:MM
    };
  };
  sleepSchedule: {
    bedtime: string;            // HH:MM
    wakeup: string;             // HH:MM
  };
  socialActivity: number;       // 社交活动频率 (1-10)
  noiseLevel: number;          // 噪音水平 (1-10)
  cleanlinessLevel: number;    // 清洁度 (1-10)
  maintenanceRequests: number; // 月均维护请求数
  hobbies: string[];           // 兴趣爱好列表
}

// 主租户接口
export interface Tenant {
  // 基础信息
  id: string;
  name: string;
  type: TenantType;
  status: TenantStatus;
  
  // 个人信息
  age: number;
  occupation: string;
  personalityTraits: PersonalityTrait[];
  preferences: TenantPreferences;
  lifestylePattern: LifestylePattern;
  
  // 租赁信息
  propertyId: string;
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyRent: number;
  rentDueDate: number;         // 每月租金到期日
  
  // 财务信息
  financials: TenantFinancials;
  
  // 满意度和关系
  satisfactionLevel: number;    // 满意度 (1-100)
  loyaltyLevel: number;        // 忠诚度 (1-100)
  relationships: TenantRelationship[];
  
  // 互动历史
  interactions: TenantInteraction[];
  
  // 游戏属性
  moodLevel: number;           // 心情水平 (1-100)
  stressLevel: number;         // 压力水平 (1-100)
  healthLevel: number;         // 健康水平 (1-100)
  
  // 特殊属性
  satisfactionFactors?: SatisfactionFactors;
  moveInDate?: string;
  description?: string;
  specialNeeds: string[];      // 特殊需求
  achievements: string[];      // 租户成就
  
  // 时间信息
  createdAt: string;
  updatedAt: string;
  lastActiveDate: string;
}

// 租户搜索过滤器
export interface TenantFilter {
  type?: TenantType[];
  status?: TenantStatus[];
  propertyId?: string;
  minSatisfaction?: number;
  maxSatisfaction?: number;
  minIncome?: number;
  maxIncome?: number;
  personalityTraits?: PersonalityTrait[];
  paymentStatus?: ('current' | 'overdue' | 'partial')[];
  ageRange?: {
    min: number;
    max: number;
  };
}

// 租户排序选项
export interface TenantSortOptions {
  field: 'name' | 'type' | 'satisfaction' | 'rent' | 'income' | 'leaseEnd' | 'age';
  order: 'asc' | 'desc';
}

// 租户统计数据
export interface TenantStatistics {
  totalTenants: number;
  activeTenants: number;
  totalMonthlyRent: number;
  averageSatisfaction: number;
  averageLoyalty: number;
  averageIncome: number;
  occupancyRate: number;
  retentionRate: number;
  averageLeaseLength: number;
  tenantsByType: Record<TenantType, number>;
  tenantsByStatus: Record<TenantStatus, number>;
  paymentStatistics: {
    onTime: number;
    late: number;
    overdue: number;
    averageDaysLate: number;
  };
}

// 租户事件
export interface TenantEvent {
  id: string;
  tenantId: string;
  type: 'lease_signed' | 'lease_renewed' | 'lease_terminated' | 'payment_made' | 'complaint_filed' | 'maintenance_requested' | 'satisfaction_changed';
  date: string;
  description: string;
  impact: {
    satisfaction?: number;
    loyalty?: number;
    mood?: number;
    stress?: number;
  };
  metadata?: Record<string, any>;
}

// 租户满意度因素
export interface SatisfactionFactors {
  rent: number;          // 租金满意度
  property: number;      // 物业状况满意度
  management: number;    // 管理服务满意度
  community: number;     // 社区环境满意度
}

// 导入物业类型
import type { PropertyType } from './property';