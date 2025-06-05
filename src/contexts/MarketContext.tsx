import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  Supplier, 
  SupplierType, 
  SupplierRating, 
  MarketItem, 
  MarketItemType, 
  MarketTrendAnalysis, 
  MarketEvent, 
  MarketStatistics,
  PriceHistoryPoint
} from '@types/market';

// 市场管理动作类型
type MarketAction =
  | { type: 'ADD_SUPPLIER'; payload: Supplier }
  | { type: 'UPDATE_SUPPLIER'; payload: Supplier }
  | { type: 'REMOVE_SUPPLIER'; payload: string }
  | { type: 'ADD_MARKET_ITEM'; payload: MarketItem }
  | { type: 'UPDATE_MARKET_ITEM'; payload: MarketItem }
  | { type: 'REMOVE_MARKET_ITEM'; payload: string }
  | { type: 'PURCHASE_ITEM'; payload: { itemId: string; quantity: number; totalCost: number } }
  | { type: 'UPDATE_PRICE_HISTORY'; payload: { itemId: string; pricePoint: PriceHistoryPoint } }
  | { type: 'TRIGGER_MARKET_EVENT'; payload: MarketEvent }
  | { type: 'UPDATE_MARKET_TRENDS'; payload: MarketTrendAnalysis }
  | { type: 'UPDATE_STATISTICS'; payload: Partial<MarketStatistics> }
  | { type: 'SET_SELECTED_SUPPLIER'; payload: Supplier | null }
  | { type: 'SET_SELECTED_ITEM'; payload: MarketItem | null };

// 市场管理状态
interface MarketState {
  suppliers: Supplier[];
  marketItems: MarketItem[];
  marketTrends: MarketTrendAnalysis;
  marketEvents: MarketEvent[];
  statistics: MarketStatistics;
  selectedSupplier: Supplier | null;
  selectedItem: MarketItem | null;
  priceHistory: Record<string, PriceHistoryPoint[]>;
}

// 市场上下文接口
interface MarketContextType {
  marketState: MarketState;
  dispatch: React.Dispatch<MarketAction>;
  
  // 供应商管理方法
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplier: Supplier) => void;
  removeSupplier: (supplierId: string) => void;
  getSupplierById: (supplierId: string) => Supplier | undefined;
  getSuppliersByType: (type: SupplierType) => Supplier[];
  
  // 市场商品管理方法
  addMarketItem: (item: MarketItem) => void;
  updateMarketItem: (item: MarketItem) => void;
  removeMarketItem: (itemId: string) => void;
  getMarketItemById: (itemId: string) => MarketItem | undefined;
  getMarketItemsByType: (type: MarketItemType) => MarketItem[];
  
  // 购买方法
  purchaseItem: (itemId: string, quantity: number) => boolean;
  
  // 价格历史方法
  updatePriceHistory: (itemId: string, pricePoint: PriceHistoryPoint) => void;
  getPriceHistory: (itemId: string) => PriceHistoryPoint[];
  
  // 市场事件方法
  triggerMarketEvent: (event: MarketEvent) => void;
  
  // 市场趋势方法
  updateMarketTrends: (trends: MarketTrendAnalysis) => void;
  analyzeMarketTrends: () => MarketTrendAnalysis;
  
  // 统计方法
  updateStatistics: (stats: Partial<MarketStatistics>) => void;
  calculateStatistics: () => MarketStatistics;
  
  // 选择方法
  selectSupplier: (supplier: Supplier | null) => void;
  selectItem: (item: MarketItem | null) => void;
  
  // 搜索方法
  searchSuppliers: (query: string) => Supplier[];
  searchMarketItems: (query: string) => MarketItem[];
  
  // 推荐方法
  getRecommendedSuppliers: (type?: SupplierType) => Supplier[];
  getRecommendedItems: (type?: MarketItemType) => MarketItem[];
}

// 初始市场状态
const initialMarketState: MarketState = {
  suppliers: [],
  marketItems: [],
  marketTrends: {
    overallTrend: 'stable',
    priceIndex: 100,
    demandIndex: 100,
    supplyIndex: 100,
    volatilityIndex: 0,
    seasonalFactors: {},
    categoryTrends: {},
    predictions: []
  },
  marketEvents: [],
  statistics: {
    totalSuppliers: 0,
    totalMarketItems: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    averageItemPrice: 0,
    topSellingItems: [],
    topSuppliers: [],
    marketGrowthRate: 0,
    suppliersByType: {
      [SupplierType.CONSTRUCTION]: 0,
      [SupplierType.MAINTENANCE]: 0,
      [SupplierType.FURNITURE]: 0,
      [SupplierType.APPLIANCE]: 0,
      [SupplierType.SECURITY]: 0,
      [SupplierType.CLEANING]: 0,
      [SupplierType.LANDSCAPING]: 0,
      [SupplierType.UTILITY]: 0
    },
    itemsByType: {
      [MarketItemType.MATERIAL]: 0,
      [MarketItemType.TOOL]: 0,
      [MarketItemType.FURNITURE]: 0,
      [MarketItemType.APPLIANCE]: 0,
      [MarketItemType.DECORATION]: 0,
      [MarketItemType.SECURITY]: 0,
      [MarketItemType.UTILITY]: 0,
      [MarketItemType.SERVICE]: 0
    }
  },
  selectedSupplier: null,
  selectedItem: null,
  priceHistory: {}
};

