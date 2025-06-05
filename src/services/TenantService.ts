import { Tenant, TenantType, TenantStatus, PersonalityTrait, TenantPreferences, TenantInteraction, TenantRelationship, LifestylePattern, TenantEvent } from '../types/tenant-system';
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
        tenant.personalityTraits,
        neighbor.personalityTraits
      );
      
      const lifestyleCompatibility = this.calculateLifestyleCompatibility(
        tenant.lifestylePattern,
        neighbor.lifestylePattern
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
    const personalityFactors = this.getPersonalityRetentionFactors(tenant.personalityTraits);
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
  private calculatePersonalityCompatibility(p1: PersonalityTrait[], p2: PersonalityTrait[]): number {
    // 计算性格特征的兼容性
    // 这里简化为共同特征的比例
    const commonTraits = p1.filter(trait => p2.includes(trait)).length;
    const totalTraits = new Set([...p1, ...p2]).size;
    
    return commonTraits / totalTraits;
  }
  
  private calculateLifestyleCompatibility(l1: LifestylePattern, l2: LifestylePattern): number {
    const scheduleCompatibility = this.calculateScheduleCompatibility(l1.workSchedule, l2.workSchedule);
    const activityCompatibility = this.calculateActivityCompatibility(l1.socialActivity, l2.socialActivity);
    
    return (scheduleCompatibility + activityCompatibility) / 2;
  }
  
  private getRelationshipBonus(tenant1: Tenant, tenant2: Tenant): number {
    const relationship = tenant1.relationships.find(
      r => r.tenantId === tenant2.id
    );
    
    if (!relationship) return 0;
    
    switch (relationship.relationshipType) {
      case 'friend': return 0.2;
      case 'neutral': return 0;
      case 'conflict': return -0.3;
      default: return 0;
    }
  }
  
  private calculateTenantNoiseLevel(tenant: Tenant): number {
    // 基于租户特征计算噪音水平
    const hasNoisyTrait = tenant.personalityTraits.includes(PersonalityTrait.PARTY_LOVER);
    const hasMusicHobby = tenant.lifestylePattern.socialActivity > 7;
    
    return (hasNoisyTrait ? 0.3 : 0) + (hasMusicHobby ? 0.2 : 0) + tenant.lifestylePattern.noiseLevel / 10;
  }
  
  private calculateCleanliness(tenants: Tenant[]): number {
    // 计算平均清洁度
    return tenants.reduce((sum, tenant) => sum + tenant.lifestylePattern.cleanlinessLevel, 0) / tenants.length * 10;
  }
  
  // 其他辅助方法...
  
  public analyzeSatisfactionFactors(tenant: Tenant, environment: PropertyEnvironment): SatisfactionFactors {
    // 分析影响租户满意度的各种因素
    const rentAffordability = this.calculateRentAffordability(tenant, environment.property);
    const propertyCondition = environment.property.condition / 100;
    const neighborRelations = this.calculateNeighborRelations(tenant, environment.neighboringTenants);
    const communityEnvironment = this.calculateCommunityEnvironment(environment.communityMetrics);
    const serviceQuality = environment.property.serviceQuality / 100;
    const locationConvenience = this.calculateLocationConvenience(tenant, environment.property);
    
    return {
      rentAffordability,
      propertyCondition,
      neighborRelations,
      communityEnvironment,
      serviceQuality,
      locationConvenience
    };
  }
  
  private calculateScheduleCompatibility(s1: any, s2: any): number {
    // 简化实现
    return 0.5;
  }
  
  private calculateActivityCompatibility(a1: number, a2: number): number {
    // 简化实现
    return 1 - Math.abs(a1 - a2) / 10;
  }
  
  private calculateRentAffordability(tenant: Tenant, property: Property): number {
    // 计算租金承受能力
    const incomeStability = 0.8; // 假设的收入稳定性
    const creditScore = tenant.financials.creditScore / 850; // 标准化信用分数
    const paymentHistory = tenant.financials.paymentHistory.length > 0 ?
      tenant.financials.paymentHistory.filter(p => p.status === 'paid').length / tenant.financials.paymentHistory.length :
      0.5;
    
    const monthlyIncome = tenant.financials.monthlyIncome;
    const rentToIncomeRatio = property.monthlyRent / monthlyIncome;
    
    // 租金不应超过收入的30%为宜
    const affordabilityScore = rentToIncomeRatio <= 0.3 ? 1 : 
                              rentToIncomeRatio <= 0.4 ? 0.8 :
                              rentToIncomeRatio <= 0.5 ? 0.6 :
                              rentToIncomeRatio <= 0.6 ? 0.4 : 0.2;
    
    return (affordabilityScore * 0.6 + creditScore * 0.2 + paymentHistory * 0.2) * incomeStability;
  }
  
  private calculateNeighborRelations(tenant: Tenant, neighbors: Tenant[]): number {
    // 简化实现
    return 0.7;
  }
  
  private calculateCommunityEnvironment(metrics: CommunityMetrics): number {
    // 简化实现
    return 0.8;
  }
  
  private calculateLocationConvenience(tenant: Tenant, property: Property): number {
    // 简化实现
    return 0.6;
  }
  
  private assessFinancialStability(tenant: Tenant): number {
    // 评估租户财务稳定性
    return 0.7;
  }
  
  private assessMarketAlternatives(tenant: Tenant, environment: PropertyEnvironment): number {
    // 评估市场上的替代选择
    return 0.5;
  }
  
  private getPersonalityRetentionFactors(personalityTraits: PersonalityTrait[]): number {
    // 基于性格特征计算留存因素
    const isAdventurous = personalityTraits.includes(PersonalityTrait.SOCIAL);
    const isStable = personalityTraits.includes(PersonalityTrait.QUIET) || personalityTraits.includes(PersonalityTrait.EASYGOING);
    
    return isStable ? 0.8 : (isAdventurous ? 0.4 : 0.6);
  }
  
  private calculateDiversityIndex(tenants: Tenant[]): number {
    // 计算多样性指数
    const typeCount = new Map<TenantType, number>();
    tenants.forEach(tenant => {
      typeCount.set(tenant.type, (typeCount.get(tenant.type) || 0) + 1);
    });
    
    // 使用Shannon多样性指数
    let shannonIndex = 0;
    const totalTenants = tenants.length;
    
    typeCount.forEach(count => {
      const proportion = count / totalTenants;
      shannonIndex -= proportion * Math.log(proportion);
    });
    
    // 归一化到0-100
    return Math.min(100, shannonIndex * 100);
  }
}

