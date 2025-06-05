# 物业管理模拟器 - 技术架构设计

## 架构概览

本文档详细描述了物业管理模拟器的技术架构设计，支持五大核心游戏循环的复合型策略游戏架构。

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    用户界面层 (UI Layer)                     │
├─────────────────────────────────────────────────────────────┤
│  React Components │ Ant Design │ CSS Modules │ Responsive   │
├─────────────────────────────────────────────────────────────┤
│                   状态管理层 (State Layer)                   │
├─────────────────────────────────────────────────────────────┤
│  Game Context │ Tenant Context │ Market Context │ Story Context │
├─────────────────────────────────────────────────────────────┤
│                   业务逻辑层 (Business Layer)                │
├─────────────────────────────────────────────────────────────┤
│ Game Engine │ Pricing Engine │ AI Engine │ Story Engine    │
├─────────────────────────────────────────────────────────────┤
│                   服务层 (Service Layer)                    │
├─────────────────────────────────────────────────────────────┤
│ Game Service │ Tenant Service │ Market Service │ Data Service │
├─────────────────────────────────────────────────────────────┤
│                   数据层 (Data Layer)                       │
├─────────────────────────────────────────────────────────────┤
│ Local Storage │ Session Storage │ IndexedDB │ JSON Files    │
└─────────────────────────────────────────────────────────────┘
```

## 核心模块设计

### 1. 游戏引擎 (Game Engine)

游戏引擎是整个系统的核心，负责协调各个子系统的运行。

```typescript
/**
 * 游戏引擎主类
 * 负责游戏循环、状态管理、事件调度
 */
class GameEngine {
  private gameState: GameState;
  private eventBus: EventBus;
  private schedulers: Map<string, Scheduler>;
  private engines: Map<string, SubEngine>;
  
  constructor() {
    this.gameState = new GameState();
    this.eventBus = new EventBus();
    this.schedulers = new Map();
    this.engines = new Map();
    
    this.initializeSubEngines();
    this.setupEventListeners();
  }
  
  /**
   * 初始化子引擎
   */
  private initializeSubEngines(): void {
    this.engines.set('tenant', new TenantEngine(this.eventBus));
    this.engines.set('pricing', new PricingEngine(this.eventBus));
    this.engines.set('market', new MarketEngine(this.eventBus));
    this.engines.set('exploration', new ExplorationEngine(this.eventBus));
    this.engines.set('auction', new AuctionEngine(this.eventBus));
    this.engines.set('story', new StoryEngine(this.eventBus));
  }
  
  /**
   * 游戏主循环
   */
  public gameLoop(deltaTime: number): void {
    // 更新所有子引擎
    this.engines.forEach(engine => engine.update(deltaTime));
    
    // 处理事件队列
    this.eventBus.processEvents();
    
    // 更新调度器
    this.schedulers.forEach(scheduler => scheduler.update(deltaTime));
    
    // 检查阶段切换条件
    this.checkPhaseTransition();
  }
  
  /**
   * 切换游戏阶段
   */
  public switchPhase(newPhase: GamePhase): void {
    const currentPhase = this.gameState.currentPhase;
    
    // 执行阶段退出逻辑
    this.engines.get(currentPhase)?.onPhaseExit();
    
    // 更新游戏状态
    this.gameState.currentPhase = newPhase;
    this.gameState.phaseStartTime = new Date();
    
    // 执行阶段进入逻辑
    this.engines.get(newPhase)?.onPhaseEnter();
    
    // 发布阶段切换事件
    this.eventBus.publish('phase_changed', {
      from: currentPhase,
      to: newPhase,
      timestamp: new Date()
    });
  }
}
```

### 2. 租户引擎 (Tenant Engine)

负责租户行为模拟、满意度计算、互动关系管理。

```typescript
/**
 * 租户引擎
 * 处理租户生态系统的所有逻辑
 */
