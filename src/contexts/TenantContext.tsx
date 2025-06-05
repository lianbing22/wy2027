import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Tenant, TenantType, TenantStatus, TenantSearchFilters, TenantSortOptions, TenantStatistics, TenantEvent } from '@types/tenant-system';
import { Property } from '@types/property';

// 租户管理动作类型
type TenantAction =
  | { type: 'ADD_TENANT'; payload: Tenant }
  | { type: 'UPDATE_TENANT'; payload: Tenant }
  | { type: 'REMOVE_TENANT'; payload: string }
  | { type: 'ASSIGN_PROPERTY'; payload: { tenantId: string; propertyId: string } }
  | { type: 'UNASSIGN_PROPERTY'; payload: { tenantId: string; propertyId: string } }
  | { type: 'UPDATE_SATISFACTION'; payload: { tenantId: string; satisfaction: number } }
  | { type: 'ADD_INTERACTION'; payload: { tenantId: string; interaction: any } }
  | { type: 'PROCESS_RENT_PAYMENT'; payload: { tenantId: string; amount: number } }
  | { type: 'HANDLE_COMPLAINT'; payload: { tenantId: string; complaintId: string } }
  | { type: 'TRIGGER_EVENT'; payload: TenantEvent }
  | { type: 'SET_FILTERS'; payload: TenantSearchFilters }
  | { type: 'SET_SORT_OPTIONS'; payload: TenantSortOptions }
  | { type: 'UPDATE_STATISTICS'; payload: Partial<TenantStatistics> };

// 租户管理状态
interface TenantState {
  tenants: Tenant[];
  filteredTenants: Tenant[];
  searchFilters: TenantSearchFilters;
  sortOptions: TenantSortOptions;
  statistics: TenantStatistics;
  activeEvents: TenantEvent[];
  selectedTenant: Tenant | null;
}

// 租户上下文接口
interface TenantContextType {
  tenantState: TenantState;
  dispatch: React.Dispatch<TenantAction>;
  
  // 租户管理方法
  addTenant: (tenant: Tenant) => void;
  updateTenant: (tenant: Tenant) => void;
  removeTenant: (tenantId: string) => void;
  getTenantById: (tenantId: string) => Tenant | undefined;
  
  // 物业分配方法
  assignProperty: (tenantId: string, propertyId: string) => void;
  unassignProperty: (tenantId: string, propertyId: string) => void;
  
  // 租户互动方法
  updateSatisfaction: (tenantId: string, satisfaction: number) => void;
  addInteraction: (tenantId: string, interaction: any) => void;
  
  // 租金管理方法
  processRentPayment: (tenantId: string, amount: number) => void;
  
  // 投诉处理方法
  handleComplaint: (tenantId: string, complaintId: string) => void;
  
  // 事件处理方法
  triggerEvent: (event: TenantEvent) => void;
  
  // 搜索和过滤方法
  setFilters: (filters: TenantSearchFilters) => void;
  setSortOptions: (options: TenantSortOptions) => void;
  searchTenants: (query: string) => Tenant[];
  
  // 统计方法
  updateStatistics: (stats: Partial<TenantStatistics>) => void;
  calculateStatistics: () => TenantStatistics;
  
  // 选择方法
  selectTenant: (tenant: Tenant | null) => void;
}

// 初始租户状态
const initialTenantState: TenantState = {
  tenants: [],
  filteredTenants: [],
  searchFilters: {
    types: [],
    statuses: [],
    minSatisfaction: 0,
    maxSatisfaction: 100,
    minRent: 0,
    maxRent: 10000,
    propertyIds: [],
    hasComplaints: undefined,
    dateRange: undefined
  },
  sortOptions: {
    field: 'name',
    order: 'asc'
  },
  statistics: {
    totalTenants: 0,
    activeTenants: 0,
    averageSatisfaction: 0,
    totalRentCollected: 0,
    occupancyRate: 0,
    averageStayDuration: 0,
    complaintRate: 0,
    renewalRate: 0,
    tenantsByType: {
      [TenantType.INDIVIDUAL]: 0,
      [TenantType.FAMILY]: 0,
      [TenantType.STUDENT]: 0,
      [TenantType.PROFESSIONAL]: 0,
      [TenantType.SENIOR]: 0,
      [TenantType.BUSINESS]: 0
    },
    tenantsByStatus: {
      [TenantStatus.ACTIVE]: 0,
      [TenantStatus.PENDING]: 0,
      [TenantStatus.INACTIVE]: 0,
      [TenantStatus.TERMINATED]: 0,
      [TenantStatus.BLACKLISTED]: 0
    }
  },
  activeEvents: [],
  selectedTenant: null
};

