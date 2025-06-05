import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, message, Spin } from 'antd';
import {
  GameLayout,
  GameDashboard,
  PropertyManager,
  TenantManager,
  MarketPlace,
  ExplorationPanel,
  AchievementPanel
} from '@/components';
import { useServices } from '@/services';
import './App.css';

const { Content } = Layout;

const App: React.FC = () => {
  const { serviceManager, isInitialized, isInitializing } = useServices();

  useEffect(() => {
    const initializeServices = async () => {
      try {
        await serviceManager.initializeAll();
        message.success('游戏引擎初始化成功');
      } catch (error) {
        console.error('初始化服务失败:', error);
        message.error('游戏引擎初始化失败，请刷新页面重试');
      }
    };

    initializeServices();

    return () => {
      serviceManager.destroyAll();
    };
  }, []);

  if (isInitializing) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="正在初始化游戏引擎..." />
      </div>
    );
  }

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/*" element={
          <GameLayout>
            <Content className="game-content">
              <Routes>
                <Route path="/dashboard" element={<GameDashboard />} />
                <Route path="/properties" element={<PropertyManager />} />
                <Route path="/tenants" element={<TenantManager />} />
                <Route path="/market" element={<MarketPlace />} />
                <Route path="/exploration" element={<ExplorationPanel />} />
                <Route path="/achievements" element={<AchievementPanel />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Content>
          </GameLayout>
        } />
      </Routes>
    </div>
  );
};

export default App;