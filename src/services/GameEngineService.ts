import { GameState, GamePhase, PlayerResources, Property } from '../types/game-state';
import { Tenant } from '../types/tenant-system';
import { MarketEvent, MarketAnalysis } from '../types/market';
import { ExplorationMission, Equipment, EquipmentStatus } from '../types/exploration';

// 事件总线接口
export interface EventBus {
  emit(eventName: string, payload?: any): void;
  on(eventName: string, callback: (payload?: any) => void): void;
  off(eventName: string, callback: (payload?: any) => void): void;
}

// 简单事件总线实现
export class SimpleEventBus implements EventBus {
  private events: Map<string, Array<(payload?: any) => void>> = new Map();

  emit(eventName: string, payload?: any): void {
    const handlers = this.events.get(eventName);
    if (handlers) {
      handlers.forEach(handler => handler(payload));
    }
  }

  on(eventName: string, callback: (payload?: any) => void): void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName)!.push(callback);
  }

  off(eventName: string, callback: (payload?: any) => void): void {
    const handlers = this.events.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(callback);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }
}

// 调度器接口
export interface Scheduler {
  schedule(taskId: string, callback: () => void, delay: number): void;
  cancel(taskId: string): void;
  update(deltaTime: number): void;
}

// 简单调度器实现
export class SimpleScheduler implements Scheduler {
  private tasks: Map<string, { callback: () => void; remainingTime: number }> = new Map();

  schedule(taskId: string, callback: () => void, delay: number): void {
    this.tasks.set(taskId, { callback, remainingTime: delay });
  }

  cancel(taskId: string): void {
    this.tasks.delete(taskId);
  }

  update(deltaTime: number): void {
    this.tasks.forEach((task, taskId) => {
      task.remainingTime -= deltaTime;
      if (task.remainingTime <= 0) {
        task.callback();
        this.tasks.delete(taskId);
      }
    });
  }
}

// 子引擎接口
export interface SubEngine {
  initialize(gameState: GameState, eventBus: EventBus): void;
  update(deltaTime: number): void;
  cleanup(): void;
}

// 租户引擎实现
export class TenantEngine implements SubEngine {
  private gameState: GameState | null = null;
  private eventBus: EventBus | null = null;
  private scheduler: Scheduler = new SimpleScheduler();

  initialize(gameState: GameState, eventBus: EventBus): void {
    this.gameState = gameState;
    this.eventBus = eventBus;

    // 监听相关事件
    this.eventBus.on('tenant:added', this.handleTenantAdded.bind(this));
    this.eventBus.on('tenant:removed', this.handleTenantRemoved.bind(this));
    this.eventBus.on('day:advanced', this.handleDayAdvanced.bind(this));
  }

  update(deltaTime: number): void {
    if (!this.gameState) return;
    
    // 更新调度器
    this.scheduler.update(deltaTime);
    
    // 更新租户状态
    this.updateTenantSatisfaction();
    this.checkRentPayments();
    this.simulateTenantInteractions();
  }

  cleanup(): void {
    if (this.eventBus) {
      this.eventBus.off('tenant:added', this.handleTenantAdded.bind(this));
      this.eventBus.off('tenant:removed', this.handleTenantRemoved.bind(this));
      this.eventBus.off('day:advanced', this.handleDayAdvanced.bind(this));
    }
    this.gameState = null;
    this.eventBus = null;
  }

  private handleTenantAdded(tenant: Tenant): void {
    // 处理新租户加入逻辑
    console.log(`新租户加入: ${tenant.name}`);
  }

  private handleTenantRemoved(tenantId: string): void {
    // 处理租户离开逻辑
    console.log(`租户离开: ${tenantId}`);
  }

  private handleDayAdvanced(): void {
    // 每日更新租户状态
    this.updateTenantSatisfaction();
    this.checkRentPayments();
  }

