import { Achievement, AchievementProgress, AchievementCategory, AchievementTier } from '../types/achievement';
import { Player } from '../types/game-state';
import { randomUUID } from 'crypto';

// 成就类型
export enum AchievementType {
  PROGRESS = 'progress', // 进度型成就
  MILESTONE = 'milestone', // 里程碑成就
  COLLECTION = 'collection', // 收集型成就
  CHALLENGE = 'challenge', // 挑战型成就
  HIDDEN = 'hidden', // 隐藏成就
  SEASONAL = 'seasonal', // 季节性成就
  SOCIAL = 'social' // 社交成就
}

// 成就状态
export enum AchievementStatus {
  LOCKED = 'locked',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CLAIMED = 'claimed'
}

// 成就条件类型
export enum ConditionType {
  MONEY_EARNED = 'money_earned',
  PROPERTIES_OWNED = 'properties_owned',
  TENANTS_MANAGED = 'tenants_managed',
  MISSIONS_COMPLETED = 'missions_completed',
  LEVEL_REACHED = 'level_reached',
  DAYS_PLAYED = 'days_played',
  ITEMS_COLLECTED = 'items_collected',
  UPGRADES_PURCHASED = 'upgrades_purchased',
  MARKET_TRANSACTIONS = 'market_transactions',
  EXPLORATION_DISTANCE = 'exploration_distance',
  TENANT_SATISFACTION = 'tenant_satisfaction',
  PROPERTY_VALUE = 'property_value',
  CONSECUTIVE_DAYS = 'consecutive_days',
  PERFECT_MISSIONS = 'perfect_missions',
  RARE_ITEMS_FOUND = 'rare_items_found'
}

// 成就条件
interface AchievementCondition {
  type: ConditionType;
  target: number;
  current: number;
  description: string;
}

// 成就奖励
interface AchievementReward {
  money: number;
  experience: number;
  items: string[];
  title?: string;
  badge?: string;
  unlocks?: string[]; // 解锁的功能或成就
}

// 成就统计
interface AchievementStatistics {
  totalAchievements: number;
  completedAchievements: number;
  completionRate: number;
  totalRewards: {
    money: number;
    experience: number;
    items: number;
  };
  rareAchievements: number;
  hiddenAchievements: number;
  recentAchievements: Achievement[];
}

/**
 * 成就系统服务
 * 管理玩家成就、进度跟踪和奖励发放
 */
export class AchievementService {
  private achievements: Map<string, Achievement> = new Map();
  private playerProgress: Map<string, Map<string, AchievementProgress>> = new Map();
  private statistics: AchievementStatistics;
  
  constructor() {
    this.statistics = {
      totalAchievements: 0,
      completedAchievements: 0,
      completionRate: 0,
      totalRewards: {
        money: 0,
        experience: 0,
        items: 0
      },
      rareAchievements: 0,
      hiddenAchievements: 0,
      recentAchievements: []
    };
    
    this.initializeAchievements();
  }
  
