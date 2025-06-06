import { randomUUID } from '../utils/uuid';

// 通知类型
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  ACHIEVEMENT = 'achievement',
  MISSION = 'mission',
  TENANT = 'tenant',
  PROPERTY = 'property',
  MARKET = 'market',
  SYSTEM = 'system'
}

// 通知优先级
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// 通知状态
export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

// 通知渠道
export enum NotificationChannel {
  IN_GAME = 'in_game',
  PUSH = 'push',
  EMAIL = 'email',
  SMS = 'sms'
}

// 通知接口
export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: any; // 附加数据
  playerId: string;
  status: NotificationStatus;
  channels: NotificationChannel[];
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
  actions?: NotificationAction[];
  icon?: string;
  image?: string;
  sound?: string;
  vibrate?: boolean;
}

// 通知操作
interface NotificationAction {
  id: string;
  label: string;
  action: string;
  data?: any;
  style?: 'default' | 'primary' | 'danger';
}

// 通知设置
interface NotificationSettings {
  playerId: string;
  channels: {
    [key in NotificationChannel]: boolean;
  };
  types: {
    [key in NotificationType]: {
      enabled: boolean;
      channels: NotificationChannel[];
      priority: NotificationPriority;
    };
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
  };
  maxNotifications: number;
  autoArchive: {
    enabled: boolean;
    days: number;
  };
}

// 通知模板
interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  icon?: string;
  sound?: string;
  actions?: Omit<NotificationAction, 'id'>[];
}

// 通知统计
interface NotificationStatistics {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
  recentActivity: {
    sent: number;
    read: number;
    archived: number;
  };
}

/**
 * 通知系统服务
 * 管理游戏内通知、消息推送和事件提醒
 */
export class NotificationService {
  private notifications: Map<string, Notification> = new Map();
  private playerSettings: Map<string, NotificationSettings> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();
  
  constructor() {
    this.initializeTemplates();
  }
  
  /**
   * 初始化通知模板
   */
  private initializeTemplates(): void {
    // 成就通知模板
    this.addTemplate({
      id: 'achievement_unlocked',
      type: NotificationType.ACHIEVEMENT,
      title: '🏆 成就解锁！',
      message: '恭喜你解锁了新成就：{achievementName}',
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_GAME, NotificationChannel.PUSH],
      icon: 'trophy',
      sound: 'achievement',
      actions: [
        { label: '查看详情', action: 'view_achievement', style: 'primary' },
        { label: '领取奖励', action: 'claim_reward', style: 'primary' }
      ]
    });
    