class TenantEngine extends SubEngine {
  private tenants: Map<string, Tenant>;
  private interactions: TenantInteraction[];
  private satisfactionCalculator: SatisfactionCalculator;
  private behaviorSimulator: TenantBehaviorSimulator;
  
  constructor(eventBus: EventBus) {
    super(eventBus);
    this.tenants = new Map();
    this.interactions = [];
    this.satisfactionCalculator = new SatisfactionCalculator();
    this.behaviorSimulator = new TenantBehaviorSimulator();
  }
  
  /**
   * 更新租户状态
   */
  public update(deltaTime: number): void {
    // 更新所有租户的状态
    this.tenants.forEach(tenant => {
      this.updateTenantSatisfaction(tenant);
      this.simulateTenantBehavior(tenant, deltaTime);
      this.checkTenantEvents(tenant);
    });
    
    // 处理租户间互动
    this.processInteractions();
    
    // 检查租约到期
    this.checkLeaseExpirations();
  }
  
  /**
   * 计算租户满意度
   */
  private updateTenantSatisfaction(tenant: Tenant): void {
    const factors = this.gatherSatisfactionFactors(tenant);
    const newSatisfaction = this.satisfactionCalculator.calculate(tenant, factors);
    
    // 如果满意度发生显著变化，发布事件
    if (Math.abs(newSatisfaction - tenant.satisfactionLevel) > 5) {
      this.eventBus.publish('tenant_satisfaction_changed', {
        tenantId: tenant.id,
        oldSatisfaction: tenant.satisfactionLevel,
        newSatisfaction: newSatisfaction,
        factors: factors
      });
    }
    
    tenant.satisfactionLevel = newSatisfaction;
  }
  
  /**
   * 收集影响满意度的因素
   */
  private gatherSatisfactionFactors(tenant: Tenant): SatisfactionFactors {
    const property = this.getPropertyForTenant(tenant);
    const neighbors = this.getNeighbors(tenant);
    
    return {
      propertyCondition: property.condition,
      noiseLevel: this.calculateNoiseLevel(tenant, neighbors),
      securityLevel: property.securityLevel,
      amenityQuality: this.calculateAmenityQuality(property),
      serviceQuality: property.serviceQuality,
      communityAtmosphere: this.calculateCommunityAtmosphere(neighbors),
      priceValue: this.calculatePriceValue(tenant, property)
    };
  }
}

/**
 * 满意度计算器
 */
class SatisfactionCalculator {
  /**
   * 计算租户满意度
   */
  public calculate(tenant: Tenant, factors: SatisfactionFactors): number {
    const weights = this.getWeights(tenant.type);
    let satisfaction = 0;
    
    // 基础满意度计算
    satisfaction += factors.propertyCondition * weights.propertyCondition;
    satisfaction += this.calculateNoisePenalty(factors.noiseLevel, tenant.preferences.noise_tolerance) * weights.noise;
    satisfaction += factors.securityLevel * weights.security;
    satisfaction += factors.amenityQuality * weights.amenity;
    satisfaction += factors.serviceQuality * weights.service;
    satisfaction += factors.communityAtmosphere * weights.community;
    satisfaction += factors.priceValue * weights.price;
    
    // 应用个性化调整
    satisfaction = this.applyPersonalityAdjustments(satisfaction, tenant);
    
    // 限制在0-100范围内
    return Math.max(0, Math.min(100, satisfaction));
  }
  
