# 物业管理模拟器 - API 设计文档

## API 架构概览

本文档详细描述了物业管理模拟器的 API 设计，采用 RESTful 架构风格，支持实时通信和批量操作。

### API 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    前端应用层 (Frontend App)                 │
├─────────────────────────────────────────────────────────────┤
│ React Components │ State Management │ Service Layer        │
├─────────────────────────────────────────────────────────────┤
│                    API 客户端层 (API Client)                 │
├─────────────────────────────────────────────────────────────┤
│ HTTP Client │ WebSocket Client │ Request/Response Handler  │
├─────────────────────────────────────────────────────────────┤
│                    网络层 (Network Layer)                   │
├─────────────────────────────────────────────────────────────┤
│ REST API │ WebSocket │ GraphQL (可选) │ File Upload        │
├─────────────────────────────────────────────────────────────┤
│                    后端服务层 (Backend Services)             │
├─────────────────────────────────────────────────────────────┤
│ Game Service │ User Service │ Market Service │ Data Service │
└─────────────────────────────────────────────────────────────┘
```

## API 基础规范

### 1. 通用约定

```typescript
/**
 * API 基础配置
 */
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
  version: 'v1',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
};

/**
 * 标准响应格式
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
  requestId: string;
  pagination?: PaginationInfo;
}

/**
 * API 错误格式
 */
interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string;
  stack?: string; // 仅开发环境
}

/**
 * 分页信息
 */
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 请求参数基类
 */
interface BaseRequest {
  requestId?: string;
  timestamp?: string;
  clientVersion?: string;
}
```

### 2. 认证和授权

```typescript
/**
 * 认证相关接口
 */
namespace AuthAPI {
  /**
   * 用户注册
   */
  interface RegisterRequest extends BaseRequest {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
  }
  
  interface RegisterResponse {
    user: UserProfile;
    token: AuthToken;
    refreshToken: string;
  }
  
  /**
   * 用户登录
   */
  interface LoginRequest extends BaseRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
    deviceInfo?: DeviceInfo;
  }
  
  interface LoginResponse {
    user: UserProfile;
    token: AuthToken;
    refreshToken: string;
    sessionId: string;
  }
  
  /**
   * 令牌刷新
   */
  interface RefreshTokenRequest extends BaseRequest {
    refreshToken: string;
  }
  
  interface RefreshTokenResponse {
    token: AuthToken;
    refreshToken: string;
  }
  
  /**
   * 认证令牌
   */
  interface AuthToken {
    accessToken: string;
    tokenType: 'Bearer';
    expiresIn: number;
    scope: string[];
  }
  
  /**
   * 设备信息
   */
  interface DeviceInfo {
    userAgent: string;
    platform: string;
    screenResolution: string;
    timezone: string;
  }
}

/**
 * 认证 API 端点
 */
class AuthApiClient {
  private httpClient: HttpClient;
  
  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }
  
  /**
   * 用户注册
   */
  async register(request: AuthAPI.RegisterRequest): Promise<ApiResponse<AuthAPI.RegisterResponse>> {
    return this.httpClient.post('/auth/register', request);
  }
  
  /**
   * 用户登录
   */
  async login(request: AuthAPI.LoginRequest): Promise<ApiResponse<AuthAPI.LoginResponse>> {
    return this.httpClient.post('/auth/login', request);
  }
  
  /**
   * 刷新令牌
   */
  async refreshToken(request: AuthAPI.RefreshTokenRequest): Promise<ApiResponse<AuthAPI.RefreshTokenResponse>> {
    return this.httpClient.post('/auth/refresh', request);
  }
  
  /**
   * 用户登出
   */
  async logout(): Promise<ApiResponse<void>> {
    return this.httpClient.post('/auth/logout');
  }
  
  /**
   * 验证令牌
   */
  async validateToken(): Promise<ApiResponse<{ valid: boolean; user: UserProfile }>> {
    return this.httpClient.get('/auth/validate');
  }
}
```

## 游戏核心 API

### 1. 游戏状态管理

```typescript
/**
 * 游戏 API 命名空间
 */
namespace GameAPI {
  /**
   * 创建新游戏
   */
  interface CreateGameRequest extends BaseRequest {
    gameName: string;
    difficulty: GameDifficulty;
    settings: GameSettings;
    scenario?: string;
  }
  
