import React from 'react';
import './Card.css';

export interface CardProps {
  /** 卡片标题 */
  title?: React.ReactNode;
  /** 卡片副标题 */
  subtitle?: React.ReactNode;
  /** 卡片右上角操作区 */
  actions?: React.ReactNode;
  /** 卡片底部内容 */
  footer?: React.ReactNode;
  /** 是否有边框 */
  bordered?: boolean;
  /** 是否可悬浮 */
  hoverable?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 卡片内容 */
  children: React.ReactNode;
  /** 额外的类名 */
  className?: string;
}

/**
 * 通用卡片组件，用于信息展示
 */
const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  actions,
  footer,
  bordered = true,
  hoverable = false,
  loading = false,
  children,
  className = ''
}) => {
  const cardClass = [
    'wy-card',
    bordered ? 'wy-card-bordered' : '',
    hoverable ? 'wy-card-hoverable' : '',
    loading ? 'wy-card-loading' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass}>
      {(title || subtitle || actions) && (
        <div className="wy-card-header">
          <div className="wy-card-header-title">
            {title && <div className="wy-card-title">{title}</div>}
            {subtitle && <div className="wy-card-subtitle">{subtitle}</div>}
          </div>
          {actions && <div className="wy-card-actions">{actions}</div>}
        </div>
      )}
      <div className="wy-card-body">
        {loading ? (
          <div className="wy-card-loading-content">
            <div className="wy-card-loading-block" />
            <div className="wy-card-loading-block" />
            <div className="wy-card-loading-block" />
          </div>
        ) : (
          children
        )}
      </div>
      {footer && <div className="wy-card-footer">{footer}</div>}
    </div>
  );
};

export default Card; 