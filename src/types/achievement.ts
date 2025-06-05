// 成就类型
export enum AchievementType {
  PROPERTY = 'property',            // 物业相关
  TENANT = 'tenant',                // 租户相关
  FINANCIAL = 'financial',          // 财务相关
  EXPLORATION = 'exploration',      // 探险相关
  SOCIAL = 'social',                // 社交相关
  SKILL = 'skill',                  // 技能相关
  COLLECTION = 'collection',        // 收集相关
  MILESTONE = 'milestone'           // 里程碑
}

// 成就分类
export enum AchievementCategory {
  BEGINNER = 'beginner',            // 新手
  INTERMEDIATE = 'intermediate',    // 中级
  ADVANCED = 'advanced',            // 高级
  EXPERT = 'expert',                // 专家
  MASTER = 'master'                 // 大师
}

// 成就等级
export enum AchievementTier {
  BRONZE = 'bronze',                // 青铜
  SILVER = 'silver',                // 白银
  GOLD = 'gold',                    // 黄金
  PLATINUM = 'platinum',            // 铂金
  DIAMOND = 'diamond'               // 钻石
}

// 成就稀有度
export enum AchievementRarity {
  COMMON = 'common',                // 普通
  UNCOMMON = 'uncommon',            // 不常见
  RARE = 'rare',                    // 稀有
  EPIC = 'epic',                    // 史诗
  LEGENDARY = 'legendary'           // 传说
}

// 成就状态
export enum AchievementStatus {
  LOCKED = 'locked',                // 锁定
  AVAILABLE = 'available',          // 可获得
  IN_PROGRESS = 'in_progress',      // 进行中
  COMPLETED = 'completed',          // 已完成
  CLAIMED = 'claimed'               // 已领取
}

// 成就条件
export interface AchievementCondition {
  type: 'count' | 'value' | 'percentage' | 'boolean' | 'time';
  target: string;                   // 目标指标
  operator: '=' | '>' | '<' | '>=' | '<=';
  value: number | string | boolean;
  description: string;
}

// 成就奖励
export interface AchievementReward {
  type: 'cash' | 'experience' | 'reputation' | 'skill_points' | 'equipment' | 'title' | 'unlock';
  amount?: number;
  itemId?: string;
  title?: string;
  unlockFeature?: string;
  description: string;
}

// 成就进度
export interface AchievementProgress {
  conditionId: string;
  currentValue: number | string | boolean;
  targetValue: number | string | boolean;
  percentage: number;               // 完成百分比 (0-100)
  isCompleted: boolean;
}

// 主成就接口
export interface Achievement {
  // 基础信息
  id: string;
  name: string;
  type: AchievementType;
  rarity: AchievementRarity;
  status: AchievementStatus;
  
  // 描述
  description: string;
  hint?: string;                    // 提示信息
  flavorText?: string;              // 风味文本
  
  // 图标和视觉
  icon: string;
  color: string;
  
  // 条件和进度
  conditions: AchievementCondition[];
  progress: AchievementProgress[];
  
  // 奖励
  rewards: AchievementReward[];
  
  // 解锁条件
  prerequisites: string[];          // 前置成就ID
  unlockConditions: {
    playerLevel?: number;
    gameDay?: number;
    completedAchievements?: string[];
  };
  
  // 统计信息
  completionRate: number;           // 全球完成率
  difficulty: number;               // 难度评分 (1-10)
  
  // 时间信息
  unlockedAt?: string;
  completedAt?: string;
  claimedAt?: string;
  createdAt: string;
  
  // 特殊属性
  isHidden: boolean;                // 是否隐藏成就
  isRepeatable: boolean;            // 是否可重复完成
  category: string;                 // 成就分类
  tags: string[];                   // 标签
}

// 成就统计
export interface AchievementStatistics {
  totalAchievements: number;
  unlockedAchievements: number;
  completedAchievements: number;
  claimedAchievements: number;
  
  // 完成率
  overallCompletionRate: number;
  
  // 类型统计
  achievementsByType: Record<AchievementType, {
    total: number;
    completed: number;
    completionRate: number;
  }>;
  
  // 稀有度统计
  achievementsByRarity: Record<AchievementRarity, {
    total: number;
    completed: number;
    completionRate: number;
  }>;
  
  // 奖励统计
  totalRewardsEarned: {
    cash: number;
    experience: number;
    reputation: number;
    skillPoints: number;
    equipment: number;
    titles: number;
  };
  
  // 最近完成
  recentlyCompleted: {
    achievementId: string;
    name: string;
    completedAt: string;
    rarity: AchievementRarity;
  }[];
  
  // 进度最高的未完成成就
  nearCompletion: {
    achievementId: string;
    name: string;
    progress: number;
    estimatedCompletion?: string;
  }[];
}