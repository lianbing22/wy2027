import { ExplorationMission, ExplorationResult, ExplorationEvent, ExplorationReward, ExplorationRisk } from '../types/exploration';
import { Player } from '../types/game-state';
import { Equipment } from '../types/equipment';
import { randomUUID } from 'crypto';

// 探险难度等级
export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXTREME = 'extreme',
  LEGENDARY = 'legendary'
}

// 探险类型
export enum ExplorationType {
  URBAN_EXPLORATION = 'urban_exploration',
  MARKET_RESEARCH = 'market_research',
  PROPERTY_SCOUTING = 'property_scouting',
  TENANT_RECRUITMENT = 'tenant_recruitment',
  RESOURCE_GATHERING = 'resource_gathering',
  BUSINESS_NETWORKING = 'business_networking',
  INVESTMENT_OPPORTUNITY = 'investment_opportunity',
  EMERGENCY_RESPONSE = 'emergency_response'
}

// 探险状态
export enum ExplorationStatus {
  AVAILABLE = 'available',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

// 探险统计数据
interface ExplorationStatistics {
  totalMissions: number;
  completedMissions: number;
  failedMissions: number;
  successRate: number;
  totalRewards: {
    money: number;
    experience: number;
    items: number;
  };
  averageDuration: number;
  favoriteType: ExplorationType;
  riskTolerance: number;
}

// 探险配置
interface ExplorationConfig {
  maxActiveMissions: number;
  missionRefreshInterval: number; // 小时
  baseSuccessRate: number;
  experienceMultiplier: number;
  riskRewardRatio: number;
}

/**
 * 探险系统服务
 * 管理探险任务、奖励和风险评估
 */
export class ExplorationService {
  private availableMissions: ExplorationMission[] = [];
  private activeMissions: Map<string, ExplorationMission> = new Map();
  private completedMissions: ExplorationMission[] = [];
  private explorationHistory: ExplorationEvent[] = [];
  private statistics: ExplorationStatistics;
  private config: ExplorationConfig;
  
  constructor(config?: Partial<ExplorationConfig>) {
    this.config = {
      maxActiveMissions: 3,
      missionRefreshInterval: 6, // 6小时刷新一次任务
      baseSuccessRate: 0.7,
      experienceMultiplier: 1.0,
      riskRewardRatio: 1.5,
      ...config
    };
    
    this.statistics = {
      totalMissions: 0,
      completedMissions: 0,
      failedMissions: 0,
      successRate: 0,
      totalRewards: {
        money: 0,
        experience: 0,
        items: 0
      },
      averageDuration: 0,
      favoriteType: ExplorationType.URBAN_EXPLORATION,
      riskTolerance: 0.5
    };
    
    this.generateInitialMissions();
  }
  
  /**
   * 生成初始探险任务
   */
  private generateInitialMissions(): void {
    for (let i = 0; i < 5; i++) {
      this.availableMissions.push(this.generateRandomMission());
    }
  }
  
  /**
   * 生成随机探险任务
   */
  generateRandomMission(): ExplorationMission {
    const types = Object.values(ExplorationType);
    const difficulties = Object.values(DifficultyLevel);
    
    const type = types[Math.floor(Math.random() * types.length)];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    
    const mission = this.createMissionByType(type, difficulty);
    return mission;
  }
  