// 市场状态减速器
const marketReducer = (state: MarketState, action: MarketAction): MarketState => {
  switch (action.type) {
    case 'ADD_SUPPLIER': {
      return {
        ...state,
        suppliers: [...state.suppliers, action.payload]
      };
    }
    
    case 'UPDATE_SUPPLIER': {
      return {
        ...state,
        suppliers: state.suppliers.map(supplier => 
          supplier.id === action.payload.id ? action.payload : supplier
        ),
        selectedSupplier: state.selectedSupplier?.id === action.payload.id ? action.payload : state.selectedSupplier
      };
    }
    
    case 'REMOVE_SUPPLIER': {
      return {
        ...state,
        suppliers: state.suppliers.filter(supplier => supplier.id !== action.payload),
        selectedSupplier: state.selectedSupplier?.id === action.payload ? null : state.selectedSupplier
      };
    }
    
    case 'ADD_MARKET_ITEM': {
      return {
        ...state,
        marketItems: [...state.marketItems, action.payload]
      };
    }
    
    case 'UPDATE_MARKET_ITEM': {
      return {
        ...state,
        marketItems: state.marketItems.map(item => 
          item.id === action.payload.id ? action.payload : item
        ),
        selectedItem: state.selectedItem?.id === action.payload.id ? action.payload : state.selectedItem
      };
    }
    
    case 'REMOVE_MARKET_ITEM': {
      return {
        ...state,
        marketItems: state.marketItems.filter(item => item.id !== action.payload),
        selectedItem: state.selectedItem?.id === action.payload ? null : state.selectedItem
      };
    }
    
    case 'PURCHASE_ITEM': {
      const updatedItems = state.marketItems.map(item => {
        if (item.id === action.payload.itemId) {
          return {
            ...item,
            stock: Math.max(0, item.stock - action.payload.quantity),
            totalSold: item.totalSold + action.payload.quantity
          };
        }
        return item;
      });
      
      return {
        ...state,
        marketItems: updatedItems
      };
    }
    
    case 'UPDATE_PRICE_HISTORY': {
      const { itemId, pricePoint } = action.payload;
      return {
        ...state,
        priceHistory: {
          ...state.priceHistory,
          [itemId]: [...(state.priceHistory[itemId] || []), pricePoint]
        }
      };
    }
    
    case 'TRIGGER_MARKET_EVENT': {
      return {
        ...state,
        marketEvents: [...state.marketEvents, action.payload]
      };
    }
    
    case 'UPDATE_MARKET_TRENDS': {
      return {
        ...state,
        marketTrends: action.payload
      };
    }
    
    case 'UPDATE_STATISTICS': {
      return {
        ...state,
        statistics: {
          ...state.statistics,
          ...action.payload
        }
      };
    }
    
    case 'SET_SELECTED_SUPPLIER': {
      return {
        ...state,
        selectedSupplier: action.payload
      };
    }
    
    case 'SET_SELECTED_ITEM': {
      return {
        ...state,
        selectedItem: action.payload
      };
    }
    
    default:
      return state;
  }
};

// 创建上下文
const MarketContext = createContext<MarketContextType | undefined>(undefined);

