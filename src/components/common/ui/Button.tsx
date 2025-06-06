import React from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  /** 按钮文本内容 */
  children: React.ReactNode;
  /** 按钮变体类型 */
  variant?: ButtonVariant;
  /** 按钮尺寸 */
  size?: ButtonSize;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 前置图标 */
  icon?: React.ReactNode;
  /** 是否铺满容器宽度 */
  fullWidth?: boolean;
  /** 点击事件处理函数 */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** 按钮类型 */
  type?: 'button' | 'submit' | 'reset';
  /** 自定义类名 */
  className?: string;
}

/**
 * 通用按钮组件，支持多种样式变体和状态
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
}) => {
  // 构建类名
  const buttonClass = [
    'wy-button',
    `wy-button-${variant}`,
    `wy-button-${size}`,
    disabled ? 'wy-button-disabled' : '',
    loading ? 'wy-button-loading' : '',
    fullWidth ? 'wy-button-full-width' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <span className="wy-button-loading-icon">●</span>}
      {icon && !loading && <span className="wy-button-icon">{icon}</span>}
      <span className="wy-button-text">{children}</span>
    </button>
  );
};

export default Button; 