  interface CreateGameResponse {
    gameId: string;
    gameState: GameState;
    saveId: string;
  }
  
  /**
   * 加载游戏
   */
  interface LoadGameRequest extends BaseRequest {
    saveId: string;
    validateChecksum?: boolean;
  }
  
  interface LoadGameResponse {
    gameState: GameState;
    metadata: SaveMetadata;
    warnings?: string[];
  }
  
  /**
   * 保存游戏
   */
  interface SaveGameRequest extends BaseRequest {
    gameId: string;
    gameState: GameState;
    saveName?: string;
    description?: string;
    screenshot?: string;
  }
  
  interface SaveGameResponse {
    saveId: string;
    checksum: string;
    savedAt: string;
  }
  
  /**
   * 游戏动作
   */
  interface GameActionRequest extends BaseRequest {
    gameId: string;
    action: GameAction;
    parameters: any;
    timestamp: string;
  }
  
  interface GameActionResponse {
    success: boolean;
    newState: Partial<GameState>;
    events: GameEvent[];
    consequences: ActionConsequence[];
  }
  
  /**
   * 阶段切换
   */
  interface PhaseTransitionRequest extends BaseRequest {
    gameId: string;
    targetPhase: GamePhase;
    force?: boolean;
  }
  
  interface PhaseTransitionResponse {
    success: boolean;
    newPhase: GamePhase;
    phaseData: PhaseData;
    availableActions: GameAction[];
  }
}

/**
 * 游戏 API 客户端
 */
class GameApiClient {
  private httpClient: HttpClient;
  private wsClient: WebSocketClient;
  
  constructor(httpClient: HttpClient, wsClient: WebSocketClient) {
    this.httpClient = httpClient;
    this.wsClient = wsClient;
  }
  
  /**
   * 创建新游戏
   */
  async createGame(request: GameAPI.CreateGameRequest): Promise<ApiResponse<GameAPI.CreateGameResponse>> {
    return this.httpClient.post('/games', request);
  }
  
  /**
   * 加载游戏
   */
  async loadGame(request: GameAPI.LoadGameRequest): Promise<ApiResponse<GameAPI.LoadGameResponse>> {
    return this.httpClient.post('/games/load', request);
  }
  
  /**
   * 保存游戏
   */
  async saveGame(request: GameAPI.SaveGameRequest): Promise<ApiResponse<GameAPI.SaveGameResponse>> {
    return this.httpClient.post('/games/save', request);
  }
  
  /**
   * 执行游戏动作
   */
  async executeAction(request: GameAPI.GameActionRequest): Promise<ApiResponse<GameAPI.GameActionResponse>> {
    return this.httpClient.post(`/games/${request.gameId}/actions`, request);
  }
  
  /**
   * 切换游戏阶段
   */
  async transitionPhase(request: GameAPI.PhaseTransitionRequest): Promise<ApiResponse<GameAPI.PhaseTransitionResponse>> {
    return this.httpClient.post(`/games/${request.gameId}/phase-transition`, request);
  }
  
  /**
   * 获取游戏状态
   */
  async getGameState(gameId: string): Promise<ApiResponse<GameState>> {
    return this.httpClient.get(`/games/${gameId}/state`);
  }
  
  /**
   * 订阅游戏事件
   */
  subscribeToGameEvents(gameId: string, callback: (event: GameEvent) => void): void {
    this.wsClient.subscribe(`game:${gameId}:events`, callback);
  }
  
  /**
   * 订阅状态更新
   */
  subscribeToStateUpdates(gameId: string, callback: (state: Partial<GameState>) => void): void {
    this.wsClient.subscribe(`game:${gameId}:state`, callback);
  }
}
```

### 2. 物业管理 API

```typescript
/**
 * 物业 API 命名空间
 */
namespace PropertyAPI {
  /**
   * 购买物业
   */
  interface PurchasePropertyRequest extends BaseRequest {
    gameId: string;
    propertyId: string;
    offerPrice: number;
    financingOption?: FinancingOption;
    inspectionWaived?: boolean;
  }
  
  interface PurchasePropertyResponse {
    success: boolean;
    property: Property;
    transaction: Transaction;
    newCashBalance: number;
  }
  
