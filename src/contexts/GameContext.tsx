import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, GamePhase, PlayerProfile, PlayerResources } from '@types/game-state';
import { Property } from '@types/property';
import { Tenant } from '@types/tenant-system';
import { Equipment, ExplorationMission } from '@types/exploration';
import { Achievement } from '@types/achievement';
import { AuctionItem } from '@types/auction';

// 游戏动作类型
type GameAction =
  | { type: 'SWITCH_PHASE'; payload: GamePhase }
  | { type: 'UPDATE_PLAYER_RESOURCES'; payload: Partial<PlayerResources> }
  | { type: 'ADD_PROPERTY'; payload: Property }
  | { type: 'UPDATE_PROPERTY'; payload: Property }
  | { type: 'REMOVE_PROPERTY'; payload: string }
  | { type: 'ADD_TENANT'; payload: Tenant }
  | { type: 'UPDATE_TENANT'; payload: Tenant }
  | { type: 'REMOVE_TENANT'; payload: string }
  | { type: 'ADD_EQUIPMENT'; payload: Equipment }
  | { type: 'UPDATE_EQUIPMENT'; payload: Equipment }
  | { type: 'EXECUTE_EXPLORATION'; payload: ExplorationMission }
  | { type: 'COMPLETE_ACHIEVEMENT'; payload: string }
  | { type: 'PLACE_BID'; payload: { auctionId: string; amount: number } }
  | { type: 'ADVANCE_DAY' }
  | { type: 'SAVE_GAME' }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'RESET_GAME' };

// 游戏上下文接口
interface GameContextType {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
  
  // 游戏控制方法
  switchPhase: (phase: GamePhase) => void;
  updatePlayerResources: (resources: Partial<PlayerResources>) => void;
  
  // 物业管理方法
  addProperty: (property: Property) => void;
  updateProperty: (property: Property) => void;
  removeProperty: (propertyId: string) => void;
  
  // 租户管理方法
  addTenant: (tenant: Tenant) => void;
  updateTenant: (tenant: Tenant) => void;
  removeTenant: (tenantId: string) => void;
  
  // 装备管理方法
  addEquipment: (equipment: Equipment) => void;
  updateEquipment: (equipment: Equipment) => void;
  
  // 探险方法
  executeExploration: (mission: ExplorationMission) => void;
  
  // 成就方法
  completeAchievement: (achievementId: string) => void;
  
  // 拍卖方法
  placeBid: (auctionId: string, amount: number) => void;
  
  // 游戏进度方法
  advanceDay: () => void;
  
  // 存档方法
  saveGame: () => void;
  loadGame: (gameState: GameState) => void;
  resetGame: () => void;
}

