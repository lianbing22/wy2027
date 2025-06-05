import { Tenant, TenantType, TenantStatus, TenantPersonality, TenantPreferences, TenantInteractionRecord, TenantRelationshipNetwork, TenantLifestyle, TenantEvent } from '../types/tenant-system';
import { Property, PropertyType } from '../types/property';
import { GameState } from '../types/game-state';

// 社区环境指标
interface CommunityMetrics {
  noiseLevel: number; // 噪音水平 (0-100)
  cleanlinessLevel: number; // 清洁度 (0-100)
  safetyLevel: number; // 安全度 (0-100)
  socialCohesion: number; // 社区凝聚力 (0-100)
  averageSatisfaction: number; // 平均满意度 (0-100)
  diversityIndex: number; // 多样性指数 (0-100)
}

// 物业环境
interface PropertyEnvironment {
  property: Property;
  neighboringTenants: Tenant[];
  communityMetrics: CommunityMetrics;
  marketConditions: {
    averageRent: number;
    vacancyRate: number;
    competitionLevel: number;
  };
}

// 满意度影响因素
interface SatisfactionFactors {
  rentAffordability: number; // 租金承受能力
  propertyCondition: number; // 物业状况
  neighborRelations: number; // 邻里关系
  communityEnvironment: number; // 社区环境
  serviceQuality: number; // 服务质量
  locationConvenience: number; // 位置便利性
}

// 租户行为预测结果
interface TenantBehaviorPrediction {
  retentionProbability: number; // 留存概率 (0-1)
  satisfactionTrend: 'improving' | 'stable' | 'declining';
  riskFactors: string[];
  recommendedActions: string[];
  predictedEvents: TenantEvent[];
}

// 租户互动结果
interface InteractionResult {
  satisfactionChange: number;
  relationshipChange: number;
  communityImpact: number;
  eventGenerated?: TenantEvent;
}

/**
 * 租户互动引擎
 * 处理租户之间的互动和影响
 */
class TenantInteractionEngine {
  /**
   * 计算租户满意度影响
   */
  calculateSatisfactionImpact(tenant: Tenant, neighbors: Tenant[]): number {
    let totalImpact = 0;
    
    neighbors.forEach(neighbor => {
      const personalityCompatibility = this.calculatePersonalityCompatibility(
        tenant.personality,
        neighbor.personality
      );
      
      const lifestyleCompatibility = this.calculateLifestyleCompatibility(
        tenant.lifestyle,
        neighbor.lifestyle
      );
      
      const relationshipBonus = this.getRelationshipBonus(tenant, neighbor);
      
      const impact = (personalityCompatibility + lifestyleCompatibility) * 0.5 + relationshipBonus;
      totalImpact += impact;
    });
    
    return neighbors.length > 0 ? totalImpact / neighbors.length : 0;
  }
  
  /**
   * 模拟噪音互动
   */
  simulateNoiseInteraction(source: Tenant, affected: Tenant[]): number[] {
    const sourceNoiseLevel = this.calculateTenantNoiseLevel(source);
    
    return affected.map(tenant => {
      const noiseSensitivity = tenant.preferences.quietEnvironment || 0.5;
      const timeOfDay = new Date().getHours();
      const timeMultiplier = timeOfDay >= 22 || timeOfDay <= 6 ? 2 : 1; // 夜间噪音影响更大
      
      return sourceNoiseLevel * noiseSensitivity * timeMultiplier;
    });
  }
  
  /**
   * 评估社区氛围
   */
  evaluateCommunityAtmosphere(tenants: Tenant[]): CommunityMetrics {
    if (tenants.length === 0) {
      return {
        noiseLevel: 0,
        cleanlinessLevel: 100,
        safetyLevel: 100,
        socialCohesion: 0,
        averageSatisfaction: 0,
        diversityIndex: 0
      };
    }
    
    const noiseLevel = this.calculateAverageNoiseLevel(tenants);
    const cleanlinessLevel = this.calculateCleanliness(tenants);
    const safetyLevel = this.calculateSafetyLevel(tenants);
    const socialCohesion = this.calculateSocialCohesion(tenants);
    const averageSatisfaction = tenants.reduce((sum, t) => sum + t.satisfactionLevel, 0) / tenants.length;
    const diversityIndex = this.calculateDiversityIndex(tenants);
    
    return {
      noiseLevel,
      cleanlinessLevel,
      safetyLevel,
      socialCohesion,
      averageSatisfaction,
      diversityIndex
    };
  }
  