  /**
   * 出售物业
   */
  interface SellPropertyRequest extends BaseRequest {
    gameId: string;
    propertyId: string;
    askingPrice: number;
    marketingBudget?: number;
    urgentSale?: boolean;
  }
  
  interface SellPropertyResponse {
    success: boolean;
    listingId: string;
    estimatedSaleTime: number; // 天数
    marketingReach: number;
  }
  
  /**
   * 物业升级
   */
  interface UpgradePropertyRequest extends BaseRequest {
    gameId: string;
    propertyId: string;
    upgrades: PropertyUpgrade[];
    budget: number;
    timeline: number; // 天数
  }
  
  interface UpgradePropertyResponse {
    success: boolean;
    upgradeProject: UpgradeProject;
    estimatedCost: number;
    estimatedDuration: number;
    valueIncrease: number;
  }
  
  /**
   * 物业搜索
   */
  interface SearchPropertiesRequest extends BaseRequest {
    filters: PropertyFilters;
    sorting: PropertySorting;
    pagination: PaginationRequest;
  }
  
  interface SearchPropertiesResponse {
    properties: Property[];
    totalCount: number;
    filters: AppliedFilters;
    suggestions: PropertySuggestion[];
  }
  
  /**
   * 物业过滤器
   */
  interface PropertyFilters {
    priceRange?: { min: number; max: number };
    propertyType?: BuildingType[];
    location?: LocationFilter;
    size?: { min: number; max: number };
    condition?: { min: number; max: number };
    roi?: { min: number; max: number };
    amenities?: string[];
  }
}

/**
 * 物业 API 客户端
 */
class PropertyApiClient {
  private httpClient: HttpClient;
  
  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }
  
  /**
   * 搜索可购买物业
   */
  async searchProperties(request: PropertyAPI.SearchPropertiesRequest): Promise<ApiResponse<PropertyAPI.SearchPropertiesResponse>> {
    return this.httpClient.post('/properties/search', request);
  }
  
  /**
   * 获取物业详情
   */
  async getPropertyDetails(propertyId: string): Promise<ApiResponse<Property>> {
    return this.httpClient.get(`/properties/${propertyId}`);
  }
  
  /**
   * 购买物业
   */
  async purchaseProperty(request: PropertyAPI.PurchasePropertyRequest): Promise<ApiResponse<PropertyAPI.PurchasePropertyResponse>> {
    return this.httpClient.post('/properties/purchase', request);
  }
  
  /**
   * 出售物业
   */
  async sellProperty(request: PropertyAPI.SellPropertyRequest): Promise<ApiResponse<PropertyAPI.SellPropertyResponse>> {
    return this.httpClient.post('/properties/sell', request);
  }
  
  /**
   * 升级物业
   */
  async upgradeProperty(request: PropertyAPI.UpgradePropertyRequest): Promise<ApiResponse<PropertyAPI.UpgradePropertyResponse>> {
    return this.httpClient.post('/properties/upgrade', request);
  }
  
  /**
   * 获取物业财务报告
   */
  async getFinancialReport(propertyId: string, period: string): Promise<ApiResponse<PropertyFinancialReport>> {
    return this.httpClient.get(`/properties/${propertyId}/financial-report?period=${period}`);
  }
  
  /**
   * 获取物业市场分析
   */
  async getMarketAnalysis(propertyId: string): Promise<ApiResponse<PropertyMarketAnalysis>> {
    return this.httpClient.get(`/properties/${propertyId}/market-analysis`);
  }
}
```

### 3. 租户管理 API

```typescript
/**
 * 租户 API 命名空间
 */
namespace TenantAPI {
  /**
   * 租户搜索
   */
  interface SearchTenantsRequest extends BaseRequest {
    propertyId?: string;
    filters: TenantFilters;
    sorting: TenantSorting;
    pagination: PaginationRequest;
  }
  
  interface SearchTenantsResponse {
    tenants: Tenant[];
    totalCount: number;
    matchingScore: number;
    recommendations: TenantRecommendation[];
  }
  
  /**
   * 租户申请处理
   */
  interface ProcessApplicationRequest extends BaseRequest {
    gameId: string;
    applicationId: string;
    decision: 'approve' | 'reject' | 'conditional';
    conditions?: LeaseCondition[];
    customTerms?: CustomLeaseTerm[];
  }
  