  private updateTenantSatisfaction(): void {
    if (!this.gameState) return;
    
    this.gameState.tenants.forEach(tenant => {
      // 基于多种因素计算满意度变化
      let satisfactionChange = 0;
      
      // 基于物业状况
      const tenantProperties = this.gameState!.properties.filter(p => 
        tenant.propertyIds.includes(p.id)
      );
      
      if (tenantProperties.length > 0) {
        const avgCondition = tenantProperties.reduce((sum, p) => sum + p.condition, 0) / tenantProperties.length;
        satisfactionChange += (avgCondition - 50) / 10; // 物业状况影响
      }
      
      // 基于租金合理性
      const rentRatio = tenant.financials.monthlyRent / tenant.financials.income;
      if (rentRatio > 0.4) satisfactionChange -= (rentRatio - 0.4) * 10;
      
      // 基于投诉处理
      if (tenant.complaints.length > 0) {
        const unresolvedComplaints = tenant.complaints.filter((c: any) => !c.resolved);
        satisfactionChange -= unresolvedComplaints.length * 2;
      }
      
      // 更新满意度
      const newSatisfaction = Math.max(0, Math.min(100, tenant.satisfaction + satisfactionChange));
      
      if (newSatisfaction !== tenant.satisfaction) {
        // 通过事件总线发送满意度变化事件
        this.eventBus?.emit('tenant:satisfaction_changed', {
          tenantId: tenant.id,
          oldValue: tenant.satisfaction,
          newValue: newSatisfaction
        });
      }
    });
  }

  private checkRentPayments(): void {
    if (!this.gameState) return;
    
    const today = this.gameState.gameDay;
    
    this.gameState.tenants.forEach(tenant => {
      // 检查是否为租金支付日
      const paymentDay = new Date(tenant.moveInDate).getDate();
      
      if (today % 30 === paymentDay % 30) { // 简化的月租支付检查
        const willPay = tenant.satisfaction > 30; // 满意度低的租户可能拒绝支付
        
        if (willPay) {
          const rentAmount = tenant.financials.monthlyRent;
          
          // 通过事件总线发送租金支付事件
          this.eventBus?.emit('tenant:rent_paid', {
            tenantId: tenant.id,
            amount: rentAmount
          });
        } else {
          // 通过事件总线发送租金拖欠事件
          this.eventBus?.emit('tenant:rent_missed', {
            tenantId: tenant.id,
            amount: tenant.financials.monthlyRent
          });
        }
      }
    });
  }

  private simulateTenantInteractions(): void {
    if (!this.gameState || this.gameState.tenants.length < 2) return;
    
    // 随机选择两个租户进行互动
    const tenantCount = this.gameState.tenants.length;
    const index1 = Math.floor(Math.random() * tenantCount);
    let index2 = Math.floor(Math.random() * (tenantCount - 1));
    if (index2 >= index1) index2++;
    
    const tenant1 = this.gameState.tenants[index1];
    const tenant2 = this.gameState.tenants[index2];
    
    // 检查是否住在同一物业
    const shareProperty = tenant1.propertyId === tenant2.propertyId;
    
    if (shareProperty) {
      // 计算互动结果
      const compatibilityScore = this.calculateCompatibility(tenant1, tenant2);
      
      if (compatibilityScore > 70) {
        // 积极互动
        this.eventBus?.emit('tenant:positive_interaction', {
          tenant1Id: tenant1.id,
          tenant2Id: tenant2.id,
          compatibilityScore
        });
      } else if (compatibilityScore < 30) {
        // 消极互动
        this.eventBus?.emit('tenant:negative_interaction', {
          tenant1Id: tenant1.id,
          tenant2Id: tenant2.id,
          compatibilityScore
        });
      }
    }
  }

  private calculateCompatibility(tenant1: Tenant, tenant2: Tenant): number {
    // 基于性格特征计算兼容性
    let score = 50; // 基础分
    
    // 性格特征匹配度
    const personalityMatch = tenant1.personalityTraits.filter(trait => 
      tenant2.personalityTraits.includes(trait)
    ).length;
    
    score += personalityMatch * 10;
    
    // 生活习惯匹配度
    const lifestyleMatch = tenant1.lifestylePattern.noiseLevel === tenant2.lifestylePattern.noiseLevel ? 10 : -10;
    score += lifestyleMatch;
    
    // 偏好匹配度
    // 比较关键偏好是否匹配
    let preferenceMatch = 0;
    
    // 检查位置偏好匹配
    if (tenant1.preferences.locationPreferences.quietArea === tenant2.preferences.locationPreferences.quietArea) {
      preferenceMatch += 5;
    }
    
    // 检查设施偏好
    if (tenant1.preferences.needsParking === tenant2.preferences.needsParking) {
      preferenceMatch += 5;
    }
    
    // 检查宠物和吸烟偏好
    if (tenant1.preferences.petFriendly === tenant2.preferences.petFriendly) {
      preferenceMatch += 5;
    }
    
    if (tenant1.preferences.smokingAllowed === tenant2.preferences.smokingAllowed) {
      preferenceMatch += 5;
    }
    
    score += preferenceMatch;
    
    return Math.max(0, Math.min(100, score));
  }
}