// 初始游戏状态
const initialGameState: GameState = {
  gameId: `game_${Date.now()}`,
  version: '2.0.0',
  createdAt: new Date().toISOString(),
  lastSavedAt: new Date().toISOString(),
  
  currentPhase: GamePhase.BUILDING,
  gameDay: 1,
  totalPlayTime: 0,
  
  player: {
    id: 'player_1',
    name: '玩家',
    level: 1,
    resources: {
      cash: 100000,
      reputation: 50,
      experience: 0,
      energy: 100,
      influence: 10
    },
    achievements: [],
    statistics: {
      totalPropertiesOwned: 0,
      totalTenantsManaged: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      totalProfit: 0,
      explorationsMissions: 0,
      auctionsWon: 0,
      daysPlayed: 0
    }
  },
  
  properties: [],
  tenants: [],
  suppliers: [],
  equipment: [],
  
  skills: {
    categories: {
      negotiation: { name: '谈判', description: '提升谈判能力', nodes: [], totalPoints: 0, spentPoints: 0 },
      management: { name: '管理', description: '提升管理能力', nodes: [], totalPoints: 0, spentPoints: 0 },
      finance: { name: '财务', description: '提升财务能力', nodes: [], totalPoints: 0, spentPoints: 0 },
      marketing: { name: '营销', description: '提升营销能力', nodes: [], totalPoints: 0, spentPoints: 0 },
      construction: { name: '建筑', description: '提升建筑能力', nodes: [], totalPoints: 0, spentPoints: 0 },
      maintenance: { name: '维护', description: '提升维护能力', nodes: [], totalPoints: 0, spentPoints: 0 },
      exploration: { name: '探险', description: '提升探险能力', nodes: [], totalPoints: 0, spentPoints: 0 },
      leadership: { name: '领导力', description: '提升领导能力', nodes: [], totalPoints: 0, spentPoints: 0 }
    },
    availablePoints: 0,
    totalExperience: 0
  },
  
  achievements: [],
  marketConditions: {
    economicIndex: 75,
    demandLevel: 60,
    competitionLevel: 50,
    seasonalFactor: 1.0,
    trends: []
  },
  
  activeMissions: [],
  auctionItems: [],
  storyProgress: {
    currentChapter: 1,
    completedMissions: [],
    availableMissions: [],
    unlockedFeatures: [],
    choices: []
  },
  
  randomEvents: [],
  
  settings: {
    difficulty: 'normal',
    autoSave: true,
    autoSaveInterval: 5,
    soundEnabled: true,
    musicEnabled: true,
    notificationsEnabled: true,
    language: 'zh-CN'
  }
};

// 游戏状态减速器
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SWITCH_PHASE':
      return {
        ...state,
        currentPhase: action.payload,
        lastSavedAt: new Date().toISOString()
      };
      
    case 'UPDATE_PLAYER_RESOURCES':
      return {
        ...state,
        player: {
          ...state.player,
          resources: {
            ...state.player.resources,
            ...action.payload
          }
        },
        lastSavedAt: new Date().toISOString()
      };
      
    case 'ADD_PROPERTY':
      return {
        ...state,
        properties: [...state.properties, action.payload],
        player: {
          ...state.player,
          statistics: {
            ...state.player.statistics,
            totalPropertiesOwned: state.player.statistics.totalPropertiesOwned + 1
          }
        },
        lastSavedAt: new Date().toISOString()
      };
      
    case 'UPDATE_PROPERTY':
      return {
        ...state,
        properties: state.properties.map(property => 
          property.id === action.payload.id ? action.payload : property
        ),
        lastSavedAt: new Date().toISOString()
      };
      
    case 'REMOVE_PROPERTY':
      return {
        ...state,
        properties: state.properties.filter(property => property.id !== action.payload),
        lastSavedAt: new Date().toISOString()
      };
      
    case 'ADD_TENANT':
      return {
        ...state,
        tenants: [...state.tenants, action.payload],
        player: {
          ...state.player,
          statistics: {
            ...state.player.statistics,
            totalTenantsManaged: state.player.statistics.totalTenantsManaged + 1
          }
        },
        lastSavedAt: new Date().toISOString()
      };
      
    case 'UPDATE_TENANT':
      return {
        ...state,
        tenants: state.tenants.map(tenant => 
          tenant.id === action.payload.id ? action.payload : tenant
        ),
        lastSavedAt: new Date().toISOString()
      };
      
    case 'REMOVE_TENANT':
      return {
        ...state,
        tenants: state.tenants.filter(tenant => tenant.id !== action.payload),
        lastSavedAt: new Date().toISOString()
      };
      
    case 'ADD_EQUIPMENT':
      return {
        ...state,
        equipment: [...state.equipment, action.payload],
        lastSavedAt: new Date().toISOString()
      };
      
    case 'UPDATE_EQUIPMENT':
      return {
        ...state,
        equipment: state.equipment.map(equipment => 
          equipment.id === action.payload.id ? action.payload : equipment
        ),
        lastSavedAt: new Date().toISOString()
      };
      
    case 'ADVANCE_DAY':
      return {
        ...state,
        gameDay: state.gameDay + 1,
        player: {
          ...state.player,
          statistics: {
            ...state.player.statistics,
            daysPlayed: state.player.statistics.daysPlayed + 1
          }
        },
        lastSavedAt: new Date().toISOString()
      };
      
    case 'LOAD_GAME':
      return action.payload;
      
    case 'RESET_GAME':
      return initialGameState;
      
    default:
      return state;
  }
};