  /**
   * 根据类型创建探险任务
   */
  private createMissionByType(type: ExplorationType, difficulty: DifficultyLevel): ExplorationMission {
    const baseReward = this.calculateBaseReward(difficulty);
    const baseDuration = this.calculateBaseDuration(difficulty);
    const risks = this.generateRisksForType(type, difficulty);
    
    const missionTemplates = {
      [ExplorationType.URBAN_EXPLORATION]: {
        name: '城市探索',
        description: '探索城市中的隐秘角落，寻找投资机会和有趣的发现',
        rewards: {
          money: baseReward * 0.8,
          experience: baseReward * 1.2,
          items: ['city_map', 'local_contacts'],
          properties: []
        }
      },
      [ExplorationType.MARKET_RESEARCH]: {
        name: '市场调研',
        description: '深入了解当地市场动态，收集有价值的商业信息',
        rewards: {
          money: baseReward * 0.6,
          experience: baseReward * 1.0,
          items: ['market_report', 'competitor_analysis'],
          properties: []
        }
      },
      [ExplorationType.PROPERTY_SCOUTING]: {
        name: '物业勘探',
        description: '寻找潜在的投资物业，评估其价值和潜力',
        rewards: {
          money: baseReward * 0.4,
          experience: baseReward * 0.8,
          items: ['property_leads'],
          properties: ['potential_property']
        }
      },
      [ExplorationType.TENANT_RECRUITMENT]: {
        name: '租户招募',
        description: '寻找优质租户，建立租户网络',
        rewards: {
          money: baseReward * 0.5,
          experience: baseReward * 0.9,
          items: ['tenant_contacts', 'referral_network'],
          properties: []
        }
      },
      [ExplorationType.RESOURCE_GATHERING]: {
        name: '资源收集',
        description: '收集建筑材料、装修用品等有用资源',
        rewards: {
          money: baseReward * 1.2,
          experience: baseReward * 0.6,
          items: ['building_materials', 'tools', 'supplies'],
          properties: []
        }
      },
      [ExplorationType.BUSINESS_NETWORKING]: {
        name: '商业社交',
        description: '参加商业活动，建立有价值的人脉关系',
        rewards: {
          money: baseReward * 0.3,
          experience: baseReward * 1.4,
          items: ['business_cards', 'partnership_opportunities'],
          properties: []
        }
      },
      [ExplorationType.INVESTMENT_OPPORTUNITY]: {
        name: '投资机会',
        description: '寻找高回报的投资项目和合作机会',
        rewards: {
          money: baseReward * 1.5,
          experience: baseReward * 1.1,
          items: ['investment_leads', 'financial_reports'],
          properties: []
        }
      },
      [ExplorationType.EMERGENCY_RESPONSE]: {
        name: '紧急响应',
        description: '处理紧急情况，可能获得意外收获',
        rewards: {
          money: baseReward * 1.8,
          experience: baseReward * 1.6,
          items: ['emergency_supplies', 'reputation_boost'],
          properties: []
        }
      }
    };
    
    const template = missionTemplates[type];
    
    return {
      id: randomUUID(),
      name: `${template.name} - ${this.getDifficultyName(difficulty)}`,
      description: template.description,
      type,
      difficulty,
      duration: baseDuration,
      rewards: template.rewards,
      risks,
      requirements: this.generateRequirements(type, difficulty),
      status: ExplorationStatus.AVAILABLE,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后过期
      successRate: this.calculateSuccessRate(difficulty, risks)
    };
  }
  
  /**
   * 计算基础奖励
   */
  private calculateBaseReward(difficulty: DifficultyLevel): number {
    const baseValues = {
      [DifficultyLevel.EASY]: 100,
      [DifficultyLevel.MEDIUM]: 250,
      [DifficultyLevel.HARD]: 500,
      [DifficultyLevel.EXTREME]: 1000,
      [DifficultyLevel.LEGENDARY]: 2000
    };
    
    return baseValues[difficulty];
  }
  
  /**
   * 计算基础持续时间（分钟）
   */
  private calculateBaseDuration(difficulty: DifficultyLevel): number {
    const baseDurations = {
      [DifficultyLevel.EASY]: 30,
      [DifficultyLevel.MEDIUM]: 60,
      [DifficultyLevel.HARD]: 120,
      [DifficultyLevel.EXTREME]: 240,
      [DifficultyLevel.LEGENDARY]: 480
    };
    
    return baseDurations[difficulty];
  }
  
