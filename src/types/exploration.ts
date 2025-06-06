// 装备类型枚举
export enum EquipmentType {
  TOOL = 'tool',                    // 工具
  VEHICLE = 'vehicle',              // 交通工具
  TECHNOLOGY = 'technology',        // 科技设备
  SAFETY = 'safety',                // 安全装备
  COMMUNICATION = 'communication'    // 通讯设备
}

// 装备稀有度
export enum EquipmentRarity {
  COMMON = 'common',                // 普通
  UNCOMMON = 'uncommon',            // 不常见
  RARE = 'rare',                    // 稀有
  EPIC = 'epic',                    // 史诗
  LEGENDARY = 'legendary'           // 传说
}

// 装备状态
export enum EquipmentStatus {
  NEW = 'new',                      // 全新
  GOOD = 'good',                    // 良好
  FAIR = 'fair',                    // 一般
  POOR = 'poor',                    // 较差
  BROKEN = 'broken'                 // 损坏
}

// 装备属性加成
export interface EquipmentBonus {
  type: 'success_rate' | 'efficiency' | 'safety' | 'speed' | 'quality' | 'cost_reduction';
  value: number;
  description: string;
}

// 装备维护记录
export interface EquipmentMaintenance {
  id: string;
  date: string;
  type: 'routine' | 'repair' | 'upgrade';
  cost: number;
  description: string;
  qualityChange: number;
}

// 主装备接口
export interface Equipment {
  // 基础信息
  id: string;
  name: string;
  type: EquipmentType;
  rarity: EquipmentRarity;
  status: EquipmentStatus;
  
  // 属性
  level: number;                    // 装备等级
  quality: number;                  // 品质 (1-100)
  durability: number;               // 耐久度 (1-100)
  maxDurability: number;            // 最大耐久度
  
  // 效果
  bonuses: EquipmentBonus[];
  specialAbilities: string[];       // 特殊能力
  
  // 经济信息
  purchasePrice: number;
  currentValue: number;
  maintenanceCost: number;          // 维护成本
  
  // 使用信息
  usageCount: number;               // 使用次数
  totalUsageTime: number;           // 总使用时间(小时)
  lastUsedDate?: string;
  
  // 维护历史
  maintenanceHistory: EquipmentMaintenance[];
  nextMaintenanceDate: string;
  
  // 获取信息
  acquiredDate: string;
  acquiredFrom: 'purchase' | 'reward' | 'craft' | 'gift';
  
  // 时间信息
  createdAt: string;
  updatedAt: string;
  
  // 新增属性以匹配GameEngineService的使用
  category?: string;
  effect?: string;
  requirements?: any;
  sellPrice?: number;
}

// 技能类型枚举
export enum SkillType {
  NEGOTIATION = 'negotiation',      // 谈判
  MANAGEMENT = 'management',        // 管理
  FINANCE = 'finance',              // 财务
  MARKETING = 'marketing',          // 营销
  CONSTRUCTION = 'construction',    // 建筑
  MAINTENANCE = 'maintenance',      // 维护
  EXPLORATION = 'exploration',      // 探险
  LEADERSHIP = 'leadership'         // 领导力
}

// 技能节点
export interface SkillNode {
  id: string;
  name: string;
  type: SkillType;
  description: string;
  
  // 等级信息
  currentLevel: number;
  maxLevel: number;
  experience: number;
  experienceToNext: number;
  
  // 效果
  effects: SkillEffect[];
  
  // 解锁条件
  prerequisites: string[];          // 前置技能ID
  unlockConditions: {
    playerLevel?: number;
    completedMissions?: string[];
    achievements?: string[];
    resources?: {
      cash?: number;
      experience?: number;
      reputation?: number;
    };
  };
  
  // 状态
  isUnlocked: boolean;
  isActive: boolean;
  
  // 升级成本
  upgradeCost: {
    cash: number;
    experience: number;
    materials?: string[];
  };
}

// 技能效果
export interface SkillEffect {
  type: 'percentage' | 'absolute' | 'unlock';
  target: string;                   // 影响目标
  value: number;
  description: string;
}

// 技能树
export interface SkillTree {
  categories: {
    [key in SkillType]: {
      name: string;
      description: string;
      nodes: SkillNode[];
      totalPoints: number;
      spentPoints: number;
    }
  };
  availablePoints: number;
  totalExperience: number;
}