  /**
   * 预测租户留存率
   */
  predictTenantRetention(tenant: Tenant, environment: PropertyEnvironment): number {
    const satisfactionFactors = this.analyzeSatisfactionFactors(tenant, environment);
    const personalityFactors = this.getPersonalityRetentionFactors(tenant.personality);
    const financialStability = this.assessFinancialStability(tenant);
    const marketAlternatives = this.assessMarketAlternatives(tenant, environment);
    
    // 综合计算留存概率
    const baseProbability = 0.7; // 基础留存概率
    const satisfactionWeight = 0.4;
    const personalityWeight = 0.2;
    const financialWeight = 0.3;
    const marketWeight = 0.1;
    
    const satisfactionScore = Object.values(satisfactionFactors).reduce((sum, val) => sum + val, 0) / Object.keys(satisfactionFactors).length;
    
    const retentionProbability = Math.min(1, Math.max(0,
      baseProbability +
      (satisfactionScore - 0.5) * satisfactionWeight +
      (personalityFactors - 0.5) * personalityWeight +
      (financialStability - 0.5) * financialWeight -
      (marketAlternatives - 0.5) * marketWeight
    ));
    
    return retentionProbability;
  }
  
  // 私有辅助方法
  private calculatePersonalityCompatibility(p1: TenantPersonality, p2: TenantPersonality): number {
    const factors = [
      Math.abs(p1.sociability - p2.sociability),
      Math.abs(p1.cleanliness - p2.cleanliness),
      Math.abs(p1.noiseLevel - p2.noiseLevel),
      Math.abs(p1.petFriendly - p2.petFriendly)
    ];
    
    const avgDifference = factors.reduce((sum, diff) => sum + diff, 0) / factors.length;
    return Math.max(0, 1 - avgDifference); // 差异越小，兼容性越高
  }
  
  private calculateLifestyleCompatibility(l1: TenantLifestyle, l2: TenantLifestyle): number {
    const scheduleCompatibility = this.calculateScheduleCompatibility(l1.dailySchedule, l2.dailySchedule);
    const activityCompatibility = this.calculateActivityCompatibility(l1.hobbies, l2.hobbies);
    
    return (scheduleCompatibility + activityCompatibility) / 2;
  }
  
  private getRelationshipBonus(tenant1: Tenant, tenant2: Tenant): number {
    const relationship = tenant1.relationshipNetwork.relationships.find(
      r => r.tenantId === tenant2.id
    );
    
    if (!relationship) return 0;
    
    switch (relationship.relationshipType) {
      case 'friend': return 0.2;
      case 'acquaintance': return 0.1;
      case 'neutral': return 0;
      case 'dislike': return -0.1;
      case 'conflict': return -0.3;
      default: return 0;
    }
  }
  
  private calculateTenantNoiseLevel(tenant: Tenant): number {
    const baseNoise = tenant.personality.noiseLevel;
    const lifestyleNoise = tenant.lifestyle.hobbies.includes('music') ? 0.2 : 0;
    const petNoise = tenant.hasPets ? 0.15 : 0;
    
    return Math.min(1, baseNoise + lifestyleNoise + petNoise);
  }
  
  private calculateAverageNoiseLevel(tenants: Tenant[]): number {
    return tenants.reduce((sum, tenant) => sum + this.calculateTenantNoiseLevel(tenant), 0) / tenants.length * 100;
  }
  
  private calculateCleanliness(tenants: Tenant[]): number {
    return tenants.reduce((sum, tenant) => sum + tenant.personality.cleanliness, 0) / tenants.length * 100;
  }
  
  private calculateSafetyLevel(tenants: Tenant[]): number {
    // 基于租户类型和行为历史计算安全水平
    const safetyScores = tenants.map(tenant => {
      let score = 0.8; // 基础安全分数
      
      // 根据租户类型调整
      switch (tenant.type) {
        case TenantType.FAMILY:
          score += 0.1;
          break;
        case TenantType.ELDERLY:
          score += 0.05;
          break;
        case TenantType.STUDENT:
          score -= 0.05;
          break;
      }
      
      // 根据历史记录调整
      const negativeEvents = tenant.interactionHistory.filter(
        record => record.interactionType === 'complaint' || record.interactionType === 'violation'
      ).length;
      
      score -= negativeEvents * 0.02;
      
      return Math.max(0, Math.min(1, score));
    });
    
    return safetyScores.reduce((sum, score) => sum + score, 0) / safetyScores.length * 100;
  }
  
