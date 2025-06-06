import React from 'react';
import { Card } from '../common/ui';
import { Property, PropertyType, PropertyStatus } from '../../types/property';
import './PropertyCard.css';

export interface PropertyCardProps {
  /** 物业数据 */
  property: Property;
  /** 是否可选择 */
  selectable?: boolean;
  /** 是否已选中 */
  selected?: boolean;
  /** 选择变化回调 */
  onSelect?: (property: Property) => void;
  /** 点击回调 */
  onClick?: (property: Property) => void;
  /** 是否显示详情按钮 */
  showDetailsButton?: boolean;
  /** 查看详情回调 */
  onViewDetails?: (property: Property) => void;
}

/**
 * 物业卡片组件，用于在游戏中展示物业信息
 */
const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  selectable = false,
  selected = false,
  onSelect,
  onClick,
  showDetailsButton = true,
  onViewDetails,
}) => {
  // 根据物业状态返回对应的样式类名
  const getStatusClassName = (status: PropertyStatus): string => {
    switch (status) {
      case PropertyStatus.AVAILABLE:
        return 'property-status-available';
      case PropertyStatus.OCCUPIED:
        return 'property-status-occupied';
      case PropertyStatus.MAINTENANCE:
        return 'property-status-maintenance';
      case PropertyStatus.RENOVATION:
        return 'property-status-renovation';
      case PropertyStatus.DAMAGED:
        return 'property-status-damaged';
      default:
        return '';
    }
  };

  // 根据物业类型返回对应的图标
  const getPropertyTypeIcon = (type: PropertyType): string => {
    switch (type) {
      case PropertyType.RESIDENTIAL:
        return '🏠';
      case PropertyType.COMMERCIAL:
        return '🏪';
      case PropertyType.OFFICE:
        return '🏢';
      case PropertyType.INDUSTRIAL:
        return '🏭';
      case PropertyType.MIXED:
        return '🏙️';
      case PropertyType.TOWNHOUSE:
        return '🏘️';
      case PropertyType.SHARED:
        return '👨‍👩‍👧‍👦';
      case PropertyType.LUXURY:
        return '💎';
      case PropertyType.ASSISTED_LIVING:
        return '👵';
      default:
        return '🏠';
    }
  };

  // 处理卡片点击
  const handleCardClick = () => {
    if (onClick) {
      onClick(property);
    }
  };

  // 处理选择按钮点击
  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(property);
    }
  };

  // 处理查看详情按钮点击
  const handleViewDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(property);
    }
  };

  // 卡片右上角的操作区域
  const cardActions = (
    <div className="property-card-actions">
      {selectable && (
        <button 
          className={`property-select-button ${selected ? 'selected' : ''}`}
          onClick={handleSelectClick}
        >
          {selected ? '✓' : ''}
        </button>
      )}
    </div>
  );

  // 卡片底部的操作区域
  const cardFooter = showDetailsButton ? (
    <div className="property-card-footer">
      <button 
        className="property-details-button"
        onClick={handleViewDetailsClick}
      >
        查看详情
      </button>
    </div>
  ) : null;

  return (
    <div 
      className={`property-card ${selected ? 'property-card-selected' : ''}`}
      onClick={handleCardClick}
    >
      <Card
        title={(
          <div className="property-card-title">
            <span className="property-type-icon">{getPropertyTypeIcon(property.type)}</span>
            <span className="property-name">{property.name}</span>
          </div>
        )}
        subtitle={(
          <div className="property-card-subtitle">
            <span className={`property-status ${getStatusClassName(property.status)}`}>
              {property.status}
            </span>
            <span className="property-location">{property.location.district}</span>
          </div>
        )}
        actions={cardActions}
        footer={cardFooter}
        hoverable
        bordered
      >
        <div className="property-card-content">
          <div className="property-info-row">
            <span className="property-info-label">面积:</span>
            <span className="property-info-value">{property.area} m²</span>
          </div>
          <div className="property-info-row">
            <span className="property-info-label">价值:</span>
            <span className="property-info-value">¥{property.currentValue.toLocaleString()}</span>
          </div>
          <div className="property-info-row">
            <span className="property-info-label">租金:</span>
            <span className="property-info-value">¥{property.monthlyRent.toLocaleString()}/月</span>
          </div>
          <div className="property-info-row">
            <span className="property-info-label">评分:</span>
            <span className="property-info-value">{property.satisfactionRating}/100</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PropertyCard; 