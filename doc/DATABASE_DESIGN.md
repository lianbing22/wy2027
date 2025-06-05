# 物业管理模拟器 - 数据库设计

## 数据库架构概览

本文档详细描述了物业管理模拟器的数据存储设计，采用混合存储策略以满足不同类型数据的需求。

### 存储架构

```
┌─────────────────────────────────────────────────────────────┐
│                    前端存储层 (Frontend Storage)              │
├─────────────────────────────────────────────────────────────┤
│ Local Storage │ Session Storage │ IndexedDB │ Memory Cache   │
├─────────────────────────────────────────────────────────────┤
│                    数据同步层 (Sync Layer)                   │
├─────────────────────────────────────────────────────────────┤
│ Sync Manager │ Conflict Resolver │ Version Control │ Backup  │
├─────────────────────────────────────────────────────────────┤
│                    数据访问层 (Data Access Layer)            │
├─────────────────────────────────────────────────────────────┤
│ Repository Pattern │ Query Builder │ Transaction Manager     │
├─────────────────────────────────────────────────────────────┤
│                    数据模型层 (Data Model Layer)             │
├─────────────────────────────────────────────────────────────┤
│ Entity Models │ Value Objects │ Aggregates │ Domain Events  │
└─────────────────────────────────────────────────────────────┘
```

## 核心数据模型

### 1. 玩家数据模型

```typescript
/**
 * 玩家档案
 */
interface PlayerProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: PlayerPreferences;
  statistics: PlayerStatistics;
  achievements: Achievement[];
  settings: GameSettings;
}

/**
 * 玩家偏好设置
 */
interface PlayerPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  soundEnabled: boolean;
  musicEnabled: boolean;
  notificationsEnabled: boolean;
  autoSave: boolean;
  autoSaveInterval: number; // 分钟
  difficultyLevel: 'easy' | 'normal' | 'hard' | 'expert';
}

/**
 * 玩家统计数据
 */
interface PlayerStatistics {
  totalPlayTime: number; // 秒
  gamesPlayed: number;
  gamesWon: number;
  totalRevenue: number;
  totalExpenses: number;
  propertiesOwned: number;
  tenantsManaged: number;
  explorationsCompleted: number;
  auctionsWon: number;
  achievementsUnlocked: number;
  highestNetWorth: number;
  longestPlaySession: number; // 秒
}

/**
 * 游戏设置
 */
interface GameSettings {
  autoAdvancePhases: boolean;
  showTutorials: boolean;
  enableRandomEvents: boolean;
  marketVolatility: 'low' | 'medium' | 'high';
  tenantComplexity: 'simple' | 'realistic' | 'complex';
  economicRealism: 'arcade' | 'balanced' | 'realistic';
}
```

### 2. 游戏状态数据模型

```typescript
/**
 * 游戏存档
 */
interface GameSave {
  id: string;
  playerId: string;
  saveName: string;
  gameState: GameState;
  metadata: SaveMetadata;
  createdAt: Date;
  updatedAt: Date;
  version: string;
  checksum: string;
}

/**
 * 存档元数据
 */
interface SaveMetadata {
  gameVersion: string;
  playTime: number;
  currentPhase: GamePhase;
  gameDay: number;
  netWorth: number;
  difficulty: string;
  screenshot?: string; // Base64编码的截图
  description?: string;
}

/**
 * 游戏状态
 */
interface GameState {
  // 基础信息
  gameId: string;
  playerId: string;
  currentPhase: GamePhase;
  gameDay: number;
  gameCycle: number;
  
  // 时间管理
  timeState: TimeState;
  
  // 玩家资源
  playerResources: PlayerResources;
  
  // 物业组合
  properties: Property[];
  
  // 租户管理
  tenants: Tenant[];
  tenantRelationships: TenantRelationship[];
  
  // 市场状态
  marketState: MarketState;
  
  // 探险系统
  explorationState: ExplorationState;
  
  // 技能系统
  skillState: SkillState;
  
  // 竞争系统
  competitionState: CompetitionState;
  
  // 故事系统
  storyState: StoryState;
  
  // 事件历史
  eventHistory: GameEvent[];
  
  // 统计数据
  gameStatistics: GameStatistics;
}

/**
 * 时间状态
 */
interface TimeState {
  currentDate: Date;
  gameSpeed: number; // 游戏速度倍数
  isPaused: boolean;
  phaseStartTime: Date;
  phaseEndTime: Date;
  seasonalFactors: SeasonalFactors;
}

/**
 * 玩家资源
 */
interface PlayerResources {
  cash: number;
  credit: number;
  reputation: number;
  experience: number;
  skillPoints: number;
  energy: number;
  influence: number;
  knowledge: number;
}
```

