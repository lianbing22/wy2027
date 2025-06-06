// 临时修复类型声明文件
// 这个文件为了解决构建过程中的类型问题

// 扩展ExplorationMission接口以支持额外属性
import { ExplorationMission, MissionStatus, ExplorationResult } from './exploration';
import { ExplorationStatus } from '../services/ExplorationService';

declare module './exploration' {
  interface ExplorationMission {
    startedAt?: Date;
    estimatedEndTime?: Date;
    completedAt?: Date;
    result?: any;
    expiresAt?: Date;
  }

  interface MissionRequirement {
    minLevel?: number;
    requiredEquipment?: string[];
    requiredSkills?: string[];
    minMoney?: number;
  }

  interface MissionReward {
    money?: number;
    experience?: number;
    items?: string[];
    properties?: string[];
  }

  interface ExplorationResult {
    rewards?: {
      money: number;
      experience: number;
      items: string[];
      properties: string[];
    };
    events?: string[];
  }

  // 补充缺失的导出
  export interface ExplorationRisk {
    type: string;
    description: string;
    probability: number;
    impact: string;
  }

  export interface ExplorationEvent {
    id: string;
    missionId: string;
    timestamp: Date;
    type: string;
    description: string;
  }

  export interface ExplorationReward {
    type: string;
    value: number;
    description: string;
  }
}

// 扩展MarketTrend接口
import { MarketTrend, EventEffect } from './game-state';

declare module './game-state' {
  interface MarketTrend {
    trendType?: string;
    strength?: number;
    startDate?: Date;
    affectedCategories?: string[];
    categoryTrends?: Record<string, number>;
    seasonalFactors?: Record<number, number>;
  }

  interface EventEffect {
    priceChange?: number;
  }

  interface MarketStatistics {
    totalProducts?: number;
    factors?: string[];
  }

  export interface Player {
    id: string;
    name: string;
    level: number;
    money: number;
    equipment: string[];
    skills: Record<string, number>;
  }
}

// 允许status类型转换
declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      status?: MissionStatus | ExplorationStatus;
    }
  }
}

// 补充缺失的模块
declare module '../types/equipment' {
  export interface Equipment {
    id: string;
    name: string;
    type: string;
    rarity: string;
    status: string;
    level?: number;
    quality?: number;
    durability?: number;
    maxDurability?: number;
    bonuses?: any[];
    specialAbilities?: string[];
    purchasePrice?: number;
    currentValue?: number;
    maintenanceCost?: number;
    usageCount?: number;
    totalUsageTime?: number;
    lastUsedDate?: string;
    maintenanceHistory?: any[];
    nextMaintenanceDate?: string;
    acquiredDate?: string;
    acquiredFrom?: string;
    createdAt?: string;
    updatedAt?: string;
  }
}

// 为缺失的服务提供临时定义
declare module '../services/TenantService' {
  export class TenantService {}
}

declare module '../services/MarketService' {
  export class MarketService {}
}

declare module '../services/AchievementService' {
  export class AchievementService {}
  export enum AchievementType { GENERAL, PROPERTY, TENANT, FINANCIAL, EXPLORATION, SOCIAL }
  export enum AchievementStatus { LOCKED, IN_PROGRESS, COMPLETED }
  export enum ConditionType { PROPERTY_COUNT, TENANT_COUNT, MONEY, EXPLORATION_COUNT, REPUTATION }
}

declare module '../services/NotificationService' {
  export class NotificationService {}
  export enum NotificationType { INFO, WARNING, ERROR, SUCCESS }
  export enum NotificationPriority { LOW, NORMAL, HIGH, URGENT }
  export enum NotificationStatus { UNREAD, READ, ARCHIVED, DELETED }
  export enum NotificationChannel { IN_APP, EMAIL, PUSH }
  export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    priority: NotificationPriority;
    status: NotificationStatus;
    timestamp: Date;
    read: boolean;
  }
}

declare module '../services/AssetService' {
  export class AssetService {}
  export enum AssetType { IMAGE, SOUND, MODEL, DATA }
  export enum AssetCategory { UI, PROPERTY, CHARACTER, EFFECT, MUSIC }
  export interface AssetInfo {
    id: string;
    type: AssetType;
    path: string;
    loaded: boolean;
  }
  export interface AssetLoadingState {
    total: number;
    loaded: number;
    progress: number;
  }
  export interface ThemeAssets {
    logos: Record<string, string>;
    backgrounds: Record<string, string>;
    icons: Record<string, string>;
  }
} 