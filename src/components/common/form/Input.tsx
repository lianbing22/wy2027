import React from 'react';
import './Input.css';

export type InputSize = 'small' | 'medium' | 'large';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  /** 输入框大小 */
  size?: InputSize;
  /** 输入框标签 */
  label?: React.ReactNode;
  /** 错误信息 */
  error?: string;
  /** 提示信息 */
  hint?: string;
  /** 前缀内容 */
  prefix?: React.ReactNode;
  /** 后缀内容 */
  suffix?: React.ReactNode;
  /** 是否处于加载状态 */
  loading?: boolean;
  /** 是否可清除内容 */
  clearable?: boolean;
  /** 清除内容的回调 */
  onClear?: () => void;
  /** 额外的类名 */
  className?: string;
}

/**
 * 通用输入框组件
 */
const Input: React.FC<InputProps> = ({
  size = 'medium',
  label,
  error,
  hint,
  prefix,
  suffix,
  loading = false,
  clearable = false,
  onClear,
  className = '',
  onChange,
  value,
  ...restProps
}) => {
  const inputClass = [
    'wy-input',
    `wy-input-${size}`,
    error ? 'wy-input-error' : '',
    loading ? 'wy-input-loading' : '',
    className
  ].filter(Boolean).join(' ');

  // 清除输入内容
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      const e = { target: { value: '' } } as React.ChangeEvent<HTMLInputElement>;
      onChange(e);
    }
  };

  return (
    <div className="wy-input-wrapper">
      {label && <label className="wy-input-label">{label}</label>}
      <div className="wy-input-container">
        {prefix && <div className="wy-input-prefix">{prefix}</div>}
        
        <input
          className={inputClass}
          value={value}
          onChange={onChange}
          {...restProps}
        />
        
        {loading && (
          <div className="wy-input-loading-icon">●</div>
        )}
        
        {clearable && value && !restProps.disabled && (
          <button 
            type="button" 
            className="wy-input-clear" 
            onClick={handleClear}
          >
            ✕
          </button>
        )}
        
        {suffix && <div className="wy-input-suffix">{suffix}</div>}
      </div>
      
      {error && <div className="wy-input-error-text">{error}</div>}
      {!error && hint && <div className="wy-input-hint">{hint}</div>}
    </div>
  );
};

export default Input; 