### 3. 物业数据模型

```typescript
/**
 * 物业实体
 */
interface Property {
  id: string;
  name: string;
  type: BuildingType;
  location: PropertyLocation;
  size: number; // 平方米
  condition: number; // 0-100
  value: number;
  purchasePrice: number;
  purchaseDate: Date;
  
  // 物理特征
  floors: number;
  units: PropertyUnit[];
  amenities: Amenity[];
  
  // 财务信息
  financials: PropertyFinancials;
  
  // 管理信息
  management: PropertyManagement;
  
  // 历史记录
  history: PropertyHistory[];
  
  // 升级和改造
  upgrades: PropertyUpgrade[];
  renovations: Renovation[];
}

/**
 * 物业位置
 */
interface PropertyLocation {
  address: string;
  district: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  accessibility: AccessibilityScore;
  neighborhood: NeighborhoodInfo;
}

/**
 * 可达性评分
 */
interface AccessibilityScore {
  publicTransport: number; // 0-100
  shopping: number;
  schools: number;
  hospitals: number;
  entertainment: number;
  business: number;
  overall: number;
}

/**
 * 社区信息
 */
interface NeighborhoodInfo {
  safetyRating: number; // 0-100
  noiseLevel: number; // 0-100
  airQuality: number; // 0-100
  demographics: Demographics;
  developmentPlans: DevelopmentPlan[];
}

/**
 * 物业单元
 */
interface PropertyUnit {
  id: string;
  propertyId: string;
  unitNumber: string;
  type: UnitType;
  size: number;
  bedrooms: number;
  bathrooms: number;
  rent: number;
  deposit: number;
  condition: number;
  amenities: string[];
  tenant?: Tenant;
  lease?: Lease;
  maintenanceHistory: MaintenanceRecord[];
}

/**
 * 物业财务
 */
interface PropertyFinancials {
  monthlyIncome: number;
  monthlyExpenses: number;
  netCashFlow: number;
  occupancyRate: number;
  roi: number; // 投资回报率
  cap: number; // 资本化率
  expenses: PropertyExpenses;
  income: PropertyIncome;
}

/**
 * 物业支出
 */
interface PropertyExpenses {
  maintenance: number;
  utilities: number;
  insurance: number;
  taxes: number;
  management: number;
  marketing: number;
  repairs: number;
  other: number;
}

/**
 * 物业收入
 */
interface PropertyIncome {
  rent: number;
  parking: number;
  laundry: number;
  storage: number;
  other: number;
}
```

### 4. 租户数据模型

