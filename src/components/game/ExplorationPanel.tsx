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
  Timeline,
  Divider
} from 'antd';
import {
  CompassOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  FireOutlined,
  StarOutlined,
  GiftOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  ShieldOutlined
} from '@ant-design/icons';
import { useServices } from '../../services';
import type { ExplorationTask, ExplorationDifficulty, ExplorationStatus, ExplorationReward } from '../../types';

interface ExplorationStats {
  activeTasks: number;
  completedTasks: number;
  totalRewards: number;
  successRate: number;
}

const ExplorationPanel: React.FC = () => {
  const [tasks, setTasks] = useState<ExplorationTask[]>([]);
  const [activeTasks, setActiveTasks] = useState<ExplorationTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<ExplorationTask[]>([]);
  const [stats, setStats] = useState<ExplorationStats>({
    activeTasks: 0,
    completedTasks: 0,
    totalRewards: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ExplorationTask | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [startModalVisible, setStartModalVisible] = useState(false);
  
  const { explorationService, gameEngine, isInitialized } = useServices();

  // 难度配置
  const difficultyConfig = {
    easy: { label: '简单', color: 'green', icon: '🌱' },
    medium: { label: '中等', color: 'orange', icon: '⚡' },
    hard: { label: '困难', color: 'red', icon: '🔥' },
    extreme: { label: '极限', color: 'purple', icon: '💀' }
  };

  // 状态配置
  const statusConfig = {
    available: { label: '可用', color: 'blue', icon: <CompassOutlined /> },
    in_progress: { label: '进行中', color: 'orange', icon: <ClockCircleOutlined /> },
    completed: { label: '已完成', color: 'green', icon: <CheckCircleOutlined /> },
    failed: { label: '失败', color: 'red', icon: <ExclamationCircleOutlined /> },
    cancelled: { label: '已取消', color: 'gray', icon: <StopOutlined /> }
  };

  // 加载数据
  useEffect(() => {
    if (!isInitialized) return;
    loadData();
    
    // 定时更新进行中的任务
    const interval = setInterval(() => {
      updateActiveTasks();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isInitialized]);

  const loadData = async () => {
    setLoading(true);
    try {
      const allTasks = await explorationService().getAvailableTasks();
      const playerStats = await explorationService().getPlayerStatistics();
      
      setTasks(allTasks);
      
      // 分类任务
      const active = allTasks.filter(task => task.status === 'in_progress');
      const completed = allTasks.filter(task => task.status === 'completed');
      
      setActiveTasks(active);
      setCompletedTasks(completed);
      
      // 计算统计数据
      const totalCompleted = completed.length;
      const totalAttempted = allTasks.filter(task => task.status !== 'available').length;
      const successRate = totalAttempted > 0 ? (totalCompleted / totalAttempted) * 100 : 0;
      const totalRewards = completed.reduce((sum, task) => {
        return sum + (task.rewards?.money || 0);
      }, 0);
      
      setStats({
        activeTasks: active.length,
        completedTasks: totalCompleted,
        totalRewards,
        successRate
      });
      
    } catch (error) {
      console.error('加载探险数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const updateActiveTasks = async () => {
    try {
      const allTasks = await explorationService().getAvailableTasks();
      const active = allTasks.filter(task => task.status === 'in_progress');
      setActiveTasks(active);
      
      // 检查是否有任务完成
      const justCompleted = active.filter(task => 
        task.endTime && new Date(task.endTime) <= new Date()
      );
      
      if (justCompleted.length > 0) {
        message.success(`${justCompleted.length}个探险任务已完成！`);
        loadData(); // 重新加载所有数据
      }
    } catch (error) {
      console.error('更新活跃任务失败:', error);
    }
  };

  // 获取难度标签
  const getDifficultyTag = (difficulty: ExplorationDifficulty) => {
    const config = difficultyConfig[difficulty];
    return (
      <Tag color={config.color}>
        <Space>
          <span>{config.icon}</span>
          {config.label}
        </Space>
      </Tag>
    );
  };

  // 获取状态标签
  const getStatusTag = (status: ExplorationStatus) => {
    const config = statusConfig[status];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.label}
      </Tag>
    );
  };

  // 计算剩余时间
  const getRemainingTime = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return '已完成';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}小时${minutes}分钟`;
  };

  // 计算进度百分比
  const getProgress = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  // 开始探险
  const handleStartTask = async (task: ExplorationTask) => {
    try {
      await explorationService().startTask(task.id);
      message.success(`开始探险: ${task.name}`);
      setStartModalVisible(false);
      loadData();
    } catch (error) {
      console.error('开始探险失败:', error);
      message.error('开始探险失败');
    }
  };

  // 取消探险
  const handleCancelTask = async (taskId: string) => {
    try {
      await explorationService().cancelTask(taskId);
      message.success('探险已取消');
      loadData();
    } catch (error) {
      console.error('取消探险失败:', error);
      message.error('取消探险失败');
    }
  };

  // 完成探险
  const handleCompleteTask = async (taskId: string) => {
    try {
      const result = await explorationService().completeTask(taskId);
      if (result.success) {
        message.success(`探险成功完成！获得奖励: ${result.rewards?.money || 0}金币`);
      } else {
        message.warning('探险失败，但获得了一些经验');
      }
      loadData();
    } catch (error) {
      console.error('完成探险失败:', error);
      message.error('完成探险失败');
    }
  };

  // 刷新任务列表
  const handleRefreshTasks = async () => {
    try {
      await explorationService().refreshTasks();
      message.success('任务列表已刷新');
      loadData();
    } catch (error) {
      console.error('刷新任务失败:', error);
      message.error('刷新任务失败');
    }
  };

  // 查看任务详情
  const handleViewTask = (task: ExplorationTask) => {
    setSelectedTask(task);
    setDetailModalVisible(true);
  };

  // 准备开始任务
  const handlePrepareStart = (task: ExplorationTask) => {
    setSelectedTask(task);
    setStartModalVisible(true);
  };

  return (
    <div className="exploration-panel">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="进行中的探险"
              value={stats.activeTasks}
              prefix={<CompassOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="完成的探险"
              value={stats.completedTasks}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总奖励"
              value={stats.totalRewards}
              prefix={<GiftOutlined />}
              suffix="金币"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="成功率"
              value={stats.successRate}
              precision={1}
              suffix="%"
              prefix={<StarOutlined />}
              valueStyle={{ color: stats.successRate >= 70 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 操作按钮 */}
      <Card style={{ marginBottom: 24 }}>
        <Space>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={handleRefreshTasks}
            loading={loading}
          >
            刷新任务
          </Button>
          <Button icon={<CompassOutlined />}>
            探险指南
          </Button>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {/* 进行中的探险 */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <ClockCircleOutlined />
                进行中的探险
                <Badge count={activeTasks.length} />
              </Space>
            }
          >
            <Spin spinning={loading}>
              {activeTasks.length === 0 ? (
                <Empty description="暂无进行中的探险" />
              ) : (
                <List
                  dataSource={activeTasks}
                  renderItem={(task) => (
                    <List.Item
                      actions={[
                        <Tooltip title="查看详情">
                          <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewTask(task)}
                          />
                        </Tooltip>,
                        task.endTime && new Date(task.endTime) <= new Date() ? (
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => handleCompleteTask(task.id)}
                          >
                            完成
                          </Button>
                        ) : (
                          <Button
                            danger
                            size="small"
                            icon={<StopOutlined />}
                            onClick={() => handleCancelTask(task.id)}
                          >
                            取消
                          </Button>
                        )
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<CompassOutlined />} />}
                        title={
                          <Space>
                            {task.name}
                            {getDifficultyTag(task.difficulty)}
                          </Space>
                        }
                        description={
                          <div>
                            <div style={{ marginBottom: 8 }}>
                              {task.endTime && (
                                <div>
                                  <Progress 
                                    percent={getProgress(task.startTime!, task.endTime)} 
                                    size="small"
                                    status={new Date(task.endTime) <= new Date() ? 'success' : 'active'}
                                  />
                                  <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                                    剩余时间: {getRemainingTime(task.endTime)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Spin>
          </Card>
        </Col>

        {/* 可用的探险 */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <CompassOutlined />
                可用的探险
              </Space>
            }
          >
            <Spin spinning={loading}>
              {tasks.filter(task => task.status === 'available').length === 0 ? (
                <Empty description="暂无可用探险" />
              ) : (
                <List
                  dataSource={tasks.filter(task => task.status === 'available')}
                  renderItem={(task) => (
                    <List.Item
                      actions={[
                        <Tooltip title="查看详情">
                          <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewTask(task)}
                          />
                        </Tooltip>,
                        <Button
                          type="primary"
                          size="small"
                          icon={<PlayCircleOutlined />}
                          onClick={() => handlePrepareStart(task)}
                        >
                          开始
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<CompassOutlined />} />}
                        title={
                          <Space>
                            {task.name}
                            {getDifficultyTag(task.difficulty)}
                          </Space>
                        }
                        description={
                          <div>
                            <div style={{ marginBottom: 4 }}>
                              <Space>
                                <span>🕐 {task.duration}小时</span>
                                <span>💰 {task.rewards?.money || 0}金币</span>
                                <span>⭐ {(task.successRate * 100).toFixed(0)}%成功率</span>
                              </Space>
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {task.description}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Spin>
          </Card>
        </Col>
      </Row>

      {/* 最近完成的探险 */}
      <Card 
        title={
          <Space>
            <TrophyOutlined />
            最近完成的探险
          </Space>
        }
        style={{ marginTop: 16 }}
      >
        {completedTasks.length === 0 ? (
          <Empty description="暂无完成的探险" />
        ) : (
          <List
            dataSource={completedTasks.slice(0, 5)}
            renderItem={(task) => (
              <List.Item
                actions={[
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewTask(task)}
                  >
                    查看详情
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<CheckCircleOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                  title={
                    <Space>
                      {task.name}
                      {getDifficultyTag(task.difficulty)}
                      {getStatusTag(task.status)}
                    </Space>
                  }
                  description={
                    <Space>
                      <span>💰 获得 {task.rewards?.money || 0} 金币</span>
                      {task.endTime && (
                        <span>🕐 完成于 {new Date(task.endTime).toLocaleString()}</span>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* 任务详情模态框 */}
      <Modal
        title="探险详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          selectedTask?.status === 'available' && (
            <Button 
              key="start" 
              type="primary" 
              icon={<PlayCircleOutlined />}
              onClick={() => {
                setDetailModalVisible(false);
                handlePrepareStart(selectedTask);
              }}
            >
              开始探险
            </Button>
          )
        ]}
        width={600}
      >
        {selectedTask && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="任务名称" span={2}>
                <Space>
                  {selectedTask.name}
                  {getDifficultyTag(selectedTask.difficulty)}
                  {getStatusTag(selectedTask.status)}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="预计时长">
                <Space>
                  <ClockCircleOutlined />
                  {selectedTask.duration} 小时
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="成功率">
                <Space>
                  <StarOutlined />
                  {(selectedTask.successRate * 100).toFixed(0)}%
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="金币奖励">
                <Space>
                  <GiftOutlined />
                  {selectedTask.rewards?.money || 0} 金币
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="经验奖励">
                <Space>
                  <TrophyOutlined />
                  {selectedTask.rewards?.experience || 0} 经验
                </Space>
              </Descriptions.Item>
              
              {selectedTask.requirements && selectedTask.requirements.length > 0 && (
                <Descriptions.Item label="要求" span={2}>
                  <Space wrap>
                    {selectedTask.requirements.map((req, index) => (
                      <Tag key={index}>{req}</Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              )}
              
              <Descriptions.Item label="描述" span={2}>
                {selectedTask.description}
              </Descriptions.Item>
            </Descriptions>
            
            {selectedTask.status === 'in_progress' && selectedTask.endTime && (
              <div style={{ marginTop: 16 }}>
                <Alert
                  message="探险进行中"
                  description={
                    <div>
                      <Progress 
                        percent={getProgress(selectedTask.startTime!, selectedTask.endTime)} 
                        status={new Date(selectedTask.endTime) <= new Date() ? 'success' : 'active'}
                      />
                      <div style={{ marginTop: 8 }}>
                        剩余时间: {getRemainingTime(selectedTask.endTime)}
                      </div>
                    </div>
                  }
                  type="info"
                />
              </div>
            )}
            
            {selectedTask.risks && selectedTask.risks.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>⚠️ 风险提示</h4>
                <List
                  size="small"
                  dataSource={selectedTask.risks}
                  renderItem={(risk) => (
                    <List.Item>
                      <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                      {risk}
                    </List.Item>
                  )}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 开始探险确认模态框 */}
      <Modal
        title="开始探险"
        open={startModalVisible}
        onCancel={() => setStartModalVisible(false)}
        onOk={() => selectedTask && handleStartTask(selectedTask)}
        okText="确认开始"
        cancelText="取消"
      >
        {selectedTask && (
          <div>
            <Alert
              message="确认开始探险？"
              description={
                <div>
                  <p><strong>任务:</strong> {selectedTask.name}</p>
                  <p><strong>难度:</strong> {difficultyConfig[selectedTask.difficulty].label}</p>
                  <p><strong>预计时长:</strong> {selectedTask.duration} 小时</p>
                  <p><strong>成功率:</strong> {(selectedTask.successRate * 100).toFixed(0)}%</p>
                  <p><strong>预期奖励:</strong> {selectedTask.rewards?.money || 0} 金币</p>
                </div>
              }
              type="info"
            />
            
            {selectedTask.requirements && selectedTask.requirements.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>📋 任务要求</h4>
                <ul>
                  {selectedTask.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExplorationPanel;