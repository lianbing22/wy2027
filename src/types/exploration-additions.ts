// 这个文件包含ExplorationService使用的额外类型定义

// 扩展ExplorationMission类型以支持服务中使用的额外字段
export interface ExplorationMissionExtended {
  startedAt?: Date;
  estimatedEndTime?: Date;
  completedAt?: Date;
  result?: ExplorationResultExtended;
  expiresAt?: Date;
}

// 扩展ExplorationResult类型以支持服务中使用的额外字段
export interface ExplorationResultExtended {
  rewards?: {
    money: number;
    experience: number;
    items: string[];
    properties: string[];
  };
  events?: string[];
}

// 扩展MissionRequirement类型以支持服务中使用的对象形式
export interface MissionRequirementObject {
  minLevel: number;
  requiredEquipment: string[];
  requiredSkills: string[];
  minMoney: number;
}

// 扩展MissionReward类型以支持服务中使用的对象形式
export interface MissionRewardObject {
  money: number;
  experience: number;
  items: string[];
  properties: string[];
}

// 其他类型定义
export interface Player {
  id: string;
  name: string;
  level: number;
  money: number;
  equipment: string[];
  skills: Record<string, number>;
}

export interface ExplorationRisk {
  type: string;
  description: string;
  probability: number;
  impact: string;
}

export interface ExplorationEvent {
  id: string;
  missionId: string;
  timestamp: Date;
  type: string;
  description: string;
}

export interface CommunityMetrics {
  noiseLevel: number;
  safetyLevel: number;
  socialCohesion: number;
}

export interface PropertyEnvironment {
  location: string;
  accessibility: number;
  amenities: string[];
}

export interface Property {
  id: string;
  name: string;
  type: string;
  location: string;
} 