```typescript
/**
 * 租户实体
 */
interface Tenant {
  id: string;
  name: string;
  type: TenantCategory;
  demographics: TenantDemographics;
  preferences: TenantPreferences;
  behavior: TenantBehavior;
  
  // 租赁信息
  currentLease?: Lease;
  leaseHistory: Lease[];
  
  // 满意度和关系
  satisfactionLevel: number; // 0-100
  relationshipLevel: number; // 0-100
  complaints: Complaint[];
  compliments: Compliment[];
  
  // 财务信息
  creditScore: number;
  income: number;
  paymentHistory: PaymentRecord[];
  
  // 社交网络
  relationships: TenantRelationship[];
  
  // 行为模式
  behaviorPatterns: BehaviorPattern[];
  
  // 生命周期
  lifecycle: TenantLifecycle;
}

/**
 * 租户人口统计
 */
interface TenantDemographics {
  age: number;
  gender: 'male' | 'female' | 'other';
  occupation: string;
  education: string;
  familySize: number;
  pets: Pet[];
  lifestyle: string;
  hobbies: string[];
}

/**
 * 租约
 */
interface Lease {
  id: string;
  tenantId: string;
  propertyId: string;
  unitId: string;
  
  // 租约条款
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  deposit: number;
  terms: LeaseTerms;
  
  // 状态
  status: LeaseStatus;
  renewalOptions: RenewalOption[];
  
  // 历史
  modifications: LeaseModification[];
  violations: LeaseViolation[];
}

/**
 * 租约条款
 */
interface LeaseTerms {
  petPolicy: PetPolicy;
  smokingPolicy: boolean;
  guestPolicy: GuestPolicy;
  maintenanceResponsibility: MaintenanceResponsibility;
  utilitiesIncluded: string[];
  parkingIncluded: boolean;
  earlyTerminationClause: EarlyTerminationClause;
}

/**
 * 租户关系
 */
interface TenantRelationship {
  id: string;
  tenant1Id: string;
  tenant2Id: string;
  relationshipType: RelationshipType;
  strength: number; // 0-100
  interactions: TenantInteraction[];
  conflicts: TenantConflict[];
}

/**
 * 租户互动
 */
interface TenantInteraction {
  id: string;
  participants: string[];
  type: InteractionType;
  outcome: InteractionOutcome;
  timestamp: Date;
  location: string;
  description: string;
  impact: InteractionImpact;
}
```

### 5. 市场数据模型

```typescript
/**
 * 市场状态
 */
interface MarketState {
  id: string;
  timestamp: Date;
  
  // 整体市场指标
  overallDemand: number; // 0-100
  marketTrend: MarketTrend;
  volatility: number; // 0-100
  
  // 经济指标
  economicIndicators: EconomicIndicators;
  
  // 分类市场数据
  segmentData: Map<PropertyType, MarketSegment>;
  
  // 价格趋势
  priceTrends: Map<PropertyType, number>;
  
  // 供需数据
  supplyDemand: SupplyDemandData;
  
  // 竞争分析
  competitionAnalysis: CompetitionAnalysis;
  
  // 季节性因素
  seasonalFactors: SeasonalFactors;
  
  // 政策影响
  policyImpacts: PolicyImpact[];
}

/**
 * 经济指标
 */
interface EconomicIndicators {
  gdpGrowth: number;
  inflationRate: number;
  unemploymentRate: number;
  interestRates: number;
  consumerConfidence: number;
  housingStarts: number;
  populationGrowth: number;
  averageIncome: number;
}

/**
 * 市场细分数据
 */
interface MarketSegment {
  propertyType: PropertyType;
  averagePrice: number;
  priceChange: number; // 百分比
  demand: number; // 0-100
  supply: number; // 0-100
  absorption: number; // 月吸收率
  vacancy: number; // 空置率
  rentGrowth: number; // 租金增长率
  capRate: number; // 资本化率
}

/**
 * 供需数据
 */
interface SupplyDemandData {
  totalSupply: number;
  totalDemand: number;
  newSupply: number;
  projectedDemand: number;
  absorptionRate: number;
  monthsOfSupply: number;
  demandDrivers: DemandDriver[];
  supplyConstraints: SupplyConstraint[];
}

/**
 * 竞争分析
 */
interface CompetitionAnalysis {
  competitors: Competitor[];
  marketShare: Map<string, number>;
  competitiveAdvantages: CompetitiveAdvantage[];
  threats: CompetitiveThreat[];
  opportunities: MarketOpportunity[];
}
```

### 6. 探险系统数据模型