// 市场提供者组件
export const MarketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [marketState, dispatch] = useReducer(marketReducer, initialMarketState);
  
  // 供应商管理方法
  const addSupplier = (supplier: Supplier): void => {
    dispatch({ type: 'ADD_SUPPLIER', payload: supplier });
  };
  
  const updateSupplier = (supplier: Supplier): void => {
    dispatch({ type: 'UPDATE_SUPPLIER', payload: supplier });
  };
  
  const removeSupplier = (supplierId: string): void => {
    dispatch({ type: 'REMOVE_SUPPLIER', payload: supplierId });
  };
  
  const getSupplierById = (supplierId: string): Supplier | undefined => {
    return marketState.suppliers.find(supplier => supplier.id === supplierId);
  };
  
  const getSuppliersByType = (type: SupplierType): Supplier[] => {
    return marketState.suppliers.filter(supplier => supplier.type === type);
  };
  
  // 市场商品管理方法
  const addMarketItem = (item: MarketItem): void => {
    dispatch({ type: 'ADD_MARKET_ITEM', payload: item });
  };
  
  const updateMarketItem = (item: MarketItem): void => {
    dispatch({ type: 'UPDATE_MARKET_ITEM', payload: item });
  };
  
  const removeMarketItem = (itemId: string): void => {
    dispatch({ type: 'REMOVE_MARKET_ITEM', payload: itemId });
  };
  
  const getMarketItemById = (itemId: string): MarketItem | undefined => {
    return marketState.marketItems.find(item => item.id === itemId);
  };
  
  const getMarketItemsByType = (type: MarketItemType): MarketItem[] => {
    return marketState.marketItems.filter(item => item.type === type);
  };
  
  // 购买方法
  const purchaseItem = (itemId: string, quantity: number): boolean => {
    const item = getMarketItemById(itemId);
    if (!item || item.stock < quantity) {
      return false;
    }
    
    const totalCost = item.currentPrice * quantity;
    dispatch({ type: 'PURCHASE_ITEM', payload: { itemId, quantity, totalCost } });
    
    // 更新价格历史
    const pricePoint: PriceHistoryPoint = {
      date: new Date().toISOString(),
      price: item.currentPrice,
      volume: quantity
    };
    updatePriceHistory(itemId, pricePoint);
    
    return true;
  };
  
  // 价格历史方法
  const updatePriceHistory = (itemId: string, pricePoint: PriceHistoryPoint): void => {
    dispatch({ type: 'UPDATE_PRICE_HISTORY', payload: { itemId, pricePoint } });
  };
  
  const getPriceHistory = (itemId: string): PriceHistoryPoint[] => {
    return marketState.priceHistory[itemId] || [];
  };
  
  // 市场事件方法
  const triggerMarketEvent = (event: MarketEvent): void => {
    dispatch({ type: 'TRIGGER_MARKET_EVENT', payload: event });
  };
  
  // 市场趋势方法
  const updateMarketTrends = (trends: MarketTrendAnalysis): void => {
    dispatch({ type: 'UPDATE_MARKET_TRENDS', payload: trends });
  };
  
  const analyzeMarketTrends = (): MarketTrendAnalysis => {
    // 简化的市场趋势分析
    const items = marketState.marketItems;
    const totalItems = items.length;
    
    if (totalItems === 0) {
      return marketState.marketTrends;
    }
    
    const averagePrice = items.reduce((sum, item) => sum + item.currentPrice, 0) / totalItems;
    const totalStock = items.reduce((sum, item) => sum + item.stock, 0);
    const totalSold = items.reduce((sum, item) => sum + item.totalSold, 0);
    
    const demandIndex = totalSold > 0 ? Math.min(150, (totalSold / totalStock) * 100) : 50;
    const supplyIndex = totalStock > 0 ? Math.min(150, (totalStock / totalSold) * 100) : 100;
    
    let overallTrend: 'rising' | 'falling' | 'stable' = 'stable';
    if (demandIndex > supplyIndex * 1.2) {
      overallTrend = 'rising';
    } else if (supplyIndex > demandIndex * 1.2) {
      overallTrend = 'falling';
    }
    
    return {
      overallTrend,
      priceIndex: Math.round(averagePrice),
      demandIndex: Math.round(demandIndex),
      supplyIndex: Math.round(supplyIndex),
      volatilityIndex: Math.round(Math.abs(demandIndex - supplyIndex)),
      seasonalFactors: {},
      categoryTrends: {},
      predictions: []
    };
  };
  
  // 统计方法
  const updateStatistics = (stats: Partial<MarketStatistics>): void => {
    dispatch({ type: 'UPDATE_STATISTICS', payload: stats });
  };
  
  const calculateStatistics = (): MarketStatistics => {
    const suppliers = marketState.suppliers;
    const items = marketState.marketItems;
    
    const totalSuppliers = suppliers.length;
    const totalMarketItems = items.length;
    const totalTransactions = items.reduce((sum, item) => sum + item.totalSold, 0);
    const totalRevenue = items.reduce((sum, item) => sum + (item.currentPrice * item.totalSold), 0);
    const averageItemPrice = totalMarketItems > 0 
      ? items.reduce((sum, item) => sum + item.currentPrice, 0) / totalMarketItems 
      : 0;
    
    const topSellingItems = items
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5)
      .map(item => ({ id: item.id, name: item.name, value: item.totalSold }));
    
    const topSuppliers = suppliers
      .sort((a, b) => b.rating.overall - a.rating.overall)
      .slice(0, 5)
      .map(supplier => ({ id: supplier.id, name: supplier.name, value: supplier.rating.overall }));
    
    const suppliersByType = {
      [SupplierType.CONSTRUCTION]: suppliers.filter(s => s.type === SupplierType.CONSTRUCTION).length,
      [SupplierType.MAINTENANCE]: suppliers.filter(s => s.type === SupplierType.MAINTENANCE).length,
      [SupplierType.FURNITURE]: suppliers.filter(s => s.type === SupplierType.FURNITURE).length,
      [SupplierType.APPLIANCE]: suppliers.filter(s => s.type === SupplierType.APPLIANCE).length,
      [SupplierType.SECURITY]: suppliers.filter(s => s.type === SupplierType.SECURITY).length,
      [SupplierType.CLEANING]: suppliers.filter(s => s.type === SupplierType.CLEANING).length,
      [SupplierType.LANDSCAPING]: suppliers.filter(s => s.type === SupplierType.LANDSCAPING).length,
      [SupplierType.UTILITY]: suppliers.filter(s => s.type === SupplierType.UTILITY).length
    };
    
    const itemsByType = {
      [MarketItemType.MATERIAL]: items.filter(i => i.type === MarketItemType.MATERIAL).length,
      [MarketItemType.TOOL]: items.filter(i => i.type === MarketItemType.TOOL).length,
      [MarketItemType.FURNITURE]: items.filter(i => i.type === MarketItemType.FURNITURE).length,
      [MarketItemType.APPLIANCE]: items.filter(i => i.type === MarketItemType.APPLIANCE).length,
      [MarketItemType.DECORATION]: items.filter(i => i.type === MarketItemType.DECORATION).length,
      [MarketItemType.SECURITY]: items.filter(i => i.type === MarketItemType.SECURITY).length,
      [MarketItemType.UTILITY]: items.filter(i => i.type === MarketItemType.UTILITY).length,
      [MarketItemType.SERVICE]: items.filter(i => i.type === MarketItemType.SERVICE).length
    };
    
    return {
      totalSuppliers,
      totalMarketItems,
      totalTransactions,
      totalRevenue,
      averageItemPrice,
      topSellingItems,
      topSuppliers,
      marketGrowthRate: 0, // 需要历史数据计算
      suppliersByType,
      itemsByType
    };
  };
  
  // 选择方法
  const selectSupplier = (supplier: Supplier | null): void => {
    dispatch({ type: 'SET_SELECTED_SUPPLIER', payload: supplier });
  };
  
  const selectItem = (item: MarketItem | null): void => {
    dispatch({ type: 'SET_SELECTED_ITEM', payload: item });
  };
  
  // 搜索方法
  const searchSuppliers = (query: string): Supplier[] => {
    const lowerQuery = query.toLowerCase();
    return marketState.suppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(lowerQuery) ||
      supplier.description.toLowerCase().includes(lowerQuery) ||
      supplier.services.some(service => service.toLowerCase().includes(lowerQuery))
    );
  };
  
  const searchMarketItems = (query: string): MarketItem[] => {
    const lowerQuery = query.toLowerCase();
    return marketState.marketItems.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery)
    );
  };
  
  // 推荐方法
  const getRecommendedSuppliers = (type?: SupplierType): Supplier[] => {
    let suppliers = marketState.suppliers;
    
    if (type) {
      suppliers = suppliers.filter(supplier => supplier.type === type);
    }
    
    return suppliers
      .sort((a, b) => b.rating.overall - a.rating.overall)
      .slice(0, 5);
  };
  
  const getRecommendedItems = (type?: MarketItemType): MarketItem[] => {
    let items = marketState.marketItems;
    
    if (type) {
      items = items.filter(item => item.type === type);
    }
    
    return items
      .filter(item => item.stock > 0)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);
  };
  
  // 自动更新统计数据和市场趋势
  useEffect(() => {
    const stats = calculateStatistics();
    updateStatistics(stats);
    
    const trends = analyzeMarketTrends();
    updateMarketTrends(trends);
  }, [marketState.suppliers, marketState.marketItems]);
  
  const contextValue: MarketContextType = {
    marketState,
    dispatch,
    addSupplier,
    updateSupplier,
    removeSupplier,
    getSupplierById,
    getSuppliersByType,
    addMarketItem,
    updateMarketItem,
    removeMarketItem,
    getMarketItemById,
    getMarketItemsByType,
    purchaseItem,
    updatePriceHistory,
    getPriceHistory,
    triggerMarketEvent,
    updateMarketTrends,
    analyzeMarketTrends,
    updateStatistics,
    calculateStatistics,
    selectSupplier,
    selectItem,
    searchSuppliers,
    searchMarketItems,
    getRecommendedSuppliers,
    getRecommendedItems
  };
  
  return (
    <MarketContext.Provider value={contextValue}>
      {children}
    </MarketContext.Provider>
  );
};

// 使用市场上下文的Hook
export const useMarket = (): MarketContextType => {
  const context = useContext(MarketContext);
  if (context === undefined) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};

export default MarketContext;