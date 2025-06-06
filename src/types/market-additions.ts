// 这个文件包含MarketService使用的额外类型定义

// 扩展MarketTrend类型以支持服务中使用的额外字段
export interface MarketTrendExtended {
  id: string;
  name: string;
  description: string;
  effect: number;
  duration: number;
  remainingDays: number;
  
  // 额外字段
  trendType?: string;
  strength?: number;
  startDate?: Date;
  affectedCategories?: string[];
  categoryTrends?: Record<string, number>;
  seasonalFactors?: Record<number, number>;
}

// 扩展MarketStatistics类型以支持服务中使用的额外字段
export interface MarketStatisticsExtended {
  averageProductPrice: number;
  totalVendors: number;
  totalProducts: number;
  priceVolatility: number;
  marketHealth: number;
  demandIndex: number;
  supplyIndex: number;
  popularCategories: string[];
  trendingProducts: string[];
  seasonalFactors: any[];
}

// 扩展Vendor类型以支持服务中使用的额外字段
export interface VendorExtended {
  id: string;
  name: string;
  type: string;
  products: any[];
  relationship?: number;
}

// 扩展Product类型以支持服务中使用的额外字段
export interface ProductExtended {
  id: string;
  name: string;
  category: string;
  price: number;
  quality: number;
  description: string;
  stock?: number;
  popularity?: number;
  vendorId?: string;
  basePrice?: number;
  maxStock?: number;
  volatility?: number;
}

// 扩展PriceHistory类型以支持服务中使用的额外字段
export interface PriceHistoryExtended {
  id: string;
  productId: string;
  price: number;
  timestamp: Date;
  reason?: string;
  marketCondition?: string;
  factors?: string[];
}

// 扩展EventEffect类型以支持GameEngineService使用的额外字段
export interface EventEffectExtended {
  magnitude: number;
  type: string;
  target: string;
  scope?: string;
  description?: string;
  duration?: number;
  property?: string;
  modifier?: number;
  value?: number;
  priceChange?: number;
} 