// 租户状态减速器
const tenantReducer = (state: TenantState, action: TenantAction): TenantState => {
  switch (action.type) {
    case 'ADD_TENANT': {
      const newTenants = [...state.tenants, action.payload];
      return {
        ...state,
        tenants: newTenants,
        filteredTenants: applyFilters(newTenants, state.searchFilters, state.sortOptions)
      };
    }
    
    case 'UPDATE_TENANT': {
      const updatedTenants = state.tenants.map(tenant => 
        tenant.id === action.payload.id ? action.payload : tenant
      );
      return {
        ...state,
        tenants: updatedTenants,
        filteredTenants: applyFilters(updatedTenants, state.searchFilters, state.sortOptions),
        selectedTenant: state.selectedTenant?.id === action.payload.id ? action.payload : state.selectedTenant
      };
    }
    
    case 'REMOVE_TENANT': {
      const filteredTenants = state.tenants.filter(tenant => tenant.id !== action.payload);
      return {
        ...state,
        tenants: filteredTenants,
        filteredTenants: applyFilters(filteredTenants, state.searchFilters, state.sortOptions),
        selectedTenant: state.selectedTenant?.id === action.payload ? null : state.selectedTenant
      };
    }
    
    case 'ASSIGN_PROPERTY': {
      const updatedTenants = state.tenants.map(tenant => {
        if (tenant.id === action.payload.tenantId) {
          return {
            ...tenant,
            propertyIds: [...tenant.propertyIds, action.payload.propertyId]
          };
        }
        return tenant;
      });
      return {
        ...state,
        tenants: updatedTenants,
        filteredTenants: applyFilters(updatedTenants, state.searchFilters, state.sortOptions)
      };
    }
    
    case 'UNASSIGN_PROPERTY': {
      const updatedTenants = state.tenants.map(tenant => {
        if (tenant.id === action.payload.tenantId) {
          return {
            ...tenant,
            propertyIds: tenant.propertyIds.filter(id => id !== action.payload.propertyId)
          };
        }
        return tenant;
      });
      return {
        ...state,
        tenants: updatedTenants,
        filteredTenants: applyFilters(updatedTenants, state.searchFilters, state.sortOptions)
      };
    }
    
    case 'UPDATE_SATISFACTION': {
      const updatedTenants = state.tenants.map(tenant => {
        if (tenant.id === action.payload.tenantId) {
          return {
            ...tenant,
            satisfaction: action.payload.satisfaction
          };
        }
        return tenant;
      });
      return {
        ...state,
        tenants: updatedTenants,
        filteredTenants: applyFilters(updatedTenants, state.searchFilters, state.sortOptions)
      };
    }
    
    case 'SET_FILTERS': {
      return {
        ...state,
        searchFilters: action.payload,
        filteredTenants: applyFilters(state.tenants, action.payload, state.sortOptions)
      };
    }
    
    case 'SET_SORT_OPTIONS': {
      return {
        ...state,
        sortOptions: action.payload,
        filteredTenants: applyFilters(state.tenants, state.searchFilters, action.payload)
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
    
    case 'TRIGGER_EVENT': {
      return {
        ...state,
        activeEvents: [...state.activeEvents, action.payload]
      };
    }
    
    default:
      return state;
  }
};

// 应用过滤器和排序
const applyFilters = (tenants: Tenant[], filters: TenantSearchFilters, sortOptions: TenantSortOptions): Tenant[] => {
  let filtered = [...tenants];
  
  // 应用类型过滤
  if (filters.types && filters.types.length > 0) {
    filtered = filtered.filter(tenant => filters.types!.includes(tenant.type));
  }
  
  // 应用状态过滤
  if (filters.statuses && filters.statuses.length > 0) {
    filtered = filtered.filter(tenant => filters.statuses!.includes(tenant.status));
  }
  
  // 应用满意度过滤
  filtered = filtered.filter(tenant => 
    tenant.satisfaction >= filters.minSatisfaction && 
    tenant.satisfaction <= filters.maxSatisfaction
  );
  
  // 应用租金过滤
  filtered = filtered.filter(tenant => 
    tenant.financials.monthlyRent >= filters.minRent && 
    tenant.financials.monthlyRent <= filters.maxRent
  );
  
  // 应用物业过滤
  if (filters.propertyIds && filters.propertyIds.length > 0) {
    filtered = filtered.filter(tenant => 
      tenant.propertyIds.some(id => filters.propertyIds!.includes(id))
    );
  }
  
  // 应用投诉过滤
  if (filters.hasComplaints !== undefined) {
    filtered = filtered.filter(tenant => 
      filters.hasComplaints ? tenant.complaints.length > 0 : tenant.complaints.length === 0
    );
  }
  
  // 应用排序
  filtered.sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortOptions.field) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'satisfaction':
        aValue = a.satisfaction;
        bValue = b.satisfaction;
        break;
      case 'monthlyRent':
        aValue = a.financials.monthlyRent;
        bValue = b.financials.monthlyRent;
        break;
      case 'moveInDate':
        aValue = new Date(a.moveInDate);
        bValue = new Date(b.moveInDate);
        break;
      default:
        aValue = a.name;
        bValue = b.name;
    }
    
    if (sortOptions.order === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
  
  return filtered;
};

// 创建上下文
const TenantContext = createContext<TenantContextType | undefined>(undefined);

// 租户提供者组件
export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenantState, dispatch] = useReducer(tenantReducer, initialTenantState);
  
  // 租户管理方法
  const addTenant = (tenant: Tenant): void => {
    dispatch({ type: 'ADD_TENANT', payload: tenant });
  };
  
  const updateTenant = (tenant: Tenant): void => {
    dispatch({ type: 'UPDATE_TENANT', payload: tenant });
  };
  
  const removeTenant = (tenantId: string): void => {
    dispatch({ type: 'REMOVE_TENANT', payload: tenantId });
  };
  
  const getTenantById = (tenantId: string): Tenant | undefined => {
    return tenantState.tenants.find(tenant => tenant.id === tenantId);
  };
  
  // 物业分配方法
  const assignProperty = (tenantId: string, propertyId: string): void => {
    dispatch({ type: 'ASSIGN_PROPERTY', payload: { tenantId, propertyId } });
  };
  
  const unassignProperty = (tenantId: string, propertyId: string): void => {
    dispatch({ type: 'UNASSIGN_PROPERTY', payload: { tenantId, propertyId } });
  };
  
  // 租户互动方法
  const updateSatisfaction = (tenantId: string, satisfaction: number): void => {
    dispatch({ type: 'UPDATE_SATISFACTION', payload: { tenantId, satisfaction } });
  };
  
  const addInteraction = (tenantId: string, interaction: any): void => {
    dispatch({ type: 'ADD_INTERACTION', payload: { tenantId, interaction } });
  };
  
  // 租金管理方法
  const processRentPayment = (tenantId: string, amount: number): void => {
    dispatch({ type: 'PROCESS_RENT_PAYMENT', payload: { tenantId, amount } });
  };
  
  // 投诉处理方法
  const handleComplaint = (tenantId: string, complaintId: string): void => {
    dispatch({ type: 'HANDLE_COMPLAINT', payload: { tenantId, complaintId } });
  };
  
  // 事件处理方法
  const triggerEvent = (event: TenantEvent): void => {
    dispatch({ type: 'TRIGGER_EVENT', payload: event });
  };
  
  // 搜索和过滤方法
  const setFilters = (filters: TenantSearchFilters): void => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };
  
  const setSortOptions = (options: TenantSortOptions): void => {
    dispatch({ type: 'SET_SORT_OPTIONS', payload: options });
  };
  
  const searchTenants = (query: string): Tenant[] => {
    return tenantState.tenants.filter(tenant => 
      tenant.name.toLowerCase().includes(query.toLowerCase()) ||
      tenant.email.toLowerCase().includes(query.toLowerCase()) ||
      tenant.phone.includes(query)
    );
  };
  
  // 统计方法
  const updateStatistics = (stats: Partial<TenantStatistics>): void => {
    dispatch({ type: 'UPDATE_STATISTICS', payload: stats });
  };
  
  const calculateStatistics = (): TenantStatistics => {
    const tenants = tenantState.tenants;
    const totalTenants = tenants.length;
    const activeTenants = tenants.filter(t => t.status === TenantStatus.ACTIVE).length;
    
    const averageSatisfaction = totalTenants > 0 
      ? tenants.reduce((sum, t) => sum + t.satisfaction, 0) / totalTenants 
      : 0;
    
    const totalRentCollected = tenants.reduce((sum, t) => sum + t.financials.totalPaid, 0);
    
    const occupancyRate = totalTenants > 0 ? (activeTenants / totalTenants) * 100 : 0;
    
    const tenantsByType = {
      [TenantType.INDIVIDUAL]: tenants.filter(t => t.type === TenantType.INDIVIDUAL).length,
      [TenantType.FAMILY]: tenants.filter(t => t.type === TenantType.FAMILY).length,
      [TenantType.STUDENT]: tenants.filter(t => t.type === TenantType.STUDENT).length,
      [TenantType.PROFESSIONAL]: tenants.filter(t => t.type === TenantType.PROFESSIONAL).length,
      [TenantType.SENIOR]: tenants.filter(t => t.type === TenantType.SENIOR).length,
      [TenantType.BUSINESS]: tenants.filter(t => t.type === TenantType.BUSINESS).length
    };
    
    const tenantsByStatus = {
      [TenantStatus.ACTIVE]: tenants.filter(t => t.status === TenantStatus.ACTIVE).length,
      [TenantStatus.PENDING]: tenants.filter(t => t.status === TenantStatus.PENDING).length,
      [TenantStatus.INACTIVE]: tenants.filter(t => t.status === TenantStatus.INACTIVE).length,
      [TenantStatus.TERMINATED]: tenants.filter(t => t.status === TenantStatus.TERMINATED).length,
      [TenantStatus.BLACKLISTED]: tenants.filter(t => t.status === TenantStatus.BLACKLISTED).length
    };
    
    return {
      totalTenants,
      activeTenants,
      averageSatisfaction,
      totalRentCollected,
      occupancyRate,
      averageStayDuration: 0, // 需要根据实际数据计算
      complaintRate: 0, // 需要根据实际数据计算
      renewalRate: 0, // 需要根据实际数据计算
      tenantsByType,
      tenantsByStatus
    };
  };
  
  // 选择方法
  const selectTenant = (tenant: Tenant | null): void => {
    // 这里可以通过dispatch更新selectedTenant，但为了简化，直接在组件中处理
  };
  
  // 自动更新统计数据
  useEffect(() => {
    const stats = calculateStatistics();
    updateStatistics(stats);
  }, [tenantState.tenants]);
  
  const contextValue: TenantContextType = {
    tenantState,
    dispatch,
    addTenant,
    updateTenant,
    removeTenant,
    getTenantById,
    assignProperty,
    unassignProperty,
    updateSatisfaction,
    addInteraction,
    processRentPayment,
    handleComplaint,
    triggerEvent,
    setFilters,
    setSortOptions,
    searchTenants,
    updateStatistics,
    calculateStatistics,
    selectTenant
  };
  
  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
};

// 使用租户上下文的Hook
export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export default TenantContext;