```typescript
/**
 * 探险状态
 */
interface ExplorationState {
  // 当前任务
  activeMissions: ExplorationMission[];
  
  // 任务历史
  completedMissions: CompletedMission[];
  
  // 可用任务
  availableMissions: ExplorationMission[];
  
  // 探险团队
  teams: ExplorationTeam[];
  
  // 装备库存
  equipment: Equipment[];
  
  // 发现的资源
  discoveries: Discovery[];
  
  // 探险地图
  explorationMap: ExplorationMap;
}

/**
 * 探险任务
 */
interface ExplorationMission {
  id: string;
  name: string;
  description: string;
  type: MissionType;
  difficulty: number; // 1-10
  duration: number; // 小时
  requirements: MissionRequirements;
  rewards: MissionRewards;
  risks: MissionRisk[];
  location: ExplorationLocation;
  status: MissionStatus;
  
  // 任务进度
  progress?: MissionProgress;
  
  // 任务结果
  result?: ExplorationResult;
}

/**
 * 任务要求
 */
interface MissionRequirements {
  minTeamSize: number;
  maxTeamSize: number;
  requiredSkills: SkillRequirement[];
  requiredEquipment: EquipmentRequirement[];
  energyCost: number;
  cashCost: number;
  prerequisites: string[]; // 前置任务ID
}

/**
 * 任务奖励
 */
interface MissionRewards {
  cash: number;
  experience: number;
  skillPoints: number;
  reputation: number;
  equipment: Equipment[];
  discoveries: Discovery[];
  specialRewards: SpecialReward[];
}

/**
 * 装备
 */
interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  rarity: EquipmentRarity;
  level: number;
  durability: number; // 0-100
  maxDurability: number;
  
  // 装备效果
  effects: EquipmentEffects;
  
  // 装备属性
  attributes: EquipmentAttributes;
  
  // 升级信息
  upgradeInfo: EquipmentUpgrade;
  
  // 获得信息
  acquiredDate: Date;
  acquiredFrom: string;
}

/**
 * 装备效果
 */
interface EquipmentEffects {
  success_rate_bonus: number;
  reward_multiplier: number;
  risk_reduction: number;
  cost_reduction: number;
  experience_bonus: number;
  durability_bonus: number;
  special_abilities: SpecialAbility[];
}

/**
 * 发现
 */
interface Discovery {
  id: string;
  name: string;
  type: DiscoveryType;
  rarity: DiscoveryRarity;
  value: number;
  description: string;
  effects: DiscoveryEffects;
  discoveredDate: Date;
  discoveredBy: string; // 团队ID
  location: ExplorationLocation;
}
```

### 7. 技能系统数据模型

```typescript
/**
 * 技能状态
 */
interface SkillState {
  // 技能树
  skillTrees: SkillTree[];
  
  // 已解锁技能
  unlockedSkills: UnlockedSkill[];
  
  // 技能点数
  availableSkillPoints: number;
  totalSkillPoints: number;
  
  // 技能经验
  skillExperience: Map<string, number>;
  
  // 技能效果
  activeEffects: SkillEffect[];
}

/**
 * 技能树
 */
interface SkillTree {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  icon: string;
  skills: Skill[];
  prerequisites: string[];
  maxLevel: number;
}

/**
 * 技能
 */
interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  type: SkillType;
  maxLevel: number;
  currentLevel: number;
  experience: number;
  experienceToNext: number;
  
  // 技能效果
  effects: SkillEffect[];
  
  // 学习要求
  requirements: SkillRequirements;
  
  // 技能树位置
  treePosition: {
    x: number;
    y: number;
  };
  
  // 前置技能
  prerequisites: string[];
  
  // 后续技能
  unlocks: string[];
}

/**
 * 技能效果
 */
interface SkillEffect {
  id: string;
  type: EffectType;
  target: EffectTarget;
  value: number;
  duration?: number; // 持续时间（秒），undefined表示永久
  conditions?: EffectCondition[];
  description: string;
}

/**
 * 已解锁技能
 */
interface UnlockedSkill {
  skillId: string;
  level: number;
  experience: number;
  unlockedDate: Date;
  totalUsage: number;
  lastUsed?: Date;
}
```

