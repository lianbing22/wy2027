// 供应商类型枚举
export enum SupplierType {
  CONSTRUCTION = 'construction',     // 建筑施工
  MAINTENANCE = 'maintenance',       // 维护保养
  FURNITURE = 'furniture',          // 家具供应
  APPLIANCE = 'appliance',          // 电器供应
  SECURITY = 'security',            // 安保服务
  CLEANING = 'cleaning',            // 清洁服务
  LANDSCAPING = 'landscaping',      // 园艺绿化
  UTILITIES = 'utilities'           // 公用事业
}

// 供应商等级枚举
export enum SupplierGrade {
  BASIC = 'basic',                  // 基础
  STANDARD = 'standard',            // 标准
  PREMIUM = 'premium',              // 高级
  ELITE = 'elite'                   // 精英
}

// 服务质量等级
export enum ServiceQuality {
  POOR = 'poor',                    // 差
  FAIR = 'fair',                    // 一般
  GOOD = 'good',                    // 良好
  EXCELLENT = 'excellent',          // 优秀
  OUTSTANDING = 'outstanding'       // 杰出
}

// 供应商服务项目
export interface SupplierService {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  duration: number;                 // 服务时长(小时)
  quality: ServiceQuality;
  satisfactionBonus: number;        // 满意度加成
  durabilityBonus: number;         // 耐久度加成
  requirements: string[];          // 服务要求
}

// 供应商评价
export interface SupplierReview {
  id: string;
  serviceId: string;
  rating: number;                   // 评分 (1-5)
  comment: string;
  date: string;
  propertyId: string;
  verified: boolean;
}

// 供应商合同
export interface SupplierContract {
  id: string;
  supplierId: string;
  serviceIds: string[];
  startDate: string;
  endDate: string;
  totalValue: number;
  paymentTerms: string;
  discountRate: number;            // 折扣率
  penaltyClause: string;
  status: 'active' | 'expired' | 'terminated' | 'pending';
}

// 主供应商接口
export interface Supplier {
  // 基础信息
  id: string;
  name: string;
  type: SupplierType;
  grade: SupplierGrade;
  
  // 联系信息
  contact: {
    phone: string;
    email: string;
    address: string;
    website?: string;
  };
  
  // 业务信息
  services: SupplierService[];
  specialties: string[];           // 专业领域
  certifications: string[];       // 资质认证
  
  // 评价和信誉
  overallRating: number;          // 总体评分 (1-5)
  totalReviews: number;
  reviews: SupplierReview[];
  reliabilityScore: number;       // 可靠性评分 (1-100)
  
  // 商业条件
  priceLevel: 'low' | 'medium' | 'high' | 'premium';
  paymentTerms: string[];
  availableDiscounts: {
    volumeDiscount: number;       // 批量折扣
    loyaltyDiscount: number;      // 忠诚度折扣
    seasonalDiscount: number;     // 季节性折扣
  };
  
  // 服务能力
  capacity: number;               // 服务容量
  currentWorkload: number;        // 当前工作量
  responseTime: number;           // 响应时间(小时)
  serviceArea: string[];          // 服务区域
  
  // 合作历史
  contracts: SupplierContract[];
  totalProjectsCompleted: number;
  averageProjectValue: number;
  
  // 时间信息
  establishedDate: string;
  lastServiceDate?: string;
  createdAt: string;
  updatedAt: string;
}

// 市场商品类型
export enum MarketItemType {
  PROPERTY = 'property',            // 物业
  EQUIPMENT = 'equipment',          // 设备
  FURNITURE = 'furniture',          // 家具
  DECORATION = 'decoration',        // 装饰品
  UPGRADE = 'upgrade',              // 升级材料
  CONSUMABLE = 'consumable'         // 消耗品
}

// 市场商品
export interface MarketItem {
  id: string;
  name: string;
  type: MarketItemType;
  description: string;
  category: string;
  
  // 价格信息
  basePrice: number;
  currentPrice: number;
  priceHistory: PricePoint[];
  
  // 属性
  quality: number;                 // 品质 (1-100)
  durability: number;              // 耐久度 (1-100)
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  
  // 效果
  effects: ItemEffect[];
  
  // 市场信息
  availability: number;            // 可用数量
  demand: number;                  // 需求度 (1-100)
  popularity: number;              // 受欢迎程度 (1-100)
  
  // 供应商信息
  supplierId: string;
  
  // 时间信息
  listedDate: string;
  lastUpdated: string;
}

// 价格历史点
export interface PricePoint {
  date: string;
  price: number;
  volume: number;                  // 交易量
}

// 物品效果
export interface ItemEffect {
  type: 'satisfaction' | 'rent' | 'maintenance' | 'energy' | 'security' | 'comfort';
  value: number;
  duration?: number;               // 持续时间(天)
  description: string;
}

// 市场趋势分析
export interface MarketAnalysis {
  sector: string;
  trend: 'rising' | 'falling' | 'stable' | 'volatile';
  confidence: number;              // 置信度 (1-100)
  factors: string[];               // 影响因素
  prediction: {
    shortTerm: number;             // 短期预测 (7天)
    mediumTerm: number;            // 中期预测 (30天)
    longTerm: number;              // 长期预测 (90天)
  };
  recommendations: string[];
}

// 竞争对手信息
export interface Competitor {
  id: string;
  name: string;
  type: 'individual' | 'company' | 'corporation';
  
  // 业务信息
  properties: number;              // 物业数量
  totalValue: number;              // 总价值
  marketShare: number;             // 市场份额
  
  // 策略信息
  averageRent: number;
  occupancyRate: number;
  customerSatisfaction: number;
  
  // 竞争力分析
  strengths: string[];
  weaknesses: string[];
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // 历史数据
  performanceHistory: {
    date: string;
    revenue: number;
    marketShare: number;
    satisfaction: number;
  }[];
}

// 市场事件
export interface MarketEvent {
  id: string;
  type: 'economic' | 'policy' | 'natural' | 'social' | 'technological';
  name: string;
  description: string;
  
  // 影响
  impact: {
    priceChange: number;           // 价格变化百分比
    demandChange: number;          // 需求变化百分比
    availabilityChange: number;    // 可用性变化百分比
  };
  
  // 时间信息
  startDate: string;
  endDate?: string;
  duration: number;                // 持续时间(天)
  
  // 影响范围
  affectedSectors: string[];
  affectedRegions: string[];
}

// 市场统计数据
export interface MarketStatistics {
  totalSuppliers: number;
  totalItems: number;
  totalTransactions: number;
  totalValue: number;
  
  // 价格统计
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  
  // 供应商统计
  suppliersByType: Record<SupplierType, number>;
  suppliersByGrade: Record<SupplierGrade, number>;
  averageSupplierRating: number;
  
  // 市场活跃度
  dailyTransactions: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  
  // 热门商品
  topSellingItems: {
    itemId: string;
    name: string;
    sales: number;
    revenue: number;
  }[];
}