  /**
   * 获取不同租户类型的权重
   */
  private getWeights(tenantType: TenantCategory): SatisfactionWeights {
    const baseWeights: Record<TenantCategory, SatisfactionWeights> = {
      student: {
        propertyCondition: 0.15,
        noise: 0.10,
        security: 0.15,
        amenity: 0.20,
        service: 0.10,
        community: 0.20,
        price: 0.30
      },
      professional: {
        propertyCondition: 0.20,
        noise: 0.25,
        security: 0.20,
        amenity: 0.15,
        service: 0.15,
        community: 0.10,
        price: 0.15
      },
      family: {
        propertyCondition: 0.25,
        noise: 0.20,
        security: 0.25,
        amenity: 0.15,
        service: 0.10,
        community: 0.15,
        price: 0.10
      },
      enterprise: {
        propertyCondition: 0.20,
        noise: 0.15,
        security: 0.20,
        amenity: 0.10,
        service: 0.25,
        community: 0.05,
        price: 0.25
      },
      elderly: {
        propertyCondition: 0.20,
        noise: 0.30,
        security: 0.25,
        amenity: 0.15,
        service: 0.20,
        community: 0.15,
        price: 0.05
      }
    };
    
    return baseWeights[tenantType];
  }
}
```

### 3. 定价引擎 (Pricing Engine)

实现动态定价算法，考虑市场因素、租户因素、竞争因素等。

```typescript
/**
 * 动态定价引擎
 */
class PricingEngine extends SubEngine {
  private marketAnalyzer: MarketAnalyzer;
  private competitionAnalyzer: CompetitionAnalyzer;
  private demandPredictor: DemandPredictor;
  
  constructor(eventBus: EventBus) {
    super(eventBus);
    this.marketAnalyzer = new MarketAnalyzer();
    this.competitionAnalyzer = new CompetitionAnalyzer();
    this.demandPredictor = new DemandPredictor();
  }
  
  /**
   * 计算动态租金
   */
  public calculateDynamicRent(property: Property, tenant: Tenant, market: MarketState): number {
    // 基础租金
    const baseRent = this.calculateBaseRent(property);
    
    // 市场调整
    const marketMultiplier = this.calculateMarketMultiplier(property, market);
    
    // 竞争调整
    const competitionAdjustment = this.calculateCompetitionAdjustment(property);
    
    // 租户特定调整
    const tenantAdjustment = this.calculateTenantAdjustment(tenant, property);
    
    // 季节性调整
    const seasonalAdjustment = this.calculateSeasonalAdjustment(market.currentSeason);
    
    // 最终租金计算
    let finalRent = baseRent * marketMultiplier;
    finalRent += competitionAdjustment;
    finalRent *= (1 + tenantAdjustment);
    finalRent *= (1 + seasonalAdjustment);
    
    return Math.round(finalRent);
  }
  
  /**
   * 计算基础租金
   */
  private calculateBaseRent(property: Property): number {
    let baseRent = 0;
    
    // 面积因素
    baseRent += property.size * this.getPricePerSquareMeter(property.location);
    
    // 设施加成
    property.amenities.forEach(amenity => {
      baseRent += this.getAmenityValue(amenity);
    });
    
    // 物业条件调整
    baseRent *= (property.condition / 100);
    
    return baseRent;
  }
  
  /**
   * 计算市场乘数
   */
  private calculateMarketMultiplier(property: Property, market: MarketState): number {
    let multiplier = 1.0;
    
    // 整体需求影响
    multiplier *= (1 + (market.overallDemand - 50) / 100);
    
    // 物业类型趋势
    const typeTrend = market.priceTrends[property.type] || 0;
    multiplier *= (1 + typeTrend / 100);
    
    // 经济指标影响
    multiplier *= this.calculateEconomicImpact(market.economicIndicators);
    
    return multiplier;
  }
  
  /**
   * 预测租金趋势
   */
  public predictRentTrend(property: Property, timeHorizon: number): RentPrediction {
    const currentRent = this.calculateCurrentMarketRent(property);
    const marketTrends = this.marketAnalyzer.analyzeTrends();
    const demandForecast = this.demandPredictor.predict(property, timeHorizon);
    
    return {
      currentRent,
      predictedRent: this.calculatePredictedRent(currentRent, marketTrends, demandForecast),
      confidence: this.calculatePredictionConfidence(marketTrends, demandForecast),
      factors: this.identifyKeyFactors(marketTrends, demandForecast)
    };
  }
}
```

### 4. 市场引擎 (Market Engine)

模拟房地产市场动态，包括供需关系、价格波动、政策影响等。

```typescript
/**
 * 市场引擎
 */