## 数据访问层设计

### 1. Repository 模式

```typescript
/**
 * 基础仓储接口
 */
interface Repository<T, K> {
  findById(id: K): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  delete(id: K): Promise<boolean>;
  exists(id: K): Promise<boolean>;
}

/**
 * 玩家仓储
 */
class PlayerRepository implements Repository<PlayerProfile, string> {
  private storage: StorageAdapter;
  
  constructor(storage: StorageAdapter) {
    this.storage = storage;
  }
  
  async findById(id: string): Promise<PlayerProfile | null> {
    const data = await this.storage.get(`player:${id}`);
    return data ? this.deserialize(data) : null;
  }
  
  async save(player: PlayerProfile): Promise<PlayerProfile> {
    const serialized = this.serialize(player);
    await this.storage.set(`player:${player.id}`, serialized);
    return player;
  }
  
  async findByEmail(email: string): Promise<PlayerProfile | null> {
    const players = await this.findAll();
    return players.find(p => p.email === email) || null;
  }
  
  async updateStatistics(playerId: string, stats: Partial<PlayerStatistics>): Promise<void> {
    const player = await this.findById(playerId);
    if (player) {
      Object.assign(player.statistics, stats);
      await this.save(player);
    }
  }
  
  private serialize(player: PlayerProfile): string {
    return JSON.stringify(player, null, 2);
  }
  
  private deserialize(data: string): PlayerProfile {
    const parsed = JSON.parse(data);
    // 转换日期字符串为Date对象
    parsed.createdAt = new Date(parsed.createdAt);
    parsed.lastLoginAt = new Date(parsed.lastLoginAt);
    return parsed;
  }
}

/**
 * 游戏存档仓储
 */
class GameSaveRepository implements Repository<GameSave, string> {
  private storage: StorageAdapter;
  private compression: CompressionService;
  
  constructor(storage: StorageAdapter, compression: CompressionService) {
    this.storage = storage;
    this.compression = compression;
  }
  
  async save(gameSave: GameSave): Promise<GameSave> {
    // 计算校验和
    gameSave.checksum = this.calculateChecksum(gameSave.gameState);
    gameSave.updatedAt = new Date();
    
    // 压缩存档数据
    const compressed = await this.compression.compress(JSON.stringify(gameSave));
    
    await this.storage.set(`save:${gameSave.id}`, compressed);
    return gameSave;
  }
  
  async findById(id: string): Promise<GameSave | null> {
    const compressed = await this.storage.get(`save:${id}`);
    if (!compressed) return null;
    
    // 解压缩数据
    const decompressed = await this.compression.decompress(compressed);
    const gameSave = JSON.parse(decompressed);
    
    // 验证校验和
    const expectedChecksum = this.calculateChecksum(gameSave.gameState);
    if (gameSave.checksum !== expectedChecksum) {
      throw new Error('Save file corrupted');
    }
    
    return this.deserialize(gameSave);
  }
  
  async findByPlayerId(playerId: string): Promise<GameSave[]> {
    const allSaves = await this.findAll();
    return allSaves.filter(save => save.playerId === playerId);
  }
  
  private calculateChecksum(gameState: GameState): string {
    const stateString = JSON.stringify(gameState);
    return this.hashFunction(stateString);
  }
  
  private hashFunction(input: string): string {
    // 简单的哈希函数实现
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash.toString(16);
  }
}
```

### 2. 存储适配器