  /**
   * 生成探险类型对应的风险
   */
  private generateRisksForType(type: ExplorationType, difficulty: DifficultyLevel): ExplorationRisk[] {
    const riskTemplates = {
      [ExplorationType.URBAN_EXPLORATION]: [
        { type: 'physical', description: '迷路或受伤', probability: 0.1, impact: 'low' },
        { type: 'legal', description: '误入私人区域', probability: 0.05, impact: 'medium' },
        { type: 'time', description: '花费过多时间', probability: 0.2, impact: 'low' }
      ],
      [ExplorationType.MARKET_RESEARCH]: [
        { type: 'information', description: '获得错误信息', probability: 0.15, impact: 'medium' },
        { type: 'competition', description: '被竞争对手发现', probability: 0.1, impact: 'low' },
        { type: 'time', description: '调研时间过长', probability: 0.25, impact: 'low' }
      ],
      [ExplorationType.PROPERTY_SCOUTING]: [
        { type: 'financial', description: '高估物业价值', probability: 0.2, impact: 'high' },
        { type: 'legal', description: '产权问题', probability: 0.1, impact: 'high' },
        { type: 'physical', description: '物业结构问题', probability: 0.15, impact: 'medium' }
      ],
      [ExplorationType.TENANT_RECRUITMENT]: [
        { type: 'social', description: '遇到不良租户', probability: 0.2, impact: 'medium' },
        { type: 'financial', description: '租户财务问题', probability: 0.15, impact: 'medium' },
        { type: 'legal', description: '合同纠纷', probability: 0.1, impact: 'high' }
      ],
      [ExplorationType.RESOURCE_GATHERING]: [
        { type: 'quality', description: '资源质量不佳', probability: 0.25, impact: 'low' },
        { type: 'physical', description: '搬运受伤', probability: 0.1, impact: 'medium' },
        { type: 'financial', description: '隐藏成本', probability: 0.15, impact: 'medium' }
      ],
      [ExplorationType.BUSINESS_NETWORKING]: [
        { type: 'social', description: '社交失误', probability: 0.2, impact: 'low' },
        { type: 'reputation', description: '声誉受损', probability: 0.05, impact: 'high' },
        { type: 'time', description: '无效社交', probability: 0.3, impact: 'low' }
      ],
      [ExplorationType.INVESTMENT_OPPORTUNITY]: [
        { type: 'financial', description: '投资陷阱', probability: 0.15, impact: 'high' },
        { type: 'market', description: '市场变化', probability: 0.2, impact: 'medium' },
        { type: 'legal', description: '法律风险', probability: 0.1, impact: 'high' }
      ],
      [ExplorationType.EMERGENCY_RESPONSE]: [
        { type: 'physical', description: '人身安全风险', probability: 0.3, impact: 'high' },
        { type: 'financial', description: '意外损失', probability: 0.2, impact: 'medium' },
        { type: 'time', description: '紧急情况延误', probability: 0.4, impact: 'medium' }
      ]
    };
    
    const baseRisks = riskTemplates[type] || [];
    const difficultyMultiplier = this.getDifficultyMultiplier(difficulty);
    
    return baseRisks.map(risk => ({
      ...risk,
      probability: Math.min(0.8, risk.probability * difficultyMultiplier),
      impact: this.adjustImpactForDifficulty(risk.impact, difficulty)
    }));
  }
  
  /**
   * 生成任务要求
   */
  private generateRequirements(type: ExplorationType, difficulty: DifficultyLevel): {
    minLevel: number;
    requiredEquipment: string[];
    requiredSkills: string[];
    minMoney: number;
  } {
    const levelRequirements = {
      [DifficultyLevel.EASY]: 1,
      [DifficultyLevel.MEDIUM]: 5,
      [DifficultyLevel.HARD]: 10,
      [DifficultyLevel.EXTREME]: 20,
      [DifficultyLevel.LEGENDARY]: 35
    };
    
    const equipmentByType = {
      [ExplorationType.URBAN_EXPLORATION]: ['map', 'flashlight'],
      [ExplorationType.MARKET_RESEARCH]: ['notebook', 'calculator'],
      [ExplorationType.PROPERTY_SCOUTING]: ['measuring_tape', 'camera'],
      [ExplorationType.TENANT_RECRUITMENT]: ['business_cards', 'contract_templates'],
      [ExplorationType.RESOURCE_GATHERING]: ['tools', 'transport'],
      [ExplorationType.BUSINESS_NETWORKING]: ['formal_attire', 'business_cards'],
      [ExplorationType.INVESTMENT_OPPORTUNITY]: ['financial_calculator', 'legal_documents'],
      [ExplorationType.EMERGENCY_RESPONSE]: ['first_aid_kit', 'emergency_supplies']
    };
    
    const skillsByType = {
      [ExplorationType.URBAN_EXPLORATION]: ['navigation', 'observation'],
      [ExplorationType.MARKET_RESEARCH]: ['analysis', 'communication'],
      [ExplorationType.PROPERTY_SCOUTING]: ['evaluation', 'negotiation'],
      [ExplorationType.TENANT_RECRUITMENT]: ['communication', 'psychology'],
      [ExplorationType.RESOURCE_GATHERING]: ['logistics', 'quality_assessment'],
      [ExplorationType.BUSINESS_NETWORKING]: ['social_skills', 'presentation'],
      [ExplorationType.INVESTMENT_OPPORTUNITY]: ['financial_analysis', 'risk_assessment'],
      [ExplorationType.EMERGENCY_RESPONSE]: ['crisis_management', 'quick_thinking']
    };
    
    return {
      minLevel: levelRequirements[difficulty],
      requiredEquipment: equipmentByType[type] || [],
      requiredSkills: skillsByType[type] || [],
      minMoney: levelRequirements[difficulty] * 50
    };
  }
  