  private calculateSocialCohesion(tenants: Tenant[]): number {
    if (tenants.length < 2) return 0;
    
    let totalConnections = 0;
    let positiveConnections = 0;
    
    tenants.forEach(tenant => {
      tenant.relationshipNetwork.relationships.forEach(relationship => {
        totalConnections++;
        if (relationship.relationshipType === 'friend' || relationship.relationshipType === 'acquaintance') {
          positiveConnections++;
        }
      });
    });
    
    return totalConnections > 0 ? (positiveConnections / totalConnections) * 100 : 0;
  }
  
  private calculateDiversityIndex(tenants: Tenant[]): number {
    const types = new Set(tenants.map(t => t.type));
    const ageGroups = new Set(tenants.map(t => this.getAgeGroup(t.age)));
    const incomeGroups = new Set(tenants.map(t => this.getIncomeGroup(t.financialInfo.monthlyIncome)));
    
    const maxDiversity = 3; // 类型、年龄、收入三个维度
    const actualDiversity = (types.size / Object.keys(TenantType).length) +
                           (ageGroups.size / 4) + // 假设4个年龄组
                           (incomeGroups.size / 5); // 假设5个收入组
    
    return Math.min(100, (actualDiversity / maxDiversity) * 100);
  }
  
  private analyzeSatisfactionFactors(tenant: Tenant, environment: PropertyEnvironment): SatisfactionFactors {
    const rentAffordability = this.calculateRentAffordability(tenant, environment.property);
    const propertyCondition = environment.property.condition / 100;
    const neighborRelations = this.calculateNeighborRelations(tenant, environment.neighboringTenants);
    const communityEnvironment = environment.communityMetrics.averageSatisfaction / 100;
    const serviceQuality = 0.8; // 假设服务质量，实际应从物业管理数据获取
    const locationConvenience = environment.property.location.conveniences.length / 10; // 简化计算
    
    return {
      rentAffordability,
      propertyCondition,
      neighborRelations,
      communityEnvironment,
      serviceQuality,
      locationConvenience
    };
  }
  
  private getPersonalityRetentionFactors(personality: TenantPersonality): number {
    // 基于性格特征计算留存倾向
    return (personality.stability + (1 - personality.adventurous)) / 2;
  }
  
  private assessFinancialStability(tenant: Tenant): number {
    const incomeStability = tenant.financialInfo.incomeStability;
    const creditScore = tenant.financialInfo.creditScore / 850; // 标准化信用分数
    const paymentHistory = tenant.financialInfo.paymentHistory.length > 0 ?
      tenant.financialInfo.paymentHistory.filter(p => p.onTime).length / tenant.financialInfo.paymentHistory.length :
      0.5;
    
    return (incomeStability + creditScore + paymentHistory) / 3;
  }
  
  private assessMarketAlternatives(tenant: Tenant, environment: PropertyEnvironment): number {
    const currentRent = environment.property.financialData.currentRent;
    const marketAverage = environment.marketConditions.averageRent;
    const vacancyRate = environment.marketConditions.vacancyRate;
    
    // 市场替代选择越多，租户越容易离开
    const priceCompetitiveness = currentRent / marketAverage;
    const availabilityFactor = vacancyRate; // 空置率高意味着选择多
    
    return (priceCompetitiveness + availabilityFactor) / 2;
  }
  
  private calculateScheduleCompatibility(schedule1: any, schedule2: any): number {
    // 简化的时间表兼容性计算
    return 0.7; // 占位符实现
  }
  
  private calculateActivityCompatibility(hobbies1: string[], hobbies2: string[]): number {
    const commonHobbies = hobbies1.filter(hobby => hobbies2.includes(hobby));
    const totalHobbies = new Set([...hobbies1, ...hobbies2]).size;
    
    return totalHobbies > 0 ? commonHobbies.length / totalHobbies : 0;
  }
  
  private calculateRentAffordability(tenant: Tenant, property: Property): number {
    const monthlyIncome = tenant.financialInfo.monthlyIncome;
    const currentRent = property.financialData.currentRent;
    const rentToIncomeRatio = currentRent / monthlyIncome;
    
    // 理想的租金收入比是30%以下
    return Math.max(0, 1 - Math.max(0, rentToIncomeRatio - 0.3) / 0.2);
  }
  
