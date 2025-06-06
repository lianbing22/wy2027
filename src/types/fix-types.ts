// 类型修复文件

// 兼容ExplorationService中的类型使用
import { MissionStatus } from './exploration';
import { ExplorationStatus } from '../services/ExplorationService';

export type CompatibleMissionStatus = MissionStatus | ExplorationStatus;

// 兼容MarketService中的类型使用
import { MarketTrend, EventEffect } from './game-state';

// 扩展MarketTrend类型
export interface ExtendedMarketTrend extends MarketTrend {
  trendType?: string;
  strength?: number;
  startDate?: Date;
  affectedCategories?: string[];
  categoryTrends?: Record<string, number>;
  seasonalFactors?: Record<number, number>;
}

// 扩展EventEffect类型
export interface ExtendedEventEffect extends EventEffect {
  priceChange?: number;
}

// 导出额外服务
export class TenantService {}
export class MarketService {}
export class ExplorationService {}
export class AchievementService {}
export class NotificationService {}
export class AssetService {} 