```typescript
/**
 * 存储适配器接口
 */
interface StorageAdapter {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

/**
 * LocalStorage 适配器
 */
class LocalStorageAdapter implements StorageAdapter {
  async get(key: string): Promise<any> {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }
  
  async set(key: string, value: any): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value));
  }
  
  async delete(key: string): Promise<boolean> {
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
      return true;
    }
    return false;
  }
  
  async exists(key: string): Promise<boolean> {
    return localStorage.getItem(key) !== null;
  }
  
  async clear(): Promise<void> {
    localStorage.clear();
  }
  
  async keys(): Promise<string[]> {
    return Object.keys(localStorage);
  }
}

/**
 * IndexedDB 适配器
 */
class IndexedDBAdapter implements StorageAdapter {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null = null;
  
  constructor(dbName: string, version: number = 1) {
    this.dbName = dbName;
    this.version = version;
  }
  
  private async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建对象存储
        if (!db.objectStoreNames.contains('gameData')) {
          db.createObjectStore('gameData', { keyPath: 'key' });
        }
      };
    });
  }
  
  async get(key: string): Promise<any> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['gameData'], 'readonly');
      const store = transaction.objectStore('gameData');
      const request = store.get(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
    });
  }
  
  async set(key: string, value: any): Promise<void> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['gameData'], 'readwrite');
      const store = transaction.objectStore('gameData');
      const request = store.put({ key, value });
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  
  async delete(key: string): Promise<boolean> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['gameData'], 'readwrite');
      const store = transaction.objectStore('gameData');
      const request = store.delete(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  }
}
```

### 3. 数据同步管理