// 市场引擎实现
export class MarketEngine implements SubEngine {
  private gameState: GameState | null = null;
  private eventBus: EventBus | null = null;
  private scheduler: Scheduler = new SimpleScheduler();
  private marketTrends: MarketAnalysis | null = null;

  initialize(gameState: GameState, eventBus: EventBus): void {
    this.gameState = gameState;
    this.eventBus = eventBus;
    this.marketTrends = gameState.marketConditions.trends[0] || null;

    // 监听相关事件
    this.eventBus.on('day:advanced', this.handleDayAdvanced.bind(this));
    this.eventBus.on('market:item_purchased', this.handleItemPurchased.bind(this));
    
    // 每周更新市场趋势
    this.scheduler.schedule('update_market_trends', this.updateMarketTrends.bind(this), 7);
  }

  update(deltaTime: number): void {
    if (!this.gameState) return;
    
    // 更新调度器
    this.scheduler.update(deltaTime);
    
    // 随机市场事件
    this.checkRandomMarketEvents();
  }

  cleanup(): void {
    if (this.eventBus) {
      this.eventBus.off('day:advanced', this.handleDayAdvanced.bind(this));
      this.eventBus.off('market:item_purchased', this.handleItemPurchased.bind(this));
    }
    this.gameState = null;
    this.eventBus = null;
  }

  private handleDayAdvanced(): void {
    // 每日更新市场状态
    this.updatePrices();
  }

  private handleItemPurchased(data: { itemId: string; quantity: number }): void {
    // 处理物品购买对市场的影响
    console.log(`物品购买: ${data.itemId}, 数量: ${data.quantity}`);
  }

  private updateMarketTrends(): void {
    if (!this.gameState) return;
    
    // 生成新的市场趋势
    const newTrend: MarketAnalysis = {
      overallTrend: this.generateOverallTrend(),
      priceIndex: this.calculatePriceIndex(),
      demandIndex: this.calculateDemandIndex(),
      supplyIndex: this.calculateSupplyIndex(),
      volatilityIndex: Math.floor(Math.random() * 30),
      seasonalFactors: this.calculateSeasonalFactors(),
      categoryTrends: this.calculateCategoryTrends(),
      predictions: this.generatePredictions()
    };
    
    this.marketTrends = newTrend;
    
    // 通过事件总线发送市场趋势更新事件
    this.eventBus?.emit('market:trends_updated', newTrend);
    
    // 重新调度下一次更新
    this.scheduler.schedule('update_market_trends', this.updateMarketTrends.bind(this), 7);
  }

  private updatePrices(): void {
    if (!this.gameState || !this.marketTrends) return;
    
    // 基于市场趋势更新价格
    const suppliers = this.gameState.suppliers;
    
    suppliers.forEach(supplier => {
      supplier.services.forEach(() => {
        // 基于趋势调整价格
        let priceAdjustment = 0;
        
        if (this.marketTrends!.overallTrend === 'rising') {
          priceAdjustment = Math.random() * 0.05; // 上涨最多5%
        } else if (this.marketTrends!.overallTrend === 'falling') {
          priceAdjustment = -Math.random() * 0.05; // 下跌最多5%
        } else {
          priceAdjustment = (Math.random() - 0.5) * 0.02; // 波动±1%
        }
        
        // 应用类别特定趋势
        const categoryTrend = this.marketTrends!.categoryTrends[supplier.type] || 0;
        priceAdjustment += categoryTrend / 100;
        
        // 应用季节性因素
        const month = Math.floor(this.gameState!.gameDay / 30) % 12;
        const seasonalFactor = this.marketTrends!.seasonalFactors[month] || 0;
        priceAdjustment += seasonalFactor / 100;
        
        // 更新价格
        // 注意：这里只是模拟，实际游戏中需要更新具体的价格数据结构
      });
      
      // 通过事件总线发送供应商价格更新事件
      this.eventBus?.emit('market:supplier_prices_updated', {
        supplierId: supplier.id
      });
    });
  }