  interface ProcessApplicationResponse {
    success: boolean;
    lease?: Lease;
    tenant: Tenant;
    nextSteps: string[];
  }
  
  /**
   * 租户互动
   */
  interface TenantInteractionRequest extends BaseRequest {
    gameId: string;
    tenantId: string;
    interactionType: InteractionType;
    message?: string;
    options?: InteractionOption[];
  }
  
  interface TenantInteractionResponse {
    success: boolean;
    response: TenantResponse;
    satisfactionChange: number;
    relationshipChange: number;
    consequences: InteractionConsequence[];
  }
  
  /**
   * 租金调整
   */
  interface AdjustRentRequest extends BaseRequest {
    gameId: string;
    tenantId: string;
    newRent: number;
    effectiveDate: string;
    reason: string;
    negotiable?: boolean;
  }
  
  interface AdjustRentResponse {
    success: boolean;
    accepted: boolean;
    counterOffer?: number;
    tenantReaction: TenantReaction;
    marketComparison: RentComparison;
  }
}

/**
 * 租户 API 客户端
 */
class TenantApiClient {
  private httpClient: HttpClient;
  
  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }
  
  /**
   * 搜索潜在租户
   */
  async searchTenants(request: TenantAPI.SearchTenantsRequest): Promise<ApiResponse<TenantAPI.SearchTenantsResponse>> {
    return this.httpClient.post('/tenants/search', request);
  }
  
  /**
   * 获取租户详情
   */
  async getTenantDetails(tenantId: string): Promise<ApiResponse<Tenant>> {
    return this.httpClient.get(`/tenants/${tenantId}`);
  }
  
  /**
   * 处理租户申请
   */
  async processApplication(request: TenantAPI.ProcessApplicationRequest): Promise<ApiResponse<TenantAPI.ProcessApplicationResponse>> {
    return this.httpClient.post('/tenants/applications/process', request);
  }
  
  /**
   * 与租户互动
   */
  async interactWithTenant(request: TenantAPI.TenantInteractionRequest): Promise<ApiResponse<TenantAPI.TenantInteractionResponse>> {
    return this.httpClient.post('/tenants/interact', request);
  }
  
  /**
   * 调整租金
   */
  async adjustRent(request: TenantAPI.AdjustRentRequest): Promise<ApiResponse<TenantAPI.AdjustRentResponse>> {
    return this.httpClient.post('/tenants/adjust-rent', request);
  }
  
  /**
   * 获取租户满意度报告
   */
  async getSatisfactionReport(tenantId: string): Promise<ApiResponse<TenantSatisfactionReport>> {
    return this.httpClient.get(`/tenants/${tenantId}/satisfaction-report`);
  }
  
  /**
   * 获取租户关系网络
   */
  async getRelationshipNetwork(tenantId: string): Promise<ApiResponse<TenantRelationshipNetwork>> {
    return this.httpClient.get(`/tenants/${tenantId}/relationships`);
  }
}
```

### 4. 市场数据 API

```typescript
/**
 * 市场 API 命名空间
 */
namespace MarketAPI {
  /**
   * 获取市场状态
   */
  interface GetMarketStateRequest extends BaseRequest {
    region?: string;
    propertyTypes?: BuildingType[];
    timeframe?: string;
  }
  
  interface GetMarketStateResponse {
    marketState: MarketState;
    trends: MarketTrend[];
    forecasts: MarketForecast[];
    insights: MarketInsight[];
  }
  
  /**
   * 价格分析
   */
  interface PriceAnalysisRequest extends BaseRequest {
    propertyId?: string;
    location: LocationFilter;
    propertyType: BuildingType;
    size: number;
    features: PropertyFeature[];
  }
  
  interface PriceAnalysisResponse {
    estimatedValue: number;
    priceRange: { min: number; max: number };
    comparables: ComparableProperty[];
    priceFactors: PriceFactor[];
    confidence: number;
  }
  
  /**
   * 投资分析
   */
  interface InvestmentAnalysisRequest extends BaseRequest {
    propertyId: string;
    investmentHorizon: number; // 年数
    scenarios: InvestmentScenario[];
  }
  
