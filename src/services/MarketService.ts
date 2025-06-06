import { Vendor, Product, PriceHistory, MarketEvent, MarketStatistics } from '../types/market';
import { MarketTrend } from '../types/game-state';
import { GameState } from '../types/game-state';
import { randomUUID } from '../utils/uuid';

/**
 * 市场服务
 * 处理市场动态、供应商、商品和价格波动
 */
export class MarketService {
  private vendors: Vendor[] = [];
  private products: Product[] = [];
  private priceHistory: PriceHistory[] = [];
  private marketEvents: MarketEvent[] = [];
  private marketTrends: MarketTrend[] = [];
  private statistics: MarketStatistics = {
    averageProductPrice: 0,
    totalVendors: 0,
    totalProducts: 0,
    priceVolatility: 0,
    marketHealth: 100,
    demandIndex: 50,
    supplyIndex: 50,
    popularCategories: [],
    trendingProducts: [],
    seasonalFactors: []
  };

  /**
   * 初始化市场
   */
  initializeMarket(initialVendors: Vendor[], initialProducts: Product[]): void {
    this.vendors = initialVendors;
    this.products = initialProducts;
    this.updateStatistics();
    this.generateInitialPriceHistory();
  }

  /**
   * 更新市场
   * @param gameState 当前游戏状态
   * @param deltaTime 时间增量
   */
  updateMarket(gameState: GameState, deltaTime: number): void {
    this.updatePrices(gameState, deltaTime);
    this.generateMarketEvents(gameState, deltaTime);
    this.updateMarketTrends(gameState);
    this.updateStatistics();
    this.manageVendorRelationships(deltaTime);
  }

  /**
   * 添加供应商
   */
  addVendor(vendor: Omit<Vendor, 'id'>): Vendor {
    const newVendor: Vendor = {
      ...vendor,
      id: randomUUID()
    };

    this.vendors.push(newVendor);
    this.updateStatistics();
    return newVendor;
  }

  /**
   * 更新供应商
   */
  updateVendor(vendorId: string, updates: Partial<Vendor>): Vendor | null {
    const vendorIndex = this.vendors.findIndex(v => v.id === vendorId);
    if (vendorIndex === -1) return null;

    const updatedVendor = {
      ...this.vendors[vendorIndex],
      ...updates
    };

    this.vendors[vendorIndex] = updatedVendor;
    return updatedVendor;
  }

  /**
   * 移除供应商
   */
  removeVendor(vendorId: string): boolean {
    const initialLength = this.vendors.length;
    this.vendors = this.vendors.filter(v => v.id !== vendorId);
    
    // 同时移除该供应商的所有商品
    this.products = this.products.filter(p => p.vendorId !== vendorId);
    
    this.updateStatistics();
    return this.vendors.length < initialLength;
  }

  /**
   * 添加商品
   */
  addProduct(product: Omit<Product, 'id'>): Product {
    const newProduct: Product = {
      ...product,
      id: randomUUID()
    };

    this.products.push(newProduct);
    
    // 为新商品创建初始价格历史
    this.priceHistory.push({
      productId: newProduct.id,
      timestamp: new Date(),
      price: newProduct.price,
      factors: ['initial']
    });
    
    this.updateStatistics();
    return newProduct;
  }

  /**
   * 更新商品
   */
  updateProduct(productId: string, updates: Partial<Product>): Product | null {
    const productIndex = this.products.findIndex(p => p.id === productId);
    if (productIndex === -1) return null;

    const oldPrice = this.products[productIndex].price;
    const updatedProduct = {
      ...this.products[productIndex],
      ...updates
    };

    this.products[productIndex] = updatedProduct;
    
    // 如果价格变化，记录价格历史
    if (updates.price && updates.price !== oldPrice) {
      this.priceHistory.push({
        productId: productId,
        timestamp: new Date(),
        price: updates.price,
        factors: ['manual_update']
      });
    }
    
    this.updateStatistics();
    return updatedProduct;
  }

  /**
   * 移除商品
   */
  removeProduct(productId: string): boolean {
    const initialLength = this.products.length;
    this.products = this.products.filter(p => p.id !== productId);
    this.updateStatistics();
    return this.products.length < initialLength;
  }