  private checkRandomMarketEvents(): void {
    if (!this.gameState) return;
    
    // 随机触发市场事件
    const eventChance = 0.01; // 每次更新1%的几率
    
    if (Math.random() < eventChance) {
      // 定义符合MarketEvent.type类型的事件类型
      const eventTypes: ('economic' | 'policy' | 'natural' | 'social' | 'technological')[] = [
        'economic',
        'policy',
        'natural',
        'social',
        'technological'
      ];
      
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const eventMagnitude = Math.floor(Math.random() * 3) + 1; // 1-3级影响
      
      const marketEvent: MarketEvent = {
        id: `event_${Date.now()}`,
        type: eventType,
        name: `${eventType}事件`,
        description: `市场发生了${eventType}类型事件，影响程度为${eventMagnitude}级。`,
        impact: {
          priceChange: (Math.random() - 0.5) * eventMagnitude * 20, // -10% to +10% per magnitude
          demandChange: (Math.random() - 0.5) * eventMagnitude * 15,
          availabilityChange: (Math.random() - 0.5) * eventMagnitude * 10
        },
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 7,
        affectedSectors: ['property', 'construction', 'services'],
        affectedRegions: ['all']
      };
      
      // 通过事件总线发送市场事件
      this.eventBus?.emit('market:event_occurred', marketEvent);
    }
  }

  private generateOverallTrend(): 'rising' | 'falling' | 'stable' {
    const rand = Math.random();
    if (rand < 0.33) return 'rising';
    if (rand < 0.66) return 'falling';
    return 'stable';
  }

  private calculatePriceIndex(): number {
    return Math.floor(Math.random() * 50) + 75; // 75-125范围
  }

  private calculateDemandIndex(): number {
    return Math.floor(Math.random() * 50) + 75; // 75-125范围
  }

  private calculateSupplyIndex(): number {
    return Math.floor(Math.random() * 50) + 75; // 75-125范围
  }

  private calculateSeasonalFactors(): Record<number, number> {
    const factors: Record<number, number> = {};
    
    // 为每个月生成季节性因素 (-10 到 +10)
    for (let month = 0; month < 12; month++) {
      factors[month] = Math.floor(Math.random() * 21) - 10;
    }
    
    return factors;
  }

  private calculateCategoryTrends(): Record<string, number> {
    const trends: Record<string, number> = {};
    
    // 为每个供应商类型生成趋势 (-10 到 +10)
    const supplierTypes = [
      'CONSTRUCTION',
      'MAINTENANCE',
      'FURNITURE',
      'APPLIANCE',
      'SECURITY',
      'CLEANING',
      'LANDSCAPING',
      'UTILITY'
    ];
    
    supplierTypes.forEach(type => {
      trends[type] = Math.floor(Math.random() * 21) - 10;
    });
    
    return trends;
  }

  private generatePredictions(): Array<{ category: string; prediction: string; confidence: number }> {
    const predictions = [];
    
    // 生成一些市场预测
    const categories = [
      'CONSTRUCTION',
      'MAINTENANCE',
      'FURNITURE',
      'APPLIANCE'
    ];
    
    const predictionTexts = [
      '价格将上涨',
      '价格将下跌',
      '需求将增加',
      '需求将减少',
      '供应将紧张',
      '供应将充足'
    ];
    
    // 随机选择2-4个类别进行预测
    const numPredictions = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < numPredictions; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const prediction = predictionTexts[Math.floor(Math.random() * predictionTexts.length)];
      const confidence = Math.floor(Math.random() * 50) + 50; // 50-100%的置信度
      
      predictions.push({ category, prediction, confidence });
    }
    
    return predictions;
  }
}

// 探险引擎实现
export class ExplorationEngine implements SubEngine {
  private gameState: GameState | null = null;
  private eventBus: EventBus | null = null;
  private scheduler: Scheduler = new SimpleScheduler();
  private activeExpeditions: Map<string, { mission: ExplorationMission; endTime: number }> = new Map();

  initialize(gameState: GameState, eventBus: EventBus): void {
    this.gameState = gameState;
    this.eventBus = eventBus;

    // 监听相关事件
    this.eventBus.on('exploration:start', this.handleExplorationStart.bind(this));
    this.eventBus.on('day:advanced', this.handleDayAdvanced.bind(this));
  }

