// 物业类型枚举
export enum PropertyType {
  RESIDENTIAL = 'residential',   // 住宅
  COMMERCIAL = 'commercial',     // 商业
  OFFICE = 'office',            // 办公
  INDUSTRIAL = 'industrial',     // 工业
  MIXED = 'mixed'               // 混合用途
}

// 物业状态枚举
export enum PropertyStatus {
  AVAILABLE = 'available',       // 可用
  OCCUPIED = 'occupied',        // 已占用
  MAINTENANCE = 'maintenance',   // 维护中
  RENOVATION = 'renovation',     // 装修中
  DAMAGED = 'damaged'           // 损坏
}

// 物业等级枚举
export enum PropertyGrade {
  BASIC = 'basic',              // 基础
  STANDARD = 'standard',        // 标准
  PREMIUM = 'premium',          // 高级
  LUXURY = 'luxury'             // 豪华
}

// 物业设施
export interface PropertyFacility {
  id: string;
  name: string;
  type: 'security' | 'comfort' | 'convenience' | 'entertainment' | 'business';
  level: number;                // 设施等级 (1-5)
  maintenanceCost: number;      // 维护成本
  satisfactionBonus: number;    // 满意度加成
  rentBonus: number;           // 租金加成
  energyCost: number;          // 能耗成本
  description: string;
}

// 物业维护记录
export interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'routine' | 'repair' | 'upgrade' | 'emergency';
  description: string;
  cost: number;
  duration: number;            // 维护时长(小时)
  contractor?: string;         // 承包商
  quality: number;            // 维护质量 (1-5)
  notes?: string;
}

// 物业财务数据
export interface PropertyFinancials {
  monthlyRent: number;         // 月租金
  occupancyRate: number;       // 入住率
  monthlyRevenue: number;      // 月收入
  monthlyExpenses: number;     // 月支出
  monthlyProfit: number;       // 月利润
  yearlyRevenue: number;       // 年收入
  yearlyExpenses: number;      // 年支出
  yearlyProfit: number;        // 年利润
  roi: number;                // 投资回报率
  breakEvenMonths: number;     // 回本月数
}

// 物业市场数据
export interface PropertyMarketData {
  averageRentInArea: number;   // 区域平均租金
  marketValue: number;         // 市场价值
  appreciationRate: number;    // 升值率
  demandScore: number;         // 需求评分 (1-100)
  competitionLevel: number;    // 竞争水平 (1-100)
  futureProspects: 'excellent' | 'good' | 'fair' | 'poor';
}

// 物业位置信息
export interface PropertyLocation {
  address: string;
  district: string;            // 区域
  coordinates: {
    lat: number;
    lng: number;
  };
  nearbyFacilities: {
    schools: number;           // 附近学校数量
    hospitals: number;         // 附近医院数量
    shoppingCenters: number;   // 附近购物中心数量
    transportStations: number; // 附近交通站点数量
    parks: number;            // 附近公园数量
  };
  accessibilityScore: number; // 交通便利性评分 (1-100)
  environmentScore: number;   // 环境评分 (1-100)
}

// 主物业接口
export interface Property {
  // 基础信息
  id: string;
  name: string;
  type: PropertyType;
  status: PropertyStatus;
  grade: PropertyGrade;
  
  // 物理属性
  area: number;               // 面积(平方米)
  floors: number;             // 楼层数
  rooms: number;              // 房间数
  bathrooms: number;          // 卫生间数
  parkingSpaces: number;      // 停车位数
  
  // 位置信息
  location: PropertyLocation;
  
  // 财务信息
  purchasePrice: number;      // 购买价格
  currentValue: number;       // 当前价值
  financials: PropertyFinancials;
  marketData: PropertyMarketData;
  
  // 设施和维护
  facilities: PropertyFacility[];
  maintenanceHistory: MaintenanceRecord[];
  condition: number;          // 物业状况 (1-100)
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  
  // 租户信息
  maxTenants: number;         // 最大租户数
  currentTenants: string[];   // 当前租户ID列表
  
  // 游戏属性
  satisfactionRating: number; // 满意度评分 (1-100)
  popularityScore: number;    // 受欢迎程度 (1-100)
  specialFeatures: string[];  // 特殊功能列表
  
  // 时间信息
  purchaseDate: string;
  createdAt: string;
  updatedAt: string;
}

// 物业搜索过滤器
export interface PropertyFilter {
  type?: PropertyType[];
  status?: PropertyStatus[];
  grade?: PropertyGrade[];
  minArea?: number;
  maxArea?: number;
  minPrice?: number;
  maxPrice?: number;
  minRent?: number;
  maxRent?: number;
  district?: string[];
  minCondition?: number;
  hasParking?: boolean;
  minRooms?: number;
  maxRooms?: number;
}

// 物业排序选项
export interface PropertySortOptions {
  field: 'name' | 'type' | 'area' | 'rent' | 'value' | 'condition' | 'satisfaction' | 'profit';
  order: 'asc' | 'desc';
}

// 物业统计数据
export interface PropertyStatistics {
  totalProperties: number;
  totalValue: number;
  totalMonthlyRevenue: number;
  totalMonthlyExpenses: number;
  totalMonthlyProfit: number;
  averageOccupancyRate: number;
  averageSatisfactionRating: number;
  averageCondition: number;
  propertiesByType: Record<PropertyType, number>;
  propertiesByStatus: Record<PropertyStatus, number>;
  propertiesByGrade: Record<PropertyGrade, number>;
}