  /**
   * 初始化成就系统
   */
  private initializeAchievements(): void {
    // 新手成就
    this.createAchievement({
      id: 'first_property',
      name: '房产新手',
      description: '购买你的第一处房产',
      category: AchievementCategory.PROPERTY,
      tier: AchievementTier.BRONZE,
      type: AchievementType.MILESTONE,
      conditions: [{
        type: ConditionType.PROPERTIES_OWNED,
        target: 1,
        current: 0,
        description: '拥有1处房产'
      }],
      rewards: {
        money: 500,
        experience: 100,
        items: ['beginner_guide'],
        title: '房产新手'
      },
      icon: 'house',
      isHidden: false
    });
    
    this.createAchievement({
      id: 'first_tenant',
      name: '租赁达人',
      description: '成功招募你的第一位租户',
      category: AchievementCategory.TENANT,
      tier: AchievementTier.BRONZE,
      type: AchievementType.MILESTONE,
      conditions: [{
        type: ConditionType.TENANTS_MANAGED,
        target: 1,
        current: 0,
        description: '管理1位租户'
      }],
      rewards: {
        money: 300,
        experience: 150,
        items: ['tenant_handbook'],
        title: '租赁新手'
      },
      icon: 'people',
      isHidden: false
    });
    
    // 财富成就
    this.createAchievement({
      id: 'millionaire',
      name: '百万富翁',
      description: '累计赚取100万金币',
      category: AchievementCategory.WEALTH,
      tier: AchievementTier.GOLD,
      type: AchievementType.PROGRESS,
      conditions: [{
        type: ConditionType.MONEY_EARNED,
        target: 1000000,
        current: 0,
        description: '累计赚取1,000,000金币'
      }],
      rewards: {
        money: 50000,
        experience: 1000,
        items: ['golden_calculator', 'luxury_office'],
        title: '百万富翁',
        badge: 'millionaire_badge'
      },
      icon: 'money',
      isHidden: false
    });
    
    // 探险成就
    this.createAchievement({
      id: 'explorer',
      name: '城市探险家',
      description: '完成50次探险任务',
      category: AchievementCategory.EXPLORATION,
      tier: AchievementTier.SILVER,
      type: AchievementType.PROGRESS,
      conditions: [{
        type: ConditionType.MISSIONS_COMPLETED,
        target: 50,
        current: 0,
        description: '完成50次探险任务'
      }],
      rewards: {
        money: 5000,
        experience: 500,
        items: ['explorer_compass', 'adventure_map'],
        title: '城市探险家'
      },
      icon: 'compass',
      isHidden: false
    });
    
    // 收集成就
    this.createAchievement({
      id: 'collector',
      name: '收藏家',
      description: '收集100种不同的物品',
      category: AchievementCategory.COLLECTION,
      tier: AchievementTier.SILVER,
      type: AchievementType.COLLECTION,
      conditions: [{
        type: ConditionType.ITEMS_COLLECTED,
        target: 100,
        current: 0,
        description: '收集100种不同物品'
      }],
      rewards: {
        money: 3000,
        experience: 300,
        items: ['collector_showcase', 'rare_item_detector'],
        title: '收藏家'
      },
      icon: 'collection',
      isHidden: false
    });
    
    // 挑战成就
    this.createAchievement({
      id: 'perfect_week',
      name: '完美一周',
      description: '连续7天完成所有日常任务',
      category: AchievementCategory.CHALLENGE,
      tier: AchievementTier.GOLD,
      type: AchievementType.CHALLENGE,
      conditions: [{
        type: ConditionType.CONSECUTIVE_DAYS,
        target: 7,
        current: 0,
        description: '连续7天完成日常任务'
      }],
      rewards: {
        money: 10000,
        experience: 800,
        items: ['perfectionist_trophy', 'efficiency_boost'],
        title: '完美主义者',
        badge: 'perfectionist_badge'
      },
      icon: 'trophy',
      isHidden: false
    });
    
    // 隐藏成就
    this.createAchievement({
      id: 'secret_room',
      name: '秘密发现',
      description: '发现隐藏的秘密房间',
      category: AchievementCategory.EXPLORATION,
      tier: AchievementTier.LEGENDARY,
      type: AchievementType.HIDDEN,
      conditions: [{
        type: ConditionType.RARE_ITEMS_FOUND,
        target: 1,
        current: 0,
        description: '发现秘密房间'
      }],
      rewards: {
        money: 25000,
        experience: 2000,
        items: ['secret_key', 'ancient_map', 'mystery_box'],
        title: '秘密探索者',
        badge: 'secret_badge',
        unlocks: ['secret_shop']
      },
      icon: 'secret',
      isHidden: true
    });
    
    // 社交成就
    this.createAchievement({
      id: 'community_builder',
      name: '社区建设者',
      description: '帮助10位租户解决问题',
      category: AchievementCategory.SOCIAL,
      tier: AchievementTier.SILVER,
      type: AchievementType.SOCIAL,
      conditions: [{
        type: ConditionType.TENANT_SATISFACTION,
        target: 10,
        current: 0,
        description: '帮助10位租户解决问题'
      }],
      rewards: {
        money: 2000,
        experience: 400,
        items: ['community_award', 'social_network'],
        title: '社区建设者'
      },
      icon: 'community',
      isHidden: false
    });
    
    // 等级成就
    this.createAchievement({
      id: 'level_master',
      name: '大师级别',
      description: '达到50级',
      category: AchievementCategory.PROGRESSION,
      tier: AchievementTier.LEGENDARY,
      type: AchievementType.MILESTONE,
      conditions: [{
        type: ConditionType.LEVEL_REACHED,
        target: 50,
        current: 0,
        description: '达到50级'
      }],
      rewards: {
        money: 100000,
        experience: 5000,
        items: ['master_certificate', 'legendary_tools', 'prestige_unlock'],
        title: '传奇大师',
        badge: 'master_badge',
        unlocks: ['prestige_system', 'master_challenges']
      },
      icon: 'crown',
      isHidden: false
    });
    
    this.updateStatistics();
  }
  