  /**
   * 计算成功率
   */
  private calculateSuccessRate(difficulty: DifficultyLevel, risks: ExplorationRisk[]): number {
    const baseRate = this.config.baseSuccessRate;
    const difficultyPenalty = this.getDifficultyPenalty(difficulty);
    const riskPenalty = risks.reduce((sum, risk) => sum + risk.probability * 0.1, 0);
    
    return Math.max(0.1, Math.min(0.95, baseRate - difficultyPenalty - riskPenalty));
  }
  
  /**
   * 开始探险任务
   */
  async startMission(missionId: string, player: Player, equipment: Equipment[] = []): Promise<{
    success: boolean;
    message: string;
    mission?: ExplorationMission;
  }> {
    const mission = this.availableMissions.find(m => m.id === missionId);
    if (!mission) {
      return { success: false, message: '任务不存在' };
    }
    
    if (this.activeMissions.size >= this.config.maxActiveMissions) {
      return { success: false, message: '活跃任务数量已达上限' };
    }
    
    // 检查要求
    const requirementCheck = this.checkRequirements(mission, player, equipment);
    if (!requirementCheck.success) {
      return { success: false, message: requirementCheck.message };
    }
    
    // 移除可用任务，添加到活跃任务
    this.availableMissions = this.availableMissions.filter(m => m.id !== missionId);
    mission.status = ExplorationStatus.IN_PROGRESS;
    mission.startedAt = new Date();
    mission.estimatedEndTime = new Date(Date.now() + mission.duration * 60 * 1000);
    
    this.activeMissions.set(missionId, mission);
    
    // 记录探险事件
    this.explorationHistory.push({
      id: randomUUID(),
      type: 'mission_started',
      missionId,
      playerId: player.id,
      timestamp: new Date(),
      description: `开始探险任务: ${mission.name}`
    });
    
    return { success: true, message: '探险任务已开始', mission };
  }
  
  /**
   * 检查任务要求
   */
  private checkRequirements(mission: ExplorationMission, player: Player, equipment: Equipment[]): {
    success: boolean;
    message: string;
  } {
    // 检查等级要求
    if (player.level < mission.requirements.minLevel) {
      return {
        success: false,
        message: `需要等级 ${mission.requirements.minLevel}，当前等级 ${player.level}`
      };
    }
    
    // 检查金钱要求
    if (player.money < mission.requirements.minMoney) {
      return {
        success: false,
        message: `需要 ${mission.requirements.minMoney} 金币，当前 ${player.money} 金币`
      };
    }
    
    // 检查装备要求
    const playerEquipmentTypes = equipment.map(e => e.type);
    const missingEquipment = mission.requirements.requiredEquipment.filter(
      req => !playerEquipmentTypes.includes(req)
    );
    
    if (missingEquipment.length > 0) {
      return {
        success: false,
        message: `缺少必需装备: ${missingEquipment.join(', ')}`
      };
    }
    
    return { success: true, message: '要求满足' };
  }
  
  /**
   * 完成探险任务
   */
  async completeMission(missionId: string, player: Player): Promise<ExplorationResult> {
    const mission = this.activeMissions.get(missionId);
    if (!mission) {
      throw new Error('任务不存在或未激活');
    }
    
    // 检查任务是否到时间
    const now = new Date();
    if (mission.estimatedEndTime && now < mission.estimatedEndTime) {
      throw new Error('任务尚未完成');
    }
    
    // 计算成功概率
    const successRate = this.calculateMissionSuccessRate(mission, player);
    const isSuccess = Math.random() < successRate;
    
    // 生成结果
    const result = this.generateMissionResult(mission, player, isSuccess);
    
    // 更新任务状态
    mission.status = isSuccess ? ExplorationStatus.COMPLETED : ExplorationStatus.FAILED;
    mission.completedAt = now;
    mission.result = result;
    
    // 移动到完成任务列表
    this.activeMissions.delete(missionId);
    this.completedMissions.push(mission);
    
    // 更新统计数据
    this.updateStatistics(mission, result);
    
    // 记录探险事件
    this.explorationHistory.push({
      id: randomUUID(),
      type: isSuccess ? 'mission_completed' : 'mission_failed',
      missionId,
      playerId: player.id,
      timestamp: now,
      description: `${isSuccess ? '完成' : '失败'}探险任务: ${mission.name}`,
      result
    });
    
    return result;
  }
  