    // 任务通知模板
    this.addTemplate({
      id: 'mission_completed',
      type: NotificationType.MISSION,
      title: '✅ 任务完成',
      message: '探险任务「{missionName}」已完成！',
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_GAME],
      icon: 'check-circle',
      actions: [
        { label: '查看结果', action: 'view_mission_result', style: 'primary' }
      ]
    });
    
    this.addTemplate({
      id: 'mission_failed',
      type: NotificationType.WARNING,
      title: '❌ 任务失败',
      message: '探险任务「{missionName}」失败了，不要灰心！',
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_GAME],
      icon: 'x-circle',
      actions: [
        { label: '查看详情', action: 'view_mission_result' },
        { label: '重新尝试', action: 'retry_mission', style: 'primary' }
      ]
    });
    
    // 租户通知模板
    this.addTemplate({
      id: 'tenant_complaint',
      type: NotificationType.WARNING,
      title: '⚠️ 租户投诉',
      message: '租户 {tenantName} 对 {propertyName} 提出了投诉',
      priority: NotificationPriority.HIGH,
      channels: [NotificationChannel.IN_GAME, NotificationChannel.PUSH],
      icon: 'alert-triangle',
      actions: [
        { label: '查看详情', action: 'view_complaint', style: 'primary' },
        { label: '立即处理', action: 'handle_complaint', style: 'danger' }
      ]
    });
    
    this.addTemplate({
      id: 'tenant_satisfaction',
      type: NotificationType.SUCCESS,
      title: '😊 租户满意',
      message: '租户 {tenantName} 对你的服务非常满意！',
      priority: NotificationPriority.LOW,
      channels: [NotificationChannel.IN_GAME],
      icon: 'smile',
      actions: [
        { label: '查看评价', action: 'view_review' }
      ]
    });
    
    // 物业通知模板
    this.addTemplate({
      id: 'property_maintenance',
      type: NotificationType.WARNING,
      title: '🔧 维护提醒',
      message: '物业 {propertyName} 需要进行维护',
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_GAME, NotificationChannel.PUSH],
      icon: 'tool',
      actions: [
        { label: '安排维护', action: 'schedule_maintenance', style: 'primary' },
        { label: '稍后提醒', action: 'snooze_maintenance' }
      ]
    });
    
    this.addTemplate({
      id: 'property_upgrade_complete',
      type: NotificationType.SUCCESS,
      title: '🏠 升级完成',
      message: '物业 {propertyName} 的升级已完成！',
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_GAME],
      icon: 'home',
      actions: [
        { label: '查看详情', action: 'view_property', style: 'primary' }
      ]
    });
    
    // 市场通知模板
    this.addTemplate({
      id: 'market_opportunity',
      type: NotificationType.INFO,
      title: '💰 市场机会',
      message: '发现了一个不错的投资机会：{opportunityName}',
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_GAME, NotificationChannel.PUSH],
      icon: 'trending-up',
      actions: [
        { label: '查看详情', action: 'view_opportunity', style: 'primary' },
        { label: '立即投资', action: 'invest_now', style: 'primary' }
      ]
    });
    
    // 系统通知模板
    this.addTemplate({
      id: 'daily_login',
      type: NotificationType.INFO,
      title: '🎉 每日登录',
      message: '欢迎回来！你已连续登录 {days} 天',
      priority: NotificationPriority.LOW,
      channels: [NotificationChannel.IN_GAME],
      icon: 'calendar',
      actions: [
        { label: '领取奖励', action: 'claim_daily_reward', style: 'primary' }
      ]
    });
    
    this.addTemplate({
      id: 'level_up',
      type: NotificationType.SUCCESS,
      title: '🎊 等级提升！',
      message: '恭喜你升到了 {level} 级！',
      priority: NotificationPriority.HIGH,
      channels: [NotificationChannel.IN_GAME, NotificationChannel.PUSH],
      icon: 'star',
      sound: 'level_up',
      actions: [
        { label: '查看奖励', action: 'view_level_rewards', style: 'primary' }
      ]
    });
  }
  
  /**
   * 添加通知模板
   */
  addTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
  }
  
  /**
   * 获取玩家通知设置
   */
  private getPlayerSettings(playerId: string): NotificationSettings {
    if (!this.playerSettings.has(playerId)) {
      // 创建默认设置
      const defaultSettings: NotificationSettings = {
        playerId,
        channels: {
          [NotificationChannel.IN_GAME]: true,
          [NotificationChannel.PUSH]: true,
          [NotificationChannel.EMAIL]: false,
          [NotificationChannel.SMS]: false
        },
        types: {
          [NotificationType.INFO]: {
            enabled: true,
            channels: [NotificationChannel.IN_GAME],
            priority: NotificationPriority.LOW
          },
          [NotificationType.SUCCESS]: {
            enabled: true,
            channels: [NotificationChannel.IN_GAME, NotificationChannel.PUSH],
            priority: NotificationPriority.MEDIUM
          },
          [NotificationType.WARNING]: {
            enabled: true,
            channels: [NotificationChannel.IN_GAME, NotificationChannel.PUSH],
            priority: NotificationPriority.HIGH
          },
          [NotificationType.ERROR]: {
            enabled: true,
            channels: [NotificationChannel.IN_GAME, NotificationChannel.PUSH],
            priority: NotificationPriority.URGENT
          },
          [NotificationType.ACHIEVEMENT]: {
            enabled: true,
            channels: [NotificationChannel.IN_GAME, NotificationChannel.PUSH],
            priority: NotificationPriority.MEDIUM
          },
          [NotificationType.MISSION]: {
            enabled: true,
            channels: [NotificationChannel.IN_GAME],
            priority: NotificationPriority.MEDIUM
          },
          [NotificationType.TENANT]: {
            enabled: true,
            channels: [NotificationChannel.IN_GAME, NotificationChannel.PUSH],
            priority: NotificationPriority.HIGH
          },
          [NotificationType.PROPERTY]: {
            enabled: true,
            channels: [NotificationChannel.IN_GAME, NotificationChannel.PUSH],
            priority: NotificationPriority.MEDIUM
          },
          [NotificationType.MARKET]: {
            enabled: true,
            channels: [NotificationChannel.IN_GAME, NotificationChannel.PUSH],
            priority: NotificationPriority.MEDIUM
          },
          [NotificationType.SYSTEM]: {
            enabled: true,
            channels: [NotificationChannel.IN_GAME],
            priority: NotificationPriority.LOW
          }
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        },
        maxNotifications: 100,
        autoArchive: {
          enabled: true,
          days: 30
        }
      };
      
      this.playerSettings.set(playerId, defaultSettings);
    }
    
    return this.playerSettings.get(playerId)!;
  }
  
  /**
   * 发送通知
   */
  async sendNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const settings = this.getPlayerSettings(notification.playerId);
    const typeSettings = settings.types[notification.type];
    
    // 检查是否启用该类型的通知
    if (!typeSettings.enabled) {
      return '';
    }
    
    // 检查静音时间
    if (this.isInQuietHours(settings)) {
      // 如果是紧急通知，仍然发送
      if (notification.priority !== NotificationPriority.URGENT) {
        return '';
      }
    }
    
    const id = randomUUID();
    const fullNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
      status: NotificationStatus.UNREAD,
      channels: notification.channels.filter(channel => settings.channels[channel])
    };
    
    this.notifications.set(id, fullNotification);
    
    // 限制通知数量
    this.limitNotifications(notification.playerId, settings.maxNotifications);
    
    // 触发事件
    this.emit('notification_sent', fullNotification);
    
    // 发送到各个渠道
    await this.deliverNotification(fullNotification);
    
    return id;
  }
  
  /**
   * 使用模板发送通知
   */
  async sendTemplateNotification(
    templateId: string,
    playerId: string,
    variables: Record<string, any> = {},
    overrides: Partial<Notification> = {}
  ): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`通知模板 ${templateId} 不存在`);
    }
    
    // 替换变量
    const title = this.replaceVariables(template.title, variables);
    const message = this.replaceVariables(template.message, variables);
    
    const notification: Omit<Notification, 'id' | 'createdAt' | 'status'> = {
      type: template.type,
      priority: template.priority,
      title,
      message,
      playerId,
      channels: template.channels,
      icon: template.icon,
      sound: template.sound,
      actions: template.actions?.map(action => ({
        ...action,
        id: randomUUID()
      })),
      ...overrides
    };
    
    return this.sendNotification(notification);
  }
  
  /**
   * 替换模板变量
   */
  private replaceVariables(text: string, variables: Record<string, any>): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  }
  
  /**
   * 检查是否在静音时间
   */
  private isInQuietHours(settings: NotificationSettings): boolean {
    if (!settings.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const start = settings.quietHours.start;
    const end = settings.quietHours.end;
    
    if (start <= end) {
      // 同一天内的时间段
      return currentTime >= start && currentTime <= end;
    } else {
      // 跨天的时间段
      return currentTime >= start || currentTime <= end;
    }
  }
  
  /**
   * 限制通知数量
   */
  private limitNotifications(playerId: string, maxNotifications: number): void {
    const playerNotifications = this.getPlayerNotifications(playerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (playerNotifications.length > maxNotifications) {
      const toDelete = playerNotifications.slice(maxNotifications);
      toDelete.forEach(notification => {
        this.notifications.delete(notification.id);
      });
    }
  }
  
  /**
   * 投递通知到各个渠道
   */
  private async deliverNotification(notification: Notification): Promise<void> {
    const promises = notification.channels.map(async (channel) => {
      try {
        switch (channel) {
          case NotificationChannel.IN_GAME:
            await this.deliverInGame(notification);
            break;
          case NotificationChannel.PUSH:
            await this.deliverPush(notification);
            break;
          case NotificationChannel.EMAIL:
            await this.deliverEmail(notification);
            break;
          case NotificationChannel.SMS:
            await this.deliverSMS(notification);
            break;
        }
      } catch (error) {
        console.error(`Failed to deliver notification via ${channel}:`, error);
      }
    });
    
    await Promise.allSettled(promises);
  }
  
  /**
   * 游戏内通知投递
   */
  private async deliverInGame(notification: Notification): Promise<void> {
    // 触发游戏内通知事件
    this.emit('in_game_notification', notification);
  }
  
  /**
   * 推送通知投递
   */
  private async deliverPush(notification: Notification): Promise<void> {
    // 这里应该集成实际的推送服务（如 Firebase、APNs 等）
    console.log('Push notification:', {
      title: notification.title,
      body: notification.message,
      icon: notification.icon,
      sound: notification.sound,
      vibrate: notification.vibrate
    });
  }
  
  /**
   * 邮件通知投递
   */
  private async deliverEmail(notification: Notification): Promise<void> {
    // 这里应该集成邮件服务
    console.log('Email notification:', {
      to: notification.playerId,
      subject: notification.title,
      body: notification.message
    });
  }
  
  /**
   * 短信通知投递
   */
  private async deliverSMS(notification: Notification): Promise<void> {
    // 这里应该集成短信服务
    console.log('SMS notification:', {
      to: notification.playerId,
      message: `${notification.title}: ${notification.message}`
    });
  }
  
  /**
   * 标记通知为已读
   */
  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (!notification || notification.status === NotificationStatus.READ) {
      return false;
    }
    
    notification.status = NotificationStatus.READ;
    notification.readAt = new Date();
    
    this.emit('notification_read', notification);
    return true;
  }
  
  /**
   * 批量标记为已读
   */
  markMultipleAsRead(notificationIds: string[]): number {
    let count = 0;
    notificationIds.forEach(id => {
      if (this.markAsRead(id)) {
        count++;
      }
    });
    return count;
  }
  
  /**
   * 标记所有通知为已读
   */
  markAllAsRead(playerId: string): number {
    const unreadNotifications = this.getPlayerNotifications(playerId)
      .filter(n => n.status === NotificationStatus.UNREAD);
    
    return this.markMultipleAsRead(unreadNotifications.map(n => n.id));
  }
  
  /**
   * 归档通知
   */
  archiveNotification(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (!notification) return false;
    
    notification.status = NotificationStatus.ARCHIVED;
    this.emit('notification_archived', notification);
    return true;
  }
  
  /**
   * 删除通知
   */
  deleteNotification(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (!notification) return false;
    
    this.notifications.delete(notificationId);
    this.emit('notification_deleted', notification);
    return true;
  }
  
  /**
   * 获取玩家通知列表
   */
  getPlayerNotifications(
    playerId: string,
    options?: {
      status?: NotificationStatus;
      type?: NotificationType;
      limit?: number;
      offset?: number;
    }
  ): Notification[] {
    let notifications = Array.from(this.notifications.values())
      .filter(n => n.playerId === playerId);
    
    // 过滤条件
    if (options?.status) {
      notifications = notifications.filter(n => n.status === options.status);
    }
    
    if (options?.type) {
      notifications = notifications.filter(n => n.type === options.type);
    }
    
    // 排序（最新的在前）
    notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // 分页
    if (options?.offset) {
      notifications = notifications.slice(options.offset);
    }
    
    if (options?.limit) {
      notifications = notifications.slice(0, options.limit);
    }
    
    return notifications;
  }
  
  /**
   * 获取通知详情
   */
  getNotification(notificationId: string): Notification | null {
    return this.notifications.get(notificationId) || null;
  }
  
  /**
   * 获取未读通知数量
   */
  getUnreadCount(playerId: string, type?: NotificationType): number {
    return this.getPlayerNotifications(playerId, {
      status: NotificationStatus.UNREAD,
      type
    }).length;
  }
  
  /**
   * 获取通知统计
   */
  getStatistics(playerId: string): NotificationStatistics {
    const notifications = this.getPlayerNotifications(playerId);
    
    const stats: NotificationStatistics = {
      total: notifications.length,
      unread: 0,
      byType: {} as Record<NotificationType, number>,
      byPriority: {} as Record<NotificationPriority, number>,
      recentActivity: {
        sent: 0,
        read: 0,
        archived: 0
      }
    };
    
    // 初始化计数器
    Object.values(NotificationType).forEach(type => {
      stats.byType[type] = 0;
    });
    
    Object.values(NotificationPriority).forEach(priority => {
      stats.byPriority[priority] = 0;
    });
    
    // 统计数据
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    notifications.forEach(notification => {
      if (notification.status === NotificationStatus.UNREAD) {
        stats.unread++;
      }
      
      stats.byType[notification.type]++;
      stats.byPriority[notification.priority]++;
      
      // 最近24小时的活动
      if (notification.createdAt >= oneDayAgo) {
        stats.recentActivity.sent++;
      }
      
      if (notification.readAt && notification.readAt >= oneDayAgo) {
        stats.recentActivity.read++;
      }
      
      if (notification.status === NotificationStatus.ARCHIVED) {
        stats.recentActivity.archived++;
      }
    });
    
    return stats;
  }
  
  /**
   * 更新通知设置
   */
  updateSettings(playerId: string, settings: Partial<NotificationSettings>): void {
    const currentSettings = this.getPlayerSettings(playerId);
    const updatedSettings = { ...currentSettings, ...settings };
    this.playerSettings.set(playerId, updatedSettings);
    
    this.emit('settings_updated', { playerId, settings: updatedSettings });
  }
  
  /**
   * 获取通知设置
   */
  getSettings(playerId: string): NotificationSettings {
    return { ...this.getPlayerSettings(playerId) };
  }
  
  /**
   * 执行通知操作
   */
  async executeAction(notificationId: string, actionId: string, data?: any): Promise<{
    success: boolean;
    message: string;
    result?: any;
  }> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      return { success: false, message: '通知不存在' };
    }
    
    const action = notification.actions?.find(a => a.id === actionId);
    if (!action) {
      return { success: false, message: '操作不存在' };
    }
    
    try {
      // 触发操作事件
      const result = await this.emit('notification_action', {
        notification,
        action,
        data
      });
      
      return {
        success: true,
        message: '操作执行成功',
        result
      };
    } catch (error) {
      return {
        success: false,
        message: `操作执行失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }
  
  /**
   * 清理过期通知
   */
  cleanupExpiredNotifications(): number {
    const now = new Date();
    let count = 0;
    
    this.notifications.forEach((notification, id) => {
      if (notification.expiresAt && notification.expiresAt < now) {
        this.notifications.delete(id);
        count++;
      }
    });
    
    // 自动归档旧通知
    this.playerSettings.forEach((settings, playerId) => {
      if (settings.autoArchive.enabled) {
        const cutoffDate = new Date(now.getTime() - settings.autoArchive.days * 24 * 60 * 60 * 1000);
        
        this.getPlayerNotifications(playerId)
          .filter(n => n.createdAt < cutoffDate && n.status === NotificationStatus.READ)
          .forEach(n => {
            this.archiveNotification(n.id);
            count++;
          });
      }
    });
    
    return count;
  }
  
  /**
   * 事件监听器
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }
  
  /**
   * 移除事件监听器
   */
  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  /**
   * 触发事件
   */
  private async emit(event: string, data: any): Promise<any> {
    const listeners = this.eventListeners.get(event) || [];
    const results = await Promise.allSettled(
      listeners.map(listener => listener(data))
    );
    
    // 返回第一个成功的结果
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value !== undefined) {
        return result.value;
      }
    }
  }
}

export default NotificationService;