  update(deltaTime: number): void {
    if (!this.gameState) return;
    
    // 更新调度器
    this.scheduler.update(deltaTime);
    
    // 检查探险完成情况
    this.checkExpeditionCompletions();
  }

  cleanup(): void {
    if (this.eventBus) {
      this.eventBus.off('exploration:start', this.handleExplorationStart.bind(this));
      this.eventBus.off('day:advanced', this.handleDayAdvanced.bind(this));
    }
    this.gameState = null;
    this.eventBus = null;
  }

  private handleExplorationStart(mission: ExplorationMission): void {
    // 处理开始探险
    console.log(`开始探险: ${mission.name}`);
    
    // 计算探险结束时间
    const endTime = this.gameState!.gameDay + mission.duration;
    
    // 添加到活跃探险列表
    this.activeExpeditions.set(mission.id, { mission, endTime });
    
    // 调度探险完成事件
    this.scheduler.schedule(
      `exploration_complete_${mission.id}`,
      () => this.completeExploration(mission.id),
      mission.duration
    );
    
    // 通过事件总线发送探险开始事件
    this.eventBus?.emit('exploration:started', mission);
  }

  private handleDayAdvanced(): void {
    // 每日更新探险状态
    this.checkExpeditionCompletions();
  }

  private checkExpeditionCompletions(): void {
    if (!this.gameState) return;
    
    const currentDay = this.gameState.gameDay;
    
    this.activeExpeditions.forEach((expedition, id) => {
      if (currentDay >= expedition.endTime) {
        this.completeExploration(id);
      }
    });
  }

  private completeExploration(missionId: string): void {
    const expedition = this.activeExpeditions.get(missionId);
    if (!expedition) return;
    
    // 计算探险结果
    const result = this.calculateExplorationResult(expedition.mission);
    
    // 从活跃探险中移除
    this.activeExpeditions.delete(missionId);
    
    // 通过事件总线发送探险完成事件
    this.eventBus?.emit('exploration:completed', {
      mission: expedition.mission,
      result
    });
  }

  private calculateExplorationResult(mission: ExplorationMission): any {
    // 计算探险成功率
    let successChance = mission.baseSuccessRate;
    
    // 考虑玩家装备
    if (this.gameState && this.gameState.player) {
      // 获取任务所需的主要技能
      const requiredSkill = mission.recommendedSkills.length > 0 ? mission.recommendedSkills[0] : null;
      
      const relevantEquipment = this.gameState.equipment.filter(e => 
        e.status === 'EQUIPPED' && requiredSkill && e.bonuses.some((b: any) => b.type === requiredSkill)
      );
      
      // 装备加成
      relevantEquipment.forEach(equipment => {
        const bonus = equipment.bonuses.find((b: any) => b.type === requiredSkill);
        if (bonus) {
          successChance += bonus.value;
        }
      });
      
      // 技能加成
      if (requiredSkill) {
        const skillCategory = this.gameState.skills.categories[requiredSkill.toLowerCase()];
        if (skillCategory) {
          successChance += skillCategory.totalPoints * 2;
        }
      }
    }
    
    // 限制在0-100范围内
    successChance = Math.max(0, Math.min(100, successChance));
    
    // 确定是否成功
    const isSuccess = Math.random() * 100 < successChance;
    
    // 生成奖励
    const rewards = isSuccess ? this.generateRewards(mission) : [];
    
    return {
      isSuccess,
      successChance,
      rewards,
      experienceGained: isSuccess ? this.calculateExperienceReward(mission) : Math.floor(this.calculateExperienceReward(mission) / 4),
      message: isSuccess 
        ? `探险成功！你获得了${rewards.length}个奖励。` 
        : '探险失败。获得了一些经验，但没有奖励。'
    };
  }

  private getDifficultyMultiplier(difficulty: any): number {
    switch (difficulty) {
      case 'easy': return 1;
      case 'normal': return 2;
      case 'hard': return 3;
      case 'expert': return 4;
      case 'legendary': return 5;
      default: return 2;
    }
  }