class MarketEngine extends SubEngine {
  private marketState: MarketState;
  private economicSimulator: EconomicSimulator;
  private policySimulator: PolicySimulator;
  private eventGenerator: MarketEventGenerator;
  
  constructor(eventBus: EventBus) {
    super(eventBus);
    this.marketState = this.initializeMarketState();
    this.economicSimulator = new EconomicSimulator();
    this.policySimulator = new PolicySimulator();
    this.eventGenerator = new MarketEventGenerator();
  }
  
  /**
   * 更新市场状态
   */
  public update(deltaTime: number): void {
    // 更新经济指标
    this.updateEconomicIndicators(deltaTime);
    
    // 更新供需关系
    this.updateSupplyDemand();
    
    // 更新价格趋势
    this.updatePriceTrends();
    
    // 生成市场事件
    this.generateMarketEvents();
    
    // 应用政策影响
    this.applyPolicyEffects();
    
    // 更新季节性因素
    this.updateSeasonalFactors();
  }
  
  /**
   * 更新经济指标
   */
  private updateEconomicIndicators(deltaTime: number): void {
    const indicators = this.marketState.economicIndicators;
    
    // 利率变化
    indicators.interestRates += this.economicSimulator.calculateInterestRateChange(deltaTime);
    indicators.interestRates = Math.max(0, Math.min(20, indicators.interestRates));
    
    // 失业率变化
    indicators.unemploymentRate += this.economicSimulator.calculateUnemploymentChange(deltaTime);
    indicators.unemploymentRate = Math.max(0, Math.min(30, indicators.unemploymentRate));
    
    // 通胀率变化
    indicators.inflationRate += this.economicSimulator.calculateInflationChange(deltaTime);
    indicators.inflationRate = Math.max(-5, Math.min(15, indicators.inflationRate));
    
    // GDP增长率变化
    indicators.gdpGrowth += this.economicSimulator.calculateGDPChange(deltaTime);
    indicators.gdpGrowth = Math.max(-10, Math.min(15, indicators.gdpGrowth));
  }
  
  /**
   * 更新供需关系
   */
  private updateSupplyDemand(): void {
    const totalProperties = this.getTotalProperties();
    const totalDemand = this.calculateTotalDemand();
    
    // 计算供需比
    const supplyDemandRatio = totalProperties / totalDemand;
    
    // 更新整体需求
    if (supplyDemandRatio < 0.8) {
      this.marketState.overallDemand = Math.min(100, this.marketState.overallDemand + 2);
    } else if (supplyDemandRatio > 1.2) {
      this.marketState.overallDemand = Math.max(0, this.marketState.overallDemand - 2);
    }
  }
  
  /**
   * 生成市场事件
   */
  private generateMarketEvents(): void {
    const events = this.eventGenerator.generateEvents(this.marketState);
    
    events.forEach(event => {
      this.applyMarketEvent(event);
      this.eventBus.publish('market_event', event);
    });
  }
}

/**
 * 经济模拟器
 */
class EconomicSimulator {
  private economicCycles: EconomicCycle[];
  private currentCycle: EconomicCycle;
  
  constructor() {
    this.economicCycles = this.initializeEconomicCycles();
    this.currentCycle = this.economicCycles[0];
  }
  
  /**
   * 计算利率变化
   */
  public calculateInterestRateChange(deltaTime: number): number {
    const baseChange = this.currentCycle.interestRateTrend * deltaTime;
    const randomFactor = (Math.random() - 0.5) * 0.1;
    
    return baseChange + randomFactor;
  }
  
  /**
   * 计算失业率变化
   */
  public calculateUnemploymentChange(deltaTime: number): number {
    const baseChange = this.currentCycle.unemploymentTrend * deltaTime;
    const economicShock = this.calculateEconomicShock();
    
    return baseChange + economicShock;
  }
  
  /**
   * 计算经济冲击
   */
  private calculateEconomicShock(): number {
    // 低概率的经济冲击事件
    if (Math.random() < 0.001) {
      return (Math.random() - 0.5) * 5; // ±2.5%的冲击
    }
    return 0;
  }
}
```

### 5. 探险引擎 (Exploration Engine)

处理探险任务、装备系统、技能树等探险相关功能。

```typescript
/**
 * 探险引擎
 */
class ExplorationEngine extends SubEngine {
  private activeMissions: Map<string, ExplorationMission>;
  private equipmentManager: EquipmentManager;
  private skillManager: SkillManager;
  private missionGenerator: MissionGenerator;
  
  constructor(eventBus: EventBus) {
    super(eventBus);
    this.activeMissions = new Map();
    this.equipmentManager = new EquipmentManager();
    this.skillManager = new SkillManager();
    this.missionGenerator = new MissionGenerator();
  }
  
  /**
   * 开始探险任务
   */
  public startMission(mission: ExplorationMission, team: ExplorationTeam): void {
    // 验证任务要求
    if (!this.validateMissionRequirements(mission, team)) {
      throw new Error('Mission requirements not met');
    }
    
    // 计算成功率
    const successRate = this.calculateSuccessRate(mission, team);
    
    // 开始任务
    mission.status = 'in_progress';
    mission.startTime = new Date();
    mission.team = team;
    mission.calculatedSuccessRate = successRate;
    
    this.activeMissions.set(mission.id, mission);
    
    // 发布任务开始事件
    this.eventBus.publish('mission_started', {
      missionId: mission.id,
      successRate,
      estimatedDuration: mission.duration
    });
  }
  
  /**
   * 计算任务成功率
   */
  private calculateSuccessRate(mission: ExplorationMission, team: ExplorationTeam): number {
    let baseSuccessRate = 50; // 基础成功率50%
    
    // 技能加成
    const skillBonus = this.calculateSkillBonus(mission, team.skills);
    baseSuccessRate += skillBonus;
    
    // 装备加成
    const equipmentBonus = this.calculateEquipmentBonus(mission, team.equipment);
    baseSuccessRate += equipmentBonus;
    
    // 团队经验加成
    const experienceBonus = this.calculateExperienceBonus(team);
    baseSuccessRate += experienceBonus;
    
    // 任务难度惩罚
    const difficultyPenalty = (mission.difficulty - 5) * 5;
    baseSuccessRate -= difficultyPenalty;
    
    // 限制在10-95%范围内
    return Math.max(10, Math.min(95, baseSuccessRate));
  }
  
  /**
   * 执行任务结果
   */
  public executeMissionResult(missionId: string): ExplorationResult {
    const mission = this.activeMissions.get(missionId);
    if (!mission) {
      throw new Error('Mission not found');
    }
    
    const success = Math.random() * 100 < mission.calculatedSuccessRate!;
    
    const result: ExplorationResult = {
      missionId,
      success,
      rewardsEarned: success ? this.calculateRewards(mission) : this.calculateFailureCompensation(mission),
      discoveries: success ? this.generateDiscoveries(mission) : [],
      consequences: this.calculateConsequences(mission, success)
    };
    
    // 更新装备耐久度
    this.updateEquipmentDurability(mission.team!.equipment);
    
    // 获得经验
    this.awardExperience(mission.team!, result);
    
    // 移除完成的任务
    this.activeMissions.delete(missionId);
    
    // 发布任务完成事件
    this.eventBus.publish('mission_completed', result);
    
    return result;
  }
}

/**
 * 装备管理器
 */
class EquipmentManager {
  private equipment: Map<string, Equipment>;
  
  constructor() {
    this.equipment = new Map();
  }
  
  /**
   * 获取装备效果
   */
  public getEquipmentEffects(equipmentIds: string[]): EquipmentEffects {
    const effects: EquipmentEffects = {
      successRateBonus: 0,
      rewardMultiplier: 1,
      riskReduction: 0,
      costReduction: 0
    };
    
    equipmentIds.forEach(id => {
      const equipment = this.equipment.get(id);
      if (equipment && equipment.durability > 0) {
        effects.successRateBonus += equipment.effects.success_rate_bonus;
        effects.rewardMultiplier *= equipment.effects.reward_multiplier;
        effects.riskReduction += equipment.effects.risk_reduction;
        effects.costReduction += equipment.effects.cost_reduction;
      }
    });
    
    return effects;
  }
  
  /**
   * 更新装备耐久度
   */
  public updateDurability(equipmentIds: string[], usageIntensity: number): void {
    equipmentIds.forEach(id => {
      const equipment = this.equipment.get(id);
      if (equipment) {
        equipment.durability = Math.max(0, equipment.durability - usageIntensity);
        
        if (equipment.durability === 0) {
          this.eventBus.publish('equipment_broken', { equipmentId: id });
        }
      }
    });
  }
}
```

## 数据流架构

### 状态管理流程

```typescript
/**
 * 全局状态管理
 */
interface GlobalState {
  game: GameState;
  ui: UIState;
  user: UserState;
  cache: CacheState;
}

/**
 * 状态更新流程
 */
class StateManager {
  private state: GlobalState;
  private subscribers: Map<string, StateSubscriber[]>;
  private middleware: Middleware[];
  
  /**
   * 分发状态更新
   */
  public dispatch(action: Action): void {
    // 应用中间件
    let processedAction = action;
    this.middleware.forEach(middleware => {
      processedAction = middleware(processedAction, this.state);
    });
    
    // 更新状态
    const newState = this.reducer(this.state, processedAction);
    
    // 检查状态变化
    const changes = this.detectChanges(this.state, newState);
    
    // 更新状态
    this.state = newState;
    
    // 通知订阅者
    this.notifySubscribers(changes);
  }
  
  /**
   * 状态缓存策略
   */
  private cacheStrategy(key: string, data: any): void {
    const cacheConfig = this.getCacheConfig(key);
    
    if (cacheConfig.persistent) {
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      sessionStorage.setItem(key, JSON.stringify(data));
    }
    
    // 设置过期时间
    if (cacheConfig.ttl) {
      setTimeout(() => {
        this.invalidateCache(key);
      }, cacheConfig.ttl);
    }
  }
}
```

### 事件系统

```typescript
/**
 * 事件总线
 */
class EventBus {
  private listeners: Map<string, EventListener[]>;
  private eventQueue: GameEvent[];
  private processing: boolean;
  
  constructor() {
    this.listeners = new Map();
    this.eventQueue = [];
    this.processing = false;
  }
  
  /**
   * 发布事件
   */
  public publish(eventType: string, data: any): void {
    const event: GameEvent = {
      type: eventType,
      data,
      timestamp: new Date(),
      id: this.generateEventId()
    };
    
    this.eventQueue.push(event);
    
    // 如果不在处理中，立即处理
    if (!this.processing) {
      this.processEvents();
    }
  }
  
  /**
   * 处理事件队列
   */
  public processEvents(): void {
    this.processing = true;
    
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      this.processEvent(event);
    }
    
    this.processing = false;
  }
  
  /**
   * 处理单个事件
   */
  private processEvent(event: GameEvent): void {
    const listeners = this.listeners.get(event.type) || [];
    
    listeners.forEach(listener => {
      try {
        listener.handle(event);
      } catch (error) {
        console.error(`Error processing event ${event.type}:`, error);
      }
    });
  }
}
```

## 性能优化策略

### 1. 渲染优化

```typescript
/**
 * 虚拟化列表组件
 */