  private calculateNeighborRelations(tenant: Tenant, neighbors: Tenant[]): number {
    if (neighbors.length === 0) return 0.5;
    
    const relationships = tenant.relationshipNetwork.relationships;
    let totalScore = 0;
    let relationshipCount = 0;
    
    neighbors.forEach(neighbor => {
      const relationship = relationships.find(r => r.tenantId === neighbor.id);
      if (relationship) {
        relationshipCount++;
        switch (relationship.relationshipType) {
          case 'friend': totalScore += 1; break;
          case 'acquaintance': totalScore += 0.7; break;
          case 'neutral': totalScore += 0.5; break;
          case 'dislike': totalScore += 0.3; break;
          case 'conflict': totalScore += 0; break;
        }
      } else {
        relationshipCount++;
        totalScore += 0.5; // 中性关系
      }
    });
    
    return relationshipCount > 0 ? totalScore / relationshipCount : 0.5;
  }
  
  private getAgeGroup(age: number): string {
    if (age < 25) return 'young';
    if (age < 40) return 'adult';
    if (age < 60) return 'middle-aged';
    return 'senior';
  }
  
  private getIncomeGroup(income: number): string {
    if (income < 3000) return 'low';
    if (income < 6000) return 'lower-middle';
    if (income < 10000) return 'middle';
    if (income < 15000) return 'upper-middle';
    return 'high';
  }
}

/**
 * 租户管理服务
 * 提供租户相关的核心业务逻辑
 */
export class TenantService {
  private interactionEngine: TenantInteractionEngine;
  
  constructor() {
    this.interactionEngine = new TenantInteractionEngine();
  }
  
  /**
   * 计算租户满意度
   */
  calculateTenantSatisfaction(tenant: Tenant, environment: PropertyEnvironment): number {
    const factors = this.interactionEngine.analyzeSatisfactionFactors(tenant, environment);
    const weights = {
      rentAffordability: 0.25,
      propertyCondition: 0.20,
      neighborRelations: 0.15,
      communityEnvironment: 0.15,
      serviceQuality: 0.15,
      locationConvenience: 0.10
    };
    
    let satisfaction = 0;
    Object.entries(factors).forEach(([factor, value]) => {
      satisfaction += value * weights[factor as keyof typeof weights];
    });
    
    // 应用个性化调整
    satisfaction = this.applyPersonalityAdjustments(satisfaction, tenant.personality);
    
    return Math.max(0, Math.min(100, satisfaction * 100));
  }
  
  /**
   * 模拟租户行为
   */
  simulateTenantBehavior(tenant: Tenant, environment: PropertyEnvironment, deltaTime: number): TenantEvent[] {
    const events: TenantEvent[] = [];
    
    // 基于满意度和性格生成事件
    const satisfaction = tenant.satisfactionLevel;
    const personality = tenant.personality;
    
    // 低满意度可能产生投诉
    if (satisfaction < 30 && Math.random() < 0.1 * deltaTime) {
      events.push(this.generateComplaintEvent(tenant, environment));
    }
    
    // 高社交性租户可能组织活动
    if (personality.sociability > 0.7 && Math.random() < 0.05 * deltaTime) {
      events.push(this.generateSocialEvent(tenant));
    }
    
    // 根据生活方式生成日常事件
    if (Math.random() < 0.02 * deltaTime) {
      events.push(this.generateLifestyleEvent(tenant));
    }
    
    return events;
  }
  
  /**
   * 预测租户行为
   */
  predictTenantBehavior(tenant: Tenant, environment: PropertyEnvironment): TenantBehaviorPrediction {
    const retentionProbability = this.interactionEngine.predictTenantRetention(tenant, environment);
    const satisfactionTrend = this.analyzeSatisfactionTrend(tenant);
    const riskFactors = this.identifyRiskFactors(tenant, environment);
    const recommendedActions = this.generateRecommendations(tenant, environment, riskFactors);
    const predictedEvents = this.predictUpcomingEvents(tenant, environment);
    
    return {
      retentionProbability,
      satisfactionTrend,
      riskFactors,
      recommendedActions,
      predictedEvents
    };
  }
  