// 导出租户服务
export class TenantService {
  private interactionEngine: TenantInteractionEngine;
  
  constructor() {
    this.interactionEngine = new TenantInteractionEngine();
  }
  
  /**
   * 计算租户满意度
   */
  calculateTenantSatisfaction(tenant: Tenant, property: Property, neighbors: Tenant[]): number {
    const environment: PropertyEnvironment = {
      property,
      neighboringTenants: neighbors,
      communityMetrics: this.interactionEngine.evaluateCommunityAtmosphere(neighbors),
      marketConditions: {
        averageRent: 1000, // 示例值
        vacancyRate: 0.05, // 示例值
        competitionLevel: 0.7 // 示例值
      }
    };
    
    const factors = this.interactionEngine.analyzeSatisfactionFactors(tenant, environment);
    
    // 基础满意度计算
    let satisfaction = (
      factors.rentAffordability * 0.25 +
      factors.propertyCondition * 0.2 +
      factors.neighborRelations * 0.15 +
      factors.communityEnvironment * 0.15 +
      factors.serviceQuality * 0.15 +
      factors.locationConvenience * 0.1
    ) * 100;
    
    // 应用性格调整
    satisfaction = this.applyPersonalityAdjustments(satisfaction, tenant.personalityTraits);
    
    return Math.min(100, Math.max(0, satisfaction));
  }
  
  /**
   * 模拟租户互动
   */
  simulateTenantInteractions(tenants: Tenant[], deltaTime: number): void {
    // 随机选择租户进行互动
    for (let i = 0; i < tenants.length; i++) {
      const tenant = tenants[i];
      const personalityTraits = tenant.personalityTraits;
      
      // 社交型租户更可能发起互动
      if (personalityTraits.includes(PersonalityTrait.SOCIAL) && Math.random() < 0.05 * deltaTime) {
        // 随机选择另一个租户
        const otherIndex = Math.floor(Math.random() * tenants.length);
        if (otherIndex !== i) {
          const otherTenant = tenants[otherIndex];
          this.processTenantInteraction(tenant, otherTenant);
        }
      }
    }
  }
  