  interface InvestmentAnalysisResponse {
    roi: number;
    irr: number;
    npv: number;
    paybackPeriod: number;
    cashFlow: CashFlowProjection[];
    riskAssessment: RiskAssessment;
    recommendations: InvestmentRecommendation[];
  }
}

/**
 * 市场 API 客户端
 */
class MarketApiClient {
  private httpClient: HttpClient;
  
  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }
  
  /**
   * 获取市场状态
   */
  async getMarketState(request: MarketAPI.GetMarketStateRequest): Promise<ApiResponse<MarketAPI.GetMarketStateResponse>> {
    return this.httpClient.post('/market/state', request);
  }
  
  /**
   * 价格分析
   */
  async analyzePricing(request: MarketAPI.PriceAnalysisRequest): Promise<ApiResponse<MarketAPI.PriceAnalysisResponse>> {
    return this.httpClient.post('/market/price-analysis', request);
  }
  
  /**
   * 投资分析
   */
  async analyzeInvestment(request: MarketAPI.InvestmentAnalysisRequest): Promise<ApiResponse<MarketAPI.InvestmentAnalysisResponse>> {
    return this.httpClient.post('/market/investment-analysis', request);
  }
  
  /**
   * 获取市场趋势
   */
  async getMarketTrends(timeframe: string, region?: string): Promise<ApiResponse<MarketTrend[]>> {
    const params = new URLSearchParams({ timeframe });
    if (region) params.append('region', region);
    return this.httpClient.get(`/market/trends?${params}`);
  }
  
  /**
   * 获取竞争分析
   */
  async getCompetitionAnalysis(propertyId: string): Promise<ApiResponse<CompetitionAnalysis>> {
    return this.httpClient.get(`/market/competition/${propertyId}`);
  }
}
```

### 5. 探险系统 API

```typescript
/**
 * 探险 API 命名空间
 */
namespace ExplorationAPI {
  /**
   * 获取可用任务
   */
  interface GetAvailableMissionsRequest extends BaseRequest {
    gameId: string;
    difficulty?: number[];
    type?: MissionType[];
    location?: string;
  }
  
  interface GetAvailableMissionsResponse {
    missions: ExplorationMission[];
    recommendations: MissionRecommendation[];
    unlockRequirements: UnlockRequirement[];
  }
  
  /**
   * 开始探险任务
   */
  interface StartMissionRequest extends BaseRequest {
    gameId: string;
    missionId: string;
    teamId: string;
    equipment: string[];
    strategy?: MissionStrategy;
  }
  
  interface StartMissionResponse {
    success: boolean;
    missionInstance: MissionInstance;
    estimatedDuration: number;
    successProbability: number;
  }
  
  /**
   * 任务进度查询
   */
  interface GetMissionProgressRequest extends BaseRequest {
    gameId: string;
    missionInstanceId: string;
  }
  
  interface GetMissionProgressResponse {
    progress: MissionProgress;
    events: MissionEvent[];
    decisions: PendingDecision[];
  }
  
  /**
   * 任务决策
   */
  interface MakeMissionDecisionRequest extends BaseRequest {
    gameId: string;
    missionInstanceId: string;
    decisionId: string;
    choice: string;
    parameters?: any;
  }
  
  interface MakeMissionDecisionResponse {
    success: boolean;
    consequences: DecisionConsequence[];
    newProgress: MissionProgress;
    nextDecisions: PendingDecision[];
  }
}

/**
 * 探险 API 客户端
 */
class ExplorationApiClient {
  private httpClient: HttpClient;
  private wsClient: WebSocketClient;
  
  constructor(httpClient: HttpClient, wsClient: WebSocketClient) {
    this.httpClient = httpClient;
    this.wsClient = wsClient;
  }
  
  /**
   * 获取可用任务
   */
  async getAvailableMissions(request: ExplorationAPI.GetAvailableMissionsRequest): Promise<ApiResponse<ExplorationAPI.GetAvailableMissionsResponse>> {
    return this.httpClient.post('/exploration/missions/available', request);
  }
  
  /**
   * 开始任务
   */
  async startMission(request: ExplorationAPI.StartMissionRequest): Promise<ApiResponse<ExplorationAPI.StartMissionResponse>> {
    return this.httpClient.post('/exploration/missions/start', request);
  }
  
