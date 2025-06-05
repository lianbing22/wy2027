import React, { useState, useEffect } from 'react';
import { Layout, Menu, Badge, Avatar, Dropdown, Space, Button, Tooltip } from 'antd';
import {
  HomeOutlined,
  ShopOutlined,
  TeamOutlined,
  TrophyOutlined,
  CompassOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useServices } from '../../services';
import type { Notification } from '../../services';

const { Header, Sider, Content } = Layout;

interface GameLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: number;
}

const GameLayout: React.FC<GameLayoutProps> = ({ children, currentPage = 'home' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { notificationService, isInitialized } = useServices();

  // 菜单项配置
  const menuItems: MenuItem[] = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '主页',
      path: '/'
    },
    {
      key: 'property',
      icon: <HomeOutlined />,
      label: '物业管理',
      path: '/property'
    },
    {
      key: 'tenant',
      icon: <TeamOutlined />,
      label: '租户管理',
      path: '/tenant'
    },
    {
      key: 'market',
      icon: <ShopOutlined />,
      label: '市场',
      path: '/market'
    },
    {
      key: 'exploration',
      icon: <CompassOutlined />,
      label: '探险',
      path: '/exploration'
    },
    {
      key: 'achievement',
      icon: <TrophyOutlined />,
      label: '成就',
      path: '/achievement'
    }
  ];

  // 加载通知数据
  useEffect(() => {
    if (!isInitialized) return;

    const loadNotifications = async () => {
      try {
        const notificationList = await notificationService().getNotifications({
          status: 'unread',
          limit: 10
        });
        setNotifications(notificationList);
        setUnreadCount(notificationList.length);
      } catch (error) {
        console.error('加载通知失败:', error);
      }
    };

    loadNotifications();

    // 监听通知更新
    const handleNotificationUpdate = () => {
      loadNotifications();
    };

    // 这里应该添加事件监听器，但由于服务还未完全集成，暂时使用定时器
    const interval = setInterval(loadNotifications, 30000); // 30秒刷新一次

    return () => {
      clearInterval(interval);
    };
  }, [isInitialized, notificationService]);

  // 用户菜单
  const userMenuItems = [
    {
      key: 'profile',
      label: '个人资料',
      icon: <UserOutlined />
    },
    {
      key: 'settings',
      label: '设置',
      icon: <SettingOutlined />
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      label: '退出登录',
      danger: true
    }
  ];

  // 通知菜单
  const notificationMenuItems = notifications.slice(0, 5).map((notification, index) => ({
    key: `notification-${notification.id}`,
    label: (
      <div className="notification-item" style={{ maxWidth: 250 }}>
        <div className="notification-title" style={{ fontWeight: 'bold', fontSize: '12px' }}>
          {notification.title}
        </div>
        <div className="notification-content" style={{ fontSize: '11px', color: '#666', marginTop: 2 }}>
          {notification.content.length > 50 
            ? `${notification.content.substring(0, 50)}...` 
            : notification.content
          }
        </div>
        <div className="notification-time" style={{ fontSize: '10px', color: '#999', marginTop: 2 }}>
          {new Date(notification.createdAt).toLocaleString()}
        </div>
      </div>
    )
  }));

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    const item = menuItems.find(item => item.key === key);
    if (item) {
      // 这里应该使用路由导航，暂时使用 console.log
      console.log(`导航到: ${item.path}`);
    }
  };

  // 处理用户菜单点击
  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        console.log('打开个人资料');
        break;
      case 'settings':
        console.log('打开设置');
        break;
      case 'logout':
        console.log('退出登录');
        break;
    }
  };

  // 处理通知点击
  const handleNotificationClick = ({ key }: { key: string }) => {
    if (key.startsWith('notification-')) {
      const notificationId = key.replace('notification-', '');
      console.log(`查看通知: ${notificationId}`);
      // 标记通知为已读
      if (isInitialized) {
        notificationService().markAsRead(notificationId);
      }
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          background: 'linear-gradient(180deg, #1890ff 0%, #096dd9 100%)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)'
        }}
      >
        {/* Logo区域 */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.1)',
          margin: '16px',
          borderRadius: '8px'
        }}>
          {!collapsed ? (
            <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
              🏢 物业大亨
            </div>
          ) : (
            <div style={{ color: 'white', fontSize: '24px' }}>🏢</div>
          )}
        </div>

        {/* 导航菜单 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentPage]}
          onClick={handleMenuClick}
          style={{ background: 'transparent', border: 'none' }}
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: item.label
          }))}
        />
      </Sider>

      <Layout>
        {/* 顶部导航栏 */}
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {/* 左侧：折叠按钮 */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />

          {/* 右侧：通知和用户信息 */}
          <Space size="large">
            {/* 通知铃铛 */}
            <Dropdown
              menu={{
                items: [
                  ...notificationMenuItems,
                  ...(notificationMenuItems.length > 0 ? [
                    { type: 'divider' as const },
                    {
                      key: 'view-all',
                      label: '查看全部通知'
                    }
                  ] : [
                    {
                      key: 'no-notifications',
                      label: '暂无新通知',
                      disabled: true
                    }
                  ])
                ],
                onClick: handleNotificationClick
              }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Badge count={unreadCount} size="small">
                <Button 
                  type="text" 
                  icon={<BellOutlined />} 
                  style={{ fontSize: '16px' }}
                />
              </Badge>
            </Dropdown>

            {/* 用户头像和菜单 */}
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick
              }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar 
                  size="small" 
                  icon={<UserOutlined />} 
                  style={{ backgroundColor: '#1890ff' }}
                />
                <span style={{ color: '#333' }}>玩家</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* 主内容区域 */}
        <Content style={{
          margin: '24px',
          padding: '24px',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          minHeight: 'calc(100vh - 112px)'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default GameLayout;