  private calculateExperienceReward(mission: any): number {
    // 基于任务难度和持续时间计算经验值奖励
    const difficultyMultiplier = this.getDifficultyMultiplier(mission.difficulty);
    const baseExperience = 50; // 基础经验值
    return Math.floor(baseExperience * difficultyMultiplier * (1 + mission.duration / 10));
  }

  private generateRewards(mission: ExplorationMission): any[] {
    const rewards = [];
    
    // 根据任务难度和类型生成奖励
    const rewardCount = Math.floor(Math.random() * 3) + 1; // 1-3个奖励
    
    for (let i = 0; i < rewardCount; i++) {
      const rewardType = Math.random() < 0.7 ? 'RESOURCE' : 'EQUIPMENT';
      
      if (rewardType === 'RESOURCE') {
        const resources = ['cash', 'reputation', 'influence'];
        const resource = resources[Math.floor(Math.random() * resources.length)];
        const difficultyMultiplier = this.getDifficultyMultiplier(mission.difficulty);
        const amount = difficultyMultiplier * (Math.floor(Math.random() * 100) + 50);
        
        rewards.push({
          type: 'RESOURCE',
          resource,
          amount
        });
      } else {
        // 生成装备奖励
        const equipmentTypes = ['TOOL', 'GEAR', 'ACCESSORY'];
        const rarities = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC'];
        
        // 难度越高，越可能获得稀有装备
        const rarityIndex = Math.min(
          rarities.length - 1,
          Math.floor(Math.random() * this.getDifficultyMultiplier(mission.difficulty))
        );
        
        rewards.push({
          type: 'EQUIPMENT',
          equipmentType: equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)],
          rarity: rarities[rarityIndex],
          bonusValue: Math.floor(Math.random() * 10) + rarityIndex * 5 + 1
        });
      }
    }
    
    return rewards;
  }
}

// 游戏引擎服务
export class GameEngineService {
  private gameState: GameState | null = null;
  private eventBus: EventBus;
  private scheduler: Scheduler;
  private subEngines: Map<string, SubEngine>;
  private lastUpdateTime: number;
  private isRunning: boolean;
  private saveInterval: number;
  private lastSaveTime: number;

  constructor() {
    this.eventBus = new SimpleEventBus();
    this.scheduler = new SimpleScheduler();
    this.subEngines = new Map();
    this.lastUpdateTime = Date.now();
    this.isRunning = false;
    this.saveInterval = 5 * 60 * 1000; // 5分钟自动保存
    this.lastSaveTime = Date.now();
    
    // 初始化子引擎
    this.subEngines.set('tenant', new TenantEngine());
    this.subEngines.set('market', new MarketEngine());
    this.subEngines.set('exploration', new ExplorationEngine());
  }

  // 初始化游戏引擎
  initialize(gameState: GameState): void {
    this.gameState = gameState;
    
    // 初始化所有子引擎
    this.subEngines.forEach(engine => {
      engine.initialize(gameState, this.eventBus);
    });
    
    // 设置事件监听
    this.setupEventListeners();
    
    console.log('游戏引擎初始化完成');
  }

  // 启动游戏循环
  start(): void {
    if (this.isRunning || !this.gameState) return;
    
    this.isRunning = true;
    this.lastUpdateTime = Date.now();
    
    // 启动游戏循环
    this.gameLoop();
    
    console.log('游戏引擎启动');
  }

  // 暂停游戏
  pause(): void {
    this.isRunning = false;
    console.log('游戏引擎暂停');
  }

  // 恢复游戏
  resume(): void {
    if (this.isRunning || !this.gameState) return;
    
    this.isRunning = true;
    this.lastUpdateTime = Date.now();
    
    // 重新启动游戏循环
    this.gameLoop();
    
    console.log('游戏引擎恢复');
  }

  // 停止游戏
  stop(): void {
    this.isRunning = false;
    
    // 清理所有子引擎
    this.subEngines.forEach(engine => {
      engine.cleanup();
    });
    
    this.gameState = null;
    
    console.log('游戏引擎停止');
  }

  // 保存游戏
  saveGame(): void {
    if (!this.gameState) return;
    
    try {
      const saveData = {
        ...this.gameState,
        lastSavedAt: new Date().toISOString()
      };
      
      localStorage.setItem('wy2027_game_save', JSON.stringify(saveData));
      this.lastSaveTime = Date.now();
      
      console.log('游戏已保存');
      
      // 发送保存成功事件
      this.eventBus.emit('game:saved', { timestamp: saveData.lastSavedAt });
    } catch (error) {
      console.error('保存游戏失败:', error);
      
      // 发送保存失败事件
      this.eventBus.emit('game:save_failed', { error });
    }
  }