  /**
   * 处理租户互动
   */
  processTenantInteraction(tenant1: Tenant, tenant2: Tenant, interactionType: string): InteractionResult {
    const compatibility = this.interactionEngine.calculatePersonalityCompatibility(
      tenant1.personality,
      tenant2.personality
    );
    
    let satisfactionChange = 0;
    let relationshipChange = 0;
    let communityImpact = 0;
    let eventGenerated: TenantEvent | undefined;
    
    switch (interactionType) {
      case 'friendly_chat':
        satisfactionChange = compatibility * 5;
        relationshipChange = 0.1;
        communityImpact = 2;
        break;
        
      case 'noise_complaint':
        satisfactionChange = -10;
        relationshipChange = -0.2;
        communityImpact = -5;
        eventGenerated = this.generateNoiseComplaintEvent(tenant1, tenant2);
        break;
        
      case 'help_request':
        if (tenant2.personality.helpfulness > 0.5) {
          satisfactionChange = 8;
          relationshipChange = 0.15;
          communityImpact = 3;
        } else {
          satisfactionChange = -2;
          relationshipChange = -0.05;
        }
        break;
        
      case 'social_gathering':
        satisfactionChange = compatibility * 10;
        relationshipChange = 0.2;
        communityImpact = 8;
        break;
    }
    
    return {
      satisfactionChange,
      relationshipChange,
      communityImpact,
      eventGenerated
    };
  }
  
  /**
   * 评估社区健康度
   */
  evaluateCommunityHealth(tenants: Tenant[]): CommunityMetrics {
    return this.interactionEngine.evaluateCommunityAtmosphere(tenants);
  }
  