```typescript
/**
 * 数据同步管理器
 */
class DataSyncManager {
  private repositories: Map<string, Repository<any, any>>;
  private syncQueue: SyncOperation[];
  private conflictResolver: ConflictResolver;
  private versionControl: VersionControl;
  
  constructor() {
    this.repositories = new Map();
    this.syncQueue = [];
    this.conflictResolver = new ConflictResolver();
    this.versionControl = new VersionControl();
  }
  
  /**
   * 同步数据到云端
   */
  async syncToCloud(playerId: string): Promise<SyncResult> {
    const localData = await this.gatherLocalData(playerId);
    const cloudData = await this.fetchCloudData(playerId);
    
    // 检测冲突
    const conflicts = this.detectConflicts(localData, cloudData);
    
    if (conflicts.length > 0) {
      // 解决冲突
      const resolvedData = await this.conflictResolver.resolve(conflicts);
      return this.uploadResolvedData(playerId, resolvedData);
    } else {
      // 直接上传
      return this.uploadData(playerId, localData);
    }
  }
  
  /**
   * 从云端同步数据
   */
  async syncFromCloud(playerId: string): Promise<SyncResult> {
    const cloudData = await this.fetchCloudData(playerId);
    const localData = await this.gatherLocalData(playerId);
    
    // 比较版本
    const versionComparison = this.versionControl.compare(
      localData.version,
      cloudData.version
    );
    
    if (versionComparison < 0) {
      // 云端数据更新，下载并合并
      return this.mergeCloudData(playerId, cloudData);
    } else if (versionComparison > 0) {
      // 本地数据更新，上传到云端
      return this.syncToCloud(playerId);
    } else {
      // 版本相同，无需同步
      return { success: true, message: 'Data already in sync' };
    }
  }
  
  /**
   * 检测数据冲突
   */
  private detectConflicts(localData: any, cloudData: any): DataConflict[] {
    const conflicts: DataConflict[] = [];
    
    // 检查游戏存档冲突
    if (localData.gameSaves && cloudData.gameSaves) {
      localData.gameSaves.forEach((localSave: GameSave) => {
        const cloudSave = cloudData.gameSaves.find((s: GameSave) => s.id === localSave.id);
        if (cloudSave && localSave.updatedAt !== cloudSave.updatedAt) {
          conflicts.push({
            type: 'game_save',
            localData: localSave,
            cloudData: cloudSave,
            conflictReason: 'timestamp_mismatch'
          });
        }
      });
    }
    
    // 检查玩家档案冲突
    if (localData.playerProfile && cloudData.playerProfile) {
      if (localData.playerProfile.lastLoginAt !== cloudData.playerProfile.lastLoginAt) {
        conflicts.push({
          type: 'player_profile',
          localData: localData.playerProfile,
          cloudData: cloudData.playerProfile,
          conflictReason: 'concurrent_modification'
        });
      }
    }
    
    return conflicts;
  }
}

/**
 * 冲突解决器
 */
class ConflictResolver {
  /**
   * 解决数据冲突
   */
  async resolve(conflicts: DataConflict[]): Promise<any> {
    const resolvedData: any = {};
    
    for (const conflict of conflicts) {
      switch (conflict.type) {
        case 'game_save':
          resolvedData[conflict.type] = this.resolveGameSaveConflict(conflict);
          break;
        case 'player_profile':
          resolvedData[conflict.type] = this.resolvePlayerProfileConflict(conflict);
          break;
        default:
          // 默认使用最新时间戳的数据
          resolvedData[conflict.type] = this.resolveByTimestamp(conflict);
      }
    }
    
    return resolvedData;
  }
  
  /**
   * 解决游戏存档冲突
   */
  private resolveGameSaveConflict(conflict: DataConflict): GameSave {
    const localSave = conflict.localData as GameSave;
    const cloudSave = conflict.cloudData as GameSave;
    
    // 比较游戏进度，选择更进步的存档
    if (localSave.metadata.gameDay > cloudSave.metadata.gameDay) {
      return localSave;
    } else if (cloudSave.metadata.gameDay > localSave.metadata.gameDay) {
      return cloudSave;
    } else {
      // 游戏天数相同，比较净资产
      return localSave.metadata.netWorth > cloudSave.metadata.netWorth ? localSave : cloudSave;
    }
  }
  
  /**
   * 解决玩家档案冲突
   */
  private resolvePlayerProfileConflict(conflict: DataConflict): PlayerProfile {
    const localProfile = conflict.localData as PlayerProfile;
    const cloudProfile = conflict.cloudData as PlayerProfile;
    
    // 合并统计数据，取最大值
    const mergedStatistics: PlayerStatistics = {
      totalPlayTime: Math.max(localProfile.statistics.totalPlayTime, cloudProfile.statistics.totalPlayTime),
      gamesPlayed: Math.max(localProfile.statistics.gamesPlayed, cloudProfile.statistics.gamesPlayed),
      gamesWon: Math.max(localProfile.statistics.gamesWon, cloudProfile.statistics.gamesWon),
      totalRevenue: Math.max(localProfile.statistics.totalRevenue, cloudProfile.statistics.totalRevenue),
      totalExpenses: Math.max(localProfile.statistics.totalExpenses, cloudProfile.statistics.totalExpenses),
      propertiesOwned: Math.max(localProfile.statistics.propertiesOwned, cloudProfile.statistics.propertiesOwned),
      tenantsManaged: Math.max(localProfile.statistics.tenantsManaged, cloudProfile.statistics.tenantsManaged),
      explorationsCompleted: Math.max(localProfile.statistics.explorationsCompleted, cloudProfile.statistics.explorationsCompleted),
      auctionsWon: Math.max(localProfile.statistics.auctionsWon, cloudProfile.statistics.auctionsWon),
      achievementsUnlocked: Math.max(localProfile.statistics.achievementsUnlocked, cloudProfile.statistics.achievementsUnlocked),
      highestNetWorth: Math.max(localProfile.statistics.highestNetWorth, cloudProfile.statistics.highestNetWorth),
      longestPlaySession: Math.max(localProfile.statistics.longestPlaySession, cloudProfile.statistics.longestPlaySession)
    };
    
    // 合并成就，去重
    const mergedAchievements = [...localProfile.achievements, ...cloudProfile.achievements]
      .filter((achievement, index, array) => 
        array.findIndex(a => a.id === achievement.id) === index
      );
    
    // 使用最新的设置和偏好
    const newerProfile = localProfile.lastLoginAt > cloudProfile.lastLoginAt ? localProfile : cloudProfile;
    
    return {
      ...newerProfile,
      statistics: mergedStatistics,
      achievements: mergedAchievements,
      lastLoginAt: new Date() // 更新为当前时间
    };
  }
}
```

