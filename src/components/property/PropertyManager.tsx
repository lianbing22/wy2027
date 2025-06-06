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
  Upload,
  message,
  Popconfirm,
  Tooltip,
  Progress,
  Row,
  Col,
  Statistic,
  Avatar,
  List,
  Tabs
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  HomeOutlined,
  DollarOutlined,
  TeamOutlined,
  UploadOutlined,
  SettingOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useServices } from '@/services';
import { PropertyType as PropertyTypeEnum, PropertyStatus as PropertyStatusEnum, PropertyGrade as PropertyGradeEnum, type Property } from '@/types/property';
import type { Tenant } from '@/types/tenant-system';

const { Option } = Select;
const { TabPane } = Tabs;

interface PropertyFormData {
  name: string;
  type: PropertyTypeEnum;
  address: string;
  area: number;
  rooms: number;
  bathrooms: number;
  monthlyRent: number;
  description?: string;
  amenities: string[];
}

interface PropertyStats {
  totalProperties: number;
  totalValue: number;
  monthlyIncome: number;
  occupancyRate: number;
  averageRent: number;
}

const PropertyManager: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<PropertyStats>({
    totalProperties: 0,
    totalValue: 0,
    monthlyIncome: 0,
    occupancyRate: 0,
    averageRent: 0
  });
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  const { initialized: isInitialized, services } = useServices();
  const gameEngine = services?.gameEngine;
  const tenantService = services?.tenantService;

  // 物业类型选项
  const propertyTypes = [
    { value: PropertyTypeEnum.RESIDENTIAL, label: '住宅' },
    { value: PropertyTypeEnum.COMMERCIAL, label: '商业' },
    { value: PropertyTypeEnum.OFFICE, label: '办公' },
    { value: PropertyTypeEnum.INDUSTRIAL, label: '工业' },
    { value: PropertyTypeEnum.MIXED, label: '混合用途' },
    { value: PropertyTypeEnum.TOWNHOUSE, label: '联排别墅' },
    { value: PropertyTypeEnum.SHARED, label: '共享住宅' },
    { value: PropertyTypeEnum.LUXURY, label: '豪华住宅' },
    { value: PropertyTypeEnum.ASSISTED_LIVING, label: '辅助生活设施' }
  ];

  // 设施选项
  const amenityOptions = [
    '停车位', '电梯', '健身房', '游泳池', '花园', '阳台', 
    '空调', '暖气', '洗衣机', '烘干机', '洗碗机', '微波炉'
  ];

  // 加载数据
  useEffect(() => {
    if (!isInitialized || !services) return;
    loadData();
  }, [isInitialized, services]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (!gameEngine) {
        message.error('游戏引擎未初始化');
        setLoading(false);
        return;
      }
      const gameState = await gameEngine.getGameState();
      const allTenants = gameState.tenants as Tenant[];
      
      setProperties(gameState.properties as Property[]);
      setTenants(allTenants);
      
      // 计算统计数据
      const totalProperties = gameState.properties.length;
      const totalValue = (gameState.properties as Property[]).reduce((sum: number, p: Property) => sum + (p.currentValue || 0), 0);
      const monthlyIncome = (gameState.properties as Property[]).reduce((sum: number, p: Property) => sum + (p.monthlyRent || 0), 0);
      const occupiedProperties = (gameState.properties as Property[]).filter((p: Property) => p.currentTenants && p.currentTenants.length > 0).length;
      const occupancyRate = totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0;
      const averageRent = totalProperties > 0 ? monthlyIncome / totalProperties : 0;
      
      setStats({
        totalProperties,
        totalValue,
        monthlyIncome,
        occupancyRate,
        averageRent
      });
      
    } catch (error) {
      console.error('加载物业数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取物业状态
  const getPropertyStatus = (property: Property): PropertyStatusEnum => {
    if (property.status && property.status !== PropertyStatusEnum.AVAILABLE) {
        return property.status;
    }
    if (property.currentTenants && property.currentTenants.length > 0) {
      return PropertyStatusEnum.OCCUPIED;
    }
    if (property.condition < 40) {
      return PropertyStatusEnum.MAINTENANCE;
    }
    return PropertyStatusEnum.AVAILABLE;
  };

  // 获取状态标签
  const getStatusTag = (status: PropertyStatusEnum) => {
    const statusConfig: Record<PropertyStatusEnum, { color: string; text: string }> = {
      [PropertyStatusEnum.AVAILABLE]: { color: 'green', text: '可租' },
      [PropertyStatusEnum.OCCUPIED]: { color: 'blue', text: '已租' },
      [PropertyStatusEnum.MAINTENANCE]: { color: 'orange', text: '维护中' },
      [PropertyStatusEnum.RENOVATION]: { color: 'gold', text: '装修中' },
      [PropertyStatusEnum.DAMAGED]: { color: 'red', text: '损坏' }
    };
    const config = statusConfig[status];
    if (!config) {
        return <Tag color="default">未知状态</Tag>;
    }
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 获取租户信息
  const getTenantInfo = (tenantId?: string) => {
    if (!tenantId) return null;
    return tenants.find((t: Tenant) => t.id === tenantId);
  };

  // 表格列定义
  const columns: ColumnsType<Property> = [
    {
      title: '物业名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record: Property) => (
        <Space>
          <Avatar icon={<HomeOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.location.address}</div>
          </div>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: PropertyTypeEnum) => {
        const typeLabel = propertyTypes.find(t => t.value === type)?.label || type;
        return <Tag>{typeLabel}</Tag>;
      }
    },
    {
      title: '面积/房间',
      key: 'size',
      render: (_, record) => (
        <div>
          <div>{record.area}㎡</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.rooms}室{record.bathrooms}卫
          </div>
        </div>
      )
    },
    {
      title: '月租金',
      dataIndex: 'monthlyRent',
      key: 'monthlyRent',
      render: (rent) => (
        <Statistic
          value={rent}
          precision={0}
          valueStyle={{ fontSize: '14px' }}
          prefix="¥"
        />
      ),
      sorter: (a, b) => (a.monthlyRent || 0) - (b.monthlyRent || 0)
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record: Property) => getStatusTag(getPropertyStatus(record))
    },
    {
      title: '租户',
      key: 'tenant',
      render: (_, record: Property) => {
        const tenant = getTenantInfo(record.currentTenants && record.currentTenants.length > 0 ? record.currentTenants[0] : undefined);
        return tenant ? (
          <Space>
            <Avatar size="small" icon={<TeamOutlined />} />
            <span>{tenant.name}</span>
          </Space>
        ) : (
          <span style={{ color: '#999' }}>空置</span>
        );
      }
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewProperty(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditProperty(record)}
            />
          </Tooltip>
          <Tooltip title="设置">
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => handlePropertySettings(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个物业吗？"
            onConfirm={() => handleDeleteProperty(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
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

  // 处理添加物业
  const handleAddProperty = () => {
    setEditingProperty(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 处理编辑物业
  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    form.setFieldsValue({
      ...property,
      amenities: property.amenities || []
    });
    setModalVisible(true);
  };

  // 处理查看物业详情
  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
    setDetailModalVisible(true);
  };

  // 处理物业设置
  const handlePropertySettings = (property: Property) => {
    console.log('打开物业设置:', property.id);
    message.info('物业设置功能开发中...');
  };

  // 处理删除物业
  const handleDeleteProperty = async (propertyId: string) => {
    try {
      // 这里应该调用游戏引擎的删除方法
      console.log('删除物业:', propertyId);
      message.success('物业删除成功');
      loadData();
    } catch (error) {
      console.error('删除物业失败:', error);
      message.error('删除失败');
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: PropertyFormData) => {
    setLoading(true);
    try {
      let newPropertyId = editingProperty ? editingProperty.id : gameEngine.generateId();
      const newPropertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'currentTenants' | 'financials' | 'marketData' | 'location' | 'facilities' | 'maintenanceHistory' | 'condition' | 'lastMaintenanceDate' | 'nextMaintenanceDate' | 'purchaseDate' | 'purchasePrice' | 'currentValue' | 'satisfactionRating' | 'popularityScore' | 'serviceQuality' | 'hasParking' | 'isPetFriendly' | 'isNearSchool' | 'isNearTransport' | 'isNearShopping' | 'isQuietArea' > & Partial<Pick<Property, 'purchasePrice' | 'currentValue'>> = {
        name: values.name,
        type: values.type,
        area: values.area,
        rooms: values.rooms,
        bathrooms: values.bathrooms,
        monthlyRent: values.monthlyRent,
        description: values.description,
        amenities: values.amenities,
        specialFeatures: [],
        grade: PropertyGradeEnum.STANDARD,
        floors: values.rooms > 3 ? 2 : 1,
        parkingSpaces: values.area > 100 ? 1 : 0,
        maxTenants: values.rooms,
      };

      const fullPropertyData: Partial<Property> = {
        ...newPropertyData,
        id: newPropertyId,
        location: editingProperty?.location || { 
            address: values.address, 
            district: 'Default District', 
            coordinates: { lat: 0, lng: 0}, 
            nearbyFacilities: { schools: 0, hospitals: 0, shoppingCenters: 0, transportStations: 0, parks: 0},
            accessibilityScore: 50,
            environmentScore: 50
        },
        status: editingProperty?.status || PropertyStatusEnum.AVAILABLE,
        currentValue: editingProperty?.currentValue || values.monthlyRent * 12 * 10,
        condition: 100,
      };

      if (editingProperty) {
        await gameEngine.updateProperty(fullPropertyData as Property);
        message.success('物业更新成功');
      } else {
        await gameEngine.addProperty(fullPropertyData as Property);
        message.success('物业添加成功');
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      console.error('保存物业失败:', error);
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="property-manager">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="物业总数"
              value={stats.totalProperties}
              prefix={<HomeOutlined />}
              suffix="处"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总价值"
              value={stats.totalValue}
              precision={0}
              prefix={<DollarOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="月收入"
              value={stats.monthlyIncome}
              precision={0}
              prefix={<DollarOutlined />}
              suffix="元"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#666' }}>入住率</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {stats.occupancyRate.toFixed(1)}%
                </div>
              </div>
              <Progress
                type="circle"
                percent={stats.occupancyRate}
                width={60}
                format={percent => `${percent?.toFixed(0)}%`}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 主要内容 */}
      <Card
        title="物业管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddProperty}
          >
            添加物业
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={properties}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个物业`
          }}
        />
      </Card>

      {/* 添加/编辑物业模态框 */}
      <Modal
        title={editingProperty ? '编辑物业' : '添加物业'}
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
              <Form.Item
                name="name"
                label="物业名称"
                rules={[{ required: true, message: '请输入物业名称' }]}
              >
                <Input placeholder="请输入物业名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="物业类型"
                rules={[{ required: true, message: '请选择物业类型' }]}
              >
                <Select placeholder="请选择物业类型">
                  {propertyTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="地址"
            rules={[{ required: true, message: '请输入地址' }]}
          >
            <Input placeholder="请输入详细地址" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="area"
                label="面积(㎡)"
                rules={[{ required: true, message: '请输入面积' }]}
              >
                <InputNumber
                  min={1}
                  placeholder="面积"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="rooms"
                label="房间数"
                rules={[{ required: true, message: '请输入房间数' }]}
              >
                <InputNumber
                  min={1}
                  placeholder="房间数"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="bathrooms"
                label="卫生间数"
                rules={[{ required: true, message: '请输入卫生间数' }]}
              >
                <InputNumber
                  min={1}
                  placeholder="卫生间数"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="monthlyRent"
            label="月租金"
            rules={[{ required: true, message: '请输入月租金' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              prefix="¥"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => parseFloat(value?.replace(/[^\d.-]/g, '') || '0')}
              precision={0}
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="amenities"
            label="设施"
          >
            <Select
              mode="multiple"
              placeholder="选择设施"
              options={amenityOptions.map(amenity => ({
                label: amenity,
                value: amenity
              }))}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea
              rows={3}
              placeholder="请输入物业描述"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingProperty ? '更新' : '添加'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 物业详情模态框 */}
      <Modal
        title="物业详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedProperty && (
          <Tabs defaultActiveKey="basic">
            <TabPane tab="基本信息" key="basic">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card size="small" title="基本信息">
                    <p><strong>名称:</strong> {selectedProperty.name}</p>
                    <p><strong>类型:</strong> {propertyTypes.find(t => t.value === selectedProperty.type)?.label}</p>
                    <p><strong>地址:</strong> {selectedProperty.location.address}</p>
                    <p><strong>面积:</strong> {selectedProperty.area}㎡</p>
                    <p><strong>房间:</strong> {selectedProperty.rooms}室{selectedProperty.bathrooms}卫</p>
                    <p><strong>月租金:</strong> ¥{selectedProperty.monthlyRent}</p>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="状态信息">
                    <p><strong>状态:</strong> {getStatusTag(getPropertyStatus(selectedProperty))}</p>
                    <p><strong>租户:</strong> {getTenantInfo(selectedProperty.currentTenants && selectedProperty.currentTenants.length > 0 ? selectedProperty.currentTenants[0] : undefined)?.name || '无'}</p>
                    <p><strong>购买时间:</strong> {selectedProperty.purchaseDate ? new Date(selectedProperty.purchaseDate).toLocaleDateString() : '未知'}</p>
                    <p><strong>物业价值:</strong> ¥{selectedProperty.currentValue || 0}</p>
                  </Card>
                </Col>
              </Row>
              
              {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                <Card size="small" title="设施" style={{ marginTop: 16 }}>
                  <Space wrap>
                    {selectedProperty.amenities.map(amenity => (
                      <Tag key={amenity}>{amenity}</Tag>
                    ))}
                  </Space>
                </Card>
              )}
              
              {selectedProperty.description && (
                <Card size="small" title="描述" style={{ marginTop: 16 }}>
                  <p>{selectedProperty.description}</p>
                </Card>
              )}
            </TabPane>
            
            <TabPane tab="财务信息" key="financial">
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Statistic
                    title="月租金收入"
                    value={selectedProperty.monthlyRent || 0}
                    prefix={<DollarOutlined />}
                    suffix="元"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="物业价值"
                    value={selectedProperty.currentValue || 0}
                    prefix={<DollarOutlined />}
                    suffix="元"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="年化收益率"
                    value={selectedProperty.currentValue ? ((selectedProperty.monthlyRent || 0) * 12 / selectedProperty.currentValue * 100) : 0}
                    precision={2}
                    suffix="%"
                  />
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default PropertyManager;