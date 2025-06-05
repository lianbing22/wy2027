// 游戏阶段枚举
export enum GamePhase {
  BUILDING = 'building',     // 建设阶段
  OPERATING = 'operating',   // 经营阶段
  EXPLORING = 'exploring',   // 探险阶段
  COMPETING = 'competing',   // 竞争阶段
  EXPANDING = 'expanding'    // 扩张阶段
}

// 玩家资源
export interface PlayerResources {
  cash: number;              // 现金
  reputation: number;        // 声誉值
  experience: number;        // 经验值
  energy: number;           // 精力值
  influence: number;        // 影响力
}

// 玩家档案
export interface PlayerProfile {
  id: string;
  name: string;
  level: number;
  resources: PlayerResources;
  achievements: string[];    // 成就ID列表
  statistics: PlayerStatistics;
}

// 玩家统计数据
export interface PlayerStatistics {
  totalPropertiesOwned: number;
  totalTenantsManaged: number;
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  explorationsMissions: number;
  auctionsWon: number;
  daysPlayed: number;
}

// 市场状态
export interface MarketState {
  economicIndex: number;     // 经济指数 (0-100)
  demandLevel: number;       // 需求水平 (0-100)
  competitionLevel: number;  // 竞争水平 (0-100)
  seasonalFactor: number;    // 季节因子 (0.5-1.5)
  trends: MarketTrend[];
}

// 市场趋势
export interface MarketTrend {
  id: string;
  name: string;
  description: string;
  effect: number;            // 影响系数
  duration: number;          // 持续时间(天)
  remainingDays: number;
}

// 故事进度
export interface StoryProgress {
  currentChapter: number;
  completedMissions: string[];
  availableMissions: string[];
  unlockedFeatures: string[];
  choices: StoryChoice[];
}

// 故事选择
export interface StoryChoice {
  id: string;
  description: string;
  consequences: {
    resources?: Partial<PlayerResources>;
    reputation?: number;
    unlockFeatures?: string[];
  };
}

// 活跃事件
export interface ActiveEvent {
  id: string;
  type: 'random' | 'seasonal' | 'story' | 'market';
  name: string;
  description: string;
  effects: EventEffect[];
  duration: number;          // 持续时间(天)
  remainingDays: number;
  isPositive: boolean;
}

// 事件效果
export interface EventEffect {
  target: 'player' | 'property' | 'tenant' | 'market';
  property: string;
  modifier: number;
  type: 'percentage' | 'absolute';
}

// 主游戏状态接口
export interface GameState {
  // 基础信息
  gameId: string;
  version: string;
  createdAt: string;
  lastSavedAt: string;
  
  // 游戏进度
  currentPhase: GamePhase;
  gameDay: number;
  totalPlayTime: number;     // 总游戏时间(分钟)
  
  // 玩家信息
  player: PlayerProfile;
  
  // 游戏实体
  properties: Property[];
  tenants: Tenant[];
  suppliers: Supplier[];
  equipment: Equipment[];
  
  // 系统状态
  skills: SkillTree;
  achievements: Achievement[];
  marketConditions: MarketState;
  activeMissions: ExplorationMission[];
  auctionItems: AuctionItem[];
  storyProgress: StoryProgress;
  randomEvents: ActiveEvent[];
  
  // 游戏设置
  settings: GameSettings;
}

// 游戏设置
export interface GameSettings {
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  autoSave: boolean;
  autoSaveInterval: number;  // 自动保存间隔(分钟)
  soundEnabled: boolean;
  musicEnabled: boolean;
  notificationsEnabled: boolean;
  language: 'zh-CN' | 'en-US';
}

// 导入其他类型(这些将在其他文件中定义)
export type { Property } from './property';
export type { Tenant } from './tenant-system';
export type { Supplier } from './market';
export type { Equipment, SkillTree } from './exploration';
export type { Achievement } from './achievement';
export type { ExplorationMission } from './exploration';
export type { AuctionItem } from './auction';