// 拍卖物品类型
export enum AuctionItemType {
  PROPERTY = 'property',            // 物业
  EQUIPMENT = 'equipment',          // 装备
  RARE_ITEM = 'rare_item',         // 稀有物品
  BLUEPRINT = 'blueprint',          // 蓝图
  CONTRACT = 'contract',            // 合同
  BUSINESS = 'business'             // 企业
}

// 拍卖状态
export enum AuctionStatus {
  UPCOMING = 'upcoming',            // 即将开始
  ACTIVE = 'active',                // 进行中
  ENDING_SOON = 'ending_soon',      // 即将结束
  ENDED = 'ended',                  // 已结束
  CANCELLED = 'cancelled'           // 已取消
}

// 竞拍状态
export enum BidStatus {
  ACTIVE = 'active',                // 有效
  OUTBID = 'outbid',               // 被超越
  WINNING = 'winning',              // 领先
  WON = 'won',                     // 获胜
  LOST = 'lost'                    // 失败
}

// 拍卖物品详情
export interface AuctionItemDetails {
  // 基础信息
  name: string;
  description: string;
  category: string;
  
  // 属性信息
  attributes: {
    [key: string]: string | number | boolean;
  };
  
  // 图片和媒体
  images: string[];
  videos?: string[];
  
  // 估值信息
  estimatedValue: number;
  marketValue: number;
  condition: 'new' | 'excellent' | 'good' | 'fair' | 'poor';
  
  // 历史信息
  previousOwner?: string;
  acquisitionDate?: string;
  provenance?: string;              // 来源历史
}

// 竞拍记录
export interface AuctionBid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  timestamp: string;
  status: BidStatus;
  isAutomatic: boolean;             // 是否自动竞拍
  maxAmount?: number;               // 自动竞拍最高金额
}

// 拍卖规则
export interface AuctionRules {
  minimumBidIncrement: number;      // 最小加价幅度
  reservePrice?: number;            // 保留价
  buyNowPrice?: number;             // 一口价
  maxBidsPerUser?: number;          // 每用户最大竞拍次数
  allowAutoBidding: boolean;        // 允许自动竞拍
  extendOnLastMinuteBid: boolean;   // 最后一分钟竞拍延时
  extensionTime: number;            // 延时时间(分钟)
}

// 拍卖费用
export interface AuctionFees {
  listingFee: number;               // 上架费
  successFee: number;               // 成交费(百分比)
  buyerPremium: number;             // 买家佣金(百分比)
  paymentProcessingFee: number;     // 支付处理费(百分比)
}

// 主拍卖物品接口
export interface AuctionItem {
  // 基础信息
  id: string;
  type: AuctionItemType;
  status: AuctionStatus;
  
  // 物品详情
  details: AuctionItemDetails;
  
  // 拍卖信息
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  
  // 价格信息
  startingPrice: number;
  currentPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
  
  // 竞拍信息
  bids: AuctionBid[];
  totalBids: number;
  leadingBidderId?: string;
  leadingBidderName?: string;
  
  // 时间信息
  startTime: string;
  endTime: string;
  duration: number;                 // 拍卖时长(小时)
  timeRemaining: number;            // 剩余时间(分钟)
  
  // 规则和费用
  rules: AuctionRules;
  fees: AuctionFees;
  
  // 观察者信息
  watchers: string[];               // 关注者ID列表
  viewCount: number;                // 浏览次数
  
  // 特殊标记
  isFeatured: boolean;              // 是否精选
  isHot: boolean;                   // 是否热门
  hasReserve: boolean;              // 是否有保留价
  
  // 验证信息
  isVerified: boolean;              // 是否已验证
  verificationDetails?: {
    verifiedBy: string;
    verificationDate: string;
    verificationNotes: string;
  };
  
  // 时间信息
  createdAt: string;
  updatedAt: string;
}

// 拍卖搜索过滤器
export interface AuctionFilter {
  type?: AuctionItemType[];
  status?: AuctionStatus[];
  priceRange?: {
    min: number;
    max: number;
  };
  category?: string[];
  condition?: string[];
  location?: string[];
  endingWithin?: number;            // 在指定小时内结束
  hasReserve?: boolean;
  hasBuyNow?: boolean;
  isFeatured?: boolean;
  sellerRating?: {
    min: number;
    max: number;
  };
}

// 拍卖排序选项
export interface AuctionSortOptions {
  field: 'price' | 'endTime' | 'bids' | 'watchers' | 'created' | 'popular';
  order: 'asc' | 'desc';
}

// 拍卖结果
export interface AuctionResult {
  auctionId: string;
  itemName: string;
  finalPrice: number;
  winnerId: string;
  winnerName: string;
  totalBids: number;
  
  // 支付信息
  paymentDue: number;               // 应付金额(含费用)
  paymentDeadline: string;
  paymentStatus: 'pending' | 'paid' | 'overdue' | 'cancelled';
  
  // 交付信息
  deliveryMethod: 'pickup' | 'delivery' | 'digital';
  deliveryStatus: 'pending' | 'in_transit' | 'delivered' | 'failed';
  deliveryDate?: string;
  
  // 评价信息
  buyerRating?: {
    rating: number;
    comment: string;
    date: string;
  };
  sellerRating?: {
    rating: number;
    comment: string;
    date: string;
  };
  
  // 时间信息
  endedAt: string;
  completedAt?: string;
}

// 拍卖统计
export interface AuctionStatistics {
  // 总体统计
  totalAuctions: number;
  activeAuctions: number;
  completedAuctions: number;
  totalValue: number;
  
  // 参与统计
  totalBids: number;
  uniqueBidders: number;
  averageBidsPerAuction: number;
  
  // 价格统计
  averageFinalPrice: number;
  highestSale: {
    auctionId: string;
    itemName: string;
    finalPrice: number;
    date: string;
  };
  
  // 成功率
  successRate: number;              // 成交率
  averageSellingPrice: number;
  
  // 类型统计
  auctionsByType: Record<AuctionItemType, {
    count: number;
    totalValue: number;
    averagePrice: number;
    successRate: number;
  }>;
  
  // 时间统计
  averageAuctionDuration: number;
  peakBiddingHours: number[];       // 竞拍高峰时段
  
  // 用户统计
  topSellers: {
    sellerId: string;
    sellerName: string;
    totalSales: number;
    totalValue: number;
    rating: number;
  }[];
  
  topBuyers: {
    buyerId: string;
    buyerName: string;
    totalPurchases: number;
    totalSpent: number;
    rating: number;
  }[];
}

// 自动竞拍设置
export interface AutoBidSettings {
  isEnabled: boolean;
  maxAmount: number;
  incrementStrategy: 'minimum' | 'aggressive' | 'conservative';
  stopIfOutbid: boolean;
  notifications: {
    onOutbid: boolean;
    onWin: boolean;
    onLoss: boolean;
  };
}