const VirtualizedTenantList: React.FC<{ tenants: Tenant[] }> = ({ tenants }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 计算可见范围
  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const itemHeight = 60; // 每个租户项的高度
    
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(tenants.length, start + Math.ceil(containerHeight / itemHeight) + 1);
    
    setVisibleRange({ start, end });
  }, [tenants.length]);
  
  // 监听滚动事件
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const throttledUpdate = throttle(updateVisibleRange, 16); // 60fps
    container.addEventListener('scroll', throttledUpdate);
    
    return () => container.removeEventListener('scroll', throttledUpdate);
  }, [updateVisibleRange]);
  
  // 渲染可见项
  const visibleTenants = tenants.slice(visibleRange.start, visibleRange.end);
  
  return (
    <div ref={containerRef} className="tenant-list-container">
      <div style={{ height: visibleRange.start * 60 }} /> {/* 上方占位 */}
      {visibleTenants.map(tenant => (
        <TenantItem key={tenant.id} tenant={tenant} />
      ))}
      <div style={{ height: (tenants.length - visibleRange.end) * 60 }} /> {/* 下方占位 */}
    </div>
  );
};
```

### 2. 内存管理

```typescript
/**
 * 内存管理器
 */
class MemoryManager {
  private cache: Map<string, CacheEntry>;
  private maxCacheSize: number;
  private gcInterval: number;
  
  constructor(maxCacheSize = 100, gcInterval = 60000) {
    this.cache = new Map();
    this.maxCacheSize = maxCacheSize;
    this.gcInterval = gcInterval;
    
    // 定期垃圾回收
    setInterval(() => this.garbageCollect(), gcInterval);
  }
  
  /**
   * 垃圾回收
   */
  private garbageCollect(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // 移除过期项
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    });
    
    // 如果缓存仍然过大，移除最旧的项
    if (this.cache.size > this.maxCacheSize) {
      const sortedEntries = entries
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
        .slice(0, this.cache.size - this.maxCacheSize);
      
      sortedEntries.forEach(([key]) => this.cache.delete(key));
    }
  }
}
```

### 3. 计算优化

```typescript
/**
 * 计算优化工具
 */
class ComputationOptimizer {
  private memoCache: Map<string, any>;
  private computationQueue: ComputationTask[];
  private worker: Worker;
  
  constructor() {
    this.memoCache = new Map();
    this.computationQueue = [];
    this.worker = new Worker('/workers/computation-worker.js');
  }
  
  /**
   * 记忆化计算
   */
  public memoize<T extends (...args: any[]) => any>(fn: T, keyGenerator?: (...args: Parameters<T>) => string): T {
    return ((...args: Parameters<T>) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      
      if (this.memoCache.has(key)) {
        return this.memoCache.get(key);
      }
      
      const result = fn(...args);
      this.memoCache.set(key, result);
      
      return result;
    }) as T;
  }
  
  /**
   * 异步计算
   */
  public async computeAsync<T>(task: ComputationTask): Promise<T> {
    return new Promise((resolve, reject) => {
      const taskId = this.generateTaskId();
      
      this.worker.postMessage({
        id: taskId,
        type: task.type,
        data: task.data
      });
      
      const handleMessage = (event: MessageEvent) => {
        if (event.data.id === taskId) {
          this.worker.removeEventListener('message', handleMessage);
          
          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data.result);
          }
        }
      };
      
      this.worker.addEventListener('message', handleMessage);
    });
  }
}
```

## 总结

这个技术架构设计提供了一个可扩展、高性能的游戏引擎架构，支持复杂的游戏逻辑和大量的数据处理。通过模块化设计、事件驱动架构、性能优化策略等，确保游戏能够提供流畅的用户体验。

关键特性：
1. **模块化架构**: 清晰的职责分离，便于维护和扩展
2. **事件驱动**: 松耦合的组件通信机制
3. **性能优化**: 多层次的性能优化策略
4. **状态管理**: 统一的状态管理和数据流
5. **可扩展性**: 支持插件和模块的动态加载

这个架构为物业管理模拟器的复杂游戏逻辑提供了坚实的技术基础。