  /**
   * 创建成就
   */
  private createAchievement(achievementData: Omit<Achievement, 'createdAt' | 'unlockedAt'>): void {
    const achievement: Achievement = {
      ...achievementData,
      createdAt: new Date(),
      unlockedAt: undefined
    };
    
    this.achievements.set(achievement.id, achievement);
  }
  
  /**
   * 初始化玩家成就进度
   */
  initializePlayerProgress(playerId: string): void {
    if (this.playerProgress.has(playerId)) return;
    
    const playerAchievements = new Map<string, AchievementProgress>();
    
    this.achievements.forEach((achievement, id) => {
      playerAchievements.set(id, {
        achievementId: id,
        playerId,
        status: AchievementStatus.LOCKED,
        progress: 0,
        conditions: achievement.conditions.map(condition => ({ ...condition })),
        startedAt: new Date(),
        completedAt: undefined,
        claimedAt: undefined
      });
    });
    
    this.playerProgress.set(playerId, playerAchievements);
  }
  
  /**
   * 更新玩家进度
   */
  updateProgress(playerId: string, conditionType: ConditionType, value: number): Achievement[] {
    const playerAchievements = this.playerProgress.get(playerId);
    if (!playerAchievements) {
      this.initializePlayerProgress(playerId);
      return this.updateProgress(playerId, conditionType, value);
    }
    
    const completedAchievements: Achievement[] = [];
    
    playerAchievements.forEach((progress, achievementId) => {
      const achievement = this.achievements.get(achievementId);
      if (!achievement || progress.status === AchievementStatus.COMPLETED) return;
      
      let hasUpdate = false;
      let allConditionsMet = true;
      
      // 更新相关条件
      progress.conditions.forEach(condition => {
        if (condition.type === conditionType) {
          condition.current = Math.max(condition.current, value);
          hasUpdate = true;
        }
        
        if (condition.current < condition.target) {
          allConditionsMet = false;
        }
      });
      
      if (hasUpdate) {
        // 更新总进度
        const totalProgress = progress.conditions.reduce((sum, condition) => {
          return sum + Math.min(1, condition.current / condition.target);
        }, 0);
        
        progress.progress = totalProgress / progress.conditions.length;
        
        // 检查是否解锁
        if (progress.status === AchievementStatus.LOCKED && progress.progress > 0) {
          progress.status = AchievementStatus.IN_PROGRESS;
        }
        
        // 检查是否完成
        if (allConditionsMet && progress.status !== AchievementStatus.COMPLETED) {
          progress.status = AchievementStatus.COMPLETED;
          progress.completedAt = new Date();
          achievement.unlockedAt = new Date();
          completedAchievements.push(achievement);
          
          // 更新统计
          this.statistics.completedAchievements++;
          this.statistics.recentAchievements.unshift(achievement);
          if (this.statistics.recentAchievements.length > 10) {
            this.statistics.recentAchievements.pop();
          }
          
          if (achievement.tier === AchievementTier.LEGENDARY) {
            this.statistics.rareAchievements++;
          }
          
          if (achievement.isHidden) {
            this.statistics.hiddenAchievements++;
          }
        }
      }
    });
    
    if (completedAchievements.length > 0) {
      this.updateStatistics();
    }
    
    return completedAchievements;
  }
  