// 创建上下文
const GameContext = createContext<GameContextType | undefined>(undefined);

// 游戏提供者组件
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  
  // 自动保存
  useEffect(() => {
    if (gameState.settings.autoSave) {
      const interval = setInterval(() => {
        saveGame();
      }, gameState.settings.autoSaveInterval * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [gameState.settings.autoSave, gameState.settings.autoSaveInterval]);
  
  // 游戏控制方法
  const switchPhase = (phase: GamePhase): void => {
    dispatch({ type: 'SWITCH_PHASE', payload: phase });
  };
  
  const updatePlayerResources = (resources: Partial<PlayerResources>): void => {
    dispatch({ type: 'UPDATE_PLAYER_RESOURCES', payload: resources });
  };
  
  // 物业管理方法
  const addProperty = (property: Property): void => {
    dispatch({ type: 'ADD_PROPERTY', payload: property });
  };
  
  const updateProperty = (property: Property): void => {
    dispatch({ type: 'UPDATE_PROPERTY', payload: property });
  };
  
  const removeProperty = (propertyId: string): void => {
    dispatch({ type: 'REMOVE_PROPERTY', payload: propertyId });
  };
  
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
  
  // 装备管理方法
  const addEquipment = (equipment: Equipment): void => {
    dispatch({ type: 'ADD_EQUIPMENT', payload: equipment });
  };
  
  const updateEquipment = (equipment: Equipment): void => {
    dispatch({ type: 'UPDATE_EQUIPMENT', payload: equipment });
  };
  
  // 探险方法
  const executeExploration = (mission: ExplorationMission): void => {
    dispatch({ type: 'EXECUTE_EXPLORATION', payload: mission });
  };
  
  // 成就方法
  const completeAchievement = (achievementId: string): void => {
    dispatch({ type: 'COMPLETE_ACHIEVEMENT', payload: achievementId });
  };
  
  // 拍卖方法
  const placeBid = (auctionId: string, amount: number): void => {
    dispatch({ type: 'PLACE_BID', payload: { auctionId, amount } });
  };
  
  // 游戏进度方法
  const advanceDay = (): void => {
    dispatch({ type: 'ADVANCE_DAY' });
  };
  
  // 存档方法
  const saveGame = (): void => {
    try {
      const saveData = {
        ...gameState,
        lastSavedAt: new Date().toISOString()
      };
      localStorage.setItem('wy2027_game_save', JSON.stringify(saveData));
      console.log('游戏已保存');
    } catch (error) {
      console.error('保存游戏失败:', error);
    }
  };
  
  const loadGame = (gameState: GameState): void => {
    dispatch({ type: 'LOAD_GAME', payload: gameState });
  };
  
  const resetGame = (): void => {
    dispatch({ type: 'RESET_GAME' });
    localStorage.removeItem('wy2027_game_save');
  };
  
  // 初始化时加载游戏
  useEffect(() => {
    try {
      const savedGame = localStorage.getItem('wy2027_game_save');
      if (savedGame) {
        const gameData = JSON.parse(savedGame);
        loadGame(gameData);
        console.log('游戏已加载');
      }
    } catch (error) {
      console.error('加载游戏失败:', error);
    }
  }, []);
  
  const contextValue: GameContextType = {
    gameState,
    dispatch,
    switchPhase,
    updatePlayerResources,
    addProperty,
    updateProperty,
    removeProperty,
    addTenant,
    updateTenant,
    removeTenant,
    addEquipment,
    updateEquipment,
    executeExploration,
    completeAchievement,
    placeBid,
    advanceDay,
    saveGame,
    loadGame,
    resetGame
  };
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// 使用游戏上下文的Hook
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export default GameContext;