  // 加载游戏
  loadGame(): GameState | null {
    try {
      const savedGame = localStorage.getItem('wy2027_game_save');
      
      if (savedGame) {
        const gameData = JSON.parse(savedGame) as GameState;
        return gameData;
      }
    } catch (error) {
      console.error('加载游戏失败:', error);
    }
    
    return null;
  }

  // 推进游戏天数
  advanceDay(): void {
    if (!this.gameState) return;
    
    // 更新游戏天数
    this.gameState.gameDay += 1;
    
    // 发送天数推进事件
    this.eventBus.emit('day:advanced', { day: this.gameState.gameDay });
    
    console.log(`游戏推进到第${this.gameState.gameDay}天`);
  }

  // 切换游戏阶段
  switchPhase(phase: GamePhase): void {
    if (!this.gameState) return;
    
    const oldPhase = this.gameState.currentPhase;
    this.gameState.currentPhase = phase;
    
    // 发送阶段切换事件
    this.eventBus.emit('game:phase_changed', { oldPhase, newPhase: phase });
    
    console.log(`游戏阶段从${oldPhase}切换到${phase}`);
  }

  // 注册事件监听器
  on(eventName: string, callback: (payload?: any) => void): void {
    this.eventBus.on(eventName, callback);
  }

  // 移除事件监听器
  off(eventName: string, callback: (payload?: any) => void): void {
    this.eventBus.off(eventName, callback);
  }

  // 触发事件
  emit(eventName: string, payload?: any): void {
    this.eventBus.emit(eventName, payload);
  }

  // 获取当前游戏状态
  getGameState(): GameState | null {
    return this.gameState;
  }

  // 更新玩家资源
  updatePlayerResources(resources: Partial<PlayerResources>): void {
    if (!this.gameState || !this.gameState.player) return;
    
    const oldResources = { ...this.gameState.player.resources };
    
    // 更新资源
    Object.entries(resources).forEach(([key, value]) => {
      if (key in this.gameState!.player.resources) {
        (this.gameState!.player.resources as any)[key] += value;
      }
    });
    
    // 发送资源更新事件
    this.eventBus.emit('player:resources_updated', {
      oldResources,
      newResources: this.gameState.player.resources,
      changes: resources
    });
  }

  // 添加物业
  addProperty(property: Property): void {
    if (!this.gameState) return;
    
    this.gameState.properties.push(property);
    
    // 更新玩家统计数据
    this.gameState.player.statistics.totalPropertiesOwned += 1;
    
    // 发送物业添加事件
    this.eventBus.emit('property:added', property);
  }

  // 添加租户
  addTenant(tenant: Tenant): void {
    if (!this.gameState) return;
    
    this.gameState.tenants.push(tenant);
    
    // 更新玩家统计数据
    this.gameState.player.statistics.totalTenantsManaged += 1;
    
    // 发送租户添加事件
    this.eventBus.emit('tenant:added', tenant);
  }

  // 添加装备
  addEquipment(equipment: Equipment): void {
    if (!this.gameState) return;
    
    this.gameState.equipment.push(equipment);
    
    // 发送装备添加事件
    this.eventBus.emit('equipment:added', equipment);
  }

  // 执行探险任务
  executeExploration(mission: ExplorationMission): void {
    if (!this.gameState) return;
    
    // 添加到活跃任务
    this.gameState.activeMissions.push(mission);
    
    // 更新玩家统计数据
    this.gameState.player.statistics.explorationsMissions += 1;
    
    // 发送探险开始事件
    this.eventBus.emit('exploration:start', mission);
  }

  // 完成成就
  completeAchievement(achievementId: string): void {
    if (!this.gameState) return;
    
    const achievement = this.gameState.achievements.find(a => a.id === achievementId);
    
    if (achievement && !achievement.completed) {
      achievement.completed = true;
      achievement.completedDate = new Date().toISOString();
      
      // 添加到玩家成就列表
      this.gameState.player.achievements.push(achievementId);
      
      // 发送成就完成事件
      this.eventBus.emit('achievement:completed', achievement);
    }
  }

