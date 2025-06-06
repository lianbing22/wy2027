import React from 'react';
import { GamePhase } from '../../types/game-state';
import './GamePhaseIndicator.css';

export interface GamePhaseIndicatorProps {
  /** 当前游戏阶段 */
  currentPhase: GamePhase;
  /** 游戏年份 */
  year: number;
  /** 游戏月份 (1-12) */
  month: number;
  /** 游戏天数 (1-30) */
  day: number;
  /** 是否是大尺寸显示 */
  large?: boolean;
  /** 点击回调 */
  onClick?: () => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 游戏阶段指示器组件
 * 用于显示当前游戏阶段、日期等信息
 */
const GamePhaseIndicator: React.FC<GamePhaseIndicatorProps> = ({
  currentPhase,
  year,
  month,
  day,
  large = false,
  onClick,
  className = '',
}) => {
  // 获取阶段名称
  const getPhaseName = (phase: GamePhase): string => {
    switch (phase) {
      case GamePhase.BUILDING:
        return '建设阶段';
      case GamePhase.OPERATING:
        return '经营阶段';
      case GamePhase.EXPLORING:
        return '探险阶段';
      case GamePhase.COMPETING:
        return '竞争阶段';
      case GamePhase.EXPANDING:
        return '扩张阶段';
      default:
        return '未知阶段';
    }
  };

  // 获取阶段图标
  const getPhaseIcon = (phase: GamePhase): string => {
    switch (phase) {
      case GamePhase.BUILDING:
        return '🏗️';
      case GamePhase.OPERATING:
        return '🏢';
      case GamePhase.EXPLORING:
        return '🔍';
      case GamePhase.COMPETING:
        return '🏆';
      case GamePhase.EXPANDING:
        return '📈';
      default:
        return '❓';
    }
  };

  // 获取月份名称
  const getMonthName = (monthNumber: number): string => {
    const monthNames = [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    return monthNames[monthNumber - 1] || '';
  };

  return (
    <div 
      className={`game-phase-indicator ${large ? 'large' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="phase-icon-container">
        <span className="phase-icon">{getPhaseIcon(currentPhase)}</span>
      </div>
      
      <div className="phase-info">
        <div className="phase-name">{getPhaseName(currentPhase)}</div>
        <div className="game-date">
          {year}年 {getMonthName(month)} {day}日
        </div>
      </div>
      
      <div className="phase-progress">
        <div className="phase-progress-bar">
          <div 
            className="phase-progress-fill"
            style={{ width: `${(day / 30) * 100}%` }}
          />
        </div>
        <div className="phase-progress-text">
          本月进度: {Math.round((day / 30) * 100)}%
        </div>
      </div>
    </div>
  );
};

export default GamePhaseIndicator; 