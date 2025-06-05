import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Modal,
  Progress,
  Statistic,
  List,
  Avatar,
  Tooltip,
  Badge,
  Alert,
  Empty,
  Spin,
  message,
  Descriptions,
  Tabs,
  Input,
  Select,
  Divider,
  Timeline
} from 'antd';
import {
  TrophyOutlined,
  StarOutlined,
  GiftOutlined,
  FireOutlined,
  CrownOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  TeamOutlined,
  CalendarOutlined,
  EyeInvisibleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LockOutlined,
  UnlockOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useServices } from '../../services';
import type { Achievement, AchievementType, AchievementStatus, PlayerAchievement } from '../../types';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface AchievementStats {
  totalAchievements: number;
  unlockedAchievements: number;
  completionRate: number;
  totalPoints: number;
  recentUnlocked: number;
}

const AchievementPanel: React.FC = () => {
  const [achievements, setAchievements] = useState<PlayerAchievement[]>([]);
  const [filteredAchievements, setFilteredAchievements] = useState<PlayerAchievement[]>([]);
  const [stats, setStats] = useState<AchievementStats>({
    totalAchievements: 0,
    unlockedAchievements: 0,
    completionRate: 0,
    totalPoints: 0,
    recentUnlocked: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<PlayerAchievement | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<AchievementType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<AchievementStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState('all');
  
  const { achievementService, gameEngine, isInitialized } = useServices();

  // 成就类型配置
  const typeConfig = {
    progress: { label: '进度', color: 'blue', icon: <ThunderboltOutlined /> },
    milestone: { label: '里程碑', color: 'gold', icon: <CrownOutlined /> },
    collection: { label: '收集', color: 'green', icon: <GiftOutlined /> },
    challenge: { label: '挑战', color: 'red', icon: <FireOutlined /> },
    hidden: { label: '隐藏', color: 'purple', icon: <EyeInvisibleOutlined /> },
    seasonal: { label: '季节', color: 'orange', icon: <CalendarOutlined /> },
    social: { label: '社交', color: 'cyan', icon: <TeamOutlined /> }
  };

  // 状态配置
  const statusConfig = {
    locked: { label: '未解锁', color: 'gray', icon: <LockOutlined /> },
    in_progress: { label: '进行中', color: 'blue', icon: <ClockCircleOutlined /> },
    completed: { label: '已完成', color: 'green', icon: <CheckCircleOutlined /> },
    claimed: { label: '已领取', color: 'gold', icon: <TrophyOutlined /> }
  };

  // 加载数据
  useEffect(() => {
    if (!isInitialized) return;
    loadData();
  }, [isInitialized]);

  // 筛选和搜索
  useEffect(() => {
    let filtered = achievements;
    
    // 搜索筛选
    if (searchText) {
      filtered = filtered.filter(achievement => 
        achievement.name.toLowerCase().includes(searchText.toLowerCase()) ||
        achievement.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // 类型筛选
    if (selectedType !== 'all') {
      filtered = filtered.filter(achievement => achievement.type === selectedType);
    }
    
    // 状态筛选
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(achievement => achievement.status === selectedStatus);
    }
    
    // 标签页筛选
    switch (activeTab) {
      case 'unlocked':
        filtered = filtered.filter(achievement => 
          achievement.status === 'completed' || achievement.status === 'claimed'
        );
        break;
      case 'in_progress':
        filtered = filtered.filter(achievement => achievement.status === 'in_progress');
        break;
      case 'locked':
        filtered = filtered.filter(achievement => achievement.status === 'locked');
        break;
      case 'claimable':
        filtered = filtered.filter(achievement => achievement.status === 'completed');
        break;
    }
    
    setFilteredAchievements(filtered);
  }, [achievements, searchText, selectedType, selectedStatus, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const playerAchievements = await achievementService().getPlayerAchievements();
      const achievementStats = await achievementService().getStatistics();
      
      setAchievements(playerAchievements);
      
      // 计算统计数据
      const totalAchievements = playerAchievements.length;
      const unlockedAchievements = playerAchievements.filter(
        a => a.status === 'completed' || a.status === 'claimed'
      ).length;
      const completionRate = totalAchievements > 0 ? (unlockedAchievements / totalAchievements) * 100 : 0;
      const totalPoints = playerAchievements
        .filter(a => a.status === 'claimed')
        .reduce((sum, a) => sum + a.points, 0);
      const recentUnlocked = playerAchievements.filter(a => {
        if (!a.unlockedAt) return false;
        const unlockDate = new Date(a.unlockedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return unlockDate > weekAgo;
      }).length;
      
      setStats({
        totalAchievements,
        unlockedAchievements,
        completionRate,
        totalPoints,
        recentUnlocked
      });
      
    } catch (error) {
      console.error('加载成就数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取类型标签
  const getTypeTag = (type: AchievementType) => {
    const config = typeConfig[type];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.label}
      </Tag>
    );
  };

  // 获取状态标签
  const getStatusTag = (status: AchievementStatus) => {
    const config = statusConfig[status];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.label}
      </Tag>
    );
  };

  // 获取进度百分比
  const getProgressPercent = (achievement: PlayerAchievement) => {
    if (achievement.status === 'locked') return 0;
    if (achievement.status === 'completed' || achievement.status === 'claimed') return 100;
    
    const current = achievement.progress || 0;
    const target = achievement.target || 1;
    return Math.min(100, (current / target) * 100);
  };

  // 领取奖励
  const handleClaimReward = async (achievementId: string) => {
    try {
      const result = await achievementService().claimReward(achievementId);
      message.success(`成就奖励已领取！获得 ${result.points} 点数`);
      setClaimModalVisible(false);
      loadData();
    } catch (error) {
      console.error('领取奖励失败:', error);
      message.error('领取奖励失败');
    }
  };

  // 查看成就详情
  const handleViewAchievement = (achievement: PlayerAchievement) => {
    setSelectedAchievement(achievement);
    setDetailModalVisible(true);
  };

  // 准备领取奖励
  const handlePrepareClaim = (achievement: PlayerAchievement) => {
    setSelectedAchievement(achievement);
    setClaimModalVisible(true);
  };

  // 刷新成就进度
  const handleRefreshProgress = async () => {
    setLoading(true);
    try {
      await achievementService().updateProgress();
      message.success('成就进度已更新');
      loadData();
    } catch (error) {
      console.error('更新进度失败:', error);
      message.error('更新进度失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取成就图标
  const getAchievementIcon = (achievement: PlayerAchievement) => {
    if (achievement.status === 'locked') {
      return <LockOutlined style={{ fontSize: '24px', color: '#d9d9d9' }} />;
    }
    
    const typeConfig = {
      progress: <ThunderboltOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      milestone: <CrownOutlined style={{ fontSize: '24px', color: '#faad14' }} />,
      collection: <GiftOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      challenge: <FireOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />,
      hidden: <EyeInvisibleOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
      seasonal: <CalendarOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
      social: <TeamOutlined style={{ fontSize: '24px', color: '#13c2c2' }} />
    };
    
    return typeConfig[achievement.type] || <TrophyOutlined style={{ fontSize: '24px' }} />;
  };

  return (
    <div className="achievement-panel">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总成就数"
              value={stats.totalAchievements}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已解锁"
              value={stats.unlockedAchievements}
              prefix={<UnlockOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="完成率"
              value={stats.completionRate}
              precision={1}
              suffix="%"
              prefix={<StarOutlined />}
              valueStyle={{ color: stats.completionRate >= 50 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总点数"
              value={stats.totalPoints}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Search
              placeholder="搜索成就..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={5}>
            <Select
              value={selectedType}
              onChange={setSelectedType}
              style={{ width: '100%' }}
              placeholder="选择类型"
            >
              <Option value="all">全部类型</Option>
              {Object.entries(typeConfig).map(([key, config]) => (
                <Option key={key} value={key}>
                  <Space>
                    {config.icon}
                    {config.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={5}>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '100%' }}
              placeholder="选择状态"
            >
              <Option value="all">全部状态</Option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <Option key={key} value={key}>
                  <Space>
                    {config.icon}
                    {config.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefreshProgress}
                loading={loading}
              >
                更新进度
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 成就标签页 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <Badge count={achievements.length} size="small">
                <span>全部成就</span>
              </Badge>
            } 
            key="all"
          />
          <TabPane 
            tab={
              <Badge count={stats.unlockedAchievements} size="small">
                <span>已解锁</span>
              </Badge>
            } 
            key="unlocked"
          />
          <TabPane 
            tab={
              <Badge 
                count={achievements.filter(a => a.status === 'in_progress').length} 
                size="small"
              >
                <span>进行中</span>
              </Badge>
            } 
            key="in_progress"
          />
          <TabPane 
            tab={
              <Badge 
                count={achievements.filter(a => a.status === 'completed').length} 
                size="small"
              >
                <span>可领取</span>
              </Badge>
            } 
            key="claimable"
          />
          <TabPane 
            tab={
              <Badge 
                count={achievements.filter(a => a.status === 'locked').length} 
                size="small"
              >
                <span>未解锁</span>
              </Badge>
            } 
            key="locked"
          />
        </Tabs>

        <Spin spinning={loading}>
          {filteredAchievements.length === 0 ? (
            <Empty description="暂无成就" />
          ) : (
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              {filteredAchievements.map(achievement => (
                <Col xs={24} sm={12} lg={8} xl={6} key={achievement.id}>
                  <Card
                    hoverable
                    className={`achievement-card ${achievement.status}`}
                    style={{
                      opacity: achievement.status === 'locked' ? 0.6 : 1,
                      border: achievement.status === 'completed' ? '2px solid #52c41a' : undefined
                    }}
                    actions={[
                      <Tooltip title="查看详情">
                        <Button
                          type="text"
                          icon={<SearchOutlined />}
                          onClick={() => handleViewAchievement(achievement)}
                        />
                      </Tooltip>,
                      achievement.status === 'completed' ? (
                        <Tooltip title="领取奖励">
                          <Button
                            type="text"
                            icon={<GiftOutlined />}
                            style={{ color: '#52c41a' }}
                            onClick={() => handlePrepareClaim(achievement)}
                          />
                        </Tooltip>
                      ) : (
                        <div style={{ width: 32 }} />
                      )
                    ]}
                  >
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                      <Avatar 
                        size={64} 
                        icon={getAchievementIcon(achievement)}
                        style={{
                          backgroundColor: achievement.status === 'locked' ? '#f5f5f5' : undefined
                        }}
                      />
                    </div>
                    
                    <Card.Meta
                      title={
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ marginBottom: 8 }}>
                            {achievement.name}
                          </div>
                          <Space>
                            {getTypeTag(achievement.type)}
                            {getStatusTag(achievement.status)}
                          </Space>
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ marginBottom: 12, textAlign: 'center', fontSize: '12px' }}>
                            {achievement.description}
                          </div>
                          
                          {achievement.status !== 'locked' && (
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: 4 }}>
                                <span>进度</span>
                                <span>
                                  {achievement.progress || 0} / {achievement.target || 1}
                                </span>
                              </div>
                              <Progress 
                                percent={getProgressPercent(achievement)} 
                                size="small"
                                status={achievement.status === 'completed' ? 'success' : 'active'}
                              />
                            </div>
                          )}
                          
                          <div style={{ textAlign: 'center' }}>
                            <Space>
                              <span style={{ fontSize: '12px' }}>🏆 {achievement.points} 点数</span>
                              {achievement.unlockedAt && (
                                <span style={{ fontSize: '12px', color: '#666' }}>
                                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                                </span>
                              )}
                            </Space>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Spin>
      </Card>

      {/* 成就详情模态框 */}
      <Modal
        title="成就详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          selectedAchievement?.status === 'completed' && (
            <Button 
              key="claim" 
              type="primary" 
              icon={<GiftOutlined />}
              onClick={() => {
                setDetailModalVisible(false);
                handlePrepareClaim(selectedAchievement);
              }}
            >
              领取奖励
            </Button>
          )
        ]}
        width={600}
      >
        {selectedAchievement && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar 
                size={80} 
                icon={getAchievementIcon(selectedAchievement)}
                style={{ marginBottom: 16 }}
              />
              <h2>{selectedAchievement.name}</h2>
              <Space>
                {getTypeTag(selectedAchievement.type)}
                {getStatusTag(selectedAchievement.status)}
              </Space>
            </div>
            
            <Descriptions column={1} bordered>
              <Descriptions.Item label="描述">
                {selectedAchievement.description}
              </Descriptions.Item>
              
              <Descriptions.Item label="奖励点数">
                <Space>
                  <TrophyOutlined style={{ color: '#faad14' }} />
                  {selectedAchievement.points} 点数
                </Space>
              </Descriptions.Item>
              
              {selectedAchievement.status !== 'locked' && (
                <Descriptions.Item label="完成进度">
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      {selectedAchievement.progress || 0} / {selectedAchievement.target || 1}
                    </div>
                    <Progress 
                      percent={getProgressPercent(selectedAchievement)} 
                      status={selectedAchievement.status === 'completed' ? 'success' : 'active'}
                    />
                  </div>
                </Descriptions.Item>
              )}
              
              {selectedAchievement.requirements && selectedAchievement.requirements.length > 0 && (
                <Descriptions.Item label="完成条件">
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {selectedAchievement.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </Descriptions.Item>
              )}
              
              {selectedAchievement.unlockedAt && (
                <Descriptions.Item label="解锁时间">
                  {new Date(selectedAchievement.unlockedAt).toLocaleString()}
                </Descriptions.Item>
              )}
              
              {selectedAchievement.claimedAt && (
                <Descriptions.Item label="领取时间">
                  {new Date(selectedAchievement.claimedAt).toLocaleString()}
                </Descriptions.Item>
              )}
            </Descriptions>
            
            {selectedAchievement.type === 'hidden' && selectedAchievement.status === 'locked' && (
              <Alert
                message="隐藏成就"
                description="这是一个隐藏成就，完成条件需要你自己探索发现！"
                type="info"
                icon={<EyeInvisibleOutlined />}
                style={{ marginTop: 16 }}
              />
            )}
          </div>
        )}
      </Modal>

      {/* 领取奖励确认模态框 */}
      <Modal
        title="领取成就奖励"
        open={claimModalVisible}
        onCancel={() => setClaimModalVisible(false)}
        onOk={() => selectedAchievement && handleClaimReward(selectedAchievement.id)}
        okText="确认领取"
        cancelText="取消"
      >
        {selectedAchievement && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar 
                size={64} 
                icon={getAchievementIcon(selectedAchievement)}
                style={{ marginBottom: 16 }}
              />
              <h3>{selectedAchievement.name}</h3>
            </div>
            
            <Alert
              message="恭喜完成成就！"
              description={
                <div>
                  <p><strong>成就:</strong> {selectedAchievement.name}</p>
                  <p><strong>描述:</strong> {selectedAchievement.description}</p>
                  <p><strong>奖励:</strong> {selectedAchievement.points} 点数</p>
                </div>
              }
              type="success"
              icon={<TrophyOutlined />}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AchievementPanel;