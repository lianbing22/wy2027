/**
 * 服务层统一导出
 * 提供游戏所有核心服务的统一入口
 */

// 核心游戏引擎服务
export { GameEngineService } from './GameEngineService';
export type {
  GameEngine,
  EventBus,
  Scheduler,
  TenantEngine,
  MarketEngine,
  ExplorationEngine
} from './GameEngineService';

// 租户管理服务
export { TenantService } from './TenantService';
export type {
  TenantInteractionEngine,
  TenantBehaviorType,
  InteractionType,
  SatisfactionFactors,
  BehaviorPrediction,
  CommunityHealth,
  TenantMatchSuggestion
} from './TenantService';

// 市场服务
export { MarketService } from './MarketService';
export type {
  MarketTrend,
  MarketEvent,
  MarketStatistics,
  PriceHistory,
  MarketHealth
} from './MarketService';

// 探险系统服务
export { ExplorationService } from './ExplorationService';
export type {
  DifficultyLevel,
  ExplorationType,
  ExplorationStatus
} from './ExplorationService';

// 成就系统服务
export { AchievementService } from './AchievementService';
export type {
  AchievementType,
  AchievementStatus,
  ConditionType
} from './AchievementService';

// 通知系统服务
export { NotificationService } from './NotificationService';
export type {
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationChannel,
  Notification
} from './NotificationService';

// 资源管理服务
export { AssetService } from './AssetService';
export type {
  AssetInfo,
  AssetType,
  AssetCategory,
  LoadingState,
  CacheConfig
} from './AssetService';

/**
 * 服务管理器
 * 统一管理所有游戏服务的生命周期
 */
export class ServiceManager {
  private static instance: ServiceManager;
  private services: Map<string, any> = new Map();
  private initialized = false;
  
  private constructor() {}
  
  static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }
  
  /**
   * 初始化所有服务
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // 初始化资源服务（优先级最高）
      const assetService = new AssetService();
      await assetService.preloadCriticalAssets();
      this.services.set('asset', assetService);
      
      // 初始化通知服务
      const notificationService = new NotificationService();
      this.services.set('notification', notificationService);
      
      // 初始化成就服务
      const achievementService = new AchievementService();
      this.services.set('achievement', achievementService);
      
      // 初始化探险服务
      const explorationService = new ExplorationService();
      this.services.set('exploration', explorationService);
      
      // 初始化市场服务
      const marketService = new MarketService();
      this.services.set('market', marketService);
      
      // 初始化租户服务
      const tenantService = new TenantService();
      this.services.set('tenant', tenantService);
      
      // 初始化游戏引擎（最后初始化，依赖其他服务）
      const gameEngineService = new GameEngineService({
        tenantService,
        marketService,
        explorationService,
        achievementService,
        notificationService
      });
      this.services.set('gameEngine', gameEngineService);
      
      this.initialized = true;
      console.log('🎮 所有游戏服务初始化完成');
      
    } catch (error) {
      console.error('❌ 服务初始化失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取服务实例
   */
  getService<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`服务 ${serviceName} 未找到或未初始化`);
    }
    return service as T;
  }
  
  /**
   * 获取游戏引擎服务
   */
  getGameEngine(): GameEngineService {
    return this.getService<GameEngineService>('gameEngine');
  }
  
  /**
   * 获取租户服务
   */
  getTenantService(): TenantService {
    return this.getService<TenantService>('tenant');
  }
  
  /**
   * 获取市场服务
   */
  getMarketService(): MarketService {
    return this.getService<MarketService>('market');
  }
  
  /**
   * 获取探险服务
   */
  getExplorationService(): ExplorationService {
    return this.getService<ExplorationService>('exploration');
  }
  
  /**
   * 获取成就服务
   */
  getAchievementService(): AchievementService {
    return this.getService<AchievementService>('achievement');
  }
  
  /**
   * 获取通知服务
   */
  getNotificationService(): NotificationService {
    return this.getService<NotificationService>('notification');
  }
  
  /**
   * 获取资源服务
   */
  getAssetService(): AssetService {
    return this.getService<AssetService>('asset');
  }
  
  /**
   * 检查服务是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * 获取所有服务状态
   */
  getServicesStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    
    const serviceNames = [
      'asset',
      'notification', 
      'achievement',
      'exploration',
      'market',
      'tenant',
      'gameEngine'
    ];
    
    serviceNames.forEach(name => {
      status[name] = this.services.has(name);
    });
    
    return status;
  }
  
  /**
   * 销毁所有服务
   */
  async destroy(): Promise<void> {
    // 按相反顺序销毁服务
    const serviceNames = [
      'gameEngine',
      'tenant',
      'market', 
      'exploration',
      'achievement',
      'notification',
      'asset'
    ];
    
    for (const serviceName of serviceNames) {
      const service = this.services.get(serviceName);
      if (service && typeof service.destroy === 'function') {
        try {
          await service.destroy();
        } catch (error) {
          console.error(`销毁服务 ${serviceName} 时出错:`, error);
        }
      }
      this.services.delete(serviceName);
    }
    
    this.initialized = false;
    console.log('🔄 所有游戏服务已销毁');
  }
  
  /**
   * 重启所有服务
   */
  async restart(): Promise<void> {
    await this.destroy();
    await this.initialize();
  }
}

// 导出服务管理器单例
export const serviceManager = ServiceManager.getInstance();

// 便捷的服务获取函数
export const getGameEngine = () => serviceManager.getGameEngine();
export const getTenantService = () => serviceManager.getTenantService();
export const getMarketService = () => serviceManager.getMarketService();
export const getExplorationService = () => serviceManager.getExplorationService();
export const getAchievementService = () => serviceManager.getAchievementService();
export const getNotificationService = () => serviceManager.getNotificationService();
export const getAssetService = () => serviceManager.getAssetService();

/**
 * React Hook: 使用服务管理器
 */
export const useServices = () => {
  return {
    serviceManager,
    gameEngine: getGameEngine,
    tenantService: getTenantService,
    marketService: getMarketService,
    explorationService: getExplorationService,
    achievementService: getAchievementService,
    notificationService: getNotificationService,
    assetService: getAssetService,
    isInitialized: serviceManager.isInitialized(),
    servicesStatus: serviceManager.getServicesStatus()
  };
};

export default serviceManager;