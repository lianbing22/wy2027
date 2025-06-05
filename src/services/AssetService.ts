import { GameState } from '../types/game-state';

// 资源类型定义
export interface AssetInfo {
  id: string;
  name: string;
  path: string;
  type: AssetType;
  category: AssetCategory;
  size?: number;
  dimensions?: { width: number; height: number };
  loaded: boolean;
  lastUsed: Date;
  metadata?: Record<string, any>;
}

export enum AssetType {
  IMAGE = 'image',
  ICON = 'icon',
  BACKGROUND = 'background',
  UI_COMPONENT = 'ui_component',
  AVATAR = 'avatar',
  DECORATION = 'decoration'
}

export enum AssetCategory {
  // UI 界面资源
  BUTTONS = 'buttons',
  BACKGROUNDS = 'backgrounds',
  ICONS = 'icons',
  NAVIGATION = 'navigation',
  FORMS = 'forms',
  
  // 游戏元素
  CHARACTERS = 'characters',
  PROPERTIES = 'properties',
  EQUIPMENT = 'equipment',
  ITEMS = 'items',
  
  // 装饰和效果
  DECORATIONS = 'decorations',
  EFFECTS = 'effects',
  PATTERNS = 'patterns'
}

// 资源加载状态
export interface AssetLoadingState {
  total: number;
  loaded: number;
  failed: number;
  progress: number;
  currentAsset?: string;
  errors: string[];
}

// 资源缓存配置
interface CacheConfig {
  maxSize: number; // 最大缓存大小 (MB)
  maxAge: number; // 最大缓存时间 (毫秒)
  preloadCategories: AssetCategory[]; // 预加载的资源类别
}

// 主题配置
export interface ThemeAssets {
  primary: {
    background: string;
    button: string;
    icon: string;
  };
  secondary: {
    background: string;
    button: string;
    icon: string;
  };
  accent: {
    background: string;
    button: string;
    icon: string;
  };
}

/**
 * 资源管理服务
 * 负责游戏中所有资源的加载、缓存和管理
 */
export class AssetService {
  private assets: Map<string, AssetInfo> = new Map();
  private loadedAssets: Map<string, any> = new Map(); // 实际加载的资源数据
  private loadingPromises: Map<string, Promise<any>> = new Map();
  private cacheConfig: CacheConfig;
  private loadingState: AssetLoadingState;
  private themeAssets: ThemeAssets;
  
  constructor(cacheConfig?: Partial<CacheConfig>) {
    this.cacheConfig = {
      maxSize: 100, // 100MB
      maxAge: 24 * 60 * 60 * 1000, // 24小时
      preloadCategories: [AssetCategory.BUTTONS, AssetCategory.ICONS, AssetCategory.NAVIGATION],
      ...cacheConfig
    };
    
    this.loadingState = {
      total: 0,
      loaded: 0,
      failed: 0,
      progress: 0,
      errors: []
    };
    
    this.themeAssets = {
      primary: {
        background: '/资源图/image-gen-server/images/background_1.svg',
        button: '/资源图/image-gen-server/images/button_1.svg',
        icon: '/资源图/image-gen-server/images/help_icon_1.svg'
      },
      secondary: {
        background: '/资源图/image-gen-server/images/background_2.svg',
        button: '/资源图/image-gen-server/images/button_2.svg',
        icon: '/资源图/image-gen-server/images/help_icon_2.svg'
      },
      accent: {
        background: '/资源图/image-gen-server/images/background_3.svg',
        button: '/资源图/image-gen-server/images/button_3.svg',
        icon: '/资源图/image-gen-server/images/help_icon_3.svg'
      }
    };
    
    this.initializeAssetRegistry();
  }
  
  /**
   * 初始化资源注册表
   */
  private initializeAssetRegistry(): void {
    // 注册UI界面资源
    this.registerUIAssets();
    
    // 注册游戏元素资源
    this.registerGameAssets();
    
    // 注册装饰资源
    this.registerDecorationAssets();
  }
  
