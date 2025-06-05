import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Progress, 
  List, 
  Avatar, 
  Button, 
  Space, 
  Tag, 
  Divider,
  Alert,
  Timeline,
  Badge
} from 'antd';
import {
  DollarOutlined,
  HomeOutlined,
  TeamOutlined,
  TrophyOutlined,
  RiseOutlined,
  CompassOutlined,
  ClockCircleOutlined,
  FireOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useServices } from '../../services';
import type { 
  GameState, 
  Tenant, 
  Property, 
  MarketItem, 
  Achievement,
  ExplorationTask,
  Notification 
} from '../../types';

interface DashboardStats {
  totalMoney: number;
  totalProperties: number;
  totalTenants: number;
  totalAchievements: number;
  satisfactionRate: number;
  monthlyIncome: number;
}

interface RecentActivity {
  id: string;
  type: 'tenant' | 'property' | 'market' | 'achievement' | 'exploration';
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ReactNode;
  color: string;
}

const GameDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalMoney: 0,
    totalProperties: 0,
    totalTenants: 0,
    totalAchievements: 0,
    satisfactionRate: 0,
    monthlyIncome: 0
  });
  
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [activeExplorations, setActiveExplorations] = useState<ExplorationTask[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [marketTrends, setMarketTrends] = useState<MarketItem[]>([]);
  const [urgentNotifications, setUrgentNotifications] = useState<Notification[]>([]);
  
  const { 
    gameEngine, 
    tenantService, 
    marketService, 
    explorationService, 
    achievementService,
    notificationService,
    isInitialized 
  } = useServices();

  // 加载仪表板数据
  useEffect(() => {
    if (!isInitialized) return;

    const loadDashboardData = async () => {
      try {
        // 加载游戏统计数据
        const gameState = await gameEngine().getGameState();
        const tenantStats = await tenantService().getTenantStatistics();
        const marketStats = await marketService().getMarketStatistics();
        const achievementStats = await achievementService().getPlayerStatistics('player1');
        
        setStats({
          totalMoney: gameState.player.money,
          totalProperties: gameState.properties.length,
          totalTenants: gameState.tenants.length,
          totalAchievements: achievementStats.unlockedCount,
          satisfactionRate: tenantStats.averageSatisfaction,
          monthlyIncome: calculateMonthlyIncome(gameState.properties)
        });

        // 加载活跃探险任务
        const explorations = await explorationService().getPlayerTasks('player1');
        setActiveExplorations(explorations.filter(task => task.status === 'in_progress'));

        // 加载最近成就
        const achievements = await achievementService().getPlayerAchievements('player1');
        setRecentAchievements(
          achievements
            .filter(a => a.status === 'unlocked')
            .sort((a, b) => new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime())
            .slice(0, 3)
        );

        // 加载市场趋势
        const trendingItems = await marketService().getTrendingItems();
        setMarketTrends(trendingItems.slice(0, 5));

        // 加载紧急通知
        const notifications = await notificationService().getNotifications({
          priority: 'high',
          status: 'unread',
          limit: 3
        });
        setUrgentNotifications(notifications);

        // 生成最近活动
        generateRecentActivities(gameState, achievements);
        
      } catch (error) {
        console.error('加载仪表板数据失败:', error);
      }
    };

    loadDashboardData();
    
    // 定期刷新数据
    const interval = setInterval(loadDashboardData, 60000); // 每分钟刷新
    
    return () => clearInterval(interval);
  }, [isInitialized]);

  // 计算月收入
  const calculateMonthlyIncome = (properties: Property[]): number => {
    return properties.reduce((total, property) => {
      return total + (property.monthlyRent || 0);
    }, 0);
  };

  // 生成最近活动
  const generateRecentActivities = (gameState: GameState, achievements: Achievement[]) => {
    const activities: RecentActivity[] = [];
    
    // 添加最近的租户活动
    gameState.tenants.slice(0, 2).forEach(tenant => {
      activities.push({
        id: `tenant-${tenant.id}`,
        type: 'tenant',
        title: '新租户入住',
        description: `${tenant.name} 入住了 ${tenant.propertyId}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000), // 随机时间
        icon: <TeamOutlined />,
        color: '#52c41a'
      });
    });

    // 添加最近的成就
    achievements.slice(0, 2).forEach(achievement => {
      activities.push({
        id: `achievement-${achievement.id}`,
        type: 'achievement',
        title: '获得成就',
        description: achievement.name,
        timestamp: new Date(achievement.unlockedAt || Date.now()),
        icon: <TrophyOutlined />,
        color: '#faad14'
      });
    });

    // 按时间排序
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setRecentActivities(activities.slice(0, 6));
  };

  // 快速操作处理
  const handleQuickAction = (action: string) => {
    console.log(`执行快速操作: ${action}`);
    // 这里应该调用相应的服务方法
  };

  return (
    <div className="game-dashboard">
      {/* 紧急通知 */}
      {urgentNotifications.length > 0 && (
        <Alert
          message="重要通知"
          description={
            <div>
              {urgentNotifications.map(notification => (
                <div key={notification.id} style={{ marginBottom: 8 }}>
                  <strong>{notification.title}</strong>: {notification.content}
                </div>
              ))}
            </div>
          }
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总资金"
              value={stats.totalMoney}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<DollarOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="物业数量"
              value={stats.totalProperties}
              valueStyle={{ color: '#1890ff' }}
              prefix={<HomeOutlined />}
              suffix="处"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="租户数量"
              value={stats.totalTenants}
              valueStyle={{ color: '#722ed1' }}
              prefix={<TeamOutlined />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="获得成就"
              value={stats.totalAchievements}
              valueStyle={{ color: '#faad14' }}
              prefix={<TrophyOutlined />}
              suffix="个"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 左侧列 */}
        <Col xs={24} lg={16}>
          {/* 收入和满意度 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12}>
              <Card title="月收入" extra={<RiseOutlined style={{ color: '#52c41a' }} />}>
                <Statistic
                  value={stats.monthlyIncome}
                  precision={0}
                  valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                  suffix="元/月"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card title="租户满意度">
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={Math.round(stats.satisfactionRate)}
                    format={percent => `${percent}%`}
                    strokeColor={{
                      '0%': '#ff4d4f',
                      '50%': '#faad14',
                      '100%': '#52c41a',
                    }}
                  />
                </div>
              </Card>
            </Col>
          </Row>

          {/* 最近活动 */}
          <Card title="最近活动" style={{ marginBottom: 16 }}>
            <Timeline
              items={recentActivities.map(activity => ({
                key: activity.id,
                dot: (
                  <Avatar 
                    size="small" 
                    style={{ backgroundColor: activity.color }}
                    icon={activity.icon}
                  />
                ),
                children: (
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{activity.title}</div>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      {activity.description}
                    </div>
                    <div style={{ color: '#999', fontSize: '11px' }}>
                      {activity.timestamp.toLocaleString()}
                    </div>
                  </div>
                )
              }))}
            />
          </Card>

          {/* 市场趋势 */}
          <Card title="市场热门商品" extra={<FireOutlined style={{ color: '#ff4d4f' }} />}>
            <List
              dataSource={marketTrends}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item.image} />}
                    title={item.name}
                    description={`价格: ${item.price}元 | 需求: ${item.demand}`}
                  />
                  <Tag color={item.price > 1000 ? 'red' : item.price > 500 ? 'orange' : 'green'}>
                    {item.price > 1000 ? '高价' : item.price > 500 ? '中价' : '低价'}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 右侧列 */}
        <Col xs={24} lg={8}>
          {/* 快速操作 */}
          <Card title="快速操作" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                block 
                icon={<HomeOutlined />}
                onClick={() => handleQuickAction('add-property')}
              >
                添加物业
              </Button>
              <Button 
                block 
                icon={<TeamOutlined />}
                onClick={() => handleQuickAction('find-tenant')}
              >
                寻找租户
              </Button>
              <Button 
                block 
                icon={<ShopOutlined />}
                onClick={() => handleQuickAction('visit-market')}
              >
                访问市场
              </Button>
              <Button 
                block 
                icon={<CompassOutlined />}
                onClick={() => handleQuickAction('start-exploration')}
              >
                开始探险
              </Button>
            </Space>
          </Card>

          {/* 进行中的探险 */}
          <Card 
            title="进行中的探险" 
            extra={<Badge count={activeExplorations.length} />}
            style={{ marginBottom: 16 }}
          >
            {activeExplorations.length > 0 ? (
              <List
                dataSource={activeExplorations}
                renderItem={(task) => {
                  const progress = Math.round(
                    ((Date.now() - new Date(task.startTime!).getTime()) / 
                     (task.duration * 60 * 1000)) * 100
                  );
                  return (
                    <List.Item>
                      <div style={{ width: '100%' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                          {task.name}
                        </div>
                        <Progress 
                          percent={Math.min(progress, 100)} 
                          size="small"
                          status={progress >= 100 ? 'success' : 'active'}
                        />
                        <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                          <ClockCircleOutlined /> 剩余 {Math.max(0, task.duration - Math.floor((Date.now() - new Date(task.startTime!).getTime()) / 60000))} 分钟
                        </div>
                      </div>
                    </List.Item>
                  );
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
                暂无进行中的探险
              </div>
            )}
          </Card>

          {/* 最近成就 */}
          <Card title="最近获得的成就" extra={<StarOutlined style={{ color: '#faad14' }} />}>
            {recentAchievements.length > 0 ? (
              <List
                dataSource={recentAchievements}
                renderItem={(achievement) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          style={{ backgroundColor: '#faad14' }}
                          icon={<TrophyOutlined />}
                        />
                      }
                      title={achievement.name}
                      description={
                        <div>
                          <div style={{ fontSize: '12px' }}>{achievement.description}</div>
                          <div style={{ fontSize: '11px', color: '#999' }}>
                            {new Date(achievement.unlockedAt!).toLocaleDateString()}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
                暂无最近成就
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default GameDashboard;