  /**
   * 处理租户互动
   */
  private processTenantInteraction(tenant1: Tenant, tenant2: Tenant): InteractionResult {
    // 计算互动结果
    const compatibilityScore = this.interactionEngine.calculateSatisfactionImpact(tenant1, [tenant2]);
    
    // 根据兼容性生成互动结果
    let satisfactionChange = 0;
    let relationshipChange = 0;
    
    if (compatibilityScore > 0.5) {
      // 积极互动
      satisfactionChange = Math.random() * 5;
      relationshipChange = Math.random() * 10;
      
      // 如果第二个租户乐于助人，增加第一个租户的满意度
      if (tenant2.personalityTraits.includes(PersonalityTrait.FRIENDLY)) {
        satisfactionChange += 2;
      }
    } else if (compatibilityScore < -0.2) {
      // 消极互动
      satisfactionChange = -Math.random() * 8;
      relationshipChange = -Math.random() * 15;
    } else {
      // 中性互动
      satisfactionChange = Math.random() * 2 - 1;
      relationshipChange = Math.random() * 4 - 2;
    }
    
    // 更新租户状态
    tenant1.satisfactionLevel = Math.min(100, Math.max(0, tenant1.satisfactionLevel + satisfactionChange));
    
    // 更新关系
    let relationship = tenant1.relationships.find(r => r.tenantId === tenant2.id);
    if (!relationship) {
      relationship = {
        tenantId: tenant2.id,
        relationshipType: 'neutral',
        strength: 0,
        interactions: 0,
        lastInteractionDate: new Date().toISOString(),
        notes: ''
      };
      tenant1.relationships.push(relationship);
    }
    
    relationship.strength = Math.min(100, Math.max(-100, relationship.strength + relationshipChange));
    relationship.interactions += 1;
    relationship.lastInteractionDate = new Date().toISOString();
    
    // 根据关系强度更新关系类型
    if (relationship.strength > 60) {
      relationship.relationshipType = 'friend';
    } else if (relationship.strength < -30) {
      relationship.relationshipType = 'conflict';
    } else {
      relationship.relationshipType = 'neutral';
    }
    
    return {
      satisfactionChange,
      relationshipChange,
      communityImpact: compatibilityScore * 0.1
    };
  }
  
  /**
   * 应用性格调整到满意度
   */
  private applyPersonalityAdjustments(baseSatisfaction: number, personalityTraits: PersonalityTrait[]): number {
    let adjustment = 0;
    
    // 乐观的租户满意度更高
    if (personalityTraits.includes(PersonalityTrait.FRIENDLY)) {
      adjustment += 5;
    }
    
    // 苛刻的租户满意度更低
    if (personalityTraits.includes(PersonalityTrait.DEMANDING)) {
      adjustment -= 8;
    }
    
    // 随和的租户满意度更高
    if (personalityTraits.includes(PersonalityTrait.EASYGOING)) {
      adjustment += 3;
    }
    
    return baseSatisfaction + adjustment;
  }
  
  /**
   * 预测租户行为
   */
  predictTenantBehavior(tenant: Tenant, property: Property, neighbors: Tenant[]): TenantBehaviorPrediction {
    const environment: PropertyEnvironment = {
      property,
      neighboringTenants: neighbors,
      communityMetrics: this.interactionEngine.evaluateCommunityAtmosphere(neighbors),
      marketConditions: {
        averageRent: 1000, // 示例值
        vacancyRate: 0.05, // 示例值
        competitionLevel: 0.7 // 示例值
      }
    };
    
    const retentionProbability = this.interactionEngine.predictTenantRetention(tenant, environment);
    
    // 识别风险因素
    const riskFactors: string[] = [];
    
    // 租金过高是风险
    if (tenant.financials.monthlyIncome < property.monthlyRent * 3) {
      riskFactors.push('租金负担过重');
    }
    
    // 满意度过低是风险
    if (tenant.satisfactionLevel < 40) {
      riskFactors.push('满意度过低');
    }
    
    // 投诉过多是风险
    if (tenant.interactions.filter(h => h.type === 'complaint').length > 3) {
      riskFactors.push('投诉频繁');
    }
    
    // 生成建议行动
    const recommendedActions: string[] = [];
    
    if (riskFactors.includes('租金负担过重')) {
      recommendedActions.push('考虑调整租金或提供分期付款选项');
    }
    
    if (riskFactors.includes('满意度过低')) {
      recommendedActions.push('安排面谈了解不满原因');
      recommendedActions.push('提供物业服务升级');
    }
    
    if (riskFactors.includes('投诉频繁')) {
      recommendedActions.push('优先处理历史投诉');
      recommendedActions.push('制定专门的服务改进计划');
    }
    
    // 预测满意度趋势
    let satisfactionTrend: 'improving' | 'stable' | 'declining';
    
    if (riskFactors.length > 2) {
      satisfactionTrend = 'declining';
    } else if (riskFactors.length === 0 && tenant.satisfactionLevel > 70) {
      satisfactionTrend = 'improving';
    } else {
      satisfactionTrend = 'stable';
    }
    
    return {
      retentionProbability,
      satisfactionTrend,
      riskFactors,
      recommendedActions,
      predictedEvents: [] // 简化实现
    };
  }
  
