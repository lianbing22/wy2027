// 核心游戏引擎
export { gameEngine } from './GameEngineService';
export type { GameEngineService } from './GameEngineService';
export type { SubEngine, EventBus, Scheduler } from './GameEngineService';

// 租户管理服务
export { TenantService } from './TenantService';

// 市场分析服务
export { MarketService } from './MarketService';

// 探险系统服务
export { ExplorationService } from './ExplorationService';
export { DifficultyLevel, ExplorationType, ExplorationStatus } from './ExplorationService';

// 成就系统服务
export { AchievementService } from './AchievementService';
export { AchievementType, AchievementStatus, ConditionType } from './AchievementService';

// 通知服务
export { NotificationService } from './NotificationService';
export {
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationChannel
} from './NotificationService';
export type { Notification } from './NotificationService';

// 资源管理服务
export { AssetService } from './AssetService';
export {
  AssetType,
  AssetCategory
} from './AssetService';
export type {
  AssetInfo,
  AssetLoadingState,
  ThemeAssets
} from './AssetService';

// 服务管理器
export class ServiceManager {
  private static instance: ServiceManager;
  private gameEngine: any;
  private tenantService: TenantService;
  private marketService: MarketService;
  private explorationService: ExplorationService;
  private achievementService: AchievementService;
  private notificationService: NotificationService;
  private assetService: AssetService;
  private initialized = false;

  private constructor() {
    // 私有构造函数，确保单例
  }

  static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // 初始化核心服务
      const { gameEngine } = await import('./GameEngineService');
      this.gameEngine = gameEngine;

      // 初始化其他服务
      this.tenantService = new TenantService();
      this.marketService = new MarketService();
      this.explorationService = new ExplorationService();
      this.achievementService = new AchievementService();
      this.notificationService = new NotificationService();
      this.assetService = new AssetService();

      // 启动游戏引擎
      await this.gameEngine.start();

      this.initialized = true;
      console.log('ServiceManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ServiceManager:', error);
      throw error;
    }
  }

  getGameEngine() {
    if (!this.initialized) {
      throw new Error('ServiceManager not initialized. Call initialize() first.');
    }
    return this.gameEngine;
  }

  getTenantService(): TenantService {
    if (!this.initialized) {
      throw new Error('ServiceManager not initialized. Call initialize() first.');
    }
    return this.tenantService;
  }

  getMarketService(): MarketService {
    if (!this.initialized) {
      throw new Error('ServiceManager not initialized. Call initialize() first.');
    }
    return this.marketService;
  }

  getExplorationService(): ExplorationService {
    if (!this.initialized) {
      throw new Error('ServiceManager not initialized. Call initialize() first.');
    }
    return this.explorationService;
  }

  getAchievementService(): AchievementService {
    if (!this.initialized) {
      throw new Error('ServiceManager not initialized. Call initialize() first.');
    }
    return this.achievementService;
  }

  getNotificationService(): NotificationService {
    if (!this.initialized) {
      throw new Error('ServiceManager not initialized. Call initialize() first.');
    }
    return this.notificationService;
  }

  getAssetService(): AssetService {
    if (!this.initialized) {
      throw new Error('ServiceManager not initialized. Call initialize() first.');
    }
    return this.assetService;
  }

  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      // 停止游戏引擎
      if (this.gameEngine && typeof this.gameEngine.stop === 'function') {
        await this.gameEngine.stop();
      }

      // 清理其他服务
      if (this.notificationService && typeof this.notificationService.shutdown === 'function') {
        await this.notificationService.shutdown();
      }

      this.initialized = false;
      console.log('ServiceManager shutdown successfully');
    } catch (error) {
      console.error('Error during ServiceManager shutdown:', error);
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // 健康检查
  async healthCheck(): Promise<{ [key: string]: boolean }> {
    const health: { [key: string]: boolean } = {};

    try {
      health.serviceManager = this.initialized;
      health.gameEngine = this.gameEngine ? true : false;
      health.tenantService = this.tenantService ? true : false;
      health.marketService = this.marketService ? true : false;
      health.explorationService = this.explorationService ? true : false;
      health.achievementService = this.achievementService ? true : false;
      health.notificationService = this.notificationService ? true : false;
      health.assetService = this.assetService ? true : false;

      return health;
    } catch (error) {
      console.error('Health check failed:', error);
      return { error: false };
    }
  }

  // 获取服务统计信息
  getServiceStats(): { [key: string]: any } {
    if (!this.initialized) {
      return { initialized: false };
    }

    return {
      initialized: true,
      services: {
        gameEngine: !!this.gameEngine,
        tenantService: !!this.tenantService,
        marketService: !!this.marketService,
        explorationService: !!this.explorationService,
        achievementService: !!this.achievementService,
        notificationService: !!this.notificationService,
        assetService: !!this.assetService
      },
      uptime: Date.now() // 简单的运行时间标记
    };
  }

  // 重新加载服务
  async reload(): Promise<void> {
    await this.shutdown();
    await this.initialize();
  }
}

// 导出单例实例
export const serviceManager = ServiceManager.getInstance();

// 便捷访问函数
export const getGameEngine = () => serviceManager.getGameEngine();
export const getTenantService = () => serviceManager.getTenantService();
export const getMarketService = () => serviceManager.getMarketService();
export const getExplorationService = () => serviceManager.getExplorationService();
export const getAchievementService = () => serviceManager.getAchievementService();
export const getNotificationService = () => serviceManager.getNotificationService();
export const getAssetService = () => serviceManager.getAssetService();

// React Hook for using services
import { useEffect, useState } from 'react';

export const useServices = () => {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initServices = async () => {
      try {
        setLoading(true);
        await serviceManager.initialize();
        setInitialized(true);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setInitialized(false);
      } finally {
        setLoading(false);
      }
    };

    if (!serviceManager.isInitialized()) {
      initServices();
    } else {
      setInitialized(true);
      setLoading(false);
    }
  }, []);

  return {
    initialized,
    loading,
    error,
    services: initialized ? {
      gameEngine: serviceManager.getGameEngine(),
      tenantService: serviceManager.getTenantService(),
      marketService: serviceManager.getMarketService(),
      explorationService: serviceManager.getExplorationService(),
      achievementService: serviceManager.getAchievementService(),
      notificationService: serviceManager.getNotificationService(),
      assetService: serviceManager.getAssetService()
    } : null
  };
};

// 默认导出
export default serviceManager;