// 探险任务类型
export enum MissionType {
  SURVEY = 'survey',                // 勘察
  NEGOTIATION = 'negotiation',      // 谈判
  ACQUISITION = 'acquisition',      // 收购
  INVESTIGATION = 'investigation',  // 调查
  NETWORKING = 'networking',        // 人脉建设
  RESEARCH = 'research'             // 研究
}

// 任务难度
export enum MissionDifficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard',
  EXPERT = 'expert',
  LEGENDARY = 'legendary'
}

// 任务状态
export enum MissionStatus {
  AVAILABLE = 'available',          // 可用
  IN_PROGRESS = 'in_progress',      // 进行中
  COMPLETED = 'completed',          // 已完成
  FAILED = 'failed',                // 失败
  EXPIRED = 'expired'               // 过期
}

// 任务奖励
export interface MissionReward {
  type: 'cash' | 'experience' | 'reputation' | 'equipment' | 'skill_points' | 'property' | 'contact';
  amount?: number;
  itemId?: string;
  description: string;
  money?: number;  // 新增属性以匹配ExplorationService的使用
}

// 任务要求
export interface MissionRequirement {
  type: 'level' | 'skill' | 'equipment' | 'property' | 'cash' | 'reputation';
  value: number | string;
  description: string;
}

// 主探险任务接口
export interface ExplorationMission {
  // 基础信息
  id: string;
  name: string;
  type: MissionType;
  difficulty: MissionDifficulty;
  status: MissionStatus;
  
  // 描述
  description: string;
  briefing: string;
  objectives: string[];
  
  // 要求
  requirements: MissionRequirement[];
  recommendedEquipment: string[];   // 推荐装备ID
  recommendedSkills: SkillType[];
  
  // 成功率计算
  baseSuccessRate: number;
  currentSuccessRate: number;
  successRate: number;              // 新增属性以匹配ExplorationService的使用
  
  // 奖励
  rewards: MissionReward[];
  bonusRewards?: MissionReward[];   // 完美完成奖励
  
  // 时间信息
  duration: number;                 // 任务时长(小时)
  cooldown: number;                 // 冷却时间(小时)
  expirationDate?: string;
  
  // 进度
  progress: number;                 // 进度百分比 (0-100)
  startTime?: string;
  estimatedCompletion?: string;
  
  // 风险和机会
  risks: {
    type: string;
    probability: number;
    impact: string;
  }[];
  opportunities: {
    type: string;
    probability: number;
    benefit: string;
  }[];
  
  // 历史记录
  attemptCount: number;
  bestResult?: {
    successRate: number;
    rewards: MissionReward[];
    date: string;
  };
  
  // 时间信息
  availableFrom: string;
  availableUntil?: string;
  createdAt: string;
  updatedAt: string;
}

// 探险结果
export interface ExplorationResult {
  missionId: string;
  success: boolean;
  actualSuccessRate: number;
  
  // 获得的奖励
  earnedRewards: MissionReward[];
  
  // 经验和成长
  experienceGained: number;
  skillExperienceGained: {
    skillType: SkillType;
    amount: number;
  }[];
  
  // 装备影响
  equipmentUsed: string[];
  equipmentDamage: {
    equipmentId: string;
    durabilityLoss: number;
  }[];
  
  // 发现和机会
  discoveries: string[];
  newContacts: string[];
  unlockedMissions: string[];
  
  // 时间信息
  completedAt: string;
  actualDuration: number;
}

// 探险统计
export interface ExplorationStatistics {
  totalMissions: number;
  completedMissions: number;
  failedMissions: number;
  successRate: number;
  
  // 奖励统计
  totalCashEarned: number;
  totalExperienceEarned: number;
  totalReputationEarned: number;
  equipmentAcquired: number;
  
  // 时间统计
  totalTimeSpent: number;           // 总时间(小时)
  averageMissionDuration: number;
  
  // 类型统计
  missionsByType: Record<MissionType, number>;
  missionsByDifficulty: Record<MissionDifficulty, number>;
  
  // 装备统计
  mostUsedEquipment: {
    equipmentId: string;
    usageCount: number;
  }[];
  
  // 技能发展
  skillDevelopment: {
    skillType: SkillType;
    experienceGained: number;
    levelsGained: number;
  }[];
}