  /**
   * 注册UI界面资源
   */
  private registerUIAssets(): void {
    // 背景资源
    for (let i = 1; i <= 3; i++) {
      this.registerAsset({
        id: `background_${i}`,
        name: `Background ${i}`,
        path: `/资源图/image-gen-server/images/background_${i}.svg`,
        type: AssetType.BACKGROUND,
        category: AssetCategory.BACKGROUNDS,
        loaded: false,
        lastUsed: new Date()
      });
    }
    
    // 按钮资源
    for (let i = 1; i <= 3; i++) {
      this.registerAsset({
        id: `button_${i}`,
        name: `Button ${i}`,
        path: `/资源图/image-gen-server/images/button_${i}.svg`,
        type: AssetType.UI_COMPONENT,
        category: AssetCategory.BUTTONS,
        loaded: false,
        lastUsed: new Date()
      });
    }
    
    // 复选框资源
    for (let i = 1; i <= 3; i++) {
      this.registerAsset({
        id: `checkbox_${i}`,
        name: `Checkbox ${i}`,
        path: `/资源图/image-gen-server/images/checkbox_${i}.svg`,
        type: AssetType.UI_COMPONENT,
        category: AssetCategory.FORMS,
        loaded: false,
        lastUsed: new Date()
      });
    }
    
    // 图标资源
    const iconTypes = ['help_icon', 'notification_icon', 'settings_icon'];
    iconTypes.forEach(iconType => {
      for (let i = 1; i <= 3; i++) {
        this.registerAsset({
          id: `${iconType}_${i}`,
          name: `${iconType.replace('_', ' ')} ${i}`,
          path: `/资源图/image-gen-server/images/${iconType}_${i}.svg`,
          type: AssetType.ICON,
          category: AssetCategory.ICONS,
          loaded: false,
          lastUsed: new Date()
        });
      }
    });
    
    // Logo资源
    for (let i = 1; i <= 3; i++) {
      this.registerAsset({
        id: `logo_${i}`,
        name: `Logo ${i}`,
        path: `/资源图/image-gen-server/images/logo_${i}.svg`,
        type: AssetType.ICON,
        category: AssetCategory.ICONS,
        loaded: false,
        lastUsed: new Date()
      });
    }
    
    // 导航资源
    for (let i = 1; i <= 3; i++) {
      this.registerAsset({
        id: `menu_button_${i}`,
        name: `Menu Button ${i}`,
        path: `/资源图/image-gen-server/images/menu_button_${i}.svg`,
        type: AssetType.UI_COMPONENT,
        category: AssetCategory.NAVIGATION,
        loaded: false,
        lastUsed: new Date()
      });
      
      this.registerAsset({
        id: `nav_background_${i}`,
        name: `Navigation Background ${i}`,
        path: `/资源图/image-gen-server/images/nav_background_${i}.svg`,
        type: AssetType.BACKGROUND,
        category: AssetCategory.NAVIGATION,
        loaded: false,
        lastUsed: new Date()
      });
    }
    
    // 用户头像资源
    for (let i = 1; i <= 3; i++) {
      this.registerAsset({
        id: `user_avatar_${i}`,
        name: `User Avatar ${i}`,
        path: `/资源图/image-gen-server/images/user_avatar_${i}.svg`,
        type: AssetType.AVATAR,
        category: AssetCategory.CHARACTERS,
        loaded: false,
        lastUsed: new Date()
      });
    }
  }
  
  /**
   * 注册游戏元素资源
   */
  private registerGameAssets(): void {
    // 这里可以注册游戏特定的资源
    // 例如：物业、租户、装备等
    
    // 占位符实现，实际应该根据游戏需求添加
    const gameAssetCategories = [
      { category: AssetCategory.PROPERTIES, prefix: 'property' },
      { category: AssetCategory.EQUIPMENT, prefix: 'equipment' },
      { category: AssetCategory.ITEMS, prefix: 'item' }
    ];
    
    gameAssetCategories.forEach(({ category, prefix }) => {
      // 为每个类别创建占位符资源
      for (let i = 1; i <= 5; i++) {
        this.registerAsset({
          id: `${prefix}_${i}`,
          name: `${prefix} ${i}`,
          path: `/assets/game/${prefix}_${i}.svg`, // 占位符路径
          type: AssetType.IMAGE,
          category,
          loaded: false,
          lastUsed: new Date(),
          metadata: {
            placeholder: true // 标记为占位符
          }
        });
      }
    });
  }
  
  /**
   * 注册装饰资源
   */
  private registerDecorationAssets(): void {
    // 装饰和效果资源
    const decorationTypes = ['pattern', 'effect', 'decoration'];
    
    decorationTypes.forEach(type => {
      for (let i = 1; i <= 3; i++) {
        this.registerAsset({
          id: `${type}_${i}`,
          name: `${type} ${i}`,
          path: `/assets/decorations/${type}_${i}.svg`, // 占位符路径
          type: AssetType.DECORATION,
          category: AssetCategory.DECORATIONS,
          loaded: false,
          lastUsed: new Date(),
          metadata: {
            placeholder: true
          }
        });
      }
    });
  }
  
