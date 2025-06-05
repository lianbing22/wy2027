# 物业管理模拟器 - 项目开发规则

## 项目概述

本项目是一个基于React的物业管理模拟器游戏，采用五大核心循环（建设、经营、探险、竞争、扩张）的复合型策略游戏架构。

### 技术栈
- **前端**: React 19 + TypeScript + Vite + Ant Design
- **状态管理**: React Context + useReducer
- **路由**: React Router DOM v7
- **构建工具**: Vite 6.3
- **代码质量**: ESLint + TypeScript
- **部署**: GitHub Pages

## 架构设计原则

### 1. 分层架构

```
用户界面层 (UI Layer)
├── React Components
├── Ant Design
├── CSS Modules
└── Responsive Design

状态管理层 (State Layer)
├── Game Context
├── Tenant Context
├── Market Context
└── Story Context

业务逻辑层 (Business Layer)
├── Game Engine
├── Pricing Engine
├── AI Engine
└── Story Engine

服务层 (Service Layer)
├── Game Service
├── Tenant Service
├── Market Service
└── Data Service

数据层 (Data Layer)
├── Local Storage
├── Session Storage
├── IndexedDB
└── JSON Files
```

### 2. 模块化设计

- **核心引擎**: 游戏引擎作为系统核心，协调各子系统运行
- **子引擎**: 租户引擎、定价引擎、市场引擎、探险引擎等独立模块
- **事件驱动**: 使用EventBus进行模块间通信
- **状态管理**: 采用Context + Reducer模式管理复杂状态

## 开发规范

### 1. 代码组织

```
src/
├── components/          # 组件目录
│   ├── common/         # 通用组件
│   ├── game/           # 游戏功能组件
│   ├── property/       # 物业管理组件
│   ├── tenant/         # 租户管理组件
│   └── market/         # 市场分析组件
├── contexts/           # 状态管理
├── services/           # 业务服务
├── types/              # TypeScript类型定义
├── utils/              # 工具函数
├── hooks/              # 自定义Hooks
├── data/               # 静态数据
└── assets/             # 静态资源
```

### 2. 命名规范

- **组件**: PascalCase (如 `GameInterface`, `TenantCard`)
- **文件**: kebab-case (如 `game-interface.tsx`, `tenant-card.tsx`)
- **变量/函数**: camelCase (如 `gameState`, `calculateRent`)
- **常量**: UPPER_SNAKE_CASE (如 `MAX_TENANTS`, `DEFAULT_RENT`)
- **接口**: PascalCase + Interface后缀 (如 `GameStateInterface`)
- **类型**: PascalCase (如 `TenantType`, `PropertyStatus`)

### 3. TypeScript规范

- 所有组件必须使用TypeScript
- 定义明确的接口和类型
- 使用泛型提高代码复用性
- 避免使用`any`类型
- 使用严格的类型检查

```typescript
// 示例：组件Props接口定义
interface TenantCardProps {
  tenant: Tenant;
  onSelect?: (tenant: Tenant) => void;
  showDetails?: boolean;
  className?: string;
}

// 示例：状态接口定义
interface GameState {
  currentPhase: GamePhase;
  properties: Property[];
  tenants: Tenant[];
  playerResources: PlayerResources;
  marketState: MarketState;
}
```

### 4. 组件设计规范

#### 通用组件
- 高度可复用
- 支持主题定制
- 响应式设计
- 完整的Props接口
- 支持事件回调

#### 功能组件
- 单一职责原则
- 状态提升到合适层级
- 使用自定义Hooks封装逻辑
- 错误边界处理

```typescript
// 示例：按钮组件
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  children,
  ...props
}) => {
  // 组件实现
};
```

## API设计规范

### 1. RESTful API设计

- 使用标准HTTP方法 (GET, POST, PUT, DELETE)
- 统一的响应格式
- 错误处理机制
- 请求/响应类型定义

```typescript
// 标准API响应格式
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
  requestId: string;
}
```

### 2. 客户端API设计

- 使用Repository模式
- 统一的错误处理
- 请求重试机制
- 缓存策略

```typescript
// API客户端示例
class GameApiClient {
  async createGame(request: CreateGameRequest): Promise<ApiResponse<CreateGameResponse>> {
    return this.httpClient.post('/games', request);
  }
  
  async loadGame(saveId: string): Promise<ApiResponse<GameState>> {
    return this.httpClient.get(`/games/${saveId}`);
  }
}
```

## 数据管理规范

### 1. 数据模型设计

- 明确的实体关系
- 标准化的数据结构
- 版本兼容性考虑
- 数据验证机制

### 2. 存储策略