  /**
   * 获取任务进度
   */
  async getMissionProgress(request: ExplorationAPI.GetMissionProgressRequest): Promise<ApiResponse<ExplorationAPI.GetMissionProgressResponse>> {
    return this.httpClient.post('/exploration/missions/progress', request);
  }
  
  /**
   * 做出任务决策
   */
  async makeMissionDecision(request: ExplorationAPI.MakeMissionDecisionRequest): Promise<ApiResponse<ExplorationAPI.MakeMissionDecisionResponse>> {
    return this.httpClient.post('/exploration/missions/decision', request);
  }
  
  /**
   * 订阅任务事件
   */
  subscribeMissionEvents(gameId: string, missionInstanceId: string, callback: (event: MissionEvent) => void): void {
    this.wsClient.subscribe(`exploration:${gameId}:mission:${missionInstanceId}`, callback);
  }
  
  /**
   * 获取装备库存
   */
  async getEquipmentInventory(gameId: string): Promise<ApiResponse<Equipment[]>> {
    return this.httpClient.get(`/exploration/equipment?gameId=${gameId}`);
  }
  
  /**
   * 升级装备
   */
  async upgradeEquipment(gameId: string, equipmentId: string, upgradeType: string): Promise<ApiResponse<Equipment>> {
    return this.httpClient.post('/exploration/equipment/upgrade', {
      gameId,
      equipmentId,
      upgradeType
    });
  }
}
```

## 实时通信 API

### WebSocket 事件系统

```typescript
/**
 * WebSocket 客户端
 */
class WebSocketClient {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  constructor(private url: string, private token: string) {}
  
  /**
   * 连接 WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${this.url}?token=${this.token}`);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };
        
        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.handleReconnect();
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * 订阅事件
   */
  subscribe(channel: string, callback: Function): void {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
      
      // 发送订阅消息
      this.send({
        type: 'subscribe',
        channel
      });
    }
    
    this.subscriptions.get(channel)!.add(callback);
  }
  
  /**
   * 取消订阅
   */
  unsubscribe(channel: string, callback?: Function): void {
    const subscribers = this.subscriptions.get(channel);
    if (!subscribers) return;
    
    if (callback) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.subscriptions.delete(channel);
        this.send({
          type: 'unsubscribe',
          channel
        });
      }
    } else {
      this.subscriptions.delete(channel);
      this.send({
        type: 'unsubscribe',
        channel
      });
    }
  }
  
  /**
   * 发送消息
   */
  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
  
  /**
   * 处理接收到的消息
   */
  private handleMessage(message: WebSocketMessage): void {
    const { channel, data } = message;
    const subscribers = this.subscriptions.get(channel);
    
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket callback:', error);
        }
      });
    }
  }
  
  /**
   * 处理重连
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect().catch(() => {
          // 重连失败，继续尝试
        });
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }
}

/**
 * WebSocket 消息格式
 */
interface WebSocketMessage {
  type: 'event' | 'response' | 'error';
  channel: string;
  data: any;
  timestamp: string;
  messageId?: string;
}

/**
 * 实时事件类型
 */
namespace RealtimeEvents {
  // 游戏事件
  interface GameEvent {
    gameId: string;
    eventType: string;
    data: any;
    timestamp: string;
  }
  
  // 市场更新
  interface MarketUpdate {
    region: string;
    propertyType: BuildingType;
    priceChange: number;
    demandChange: number;
    timestamp: string;
  }
  
  // 租户事件
  interface TenantEvent {
    tenantId: string;
    eventType: 'satisfaction_change' | 'complaint' | 'lease_renewal' | 'move_out';
    data: any;
    timestamp: string;
  }
  
  // 任务事件
  interface MissionEvent {
    missionInstanceId: string;
    eventType: 'progress_update' | 'decision_required' | 'completed' | 'failed';
    data: any;
    timestamp: string;
  }
}
```

## HTTP 客户端实现

```typescript
/**
 * HTTP 客户端
 */