  /**
   * 领取成就奖励
   */
  claimReward(playerId: string, achievementId: string): {
    success: boolean;
    message: string;
    rewards?: AchievementReward;
  } {
    const playerAchievements = this.playerProgress.get(playerId);
    const progress = playerAchievements?.get(achievementId);
    const achievement = this.achievements.get(achievementId);
    
    if (!progress || !achievement) {
      return { success: false, message: '成就不存在' };
    }
    
    if (progress.status !== AchievementStatus.COMPLETED) {
      return { success: false, message: '成就尚未完成' };
    }
    
    if (progress.status === AchievementStatus.CLAIMED) {
      return { success: false, message: '奖励已领取' };
    }
    
    // 标记为已领取
    progress.status = AchievementStatus.CLAIMED;
    progress.claimedAt = new Date();
    
    // 更新统计
    this.statistics.totalRewards.money += achievement.rewards.money;
    this.statistics.totalRewards.experience += achievement.rewards.experience;
    this.statistics.totalRewards.items += achievement.rewards.items.length;
    
    return {
      success: true,
      message: '奖励已领取',
      rewards: achievement.rewards
    };
  }
  
  /**
   * 获取玩家成就列表
   */
  getPlayerAchievements(playerId: string, options?: {
    category?: AchievementCategory;
    status?: AchievementStatus;
    includeHidden?: boolean;
  }): Array<Achievement & { progress: AchievementProgress }> {
    const playerAchievements = this.playerProgress.get(playerId);
    if (!playerAchievements) {
      this.initializePlayerProgress(playerId);
      return this.getPlayerAchievements(playerId, options);
    }
    
    const result: Array<Achievement & { progress: AchievementProgress }> = [];
    
    this.achievements.forEach((achievement, id) => {
      const progress = playerAchievements.get(id)!;
      
      // 过滤条件
      if (options?.category && achievement.category !== options.category) return;
      if (options?.status && progress.status !== options.status) return;
      if (!options?.includeHidden && achievement.isHidden && progress.status === AchievementStatus.LOCKED) return;
      
      result.push({
        ...achievement,
        progress
      });
    });
    
    return result.sort((a, b) => {
      // 排序：已完成 > 进行中 > 锁定
      const statusOrder = {
        [AchievementStatus.COMPLETED]: 0,
        [AchievementStatus.CLAIMED]: 0,
        [AchievementStatus.IN_PROGRESS]: 1,
        [AchievementStatus.LOCKED]: 2
      };
      
      const statusDiff = statusOrder[a.progress.status] - statusOrder[b.progress.status];
      if (statusDiff !== 0) return statusDiff;
      
      // 相同状态按进度排序
      return b.progress.progress - a.progress.progress;
    });
  }
  
  /**
   * 获取成就详情
   */
  getAchievementDetails(achievementId: string, playerId?: string): {
    achievement: Achievement;
    progress?: AchievementProgress;
  } | null {
    const achievement = this.achievements.get(achievementId);
    if (!achievement) return null;
    
    let progress: AchievementProgress | undefined;
    if (playerId) {
      const playerAchievements = this.playerProgress.get(playerId);
      progress = playerAchievements?.get(achievementId);
    }
    
    return { achievement, progress };
  }
  