  // 私有方法：游戏循环
  private gameLoop(): void {
    if (!this.isRunning || !this.gameState) return;
    
    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // 转换为秒
    this.lastUpdateTime = currentTime;
    
    // 更新所有子引擎
    this.subEngines.forEach(engine => {
      engine.update(deltaTime);
    });
    
    // 更新调度器
    this.scheduler.update(deltaTime);
    
    // 检查自动保存
    if (this.gameState.settings.autoSave && 
        currentTime - this.lastSaveTime > this.saveInterval) {
      this.saveGame();
    }
    
    // 更新游戏总游玩时间
    this.gameState.totalPlayTime += deltaTime;
    
    // 继续游戏循环
    requestAnimationFrame(() => this.gameLoop());
  }

  // 私有方法：设置事件监听器
  private setupEventListeners(): void {
    // 监听租金支付事件
    this.eventBus.on('tenant:rent_paid', ({ tenantId, amount }) => {
      if (!this.gameState) return;
      
      // 更新玩家现金
      this.updatePlayerResources({ cash: amount });
      
      // 更新统计数据
      this.gameState.player.statistics.totalRevenue += amount;
      this.gameState.player.statistics.totalProfit += amount;
      
      // 更新租户支付记录
      const tenant = this.gameState.tenants.find(t => t.id === tenantId);
      if (tenant) {
        tenant.financials.totalPaid += amount;
        tenant.financials.lastPaymentDate = new Date().toISOString();
      }
    });
    
    // 监听探险完成事件
    this.eventBus.on('exploration:completed', ({ mission, result }) => {
      if (!this.gameState) return;
      
      // 从活跃任务中移除
      this.gameState.activeMissions = this.gameState.activeMissions.filter(
        m => m.id !== mission.id
      );
      
      // 处理奖励
      if (result.isSuccess) {
        result.rewards.forEach((reward: any) => {
          if (reward.type === 'RESOURCE') {
            // 添加资源奖励
            const resources: Partial<PlayerResources> = {};
            resources[reward.resource as keyof PlayerResources] = reward.amount;
            this.updatePlayerResources(resources);
          } else if (reward.type === 'EQUIPMENT') {
            // 添加装备奖励
            const newEquipment: Equipment = {
              id: `equipment_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              name: `${reward.rarity} ${reward.equipmentType}`,
              type: reward.equipmentType,
              rarity: reward.rarity,
               status: EquipmentStatus.GOOD,
              bonuses: [{
                type: 'success_rate',
                value: reward.bonusValue,
                description: `提升${reward.bonusValue}%成功率`
              }],
              acquiredDate: new Date().toISOString(),
              lastUsedDate: undefined
            };
            
            this.addEquipment(newEquipment);
          }
        });
      }
      
      // 添加经验
      this.updatePlayerResources({ experience: result.experienceGained });
      
      // 检查是否需要升级
      this.checkLevelUp();
    });
    
    // 监听市场事件
    this.eventBus.on('market:event_occurred', (event: MarketEvent) => {
      if (!this.gameState) return;
      
      // 添加到随机事件列表
      this.gameState.randomEvents.push({
        id: event.id,
        type: 'market',
        name: event.type,
        description: event.description,
        startTime: event.startDate,
        duration: 7, // 7天
        effects: [{
          type: 'percentage',
          value: event.impact.priceChange,
          target: 'market'
        }],
        isActive: true
      });
    });
  }

  // 私有方法：检查玩家升级
  private checkLevelUp(): void {
    if (!this.gameState || !this.gameState.player) return;
    
    const player = this.gameState.player;
    const currentLevel = player.level;
    const currentExp = player.resources.experience;
    
    // 简单的升级公式：每级需要 level * 1000 经验
    const expNeeded = currentLevel * 1000;
    
    if (currentExp >= expNeeded) {
      // 升级
      player.level += 1;
      player.resources.experience -= expNeeded;
      
      // 奖励技能点
      this.gameState.skills.availablePoints += 3;
      
      // 发送升级事件
      this.eventBus.emit('player:level_up', {
        oldLevel: currentLevel,
        newLevel: player.level,
        skillPointsGained: 3
      });
      
      // 递归检查是否可以再次升级
      this.checkLevelUp();
    }
  }
}

// 导出单例实例
export const gameEngine = new GameEngineService();