class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private interceptors: RequestInterceptor[];
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    this.interceptors = [];
  }
  
  /**
   * 设置认证令牌
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  /**
   * 添加请求拦截器
   */
  addInterceptor(interceptor: RequestInterceptor): void {
    this.interceptors.push(interceptor);
  }
  
  /**
   * GET 请求
   */
  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }
  
  /**
   * POST 请求
   */
  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }
  
  /**
   * PUT 请求
   */
  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }
  
  /**
   * DELETE 请求
   */
  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }
  
  /**
   * 通用请求方法
   */
  private async request<T>(
    method: string,
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const fullUrl = `${this.baseURL}${url}`;
    const headers = { ...this.defaultHeaders, ...config?.headers };
    
    // 应用拦截器
    let requestConfig: RequestConfig = {
      method,
      url: fullUrl,
      data,
      headers,
      ...config
    };
    
    for (const interceptor of this.interceptors) {
      requestConfig = await interceptor(requestConfig);
    }
    
    try {
      const response = await fetch(requestConfig.url, {
        method: requestConfig.method,
        headers: requestConfig.headers,
        body: requestConfig.data ? JSON.stringify(requestConfig.data) : undefined,
        signal: config?.signal
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new ApiError(responseData.error || 'Request failed', response.status);
      }
      
      return responseData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError('Network error', 0, error);
    }
  }
}

/**
 * 请求配置
 */
interface RequestConfig {
  method?: string;
  url?: string;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * 请求拦截器
 */
type RequestInterceptor = (config: RequestConfig) => Promise<RequestConfig>;

/**
 * API 错误类
 */
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

## API 客户端集成

```typescript
/**
 * 主 API 客户端
 */
class ApiClient {
  private httpClient: HttpClient;
  private wsClient: WebSocketClient;
  
  public auth: AuthApiClient;
  public game: GameApiClient;
  public property: PropertyApiClient;
  public tenant: TenantApiClient;
  public market: MarketApiClient;
  public exploration: ExplorationApiClient;
  
  constructor(config: ApiClientConfig) {
    this.httpClient = new HttpClient(config.baseURL);
    this.wsClient = new WebSocketClient(config.wsURL, config.token || '');
    
    // 初始化子客户端
    this.auth = new AuthApiClient(this.httpClient);
    this.game = new GameApiClient(this.httpClient, this.wsClient);
    this.property = new PropertyApiClient(this.httpClient);
    this.tenant = new TenantApiClient(this.httpClient);
    this.market = new MarketApiClient(this.httpClient);
    this.exploration = new ExplorationApiClient(this.httpClient, this.wsClient);
    
    this.setupInterceptors();
  }
  
  /**
   * 设置请求拦截器
   */
  private setupInterceptors(): void {
    // 认证拦截器
    this.httpClient.addInterceptor(async (config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    });
    
    // 请求ID拦截器
    this.httpClient.addInterceptor(async (config) => {
      config.headers = config.headers || {};
      config.headers['X-Request-ID'] = this.generateRequestId();
      return config;
    });
    
    // 重试拦截器
    this.httpClient.addInterceptor(async (config) => {
      config.retryAttempts = config.retryAttempts || 3;
      config.retryDelay = config.retryDelay || 1000;
      return config;
    });
  }
  
  /**
   * 连接 WebSocket
   */
  async connectWebSocket(): Promise<void> {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.wsClient = new WebSocketClient(this.wsClient.url, token);
      await this.wsClient.connect();
    }
  }
  
  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * API 客户端配置
 */
interface ApiClientConfig {
  baseURL: string;
  wsURL: string;
  token?: string;
  timeout?: number;
  retryAttempts?: number;
}

/**
 * 导出配置好的 API 客户端实例
 */
export const apiClient = new ApiClient({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
  wsURL: process.env.REACT_APP_WS_URL || 'ws://localhost:3001/ws',
  timeout: 30000,
  retryAttempts: 3
});
```

## 总结

这个 API 设计提供了一个完整的前后端通信解决方案，包括：

1. **RESTful API**: 标准的 HTTP API 设计
2. **实时通信**: WebSocket 支持实时事件推送
3. **类型安全**: 完整的 TypeScript 类型定义
4. **错误处理**: 统一的错误处理机制
5. **认证授权**: JWT 令牌认证系统
6. **请求拦截**: 灵活的请求拦截器系统
7. **重试机制**: 自动重试失败的请求
8. **缓存策略**: 支持请求缓存和优化

这个设计为物业管理模拟器提供了可靠、高效的数据通信基础。