  /**
   * 获取成就统计
   */
  getStatistics(playerId?: string): AchievementStatistics {
    if (!playerId) {
      return { ...this.statistics };
    }
    
    const playerAchievements = this.playerProgress.get(playerId);
    if (!playerAchievements) {
      return {
        totalAchievements: this.achievements.size,
        completedAchievements: 0,
        completionRate: 0,
        totalRewards: { money: 0, experience: 0, items: 0 },
        rareAchievements: 0,
        hiddenAchievements: 0,
        recentAchievements: []
      };
    }
    
    let completed = 0;
    let rare = 0;
    let hidden = 0;
    const totalRewards = { money: 0, experience: 0, items: 0 };
    const recent: Achievement[] = [];
    
    playerAchievements.forEach((progress, achievementId) => {
      const achievement = this.achievements.get(achievementId)!;
      
      if (progress.status === AchievementStatus.COMPLETED || progress.status === AchievementStatus.CLAIMED) {
        completed++;
        
        if (achievement.tier === AchievementTier.LEGENDARY) {
          rare++;
        }
        
        if (achievement.isHidden) {
          hidden++;
        }
        
        if (progress.status === AchievementStatus.CLAIMED) {
          totalRewards.money += achievement.rewards.money;
          totalRewards.experience += achievement.rewards.experience;
          totalRewards.items += achievement.rewards.items.length;
        }
        
        if (progress.completedAt) {
          recent.push(achievement);
        }
      }
    });
    
    recent.sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0));
    
    return {
      totalAchievements: this.achievements.size,
      completedAchievements: completed,
      completionRate: completed / this.achievements.size,
      totalRewards,
      rareAchievements: rare,
      hiddenAchievements: hidden,
      recentAchievements: recent.slice(0, 10)
    };
  }
  
  /**
   * 获取推荐成就
   */
  getRecommendedAchievements(playerId: string, limit: number = 5): Achievement[] {
    const playerAchievements = this.getPlayerAchievements(playerId, {
      status: AchievementStatus.IN_PROGRESS,
      includeHidden: false
    });
    
    return playerAchievements
      .sort((a, b) => {
        // 优先推荐进度较高的成就
        const progressDiff = b.progress.progress - a.progress.progress;
        if (progressDiff !== 0) return progressDiff;
        
        // 其次推荐奖励较好的成就
        const rewardA = a.rewards.money + a.rewards.experience;
        const rewardB = b.rewards.money + b.rewards.experience;
        return rewardB - rewardA;
      })
      .slice(0, limit)
      .map(item => item as Achievement);
  }
  
  /**
   * 检查特殊触发条件
   */
  checkSpecialTriggers(playerId: string, eventType: string, data: any): Achievement[] {
    const completedAchievements: Achievement[] = [];
    
    // 根据事件类型触发特殊成就
    switch (eventType) {
      case 'secret_room_discovered':
        completedAchievements.push(...this.updateProgress(playerId, ConditionType.RARE_ITEMS_FOUND, 1));
        break;
        
      case 'perfect_mission_streak':
        if (data.streak >= 5) {
          completedAchievements.push(...this.updateProgress(playerId, ConditionType.PERFECT_MISSIONS, data.streak));
        }
        break;
        
      case 'market_master':
        if (data.transactions >= 100) {
          completedAchievements.push(...this.updateProgress(playerId, ConditionType.MARKET_TRANSACTIONS, data.transactions));
        }
        break;
        
      case 'property_empire':
        if (data.totalValue >= 10000000) {
          completedAchievements.push(...this.updateProgress(playerId, ConditionType.PROPERTY_VALUE, data.totalValue));
        }
        break;
    }
    
    return completedAchievements;
  }
  
  /**
   * 重置玩家成就进度（用于测试或特殊情况）
   */
  resetPlayerProgress(playerId: string, achievementId?: string): void {
    const playerAchievements = this.playerProgress.get(playerId);
    if (!playerAchievements) return;
    
    if (achievementId) {
      // 重置特定成就
      const achievement = this.achievements.get(achievementId);
      if (achievement) {
        playerAchievements.set(achievementId, {
          achievementId,
          playerId,
          status: AchievementStatus.LOCKED,
          progress: 0,
          conditions: achievement.conditions.map(condition => ({ ...condition, current: 0 })),
          startedAt: new Date(),
          completedAt: undefined,
          claimedAt: undefined
        });
      }
    } else {
      // 重置所有成就
      this.playerProgress.delete(playerId);
      this.initializePlayerProgress(playerId);
    }
  }
  
  /**
   * 更新统计数据
   */
  private updateStatistics(): void {
    this.statistics.totalAchievements = this.achievements.size;
    this.statistics.completionRate = this.statistics.completedAchievements / this.statistics.totalAchievements;
  }
  
  /**
   * 导出玩家成就数据
   */
  exportPlayerData(playerId: string): {
    achievements: Array<Achievement & { progress: AchievementProgress }>;
    statistics: AchievementStatistics;
  } {
    return {
      achievements: this.getPlayerAchievements(playerId, { includeHidden: true }),
      statistics: this.getStatistics(playerId)
    };
  }
  
  /**
   * 导入玩家成就数据
   */
  importPlayerData(playerId: string, data: {
    achievements: Array<Achievement & { progress: AchievementProgress }>;
  }): void {
    const playerAchievements = new Map<string, AchievementProgress>();
    
    data.achievements.forEach(item => {
      playerAchievements.set(item.id, item.progress);
    });
    
    this.playerProgress.set(playerId, playerAchievements);
  }
}

export default AchievementService;