  /**
   * 注册资源
   */
  registerAsset(asset: AssetInfo): void {
    this.assets.set(asset.id, asset);
  }
  
  /**
   * 获取资源信息
   */
  getAssetInfo(assetId: string): AssetInfo | undefined {
    return this.assets.get(assetId);
  }
  
  /**
   * 获取资源列表
   */
  getAssetsByCategory(category: AssetCategory): AssetInfo[] {
    return Array.from(this.assets.values()).filter(asset => asset.category === category);
  }
  
  /**
   * 获取资源列表
   */
  getAssetsByType(type: AssetType): AssetInfo[] {
    return Array.from(this.assets.values()).filter(asset => asset.type === type);
  }
  
  /**
   * 加载单个资源
   */
  async loadAsset(assetId: string): Promise<any> {
    const asset = this.assets.get(assetId);
    if (!asset) {
      throw new Error(`Asset not found: ${assetId}`);
    }
    
    // 如果已经加载，直接返回
    if (this.loadedAssets.has(assetId)) {
      asset.lastUsed = new Date();
      return this.loadedAssets.get(assetId);
    }
    
    // 如果正在加载，返回现有的Promise
    if (this.loadingPromises.has(assetId)) {
      return this.loadingPromises.get(assetId);
    }
    
    // 开始加载
    const loadingPromise = this.performAssetLoad(asset);
    this.loadingPromises.set(assetId, loadingPromise);
    
    try {
      const loadedData = await loadingPromise;
      this.loadedAssets.set(assetId, loadedData);
      asset.loaded = true;
      asset.lastUsed = new Date();
      
      this.loadingPromises.delete(assetId);
      return loadedData;
    } catch (error) {
      this.loadingPromises.delete(assetId);
      this.loadingState.errors.push(`Failed to load ${assetId}: ${error}`);
      throw error;
    }
  }
  
  /**
   * 批量加载资源
   */
  async loadAssets(assetIds: string[]): Promise<Map<string, any>> {
    this.loadingState.total = assetIds.length;
    this.loadingState.loaded = 0;
    this.loadingState.failed = 0;
    this.loadingState.progress = 0;
    this.loadingState.errors = [];
    
    const results = new Map<string, any>();
    
    for (const assetId of assetIds) {
      try {
        this.loadingState.currentAsset = assetId;
        const data = await this.loadAsset(assetId);
        results.set(assetId, data);
        this.loadingState.loaded++;
      } catch (error) {
        this.loadingState.failed++;
        console.error(`Failed to load asset ${assetId}:`, error);
      }
      
      this.loadingState.progress = (this.loadingState.loaded + this.loadingState.failed) / this.loadingState.total * 100;
    }
    
    this.loadingState.currentAsset = undefined;
    return results;
  }
  
  /**
   * 预加载资源
   */
  async preloadAssets(): Promise<void> {
    const preloadAssets = Array.from(this.assets.values())
      .filter(asset => this.cacheConfig.preloadCategories.includes(asset.category))
      .map(asset => asset.id);
    
    if (preloadAssets.length > 0) {
      await this.loadAssets(preloadAssets);
    }
  }
  
  /**
   * 获取资源URL
   */
  getAssetUrl(assetId: string): string | null {
    const asset = this.assets.get(assetId);
    if (!asset) return null;
    
    // 如果是占位符资源，返回默认图片
    if (asset.metadata?.placeholder) {
      return this.getPlaceholderUrl(asset.type);
    }
    
    return asset.path;
  }
  
  /**
   * 获取占位符URL
   */
  private getPlaceholderUrl(type: AssetType): string {
    const placeholders = {
      [AssetType.IMAGE]: '/assets/placeholders/image.svg',
      [AssetType.ICON]: '/assets/placeholders/icon.svg',
      [AssetType.BACKGROUND]: '/assets/placeholders/background.svg',
      [AssetType.UI_COMPONENT]: '/assets/placeholders/component.svg',
      [AssetType.AVATAR]: '/assets/placeholders/avatar.svg',
      [AssetType.DECORATION]: '/assets/placeholders/decoration.svg'
    };
    
    return placeholders[type] || '/assets/placeholders/default.svg';
  }
  
  /**
   * 获取主题资源
   */
  getThemeAssets(theme: 'primary' | 'secondary' | 'accent' = 'primary'): ThemeAssets[keyof ThemeAssets] {
    return this.themeAssets[theme];
  }
  