  /**
   * 购买商品
   */
  purchaseProduct(productId: string, quantity: number): { success: boolean; product?: Product; totalCost: number } {
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      return { success: false, totalCost: 0 };
    }

    if ((product.stock || 0) < quantity) {
      return { success: false, totalCost: 0 };
    }

    // 更新库存
    const updatedProduct = this.updateProduct(productId, {
      stock: (product.stock || 0) - quantity,
      popularity: (product.popularity || 0) + 1 // 增加人气
    });

    if (!updatedProduct) {
      return { success: false, totalCost: 0 };
    }

    const totalCost = product.price * quantity;

    // 记录市场事件
    this.marketEvents.push({
      id: randomUUID(),
      eventType: 'purchase',
      description: `Purchase of ${quantity} units of ${product.name}`,
      timestamp: new Date(),
      affectedProducts: [productId],
      affectedVendors: product.vendorId ? [product.vendorId] : [],
      marketImpact: {
        demandChange: 1,
        priceChange: 0,
        supplyChange: -quantity / 100 // 小幅影响供应指数
      }
    });

    this.updateStatistics();
    return { success: true, product: updatedProduct, totalCost };
  }

  /**
   * 获取商品价格历史
   */
  getProductPriceHistory(productId: string): PriceHistory[] {
    return this.priceHistory.filter(history => history.productId === productId);
  }

  /**
   * 获取市场统计数据
   */
  getMarketStatistics(): MarketStatistics {
    return { ...this.statistics };
  }

  /**
   * 获取市场趋势
   */
  getMarketTrends(): MarketTrend[] {
    return [...this.marketTrends];
  }

  /**
   * 获取最近的市场事件
   */
  getRecentMarketEvents(limit: number = 10): MarketEvent[] {
    return [...this.marketEvents]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * 获取供应商列表
   */
  getVendors(): Vendor[] {
    return [...this.vendors];
  }

  /**
   * 获取商品列表
   */
  getProducts(filters?: {
    category?: string;
    vendorId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
  }): Product[] {
    let filteredProducts = [...this.products];

    if (filters) {
      if (filters.category) {
        filteredProducts = filteredProducts.filter(p => p.category === filters.category);
      }

      if (filters.vendorId) {
        filteredProducts = filteredProducts.filter(p => p.vendorId === filters.vendorId);
      }

      if (filters.minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice!);
      }

      if (filters.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice!);
      }

      if (filters.inStock !== undefined) {
        filteredProducts = filteredProducts.filter(p => filters.inStock ? (p.stock || 0) > 0 : true);
      }
    }

    return filteredProducts;
  }

  /**
   * 获取特定供应商
   */
  getVendor(vendorId: string): Vendor | undefined {
    return this.vendors.find(v => v.id === vendorId);
  }

  /**
   * 获取特定商品
   */
  getProduct(productId: string): Product | undefined {
    return this.products.find(p => p.id === productId);
  }

  /**
   * 补充商品库存
   */
  restockProduct(productId: string, quantity: number): Product | null {
    const product = this.products.find(p => p.id === productId);
    if (!product) return null;

    const updatedProduct = this.updateProduct(productId, {
      stock: (product.stock || 0) + quantity
    });

    if (updatedProduct) {
      // 记录市场事件
      this.marketEvents.push({
        id: randomUUID(),
        eventType: 'restock',
        description: `Restock of ${quantity} units of ${product.name}`,
        timestamp: new Date(),
        affectedProducts: [productId],
        affectedVendors: product.vendorId ? [product.vendorId] : [],
        marketImpact: {
          demandChange: 0,
          priceChange: -0.5, // 小幅降低价格压力
          supplyChange: quantity / 100 // 增加供应指数
        }
      });
    }

    return updatedProduct;
  }

  /**
   * 触发市场事件
   */
  triggerMarketEvent(eventType: string, description: string, impact: {
    demandChange: number;
    priceChange: number;
    supplyChange: number;
    affectedCategories?: string[];
    affectedVendors?: string[];
  }): MarketEvent {
    const affectedCategories = impact.affectedCategories || [];
    const affectedVendors = impact.affectedVendors || [];

    // 找出受影响的商品
    const affectedProducts = this.products
      .filter(p => {
        return (affectedCategories.length === 0 || affectedCategories.includes(p.category)) &&
               (affectedVendors.length === 0 || (p.vendorId && affectedVendors.includes(p.vendorId)));
      })
      .map(p => p.id);

    const marketEvent: MarketEvent = {
      id: randomUUID(),
      eventType,
      description,
      timestamp: new Date(),
      affectedProducts,
      affectedVendors,
      marketImpact: {
        demandChange: impact.demandChange,
        priceChange: impact.priceChange,
        supplyChange: impact.supplyChange
      }
    };

    this.marketEvents.push(marketEvent);

    // 应用事件影响
    this.applyMarketEventImpact(marketEvent);

    return marketEvent;
  }

  // 私有辅助方法

  /**
   * 生成初始价格历史
   */
  private generateInitialPriceHistory(): void {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    this.products.forEach(product => {
      // 为每个产品生成过去30天的价格历史
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now.getTime() - i * oneDay);
        const randomFactor = 0.95 + Math.random() * 0.1; // 在 0.95 到 1.05 之间的随机因子
        const historicalPrice = Math.round(product.price * randomFactor * 100) / 100;

        this.priceHistory.push({
          productId: product.id,
          timestamp: date,
          price: historicalPrice,
          factors: ['historical']
        });
      }
    });
  }

  /**
   * 更新商品价格
   */
  private updatePrices(gameState: GameState, deltaTime: number): void {
    // 获取当前季节和经济状况
    const season = this.getCurrentSeason(gameState.date);
    const economicFactor = this.calculateEconomicFactor(gameState);

    this.products.forEach(product => {
      // 基础波动因子 (每天 -2% 到 +2% 的随机波动)
      const baseFluctuation = 0.98 + Math.random() * 0.04;
      
      // 季节性影响 (某些商品在特定季节可能价格上涨或下跌)
      const seasonalFactor = this.calculateSeasonalFactor(product, season);
      
      // 供需影响
      const supplyDemandFactor = this.calculateSupplyDemandFactor(product);
      
      // 经济状况影响
      const economicImpact = economicFactor;
      
      // 商品特定波动性
      const volatilityFactor = 1 + (product.volatility - 0.5) * 0.04;
      
      // 计算新价格
      const priceMultiplier = baseFluctuation * seasonalFactor * supplyDemandFactor * economicImpact * volatilityFactor;
      const newPrice = Math.max(product.basePrice * 0.5, Math.min(product.price * priceMultiplier, product.basePrice * 2));
      const roundedPrice = Math.round(newPrice * 100) / 100;
      
      // 如果价格变化超过阈值，则更新价格
      if (Math.abs(roundedPrice - product.price) / product.price > 0.005) { // 0.5% 的变化阈值
        this.updateProduct(product.id, { price: roundedPrice });
        
        // 记录价格历史
        const factors = [];
        if (baseFluctuation > 1.01) factors.push('market_fluctuation');
        if (baseFluctuation < 0.99) factors.push('market_fluctuation');
        if (seasonalFactor > 1.01) factors.push('seasonal_increase');
        if (seasonalFactor < 0.99) factors.push('seasonal_decrease');
        if (supplyDemandFactor > 1.01) factors.push('demand_increase');
        if (supplyDemandFactor < 0.99) factors.push('supply_increase');
        if (economicImpact > 1.01) factors.push('economic_growth');
        if (economicImpact < 0.99) factors.push('economic_recession');
        
        this.priceHistory.push({
          productId: product.id,
          timestamp: new Date(gameState.date),
          price: roundedPrice,
          factors: factors.length > 0 ? factors : ['normal_fluctuation']
        });
      }
    });
  }

  /**
   * 生成市场事件
   */
  private generateMarketEvents(gameState: GameState, deltaTime: number): void {
    // 每天有10%的概率生成随机市场事件
    if (Math.random() > 0.1 * deltaTime) return;

    const eventTypes = [
      'supply_shortage',
      'surplus_supply',
      'demand_spike',
      'demand_drop',
      'new_technology',
      'regulatory_change',
      'economic_shift',
      'seasonal_change',
      'vendor_issue',
      'market_innovation'
    ];

    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    let description = '';
    let impact = {
      demandChange: 0,
      priceChange: 0,
      supplyChange: 0
    };

    // 随机选择受影响的类别
    const categories = [...new Set(this.products.map(p => p.category))];
    const affectedCategories = [categories[Math.floor(Math.random() * categories.length)]];

    switch (eventType) {
      case 'supply_shortage':
        description = `Supply shortage affecting ${affectedCategories[0]} products`;
        impact = {
          demandChange: 0.5,
          priceChange: 1.5,
          supplyChange: -2
        };
        break;

      case 'surplus_supply':
        description = `Surplus supply of ${affectedCategories[0]} products`;
        impact = {
          demandChange: -0.5,
          priceChange: -1,
          supplyChange: 2
        };
        break;

      case 'demand_spike':
        description = `Sudden increase in demand for ${affectedCategories[0]} products`;
        impact = {
          demandChange: 2,
          priceChange: 1,
          supplyChange: -0.5
        };
        break;

      case 'demand_drop':
        description = `Decrease in demand for ${affectedCategories[0]} products`;
        impact = {
          demandChange: -1.5,
          priceChange: -1,
          supplyChange: 0.5
        };
        break;

      case 'new_technology':
        description = `New technology affecting ${affectedCategories[0]} market`;
        impact = {
          demandChange: 1,
          priceChange: -0.5,
          supplyChange: 1
        };
        break;

      case 'regulatory_change':
        description = `Regulatory changes affecting ${affectedCategories[0]} market`;
        impact = {
          demandChange: -0.5,
          priceChange: 0.5,
          supplyChange: -0.5
        };
        break;

      case 'economic_shift':
        description = `Economic shift affecting all markets`;
        impact = {
          demandChange: Math.random() > 0.5 ? 1 : -1,
          priceChange: Math.random() > 0.5 ? 0.5 : -0.5,
          supplyChange: Math.random() > 0.5 ? 0.5 : -0.5
        };
        break;

      case 'seasonal_change':
        description = `Seasonal changes affecting ${affectedCategories[0]} products`;
        impact = {
          demandChange: Math.random() > 0.5 ? 1 : -1,
          priceChange: Math.random() > 0.5 ? 0.5 : -0.5,
          supplyChange: 0
        };
        break;

      case 'vendor_issue':
        // 随机选择一个供应商
        const vendor = this.vendors[Math.floor(Math.random() * this.vendors.length)];
        description = `Issues with vendor ${vendor.name} affecting their products`;
        impact = {
          demandChange: -1,
          priceChange: 0.5,
          supplyChange: -1
        };
        break;

      case 'market_innovation':
        description = `Market innovation in ${affectedCategories[0]} sector`;
        impact = {
          demandChange: 1.5,
          priceChange: 0,
          supplyChange: 1
        };
        break;
    }

    this.triggerMarketEvent(eventType, description, {
      ...impact,
      affectedCategories
    });
  }

  /**
   * 应用市场事件影响
   */
  private applyMarketEventImpact(event: MarketEvent): void {
    // 更新受影响的商品价格和库存
    event.affectedProducts.forEach(productId => {
      const product = this.products.find(p => p.id === productId);
      if (!product) return;

      // 价格影响
      const priceChange = product.price * (event.marketImpact.priceChange / 100);
      const newPrice = Math.max(product.basePrice * 0.5, Math.min(product.price + priceChange, product.basePrice * 2));

      // 库存影响
      const supplyChange = Math.floor(product.stock * (event.marketImpact.supplyChange / 100));
      const newStock = Math.max(0, product.stock + supplyChange);

      // 更新商品
      this.updateProduct(productId, {
        price: Math.round(newPrice * 100) / 100,
        stock: newStock
      });
    });

    // 更新市场趋势
    const existingTrendIndex = this.marketTrends.findIndex(t => 
      t.trendType === event.eventType && 
      t.affectedCategories.some(c => event.affectedProducts.includes(c))
    );

    if (existingTrendIndex >= 0) {
      // 更新现有趋势
      this.marketTrends[existingTrendIndex].strength += event.marketImpact.demandChange / 100;
      this.marketTrends[existingTrendIndex].duration += 1;
    } else {
      // 创建新趋势
      const affectedCategories = [...new Set(
        event.affectedProducts.map(productId => {
          const product = this.products.find(p => p.id === productId);
          return product ? product.category : '';
        }).filter(category => category !== '')
      )];

      if (affectedCategories.length > 0) {
        this.marketTrends.push({
          id: randomUUID(),
          trendType: event.eventType,
          description: `Trend: ${event.description}`,
          strength: event.marketImpact.demandChange / 100,
          duration: 3, // 默认持续3天
          startDate: new Date(),
          affectedCategories
        });
      }
    }

    // 更新市场统计数据
    this.updateStatistics();
  }

  /**
   * 更新市场趋势
   */
  private updateMarketTrends(gameState: GameState): void {
    // 移除过期的趋势
    this.marketTrends = this.marketTrends.filter(trend => {
      const trendEndDate = new Date(trend.startDate);
      trendEndDate.setDate(trendEndDate.getDate() + trend.duration);
      return trendEndDate >= gameState.date;
    });

    // 减弱长期趋势的强度
    this.marketTrends.forEach(trend => {
      const daysSinceStart = Math.floor((gameState.date.getTime() - trend.startDate.getTime()) / (24 * 60 * 60 * 1000));
      if (daysSinceStart > 1) {
        trend.strength *= 0.9; // 每天减弱10%
      }
    });
  }

  /**
   * 更新市场统计数据
   */
  private updateStatistics(): void {
    if (this.products.length === 0) {
      this.statistics = {
        averageProductPrice: 0,
        totalVendors: this.vendors.length,
        totalProducts: 0,
        priceVolatility: 0,
        marketHealth: 100,
        demandIndex: 50,
        supplyIndex: 50,
        popularCategories: [],
        trendingProducts: [],
        seasonalFactors: []
      };
      return;
    }

    // 计算平均价格
    const averagePrice = this.products.reduce((sum, product) => sum + product.price, 0) / this.products.length;

    // 计算价格波动性
    const priceVolatility = this.calculatePriceVolatility();

    // 计算市场健康度
    const marketHealth = this.calculateMarketHealth();

    // 计算需求指数
    const demandIndex = this.calculateDemandIndex();

    // 计算供应指数
    const supplyIndex = this.calculateSupplyIndex();

    // 计算热门类别
    const popularCategories = this.calculatePopularCategories();

    // 计算热门商品
    const trendingProducts = this.calculateTrendingProducts();

    // 计算季节性因素
    const seasonalFactors = this.calculateSeasonalFactors();

    this.statistics = {
      averageProductPrice: Math.round(averagePrice * 100) / 100,
      totalVendors: this.vendors.length,
      totalProducts: this.products.length,
      priceVolatility,
      marketHealth,
      demandIndex,
      supplyIndex,
      popularCategories,
      trendingProducts,
      seasonalFactors
    };
  }

  /**
   * 管理供应商关系
   */
  private manageVendorRelationships(deltaTime: number): void {
    this.vendors.forEach(vendor => {
      // 随机小幅度调整关系值
      const relationshipChange = (Math.random() - 0.5) * 0.2 * deltaTime;
      const newRelationship = Math.max(0, Math.min(100, vendor.relationship + relationshipChange));
      
      if (Math.abs(newRelationship - vendor.relationship) > 0.1) {
        this.updateVendor(vendor.id, { relationship: newRelationship });
      }
      
      // 根据关系值调整供应商的价格和库存
      if (Math.random() < 0.05 * deltaTime) {
        const vendorProducts = this.products.filter(p => p.vendorId === vendor.id);
        vendorProducts.forEach(product => {
          // 关系好的供应商提供更好的价格和更多库存
          const relationshipFactor = vendor.relationship / 100;
          const priceAdjustment = 1 - (relationshipFactor * 0.1); // 最多降价10%
          const stockBonus = Math.floor(relationshipFactor * 5); // 最多增加5个库存
          
          this.updateProduct(product.id, {
            price: Math.round(product.basePrice * priceAdjustment * 100) / 100,
            stock: product.stock + stockBonus
          });
        });
      }
    });
  }

  /**
   * 计算当前季节
   */
  private getCurrentSeason(date: Date): 'spring' | 'summer' | 'autumn' | 'winter' {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  /**
   * 计算经济因子
   */
  private calculateEconomicFactor(gameState: GameState): number {
    // 简化的经济因子计算，实际应该基于游戏状态中的经济指标
    return 0.98 + Math.random() * 0.04; // 0.98 到 1.02 之间
  }

  /**
   * 计算季节性因子
   */
  private calculateSeasonalFactor(product: Product, season: 'spring' | 'summer' | 'autumn' | 'winter'): number {
    // 不同商品在不同季节有不同的价格影响
    const seasonalFactors: Record<string, Record<string, number>> = {
      'construction': {
        'spring': 1.05,
        'summer': 1.1,
        'autumn': 0.95,
        'winter': 0.9
      },
      'decoration': {
        'spring': 1.1,
        'summer': 1.0,
        'autumn': 1.05,
        'winter': 0.95
      },
      'furniture': {
        'spring': 1.05,
        'summer': 1.0,
        'autumn': 1.0,
        'winter': 0.95
      },
      'appliance': {
        'spring': 1.0,
        'summer': 1.05,
        'autumn': 1.0,
        'winter': 0.95
      },
      'service': {
        'spring': 1.0,
        'summer': 1.05,
        'autumn': 1.0,
        'winter': 0.95
      }
    };

    return seasonalFactors[product.category]?.[season] || 1.0;
  }

  /**
   * 计算供需因子
   */
  private calculateSupplyDemandFactor(product: Product): number {
    // 库存低意味着需求高于供应，价格上涨
    const stockRatio = product.stock / product.maxStock;
    
    if (stockRatio < 0.2) return 1.05; // 库存非常低，价格上涨5%
    if (stockRatio < 0.4) return 1.02; // 库存较低，价格上涨2%
    if (stockRatio > 0.8) return 0.98; // 库存较高，价格下跌2%
    if (stockRatio > 0.9) return 0.95; // 库存非常高，价格下跌5%
    
    return 1.0; // 库存适中，价格稳定
  }

  /**
   * 计算价格波动性
   */
  private calculatePriceVolatility(): number {
    if (this.priceHistory.length < 10) return 0;

    // 计算最近7天的价格变化率
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentHistory = this.priceHistory.filter(h => h.timestamp >= sevenDaysAgo);
    if (recentHistory.length < 2) return 0;

    // 按产品分组计算波动性
    const productVolatilities: number[] = [];
    
    const productIds = [...new Set(recentHistory.map(h => h.productId))];
    productIds.forEach(productId => {
      const productHistory = recentHistory
        .filter(h => h.productId === productId)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      if (productHistory.length < 2) return;
      
      // 计算每日价格变化率
      let totalChange = 0;
      for (let i = 1; i < productHistory.length; i++) {
        const prevPrice = productHistory[i-1].price;
        const currentPrice = productHistory[i].price;
        const changeRate = Math.abs((currentPrice - prevPrice) / prevPrice);
        totalChange += changeRate;
      }
      
      const avgChange = totalChange / (productHistory.length - 1);
      productVolatilities.push(avgChange * 100); // 转换为百分比
    });
    
    if (productVolatilities.length === 0) return 0;
    
    // 返回平均波动性
    return Math.round(productVolatilities.reduce((sum, v) => sum + v, 0) / productVolatilities.length);
  }

  /**
   * 计算市场健康度
   */
  private calculateMarketHealth(): number {
    // 基于多个因素计算市场健康度
    const vendorDiversity = Math.min(100, this.vendors.length * 10); // 供应商多样性
    const productDiversity = Math.min(100, this.products.length * 2); // 产品多样性
    
    // 计算平均库存水平
    const avgStockLevel = this.products.reduce((sum, p) => sum + (p.stock / p.maxStock), 0) / this.products.length * 100;
    
    // 计算平均供应商关系
    const avgVendorRelationship = this.vendors.reduce((sum, v) => sum + v.relationship, 0) / this.vendors.length;
    
    // 综合计算健康度
    const health = (
      vendorDiversity * 0.3 +
      productDiversity * 0.3 +
      avgStockLevel * 0.2 +
      avgVendorRelationship * 0.2
    );
    
    return Math.round(Math.max(0, Math.min(100, health)));
  }

  /**
   * 计算需求指数
   */
  private calculateDemandIndex(): number {
    // 基于最近购买事件和市场趋势计算需求指数
    const baseIndex = 50; // 基础需求指数
    
    // 计算最近购买事件的影响
    const recentPurchases = this.marketEvents
      .filter(e => e.eventType === 'purchase')
      .filter(e => e.timestamp.getTime() > Date.now() - 3 * 24 * 60 * 60 * 1000); // 最近3天
    
    const purchaseImpact = recentPurchases.length * 2; // 每次购买增加2点需求
    
    // 计算市场趋势的影响
    const trendImpact = this.marketTrends.reduce((sum, trend) => {
      if (trend.trendType.includes('demand')) {
        return sum + (trend.strength * 10); // 需求相关趋势的影响
      }
      return sum;
    }, 0);
    
    // 综合计算需求指数
    const demandIndex = baseIndex + purchaseImpact + trendImpact;
    
    return Math.round(Math.max(0, Math.min(100, demandIndex)));
  }

  /**
   * 计算供应指数
   */
  private calculateSupplyIndex(): number {
    // 基于库存水平和供应商关系计算供应指数
    const baseIndex = 50; // 基础供应指数
    
    // 计算平均库存水平的影响
    const avgStockRatio = this.products.reduce((sum, p) => sum + (p.stock / p.maxStock), 0) / this.products.length;
    const stockImpact = (avgStockRatio - 0.5) * 50; // 库存比例影响
    
    // 计算供应商关系的影响
    const avgRelationship = this.vendors.reduce((sum, v) => sum + v.relationship, 0) / this.vendors.length;
    const relationshipImpact = (avgRelationship / 100 - 0.5) * 20; // 关系影响
    
    // 计算市场趋势的影响
    const trendImpact = this.marketTrends.reduce((sum, trend) => {
      if (trend.trendType.includes('supply')) {
        return sum + (trend.strength * 10); // 供应相关趋势的影响
      }
      return sum;
    }, 0);
    
    // 综合计算供应指数
    const supplyIndex = baseIndex + stockImpact + relationshipImpact + trendImpact;
    
    return Math.round(Math.max(0, Math.min(100, supplyIndex)));
  }

  /**
   * 计算热门类别
   */
  private calculatePopularCategories(): { category: string; popularity: number }[] {
    // 基于商品人气和最近购买计算热门类别
    const categoryPopularity: Record<string, { totalPopularity: number; count: number }> = {};
    
    this.products.forEach(product => {
      if (!categoryPopularity[product.category]) {
        categoryPopularity[product.category] = { totalPopularity: 0, count: 0 };
      }
      
      categoryPopularity[product.category].totalPopularity += product.popularity;
      categoryPopularity[product.category].count += 1;
    });
    
    return Object.entries(categoryPopularity)
      .map(([category, data]) => ({
        category,
        popularity: Math.round(data.totalPopularity / data.count)
      }))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 5); // 返回前5个热门类别
  }

  /**
   * 计算热门商品
   */
  private calculateTrendingProducts(): { productId: string; name: string; popularity: number }[] {
    // 返回人气最高的商品
    return this.products
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10) // 返回前10个热门商品
      .map(p => ({
        productId: p.id,
        name: p.name,
        popularity: p.popularity
      }));
  }

  /**
   * 计算季节性因素
   */
  private calculateSeasonalFactors(): { category: string; season: string; impact: number }[] {
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    const currentSeason = this.getCurrentSeason(new Date());
    
    // 获取所有商品类别
    const categories = [...new Set(this.products.map(p => p.category))];
    
    return categories.map(category => {
      // 计算当前季节对该类别的影响
      const seasonalFactor = this.calculateSeasonalFactor(
        { category } as Product, 
        currentSeason as 'spring' | 'summer' | 'autumn' | 'winter'
      );
      
      return {
        category,
        season: currentSeason,
        impact: Math.round((seasonalFactor - 1) * 100) // 转换为百分比影响
      };
    });
  }
}

export default MarketService;