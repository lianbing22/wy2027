import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Modal,
  Input,
  Select,
  InputNumber,
  message,
  Tooltip,
  Progress,
  Statistic,
  Avatar,
  List,
  Tabs,
  Badge,
  Divider,
  Empty,
  Spin,
  Alert
} from 'antd';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined,
  FireOutlined,
  StarOutlined,
  SearchOutlined,
  FilterOutlined,
  ShopOutlined,
  HeartOutlined,
  EyeOutlined,
  PlusOutlined,
  MinusOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { useServices } from '../../services';
import type { MarketItem, MarketCategory, MarketTrend, PriceHistory } from '../../types';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface MarketStats {
  totalItems: number;
  totalValue: number;
  averagePrice: number;
  trendingItems: number;
  playerMoney: number;
}

interface CartItem extends MarketItem {
  quantity: number;
}

const MarketPlace: React.FC = () => {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MarketItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [stats, setStats] = useState<MarketStats>({
    totalItems: 0,
    totalValue: 0,
    averagePrice: 0,
    trendingItems: 0,
    playerMoney: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [priceHistoryModalVisible, setPriceHistoryModalVisible] = useState(false);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'price' | 'demand' | 'name'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const { gameEngine, marketService, isInitialized } = useServices();

  // 市场分类
  const categories: { value: MarketCategory | 'all', label: string, icon: React.ReactNode }[] = [
    { value: 'all', label: '全部', icon: <ShopOutlined /> },
    { value: 'furniture', label: '家具', icon: '🪑' },
    { value: 'appliance', label: '电器', icon: '📺' },
    { value: 'decoration', label: '装饰', icon: '🖼️' },
    { value: 'tool', label: '工具', icon: '🔧' },
    { value: 'material', label: '材料', icon: '🧱' },
    { value: 'service', label: '服务', icon: '🛠️' }
  ];

  // 加载数据
  useEffect(() => {
    if (!isInitialized) return;
    loadData();
  }, [isInitialized]);

  // 筛选和排序
  useEffect(() => {
    let filtered = items;
    
    // 搜索筛选
    if (searchText) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // 分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // 排序
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'demand':
          aValue = a.demand;
          bValue = b.demand;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });
    
    setFilteredItems(filtered);
  }, [items, searchText, selectedCategory, sortBy, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    try {
      const gameState = await gameEngine().getGameState();
      const marketItems = await marketService().getAllItems();
      const marketStats = await marketService().getMarketStatistics();
      
      setItems(marketItems);
      
      // 计算统计数据
      const totalItems = marketItems.length;
      const totalValue = marketItems.reduce((sum, item) => sum + item.price, 0);
      const averagePrice = totalItems > 0 ? totalValue / totalItems : 0;
      const trendingItems = marketItems.filter(item => item.demand > 70).length;
      
      setStats({
        totalItems,
        totalValue,
        averagePrice,
        trendingItems,
        playerMoney: gameState.player.money
      });
      
    } catch (error) {
      console.error('加载市场数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取需求标签
  const getDemandTag = (demand: number) => {
    if (demand >= 80) return <Tag color="red" icon={<FireOutlined />}>热门</Tag>;
    if (demand >= 60) return <Tag color="orange">需求高</Tag>;
    if (demand >= 40) return <Tag color="blue">需求中</Tag>;
    return <Tag color="gray">需求低</Tag>;
  };

  // 获取价格趋势图标
  const getPriceTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUpOutlined style={{ color: '#52c41a' }} />;
    if (trend < 0) return <TrendingDownOutlined style={{ color: '#ff4d4f' }} />;
    return null;
  };

  // 添加到购物车
  const addToCart = (item: MarketItem, quantity: number = 1) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity }]);
    }
    
    message.success(`${item.name} 已添加到购物车`);
  };

  // 从购物车移除
  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  // 更新购物车数量
  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  // 计算购物车总价
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // 处理购买
  const handlePurchase = async () => {
    if (cart.length === 0) {
      message.warning('购物车为空');
      return;
    }
    
    const total = getCartTotal();
    if (total > stats.playerMoney) {
      message.error('资金不足');
      return;
    }
    
    try {
      // 这里应该调用市场服务的购买方法
      for (const cartItem of cart) {
        await marketService().purchaseItem(cartItem.id, cartItem.quantity);
      }
      
      message.success('购买成功！');
      setCart([]);
      setCartModalVisible(false);
      loadData();
    } catch (error) {
      console.error('购买失败:', error);
      message.error('购买失败');
    }
  };

  // 查看商品详情
  const handleViewItem = (item: MarketItem) => {
    setSelectedItem(item);
    setDetailModalVisible(true);
  };

  // 查看价格历史
  const handleViewPriceHistory = async (item: MarketItem) => {
    try {
      const history = await marketService().getPriceHistory(item.id);
      setPriceHistory(history);
      setSelectedItem(item);
      setPriceHistoryModalVisible(true);
    } catch (error) {
      console.error('获取价格历史失败:', error);
      message.error('获取价格历史失败');
    }
  };

  return (
    <div className="marketplace">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="可用资金"
              value={stats.playerMoney}
              precision={0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<DollarOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="商品总数"
              value={stats.totalItems}
              prefix={<ShopOutlined />}
              suffix="件"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均价格"
              value={stats.averagePrice}
              precision={0}
              prefix={<DollarOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="热门商品"
              value={stats.trendingItems}
              prefix={<FireOutlined />}
              suffix="件"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Search
              placeholder="搜索商品..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ width: '100%' }}
              placeholder="选择分类"
            >
              {categories.map(category => (
                <Option key={category.value} value={category.value}>
                  <Space>
                    {category.icon}
                    {category.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Select
              value={sortBy}
              onChange={setSortBy}
              style={{ width: '100%' }}
            >
              <Option value="name">按名称</Option>
              <Option value="price">按价格</Option>
              <Option value="demand">按需求</Option>
            </Select>
          </Col>
          <Col xs={24} sm={3}>
            <Select
              value={sortOrder}
              onChange={setSortOrder}
              style={{ width: '100%' }}
            >
              <Option value="asc">升序</Option>
              <Option value="desc">降序</Option>
            </Select>
          </Col>
          <Col xs={24} sm={3}>
            <Badge count={cart.length} size="small">
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={() => setCartModalVisible(true)}
              >
                购物车
              </Button>
            </Badge>
          </Col>
        </Row>
      </Card>

      {/* 商品列表 */}
      <Spin spinning={loading}>
        {filteredItems.length === 0 ? (
          <Empty description="暂无商品" />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredItems.map(item => (
              <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                <Card
                  hoverable
                  cover={
                    <div style={{ height: 200, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} style={{ maxHeight: '100%', maxWidth: '100%' }} />
                      ) : (
                        <div style={{ fontSize: '48px' }}>📦</div>
                      )}
                    </div>
                  }
                  actions={[
                    <Tooltip title="查看详情">
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewItem(item)}
                      />
                    </Tooltip>,
                    <Tooltip title="价格历史">
                      <Button
                        type="text"
                        icon={<HistoryOutlined />}
                        onClick={() => handleViewPriceHistory(item)}
                      />
                    </Tooltip>,
                    <Tooltip title="添加到购物车">
                      <Button
                        type="text"
                        icon={<ShoppingCartOutlined />}
                        onClick={() => addToCart(item)}
                      />
                    </Tooltip>
                  ]}
                >
                  <Card.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{item.name}</span>
                        {getPriceTrendIcon(item.priceTrend || 0)}
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: 8 }}>
                          <Statistic
                            value={item.price}
                            precision={0}
                            valueStyle={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}
                            prefix={<DollarOutlined />}
                            suffix="元"
                          />
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          {getDemandTag(item.demand)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {item.description.length > 50 
                            ? `${item.description.substring(0, 50)}...` 
                            : item.description
                          }
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

      {/* 商品详情模态框 */}
      <Modal
        title="商品详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button 
            key="add-cart" 
            type="primary" 
            icon={<ShoppingCartOutlined />}
            onClick={() => {
              if (selectedItem) {
                addToCart(selectedItem);
                setDetailModalVisible(false);
              }
            }}
          >
            添加到购物车
          </Button>
        ]}
        width={600}
      >
        {selectedItem && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ height: 300, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
                  {selectedItem.image ? (
                    <img src={selectedItem.image} alt={selectedItem.name} style={{ maxHeight: '100%', maxWidth: '100%' }} />
                  ) : (
                    <div style={{ fontSize: '72px' }}>📦</div>
                  )}
                </div>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <h2>{selectedItem.name}</h2>
                    <Space>
                      <Tag>{categories.find(c => c.value === selectedItem.category)?.label}</Tag>
                      {getDemandTag(selectedItem.demand)}
                    </Space>
                  </div>
                  
                  <Statistic
                    title="价格"
                    value={selectedItem.price}
                    precision={0}
                    valueStyle={{ fontSize: '24px', color: '#1890ff' }}
                    prefix={<DollarOutlined />}
                    suffix="元"
                  />
                  
                  <div>
                    <div style={{ marginBottom: 8 }}>需求度</div>
                    <Progress 
                      percent={selectedItem.demand} 
                      strokeColor={{
                        '0%': '#ff4d4f',
                        '50%': '#faad14',
                        '100%': '#52c41a',
                      }}
                    />
                  </div>
                  
                  {selectedItem.supplier && (
                    <div>
                      <strong>供应商:</strong> {selectedItem.supplier.name}
                    </div>
                  )}
                </Space>
              </Col>
            </Row>
            
            <Divider />
            
            <div>
              <h4>商品描述</h4>
              <p>{selectedItem.description}</p>
            </div>
            
            {selectedItem.features && selectedItem.features.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>特性</h4>
                <Space wrap>
                  {selectedItem.features.map(feature => (
                    <Tag key={feature}>{feature}</Tag>
                  ))}
                </Space>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 购物车模态框 */}
      <Modal
        title={`购物车 (${cart.length}件商品)`}
        open={cartModalVisible}
        onCancel={() => setCartModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setCartModalVisible(false)}>
            继续购物
          </Button>,
          <Button 
            key="purchase" 
            type="primary" 
            disabled={cart.length === 0 || getCartTotal() > stats.playerMoney}
            onClick={handlePurchase}
          >
            结算 (¥{getCartTotal()})
          </Button>
        ]}
        width={700}
      >
        {cart.length === 0 ? (
          <Empty description="购物车为空" />
        ) : (
          <div>
            {getCartTotal() > stats.playerMoney && (
              <Alert
                message="资金不足"
                description={`总价 ¥${getCartTotal()}，可用资金 ¥${stats.playerMoney}`}
                type="error"
                style={{ marginBottom: 16 }}
              />
            )}
            
            <List
              dataSource={cart}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Space key="quantity">
                      <Button
                        size="small"
                        icon={<MinusOutlined />}
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      />
                      <span>{item.quantity}</span>
                      <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      />
                    </Space>,
                    <Button
                      key="remove"
                      type="text"
                      danger
                      onClick={() => removeFromCart(item.id)}
                    >
                      移除
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={item.image} icon={<ShopOutlined />} />}
                    title={item.name}
                    description={`单价: ¥${item.price} | 小计: ¥${item.price * item.quantity}`}
                  />
                </List.Item>
              )}
            />
            
            <Divider />
            
            <div style={{ textAlign: 'right' }}>
              <Space direction="vertical">
                <Statistic
                  title="总计"
                  value={getCartTotal()}
                  precision={0}
                  valueStyle={{ fontSize: '24px', color: '#1890ff' }}
                  prefix={<DollarOutlined />}
                  suffix="元"
                />
                <div style={{ color: '#666' }}>
                  可用资金: ¥{stats.playerMoney}
                </div>
              </Space>
            </div>
          </div>
        )}
      </Modal>

      {/* 价格历史模态框 */}
      <Modal
        title={`价格历史 - ${selectedItem?.name}`}
        open={priceHistoryModalVisible}
        onCancel={() => setPriceHistoryModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPriceHistoryModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {priceHistory.length === 0 ? (
          <Empty description="暂无价格历史数据" />
        ) : (
          <div>
            <List
              dataSource={priceHistory}
              renderItem={(record) => (
                <List.Item>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>¥{record.price}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      {record.change > 0 && (
                        <Tag color="green" icon={<TrendingUpOutlined />}>
                          +{record.change.toFixed(1)}%
                        </Tag>
                      )}
                      {record.change < 0 && (
                        <Tag color="red" icon={<TrendingDownOutlined />}>
                          {record.change.toFixed(1)}%
                        </Tag>
                      )}
                      {record.change === 0 && (
                        <Tag>无变化</Tag>
                      )}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MarketPlace;