  /**
   * 生成租户匹配建议
   */
  generateTenantMatchingSuggestions(property: Property, candidateTenants: Tenant[], existingTenants: Tenant[]): Tenant[] {
    return candidateTenants
      .map(candidate => ({
        tenant: candidate,
        score: this.calculateMatchingScore(candidate, existingTenants, property)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.tenant);
  }
  
  // 私有辅助方法
  private applyPersonalityAdjustments(baseSatisfaction: number, personality: TenantPersonality): number {
    let adjustment = 0;
    
    // 乐观的租户更容易满意
    adjustment += (personality.optimism - 0.5) * 0.1;
    
    // 要求高的租户更难满意
    adjustment -= (personality.demandingness - 0.5) * 0.15;
    
    // 适应性强的租户更容易满意
    adjustment += (personality.adaptability - 0.5) * 0.08;
    
    return baseSatisfaction + adjustment;
  }
  
  private generateComplaintEvent(tenant: Tenant, environment: PropertyEnvironment): TenantEvent {
    const complaints = ['noise', 'maintenance', 'cleanliness', 'security', 'neighbors'];
    const complaint = complaints[Math.floor(Math.random() * complaints.length)];
    
    return {
      id: `complaint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId: tenant.id,
      eventType: 'complaint',
      description: `Tenant complained about ${complaint}`,
      severity: tenant.satisfactionLevel < 20 ? 'high' : 'medium',
      timestamp: new Date(),
      resolved: false,
      impact: {
        satisfactionChange: -5,
        relationshipChange: -0.1,
        communityImpact: -3
      }
    };
  }
  
  private generateSocialEvent(tenant: Tenant): TenantEvent {
    const events = ['party', 'gathering', 'community_meeting', 'celebration'];
    const event = events[Math.floor(Math.random() * events.length)];
    
    return {
      id: `social_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId: tenant.id,
      eventType: 'social',
      description: `Tenant organized a ${event}`,
      severity: 'low',
      timestamp: new Date(),
      resolved: true,
      impact: {
        satisfactionChange: 5,
        relationshipChange: 0.1,
        communityImpact: 8
      }
    };
  }
  
  private generateLifestyleEvent(tenant: Tenant): TenantEvent {
    const events = ['hobby_activity', 'routine_change', 'lifestyle_adjustment'];
    const event = events[Math.floor(Math.random() * events.length)];
    
    return {
      id: `lifestyle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId: tenant.id,
      eventType: 'lifestyle',
      description: `Tenant engaged in ${event}`,
      severity: 'low',
      timestamp: new Date(),
      resolved: true,
      impact: {
        satisfactionChange: 2,
        relationshipChange: 0,
        communityImpact: 1
      }
    };
  }
  
  private generateNoiseComplaintEvent(complainant: Tenant, target: Tenant): TenantEvent {
    return {
      id: `noise_complaint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId: complainant.id,
      eventType: 'complaint',
      description: `Noise complaint against tenant ${target.id}`,
      severity: 'medium',
      timestamp: new Date(),
      resolved: false,
      impact: {
        satisfactionChange: -8,
        relationshipChange: -0.2,
        communityImpact: -5
      },
      involvedTenants: [target.id]
    };
  }
  
  private analyzeSatisfactionTrend(tenant: Tenant): 'improving' | 'stable' | 'declining' {
    // 基于历史满意度数据分析趋势
    // 这里简化处理，实际应该基于历史数据
    const currentSatisfaction = tenant.satisfactionLevel;
    
    if (currentSatisfaction > 70) return 'stable';
    if (currentSatisfaction > 40) return 'stable';
    return 'declining';
  }
  
  private identifyRiskFactors(tenant: Tenant, environment: PropertyEnvironment): string[] {
    const risks: string[] = [];
    
    if (tenant.satisfactionLevel < 40) {
      risks.push('Low satisfaction level');
    }
    
    if (tenant.financialInfo.monthlyIncome < environment.property.financialData.currentRent * 3) {
      risks.push('Financial strain');
    }
    
    if (environment.communityMetrics.noiseLevel > 70) {
      risks.push('High community noise level');
    }
    
    if (tenant.interactionHistory.filter(h => h.interactionType === 'complaint').length > 3) {
      risks.push('Frequent complaints');
    }
    
    return risks;
  }
  
  private generateRecommendations(tenant: Tenant, environment: PropertyEnvironment, riskFactors: string[]): string[] {
    const recommendations: string[] = [];
    
    if (riskFactors.includes('Low satisfaction level')) {
      recommendations.push('Schedule a personal meeting to address concerns');
      recommendations.push('Consider rent adjustment or property improvements');
    }
    
    if (riskFactors.includes('Financial strain')) {
      recommendations.push('Discuss payment plan options');
      recommendations.push('Provide information about financial assistance programs');
    }
    
    if (riskFactors.includes('High community noise level')) {
      recommendations.push('Implement noise reduction measures');
      recommendations.push('Establish community quiet hours');
    }
    
    if (riskFactors.includes('Frequent complaints')) {
      recommendations.push('Investigate and address underlying issues');
      recommendations.push('Improve communication channels');
    }
    
    return recommendations;
  }
  
  private predictUpcomingEvents(tenant: Tenant, environment: PropertyEnvironment): TenantEvent[] {
    const events: TenantEvent[] = [];
    
    // 基于模式预测可能的事件
    if (tenant.satisfactionLevel < 30) {
      events.push({
        id: `predicted_complaint_${Date.now()}`,
        tenantId: tenant.id,
        eventType: 'complaint',
        description: 'Predicted complaint based on low satisfaction',
        severity: 'medium',
        timestamp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 一周后
        resolved: false,
        impact: {
          satisfactionChange: -10,
          relationshipChange: -0.1,
          communityImpact: -5
        }
      });
    }
    
    return events;
  }
  
  private calculateMatchingScore(candidate: Tenant, existingTenants: Tenant[], property: Property): number {
    let score = 50; // 基础分数
    
    // 财务匹配度
    const rentAffordability = candidate.financialInfo.monthlyIncome / property.financialData.currentRent;
    if (rentAffordability >= 3) score += 20;
    else if (rentAffordability >= 2.5) score += 10;
    else if (rentAffordability < 2) score -= 20;
    
    // 与现有租户的兼容性
    if (existingTenants.length > 0) {
      const avgCompatibility = existingTenants.reduce((sum, existing) => {
        return sum + this.interactionEngine.calculatePersonalityCompatibility(
          candidate.personality,
          existing.personality
        );
      }, 0) / existingTenants.length;
      
      score += avgCompatibility * 30;
    }
    
    // 物业类型匹配度
    const typeMatch = this.calculatePropertyTypeMatch(candidate, property);
    score += typeMatch * 20;
    
    return Math.max(0, Math.min(100, score));
  }
  
  private calculatePropertyTypeMatch(tenant: Tenant, property: Property): number {
    // 根据租户类型和物业类型计算匹配度
    const matches: Record<string, PropertyType[]> = {
      [TenantType.FAMILY]: [PropertyType.RESIDENTIAL, PropertyType.TOWNHOUSE],
      [TenantType.STUDENT]: [PropertyType.RESIDENTIAL, PropertyType.SHARED],
      [TenantType.PROFESSIONAL]: [PropertyType.RESIDENTIAL, PropertyType.LUXURY],
      [TenantType.ELDERLY]: [PropertyType.RESIDENTIAL, PropertyType.ASSISTED_LIVING],
      [TenantType.COUPLE]: [PropertyType.RESIDENTIAL, PropertyType.LUXURY]
    };
    
    const preferredTypes = matches[tenant.type] || [];
    return preferredTypes.includes(property.type) ? 1 : 0.5;
  }
}

export default TenantService;