  /**
   * 更新主题资源
   */
  updateThemeAssets(theme: 'primary' | 'secondary' | 'accent', assets: Partial<ThemeAssets[keyof ThemeAssets]>): void {
    this.themeAssets[theme] = {
      ...this.themeAssets[theme],
      ...assets
    };
  }
  
  /**
   * 获取加载状态
   */
  getLoadingState(): AssetLoadingState {
    return { ...this.loadingState };
  }
  
  /**
   * 清理缓存
   */
  clearCache(): void {
    this.loadedAssets.clear();
    this.loadingPromises.clear();
    
    // 重置资源加载状态
    this.assets.forEach(asset => {
      asset.loaded = false;
    });
  }
  
  /**
   * 清理过期缓存
   */
  cleanupExpiredCache(): void {
    const now = new Date();
    const expiredAssets: string[] = [];
    
    this.assets.forEach((asset, id) => {
      if (asset.loaded && (now.getTime() - asset.lastUsed.getTime()) > this.cacheConfig.maxAge) {
        expiredAssets.push(id);
      }
    });
    
    expiredAssets.forEach(id => {
      this.loadedAssets.delete(id);
      const asset = this.assets.get(id);
      if (asset) {
        asset.loaded = false;
      }
    });
  }
  
  /**
   * 获取缓存统计
   */
  getCacheStats(): {
    totalAssets: number;
    loadedAssets: number;
    cacheSize: number;
    hitRate: number;
  } {
    const totalAssets = this.assets.size;
    const loadedAssets = this.loadedAssets.size;
    
    // 简化的缓存大小计算
    const cacheSize = loadedAssets * 0.1; // 假设每个资源平均0.1MB
    
    // 简化的命中率计算
    const hitRate = totalAssets > 0 ? (loadedAssets / totalAssets) * 100 : 0;
    
    return {
      totalAssets,
      loadedAssets,
      cacheSize,
      hitRate
    };
  }
  
  /**
   * 搜索资源
   */
  searchAssets(query: string, filters?: {
    type?: AssetType;
    category?: AssetCategory;
    loaded?: boolean;
  }): AssetInfo[] {
    const lowerQuery = query.toLowerCase();
    
    return Array.from(this.assets.values())
      .filter(asset => {
        // 文本搜索
        const matchesQuery = asset.name.toLowerCase().includes(lowerQuery) ||
                           asset.id.toLowerCase().includes(lowerQuery);
        
        if (!matchesQuery) return false;
        
        // 应用过滤器
        if (filters) {
          if (filters.type && asset.type !== filters.type) return false;
          if (filters.category && asset.category !== filters.category) return false;
          if (filters.loaded !== undefined && asset.loaded !== filters.loaded) return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // 按最后使用时间排序
        return b.lastUsed.getTime() - a.lastUsed.getTime();
      });
  }
  
  /**
   * 执行资源加载
   */
  private async performAssetLoad(asset: AssetInfo): Promise<any> {
    // 如果是占位符资源，返回占位符数据
    if (asset.metadata?.placeholder) {
      return {
        type: 'placeholder',
        url: this.getPlaceholderUrl(asset.type),
        asset
      };
    }
    
    try {
      // 对于SVG文件，我们可以直接返回URL
      if (asset.path.endsWith('.svg')) {
        // 在实际应用中，这里可能需要验证文件是否存在
        return {
          type: 'svg',
          url: asset.path,
          asset
        };
      }
      
      // 对于其他类型的文件，可以使用fetch加载
      const response = await fetch(asset.path);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      return {
        type: 'blob',
        url,
        blob,
        asset
      };
    } catch (error) {
      console.error(`Failed to load asset ${asset.id}:`, error);
      
      // 返回占位符作为后备
      return {
        type: 'fallback',
        url: this.getPlaceholderUrl(asset.type),
        asset,
        error
      };
    }
  }
  
  /**
   * 生成资源清单
   */
  generateManifest(): {
    version: string;
    timestamp: string;
    assets: AssetInfo[];
    categories: Record<AssetCategory, number>;
    types: Record<AssetType, number>;
  } {
    const assets = Array.from(this.assets.values());
    
    // 统计各类别的资源数量
    const categories = {} as Record<AssetCategory, number>;
    const types = {} as Record<AssetType, number>;
    
    Object.values(AssetCategory).forEach(category => {
      categories[category] = 0;
    });
    
    Object.values(AssetType).forEach(type => {
      types[type] = 0;
    });
    
    assets.forEach(asset => {
      categories[asset.category]++;
      types[asset.type]++;
    });
    
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      assets,
      categories,
      types
    };
  }
}

// 创建全局资源服务实例
export const assetService = new AssetService();

export default AssetService;