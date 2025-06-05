// 通用组件
export { default as GameLayout } from './common/GameLayout';

// 游戏组件
export { default as GameDashboard } from './game/GameDashboard';
export { default as ExplorationPanel } from './game/ExplorationPanel';
export { default as AchievementPanel } from './game/AchievementPanel';

// 物业组件
export { default as PropertyManager } from './property/PropertyManager';

// 租户组件
export { default as TenantManager } from './tenant/TenantManager';

// 市场组件
export { default as MarketPlace } from './market/MarketPlace';

// 组件类型导出
export type { GameLayoutProps } from './common/GameLayout';
export type { GameDashboardProps } from './game/GameDashboard';
export type { ExplorationPanelProps } from './game/ExplorationPanel';
export type { AchievementPanelProps } from './game/AchievementPanel';
export type { PropertyManagerProps } from './property/PropertyManager';
export type { TenantManagerProps } from './tenant/TenantManager';
export type { MarketPlaceProps } from './market/MarketPlace';