- **LocalStorage**: 用户偏好设置、简单配置
- **SessionStorage**: 临时数据、会话状态
- **IndexedDB**: 游戏存档、大量结构化数据
- **Memory Cache**: 频繁访问的数据

### 3. 数据持久化

```typescript
// 游戏存档系统
class GameSaveSystem {
  static saveGame(gameState: GameState): void {
    const saveData = {
      ...gameState,
      timestamp: new Date().toISOString(),
      version: '2.0.0'
    };
    localStorage.setItem('game_save', JSON.stringify(saveData));
  }
  
  static loadGame(): GameState | null {
    const saveData = localStorage.getItem('game_save');
    return saveData ? JSON.parse(saveData) : null;
  }
}
```

## 游戏系统设计规范

### 1. 游戏循环架构

- **建设阶段**: 物业购买、装修、基础设施建设
- **经营阶段**: 租户管理、收益优化、维护运营
- **探险阶段**: 任务探索、装备获取、技能提升
- **竞争阶段**: 拍卖竞价、排行榜、社交互动
- **扩张阶段**: 业务拓展、新市场开发、规模化经营

### 2. 核心系统

#### 租户生态系统
- 租户满意度计算
- 租户间互动模拟
- 社区氛围评估
- 租户流失预测

#### 动态定价系统
- 市场因素分析
- 竞争对手调研
- 季节性调整
- 租户特征考虑

#### 探险系统
- 任务生成算法
- 成功率计算
- 装备效果系统
- 技能树管理

### 3. 平衡性设计

- 经济系统平衡
- 难度曲线设计
- 奖励机制优化
- 随机事件控制

## 性能优化规范

### 1. 渲染优化

- 使用React.memo避免不必要的重渲染
- 虚拟化长列表
- 懒加载组件
- 图片优化

```typescript
// 组件优化示例
const TenantList = React.memo(({ tenants, onSelect }: TenantListProps) => {
  return (
    <FixedSizeList
      height={400}
      itemCount={tenants.length}
      itemSize={80}
      itemData={tenants}
    >
      {TenantItem}
    </FixedSizeList>
  );
});
```

### 2. 状态优化

- 状态分割和局部化
- 使用useMemo缓存计算结果
- 防抖处理用户输入
- 批量状态更新

### 3. 数据优化

- 数据压缩存储
- 增量更新机制
- 缓存策略
- 预加载关键数据

## 测试规范

### 1. 单元测试

- 组件测试覆盖率 > 80%
- 业务逻辑测试覆盖率 > 90%
- 使用Jest + React Testing Library
- Mock外部依赖

### 2. 集成测试

- 游戏流程测试
- API集成测试
- 状态管理测试
- 用户交互测试

### 3. 性能测试

- 渲染性能基准
- 内存使用监控
- 加载时间测试
- 大数据集处理测试

## 部署和发布规范

### 1. 构建配置

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/wy2027/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          game: ['./src/services/gameStateService.ts']
        }
      }
    }
  }
});
```

### 2. CI/CD流程

- 自动化测试
- 代码质量检查
- 构建优化
- 自动部署到GitHub Pages

### 3. 版本管理

- 语义化版本控制
- 变更日志维护
- 向后兼容性保证
- 数据迁移策略

## 代码质量规范

### 1. ESLint配置

```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react-hooks/exhaustive-deps": "error"
  }
}
```

### 2. 代码审查

- 所有代码变更必须经过审查
- 关注代码可读性和维护性
- 检查性能影响
- 验证测试覆盖率

### 3. 文档规范

- 组件文档使用JSDoc
- API文档保持更新
- 架构决策记录
- 用户使用指南

## 安全规范

### 1. 数据安全

- 敏感数据加密存储
- 输入验证和清理
- XSS防护
- 数据备份策略

### 2. 代码安全

- 依赖包安全扫描
- 避免硬编码敏感信息
- 安全的随机数生成
- 错误信息脱敏

## 用户体验规范

### 1. 响应式设计

- 移动端适配
- 平板端优化
- 桌面端完整功能
- 触摸友好的交互

### 2. 可访问性

- 键盘导航支持
- 屏幕阅读器兼容
- 颜色对比度达标
- 语义化HTML结构

### 3. 国际化

- 多语言支持框架
- 文本外部化
- 日期时间本地化
- 数字格式本地化

## 项目管理规范

### 1. 开发流程

- 敏捷开发方法
- 迭代式交付
- 持续集成
- 定期回顾和改进

### 2. 里程碑管理

- 明确的交付目标
- 可量化的验收标准
- 风险识别和缓解
- 进度跟踪和报告

### 3. 团队协作

- 代码规范统一
- 沟通渠道畅通
- 知识分享机制
- 技术债务管理

---

本规则文档将随着项目发展持续更新，确保开发团队遵循一致的标准和最佳实践。