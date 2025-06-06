import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Popconfirm,
  Tooltip,
  Progress,
  Row,
  Col,
  Statistic,
  Avatar,
  List,
  Tabs,
  Badge,
  Divider,
  Typography
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  SmileOutlined,
  FrownOutlined,
  HomeOutlined,
  DollarOutlined,
  MessageOutlined,
  SettingOutlined,
  DeleteOutlined,
  PlusOutlined,
  HeartOutlined,
  FilterOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useServices } from '@/services';
import { 
  TenantType as TenantTypeEnum, 
  TenantStatus as TenantStatusEnum,
  type Tenant, 
  type SatisfactionFactors 
} from '@/types/tenant-system';
import type { Property } from '@/types/property';

const { Option } = Select;
const { TabPane } = Tabs;
const { Paragraph } = Typography;

interface TenantFormData {
  name: string;
  type: TenantTypeEnum;
  age: number;
  occupation: string;
  income: number;
  propertyId?: string;
  preferences?: string[];
  description?: string;
}

interface TenantStats {
  totalTenants: number;
  averageSatisfaction: number;
  totalIncome: number;
  occupancyRate: number;
  problemTenants: number;
}

const TenantManager: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<TenantStats>({
    totalTenants: 0,
    averageSatisfaction: 0,
    totalIncome: 0,
    occupancyRate: 0,
    problemTenants: 0
  });
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [interactionModalVisible, setInteractionModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  const { initialized: isInitialized, services } = useServices();
  const gameEngine = services?.gameEngine;
  const tenantService = services?.tenantService;

  // 租户类型选项
  const tenantTypes = [
    { value: TenantTypeEnum.INDIVIDUAL, label: '个人' },
    { value: TenantTypeEnum.FAMILY, label: '家庭' },
    { value: TenantTypeEnum.STUDENT, label: '学生' },
    { value: TenantTypeEnum.PROFESSIONAL, label: '专业人士' },
    { value: TenantTypeEnum.ELDERLY, label: '老年人' }
  ];

  // 职业选项
  const occupationOptions = [
    '学生', '教师', '医生', '工程师', '设计师', '销售', 
    '管理人员', '自由职业者', '退休人员', '其他'
  ];

  // 偏好选项
  const preferenceOptions = [
    '安静环境', '靠近公共交通', '宠物友好', '有停车位', 
    '靠近学校', '靠近购物中心', '有健身设施', '有游泳池'
  ];

  // 加载数据
  useEffect(() => {
    if (!isInitialized) return;
    loadData();
  }, [isInitialized]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (!gameEngine) {
        message.error("游戏引擎未初始化");
        setLoading(false);
        return;
      }
      const gameState = await gameEngine.getGameState();
      const allTenants = gameState.tenants as Tenant[];
      const allProperties = gameState.properties as Property[];
      
      setTenants(allTenants);
      setProperties(allProperties);
      
      // 计算统计数据
      const totalTenants = allTenants.length;
      const totalSatisfaction = allTenants.reduce((sum: number, t: Tenant) => sum + (t.satisfactionLevel || 0), 0);
      const averageSatisfaction = totalTenants > 0 ? totalSatisfaction / totalTenants : 0;
      const totalIncome = allTenants.reduce((sum: number, t: Tenant) => {
        const property = allProperties.find((p: Property) => p.id === t.propertyId);
        return sum + (property?.monthlyRent || 0);
      }, 0);
      const occupiedProperties = allProperties.filter((p: Property) => p.currentTenants && p.currentTenants.length > 0).length;
      const occupancyRate = allProperties.length > 0 ? (occupiedProperties / allProperties.length) * 100 : 0;
      const problemTenants = allTenants.filter((t: Tenant) => (t.satisfactionLevel || 0) < 50).length;
      
      setStats({
        totalTenants,
        averageSatisfaction,
        totalIncome,
        occupancyRate,
        problemTenants
      });
      
    } catch (error) {
      console.error('加载租户数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取租户状态
  const getTenantStatus = (tenant: Tenant): TenantStatusEnum => {
    return tenant.status; // Directly use status from tenant object
  };

  // 获取状态标签
  const getStatusTag = (status: TenantStatusEnum) => {
    const statusConfig: Record<TenantStatusEnum, { color: string; text: string; icon: React.ReactNode }> = {
      [TenantStatusEnum.ACTIVE]: { color: 'green', text: '活跃', icon: <SmileOutlined /> },
      [TenantStatusEnum.INACTIVE]: { color: 'gray', text: '不活跃', icon: null },
      [TenantStatusEnum.MOVING_OUT]: { color: 'orange', text: '准备搬出', icon: <HomeOutlined /> },
      [TenantStatusEnum.OVERDUE]: { color: 'red', text: '逾期', icon: <FrownOutlined /> },
      [TenantStatusEnum.SUSPENDED]: { color: 'purple', text: '暂停', icon: <UserOutlined /> },
    };
    const config = statusConfig[status];
    if (!config) {
        return <Tag>未知状态</Tag>;
    }
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // 获取物业信息
  const getPropertyInfo = (propertyId?: string) => {
    if (!propertyId) return null;
    return properties.find((p: Property) => p.id === propertyId);
  };

  // 表格列定义
  const columns: ColumnsType<Tenant> = [
    {
      title: '租户',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.occupation}</div>
          </div>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: TenantTypeEnum) => {
        const typeLabel = tenantTypes.find(t => t.value === type)?.label || type;
        return <Tag>{typeLabel}</Tag>;
      }
    },
    {
      title: '满意度',
      dataIndex: 'satisfactionLevel',
      key: 'satisfactionLevel',
      render: (satisfaction = 0) => {
        let color = '#52c41a';
        if (satisfaction < 30) color = '#f5222d';
        else if (satisfaction < 70) color = '#faad14';
        
        return (
          <Progress
            percent={satisfaction}
            size="small"
            strokeColor={color}
            format={percent => `${percent}%`}
          />
        );
      },
      sorter: (a, b) => (a.satisfactionLevel || 0) - (b.satisfactionLevel || 0)
    },
    {
      title: '租住物业',
      key: 'property',
      render: (_, record) => {
        const property = getPropertyInfo(record.propertyId);
        return property ? (
          <Space>
            <HomeOutlined />
            <span>{property.name}</span>
          </Space>
        ) : (
          <span style={{ color: '#999' }}>无</span>
        );
      }
    },
    {
      title: '月收入',
      dataIndex: 'financials.monthlyIncome',
      key: 'income',
      render: (income) => (
        <Statistic
          value={income}
          precision={0}
          valueStyle={{ fontSize: '14px' }}
          prefix={<DollarOutlined />}
          suffix="元"
        />
      ),
      sorter: (a, b) => (a.financials.monthlyIncome || 0) - (b.financials.monthlyIncome || 0)
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => getStatusTag(getTenantStatus(record))
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<UserOutlined />}
              onClick={() => handleViewTenant(record)}
            />
          </Tooltip>
          <Tooltip title="互动">
            <Button
              type="text"
              icon={<MessageOutlined />}
              onClick={() => handleTenantInteraction(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => handleEditTenant(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要移除这个租户吗？"
            onConfirm={() => handleRemoveTenant(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="移除">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 处理添加租户
  const handleAddTenant = () => {
    setEditingTenant(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 处理编辑租户
  const handleEditTenant = (tenant: Tenant) => {
    setEditingTenant(tenant);
    form.setFieldsValue({
      ...tenant,
      preferences: tenant.preferences || []
    });
    setModalVisible(true);
  };

  // 处理查看租户详情
  const handleViewTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setDetailModalVisible(true);
  };

  // 处理租户互动
  const handleTenantInteraction = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setInteractionModalVisible(true);
  };

  // 处理移除租户
  const handleRemoveTenant = async (tenantId: string) => {
    try {
      // 这里应该调用游戏引擎的移除方法
      console.log('移除租户:', tenantId);
      message.success('租户移除成功');
      loadData();
    } catch (error) {
      console.error('移除租户失败:', error);
      message.error('移除失败');
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: TenantFormData) => {
    try {
      if (editingTenant) {
        // 更新租户
        console.log('更新租户:', editingTenant.id, values);
        message.success('租户更新成功');
      } else {
        // 添加新租户
        console.log('添加新租户:', values);
        message.success('租户添加成功');
      }
      
      setModalVisible(false);
      loadData();
    } catch (error) {
      console.error('保存租户失败:', error);
      message.error('保存失败');
    }
  };

  // 处理互动提交
  const handleInteractionSubmit = async (interactionType: string) => {
    if (!selectedTenant) return;
    
    try {
      // 这里应该调用租户服务的互动方法
      console.log('与租户互动:', selectedTenant.id, interactionType);
      message.success('互动成功');
      setInteractionModalVisible(false);
      loadData();
    } catch (error) {
      console.error('互动失败:', error);
      message.error('互动失败');
    }
  };

  // 获取满意度因素详情
  const getSatisfactionFactors = (tenant: Tenant): SatisfactionFactors => {
    return tenant.satisfactionFactors || { rent: 50, property: 50, management: 50, community: 50 };
  };

  return (
    <div className="tenant-manager">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="租户总数"
              value={stats.totalTenants}
              prefix={<TeamOutlined />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#666' }}>平均满意度</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {stats.averageSatisfaction.toFixed(1)}%
                </div>
              </div>
              <Progress
                type="circle"
                percent={stats.averageSatisfaction}
                width={60}
                strokeColor={{
                  '0%': '#ff4d4f',
                  '50%': '#faad14',
                  '100%': '#52c41a',
                }}
                format={percent => `${percent?.toFixed(0)}%`}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="月租金收入"
              value={stats.totalIncome}
              precision={0}
              prefix={<DollarOutlined />}
              suffix="元"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="问题租户"
              value={stats.problemTenants}
              prefix={<FrownOutlined />}
              suffix="人"
              valueStyle={{ color: stats.problemTenants > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容 */}
      <Card
        title="租户管理"
        extra={
          <Space>
            <Button
              icon={<FilterOutlined />}
            >
              筛选
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddTenant}
            >
              添加租户
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={tenants}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个租户`
          }}
        />
      </Card>

      {/* 添加/编辑租户模态框 */}
      <Modal
        title={editingTenant ? '编辑租户' : '添加租户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入租户姓名' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择租户类型' }]}>
                <Select>
                  {tenantTypes.map(t => <Option key={t.value} value={t.value}>{t.label}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="age" label="年龄" rules={[{ required: true, message: '请输入年龄' }]}>
                <InputNumber min={18} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="income" label="月收入" rules={[{ required: true, message: '请输入月收入' }]}>
                <InputNumber
                   style={{ width: '100%' }}
                   prefix="¥"
                   formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                   parser={(value) => value?.replace(/[^\d]/g, '') || ''}
                   precision={0}
                   min={0}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
               <Form.Item name="propertyId" label="租住物业">
                 <Select allowClear placeholder="选择一个物业">
                   {properties.map(p => (
                     <Option key={p.id} value={p.id}>{p.name} - {p.location.address}</Option>
                   ))}
                 </Select>
               </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="preferences" label="偏好">
                <Select mode="multiple" allowClear placeholder="请选择租户偏好">
                  {preferenceOptions.map(preference => (
                    <Option key={preference} value={preference}>{preference}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="备注">
                <Input.TextArea rows={3} placeholder="输入备注信息" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingTenant ? '更新' : '添加'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 租户详情模态框 */}
      <Modal
        title="租户详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedTenant && (
          <Tabs defaultActiveKey="basic">
            <TabPane tab="基本信息" key="basic">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card size="small" title="个人信息">
                    <p><strong>姓名:</strong> {selectedTenant.name}</p>
                    <p><strong>类型:</strong> {tenantTypes.find(t => t.value === selectedTenant.type)?.label}</p>
                    <p><strong>年龄:</strong> {selectedTenant.age}岁</p>
                    <p><strong>职业:</strong> {selectedTenant.occupation}</p>
                    <p><strong>月收入:</strong> ¥{selectedTenant.financials.monthlyIncome}</p>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="租住信息">
                    <p>
                      <strong>状态:</strong> {getStatusTag(getTenantStatus(selectedTenant))}
                    </p>
                    <p>
                      <strong>满意度:</strong> 
                      <Progress 
                        percent={selectedTenant.satisfactionLevel || 0} 
                        size="small" 
                        style={{ marginLeft: 8 }}
                      />
                    </p>
                    <p>
                      <strong>租住物业:</strong> {getPropertyInfo(selectedTenant.propertyId)?.name || '无'}
                    </p>
                    <p>
                      <strong>入住时间:</strong> {selectedTenant.moveInDate ? new Date(selectedTenant.moveInDate).toLocaleDateString() : '未知'}
                    </p>
                    <p>
                      <strong>租约到期:</strong> {selectedTenant.leaseEndDate ? new Date(selectedTenant.leaseEndDate).toLocaleDateString() : '未知'}
                    </p>
                  </Card>
                </Col>
              </Row>
              
              <Card size="small" title="偏好与生活方式" style={{ marginTop: 16 }}>
                <Paragraph>
                  <strong>偏好:</strong> 
                  {selectedTenant.preferences.preferredFacilities && selectedTenant.preferences.preferredFacilities.length > 0
                    ? selectedTenant.preferences.preferredFacilities.map((preference: string, index: number) => (
                        <Tag key={index}>{preference}</Tag>
                      ))
                    : ' 无特殊偏好'}
                </Paragraph>
              </Card>
              
              {selectedTenant.description && (
                <Card size="small" title="描述" style={{ marginTop: 16 }}>
                  <p>{selectedTenant.description}</p>
                </Card>
              )}
            </TabPane>
            
            <TabPane tab="满意度分析" key="satisfaction">
              <Card size="small" title="满意度因素分析">
                <Row gutter={[16, 16]}>
                  {Object.entries(getSatisfactionFactors(selectedTenant)).map(([factor, value]) => (
                    <Col span={12} key={factor}>
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ marginRight: 8 }}>
                          {factor === 'environment' && '环境'}
                          {factor === 'price' && '价格'}
                          {factor === 'facilities' && '设施'}
                          {factor === 'maintenance' && '维护'}
                          {factor === 'community' && '社区'}
                        </span>
                        <Progress 
                          percent={value as number}
                          size="small"
                          strokeColor={
                            (value as number) > 70 ? '#52c41a' : (value as number) > 30 ? '#faad14' : '#ff4d4f'
                          }
                        />
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>
              
              <Card size="small" title="满意度趋势" style={{ marginTop: 16 }}>
                <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
                  满意度趋势图表开发中...
                </div>
              </Card>
            </TabPane>
            
            <TabPane tab="互动历史" key="interactions">
              <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
                互动历史记录开发中...
              </div>
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* 租户互动模态框 */}
      <Modal
        title="租户互动"
        open={interactionModalVisible}
        onCancel={() => setInteractionModalVisible(false)}
        footer={null}
        width={500}
      >
        {selectedTenant && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <h3 style={{ marginTop: 16 }}>{selectedTenant.name}</h3>
              <div>
                {getStatusTag(getTenantStatus(selectedTenant))}
                <span style={{ marginLeft: 8 }}>
                  满意度: {selectedTenant.satisfactionLevel || 0}%
                </span>
              </div>
            </div>
            
            <Divider>选择互动方式</Divider>
            
            <List
              grid={{ gutter: 16, column: 2 }}
              dataSource={[
                { key: 'chat', title: '聊天', icon: <MessageOutlined />, color: '#1890ff' },
                { key: 'maintenance', title: '维修服务', icon: <SettingOutlined />, color: '#52c41a' },
                { key: 'gift', title: '赠送礼物', icon: <HeartOutlined />, color: '#eb2f96' },
                { key: 'discount', title: '提供折扣', icon: <DollarOutlined />, color: '#faad14' }
              ]}
              renderItem={item => (
                <List.Item>
                  <Button
                    type="default"
                    icon={item.icon}
                    style={{ width: '100%', height: 80, borderColor: item.color, color: item.color }}
                    onClick={() => handleInteractionSubmit(item.key)}
                  >
                    {item.title}
                  </Button>
                </List.Item>
              )}
            />
            
            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Button onClick={() => setInteractionModalVisible(false)}>
                取消
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TenantManager;