  /**
   * 计算任务成功率
   */
  private calculateMissionSuccessRate(mission: ExplorationMission, player: Player): number {
    let successRate = mission.successRate;
    
    // 玩家等级加成
    const levelBonus = Math.min(0.2, (player.level - mission.requirements.minLevel) * 0.02);
    successRate += levelBonus;
    
    // 经验加成
    const experienceBonus = Math.min(0.15, player.experience / 10000 * 0.1);
    successRate += experienceBonus;
    
    return Math.max(0.1, Math.min(0.95, successRate));
  }
  
  /**
   * 生成任务结果
   */
  private generateMissionResult(mission: ExplorationMission, player: Player, isSuccess: boolean): ExplorationResult {
    const result: ExplorationResult = {
      success: isSuccess,
      mission,
      rewards: {
        money: 0,
        experience: 0,
        items: [],
        properties: []
      },
      events: [],
      duration: mission.duration,
      completedAt: new Date()
    };
    
    if (isSuccess) {
      // 成功时给予奖励
      result.rewards = {
        money: Math.floor(mission.rewards.money * (0.8 + Math.random() * 0.4)), // 80%-120%的奖励
        experience: Math.floor(mission.rewards.experience * this.config.experienceMultiplier),
        items: [...mission.rewards.items],
        properties: [...mission.rewards.properties]
      };
      
      // 随机额外奖励
      if (Math.random() < 0.2) {
        result.rewards.money += Math.floor(result.rewards.money * 0.5);
        result.events.push('发现了额外的收益机会');
      }
      
      if (Math.random() < 0.15) {
        result.rewards.items.push('rare_item');
        result.events.push('发现了稀有物品');
      }
    } else {
      // 失败时可能有部分奖励
      result.rewards = {
        money: Math.floor(mission.rewards.money * 0.1), // 10%的安慰奖
        experience: Math.floor(mission.rewards.experience * 0.2), // 20%的经验
        items: [],
        properties: []
      };
      
      // 生成失败事件
      const failureEvents = this.generateFailureEvents(mission);
      result.events = failureEvents;
    }
    
    return result;
  }
  
  /**
   * 生成失败事件
   */
  private generateFailureEvents(mission: ExplorationMission): string[] {
    const events: string[] = [];
    
    // 基于风险生成失败原因
    mission.risks.forEach(risk => {
      if (Math.random() < risk.probability) {
        events.push(`遭遇风险: ${risk.description}`);
      }
    });
    
    if (events.length === 0) {
      events.push('由于意外情况，任务未能完成');
    }
    
    return events;
  }
  
  /**
   * 更新统计数据
   */
  private updateStatistics(mission: ExplorationMission, result: ExplorationResult): void {
    this.statistics.totalMissions++;
    
    if (result.success) {
      this.statistics.completedMissions++;
      this.statistics.totalRewards.money += result.rewards.money;
      this.statistics.totalRewards.experience += result.rewards.experience;
      this.statistics.totalRewards.items += result.rewards.items.length;
    } else {
      this.statistics.failedMissions++;
    }
    
    this.statistics.successRate = this.statistics.completedMissions / this.statistics.totalMissions;
    
    // 更新平均持续时间
    const totalDuration = this.completedMissions.reduce((sum, m) => sum + m.duration, 0);
    this.statistics.averageDuration = totalDuration / this.completedMissions.length;
    
    // 更新最喜欢的类型
    const typeCounts = new Map<ExplorationType, number>();
    this.completedMissions.forEach(m => {
      typeCounts.set(m.type, (typeCounts.get(m.type) || 0) + 1);
    });
    
    let maxCount = 0;
    let favoriteType = ExplorationType.URBAN_EXPLORATION;
    typeCounts.forEach((count, type) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteType = type;
      }
    });
    
    this.statistics.favoriteType = favoriteType;
  }
  
  /**
   * 获取可用任务
   */
  getAvailableMissions(): ExplorationMission[] {
    return [...this.availableMissions];
  }
  
  /**
   * 获取活跃任务
   */
  getActiveMissions(): ExplorationMission[] {
    return Array.from(this.activeMissions.values());
  }
  
  /**
   * 获取已完成任务
   */
  getCompletedMissions(limit?: number): ExplorationMission[] {
    const missions = [...this.completedMissions].sort(
      (a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0)
    );
    
    return limit ? missions.slice(0, limit) : missions;
  }
  
  /**
   * 获取探险历史
   */
  getExplorationHistory(limit?: number): ExplorationEvent[] {
    const history = [...this.explorationHistory].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    
    return limit ? history.slice(0, limit) : history;
  }
  
  /**
   * 获取统计数据
   */
  getStatistics(): ExplorationStatistics {
    return { ...this.statistics };
  }
  
  /**
   * 刷新任务列表
   */
  refreshMissions(): void {
    // 移除过期任务
    const now = new Date();
    this.availableMissions = this.availableMissions.filter(m => m.expiresAt > now);
    
    // 生成新任务补充到5个
    while (this.availableMissions.length < 5) {
      this.availableMissions.push(this.generateRandomMission());
    }
  }
  
  /**
   * 取消任务
   */
  cancelMission(missionId: string): boolean {
    const mission = this.activeMissions.get(missionId);
    if (!mission) return false;
    
    mission.status = ExplorationStatus.FAILED;
    mission.completedAt = new Date();
    
    this.activeMissions.delete(missionId);
    this.completedMissions.push(mission);
    
    // 记录取消事件
    this.explorationHistory.push({
      id: randomUUID(),
      type: 'mission_cancelled',
      missionId,
      playerId: '', // 需要从上下文获取
      timestamp: new Date(),
      description: `取消探险任务: ${mission.name}`
    });
    
    return true;
  }
  
  /**
   * 获取推荐任务
   */
  getRecommendedMissions(player: Player, limit: number = 3): ExplorationMission[] {
    return this.availableMissions
      .filter(mission => {
        // 过滤掉玩家无法完成的任务
        return player.level >= mission.requirements.minLevel &&
               player.money >= mission.requirements.minMoney;
      })
      .sort((a, b) => {
        // 根据成功率和奖励排序
        const scoreA = a.successRate * a.rewards.money;
        const scoreB = b.successRate * b.rewards.money;
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }
  
  // 辅助方法
  
  private getDifficultyName(difficulty: DifficultyLevel): string {
    const names = {
      [DifficultyLevel.EASY]: '简单',
      [DifficultyLevel.MEDIUM]: '中等',
      [DifficultyLevel.HARD]: '困难',
      [DifficultyLevel.EXTREME]: '极难',
      [DifficultyLevel.LEGENDARY]: '传奇'
    };
    
    return names[difficulty];
  }
  
  private getDifficultyMultiplier(difficulty: DifficultyLevel): number {
    const multipliers = {
      [DifficultyLevel.EASY]: 0.8,
      [DifficultyLevel.MEDIUM]: 1.0,
      [DifficultyLevel.HARD]: 1.3,
      [DifficultyLevel.EXTREME]: 1.6,
      [DifficultyLevel.LEGENDARY]: 2.0
    };
    
    return multipliers[difficulty];
  }
  
  private getDifficultyPenalty(difficulty: DifficultyLevel): number {
    const penalties = {
      [DifficultyLevel.EASY]: 0,
      [DifficultyLevel.MEDIUM]: 0.1,
      [DifficultyLevel.HARD]: 0.2,
      [DifficultyLevel.EXTREME]: 0.3,
      [DifficultyLevel.LEGENDARY]: 0.4
    };
    
    return penalties[difficulty];
  }
  
  private adjustImpactForDifficulty(impact: string, difficulty: DifficultyLevel): string {
    if (difficulty === DifficultyLevel.EXTREME || difficulty === DifficultyLevel.LEGENDARY) {
      if (impact === 'low') return 'medium';
      if (impact === 'medium') return 'high';
    }
    
    return impact;
  }
}

export default ExplorationService;