  /**
   * 匹配租户与物业
   */
  matchTenantToProperty(tenant: Tenant, properties: Property[]): Property[] {
    // 根据租户偏好和特征匹配最适合的物业
    return properties.filter(property => {
      // 检查基本匹配条件
      if (!tenant.preferences.propertyType.includes(property.type)) {
        return false;
      }
      
      if (property.area < tenant.preferences.minArea || property.area > tenant.preferences.maxArea) {
        return false;
      }
      
      if (property.monthlyRent > tenant.preferences.maxRent) {
        return false;
      }
      
      // 检查特殊需求
      if (tenant.preferences.needsParking && !property.hasParking) {
        return false;
      }
      
      if (tenant.preferences.petFriendly && !property.isPetFriendly) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // 计算匹配分数
      const scoreA = this.calculateMatchScore(tenant, a);
      const scoreB = this.calculateMatchScore(tenant, b);
      return scoreB - scoreA; // 降序排列
    });
  }
  
  /**
   * 计算租户与物业的匹配分数
   */
  private calculateMatchScore(tenant: Tenant, property: Property): number {
    let score = 0;
    
    // 租金承受能力
    const rentAffordability = tenant.financials.monthlyIncome / property.monthlyRent;
    score += Math.min(1, rentAffordability / 4) * 30; // 最高30分
    
    // 面积匹配度
    const idealArea = (tenant.preferences.minArea + tenant.preferences.maxArea) / 2;
    const areaDifference = Math.abs(property.area - idealArea) / idealArea;
    score += (1 - Math.min(1, areaDifference)) * 20; // 最高20分
    
    // 位置便利性
    if (tenant.preferences.locationPreferences.nearSchool && property.isNearSchool) {
      score += 10;
    }
    
    if (tenant.preferences.locationPreferences.nearTransport && property.isNearTransport) {
      score += 10;
    }
    
    if (tenant.preferences.locationPreferences.nearShopping && property.isNearShopping) {
      score += 10;
    }
    
    if (tenant.preferences.locationPreferences.quietArea && property.isQuietArea) {
      score += 10;
    }
    
    // 设施匹配
    const matchedFacilities = property.facilities.filter(f => 
      tenant.preferences.preferredFacilities.includes(f.name)
    ).length;
    
    score += (matchedFacilities / Math.max(1, tenant.preferences.preferredFacilities.length)) * 20;
    
    return score;
  }
  
  /**
   * 获取租户类型与物业类型的默认匹配关系
   */
  getDefaultPropertyTypeMatches(): Record<TenantType, PropertyType[]> {
    return {
      [TenantType.INDIVIDUAL]: [PropertyType.RESIDENTIAL],
      [TenantType.FAMILY]: [PropertyType.RESIDENTIAL],
      [TenantType.STUDENT]: [PropertyType.RESIDENTIAL],
      [TenantType.BUSINESS]: [PropertyType.COMMERCIAL, PropertyType.OFFICE],
      [TenantType.STARTUP]: [PropertyType.OFFICE],
      [TenantType.CORPORATION]: [PropertyType.OFFICE, PropertyType.COMMERCIAL]
    };
  }
}

export default TenantService;