## 数据迁移和版本控制

### 数据迁移策略

```typescript
/**
 * 数据迁移管理器
 */
class DataMigrationManager {
  private migrations: Map<string, Migration>;
  
  constructor() {
    this.migrations = new Map();
    this.registerMigrations();
  }
  
  /**
   * 注册迁移脚本
   */
  private registerMigrations(): void {
    this.migrations.set('1.0.0-to-1.1.0', new Migration_1_0_0_to_1_1_0());
    this.migrations.set('1.1.0-to-1.2.0', new Migration_1_1_0_to_1_2_0());
    // 添加更多迁移...
  }
  
  /**
   * 执行数据迁移
   */
  async migrate(fromVersion: string, toVersion: string, data: any): Promise<any> {
    const migrationPath = this.findMigrationPath(fromVersion, toVersion);
    
    let migratedData = data;
    for (const migrationKey of migrationPath) {
      const migration = this.migrations.get(migrationKey);
      if (migration) {
        migratedData = await migration.execute(migratedData);
      }
    }
    
    return migratedData;
  }
  
  /**
   * 查找迁移路径
   */
  private findMigrationPath(fromVersion: string, toVersion: string): string[] {
    // 简化的版本路径查找逻辑
    const path: string[] = [];
    
    if (fromVersion === '1.0.0' && toVersion === '1.2.0') {
      path.push('1.0.0-to-1.1.0', '1.1.0-to-1.2.0');
    } else if (fromVersion === '1.1.0' && toVersion === '1.2.0') {
      path.push('1.1.0-to-1.2.0');
    }
    
    return path;
  }
}

/**
 * 迁移接口
 */
interface Migration {
  execute(data: any): Promise<any>;
  rollback(data: any): Promise<any>;
}

/**
 * 示例迁移：1.0.0 到 1.1.0
 */
class Migration_1_0_0_to_1_1_0 implements Migration {
  async execute(data: any): Promise<any> {
    // 添加新的玩家统计字段
    if (data.playerProfile && data.playerProfile.statistics) {
      data.playerProfile.statistics.explorationsCompleted = 0;
      data.playerProfile.statistics.auctionsWon = 0;
    }
    
    // 为所有租户添加新的行为模式字段
    if (data.gameState && data.gameState.tenants) {
      data.gameState.tenants.forEach((tenant: any) => {
        tenant.behaviorPatterns = [];
        tenant.lifecycle = {
          stage: 'active',
          stageStartDate: new Date(),
          expectedDuration: 365 // 天
        };
      });
    }
    
    return data;
  }
  
  async rollback(data: any): Promise<any> {
    // 移除添加的字段
    if (data.playerProfile && data.playerProfile.statistics) {
      delete data.playerProfile.statistics.explorationsCompleted;
      delete data.playerProfile.statistics.auctionsWon;
    }
    
    if (data.gameState && data.gameState.tenants) {
      data.gameState.tenants.forEach((tenant: any) => {
        delete tenant.behaviorPatterns;
        delete tenant.lifecycle;
      });
    }
    
    return data;
  }
}
```

## 总结

这个数据库设计提供了一个完整的数据存储解决方案，支持：

1. **完整的数据模型**: 覆盖游戏的所有核心实体和关系
2. **灵活的存储策略**: 支持多种存储后端（LocalStorage、IndexedDB等）
3. **数据同步机制**: 支持本地和云端数据同步
4. **版本控制**: 支持数据结构的版本迁移
5. **性能优化**: 包含压缩、缓存等优化策略
6. **数据完整性**: 包含校验和验证机制

这个设计为物业管理模拟器提供了可靠、高效的数据存储基础。