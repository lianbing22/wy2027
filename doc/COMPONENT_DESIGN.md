# 物业管理模拟器 - 组件设计文档

## 组件架构概览

本文档详细描述了物业管理模拟器的前端组件架构设计，采用模块化、可复用的组件设计理念。

### 组件层次结构

```
┌─────────────────────────────────────────────────────────────┐
│                    应用层 (App Layer)                       │
├─────────────────────────────────────────────────────────────┤
│ App.tsx │ Router │ Global Providers │ Error Boundary      │
├─────────────────────────────────────────────────────────────┤
│                    页面层 (Page Layer)                      │
├─────────────────────────────────────────────────────────────┤
│ Auth Pages │ Game Pages │ Property Pages │ Dashboard Pages │
├─────────────────────────────────────────────────────────────┤
│                    布局层 (Layout Layer)                    │
├─────────────────────────────────────────────────────────────┤
│ MainLayout │ GameLayout │ AuthLayout │ DashboardLayout    │
├─────────────────────────────────────────────────────────────┤
│                    功能组件层 (Feature Layer)                │
├─────────────────────────────────────────────────────────────┤
│ Game Components │ Property Components │ Tenant Components │
├─────────────────────────────────────────────────────────────┤
│                    通用组件层 (Common Layer)                 │
├─────────────────────────────────────────────────────────────┤
│ UI Components │ Form Components │ Chart Components       │
└─────────────────────────────────────────────────────────────┘
```

## 通用组件设计

### 1. 基础 UI 组件

```typescript
/**
 * 按钮组件
 */
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  children,
  className,
  type = 'button',
  ...props
}) => {
  const buttonClasses = cn(
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    {
      'btn-disabled': disabled,
      'btn-loading': loading,
      'btn-full-width': fullWidth,
    },
    className
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <Spinner size="small" />}
      {!loading && icon && iconPosition === 'left' && (
        <span className="btn-icon btn-icon-left">{icon}</span>
      )}
      <span className="btn-content">{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="btn-icon btn-icon-right">{icon}</span>
      )}
    </button>
  );
};

/**
 * 卡片组件
 */
interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  bordered?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  actions,
  footer,
  bordered = true,
  hoverable = false,
  loading = false,
  className,
  children,
}) => {
  const cardClasses = cn(
    'card',
    {
      'card-bordered': bordered,
      'card-hoverable': hoverable,
      'card-loading': loading,
    },
    className
  );

  return (
    <div className={cardClasses}>
      {(title || subtitle || actions) && (
        <div className="card-header">
          <div className="card-header-content">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-body">
        {loading ? <CardSkeleton /> : children}
      </div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

/**
 * 模态框组件
 */
interface ModalProps {
  open: boolean;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closable?: boolean;
  maskClosable?: boolean;
  footer?: React.ReactNode;
  onClose?: () => void;
  onCancel?: () => void;
  onOk?: () => void;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  open,
  title,
  size = 'medium',
  closable = true,
  maskClosable = true,
  footer,
  onClose,
  onCancel,
  onOk,
  children,
  className,
}) => {
  const modalClasses = cn(
    'modal',
    `modal-${size}`,
    {
      'modal-open': open,
    },
    className
  );

  const handleMaskClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && maskClosable && onClose) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={handleMaskClick}>
      <div className={modalClasses}>
        {(title || closable) && (
          <div className="modal-header">
            {title && <h2 className="modal-title">{title}</h2>}
            {closable && (
              <button className="modal-close" onClick={onClose}>
                <CloseIcon />
              </button>
            )}
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};
```

### 2. 表单组件

```typescript
/**
 * 输入框组件
 */
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'small' | 'medium' | 'large';
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  loading?: boolean;
  clearable?: boolean;
  onClear?: () => void;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  size = 'medium',
  prefix,
  suffix,
  loading,
  clearable,
  onClear,
  className,
  ...props
}) => {
  const inputClasses = cn(
    'input',
    `input-${size}`,
    {
      'input-error': error,
      'input-loading': loading,
    },
    className
  );

  return (
    <div className="input-wrapper">
      {label && <label className="input-label">{label}</label>}
      <div className="input-container">
        {prefix && <span className="input-prefix">{prefix}</span>}
        <input className={inputClasses} {...props} />
        {loading && <Spinner className="input-spinner" size="small" />}
        {clearable && props.value && (
          <button className="input-clear" onClick={onClear}>
            <CloseIcon size={16} />
          </button>
        )}
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
      {error && <span className="input-error-text">{error}</span>}
      {hint && !error && <span className="input-hint">{hint}</span>}
    </div>
  );
};

/**
 * 选择器组件
 */
interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  label?: string;
  error?: string;
  hint?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  onChange?: (value: string | number | (string | number)[]) => void;
  onSearch?: (query: string) => void;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  defaultValue,
  placeholder,
  label,
  error,
  hint,
  size = 'medium',
  disabled,
  loading,
  searchable,
  clearable,
  multiple,
  onChange,
  onSearch,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedValue, setSelectedValue] = useState(value || defaultValue);

  const selectClasses = cn(
    'select',
    `select-${size}`,
    {
      'select-open': isOpen,
      'select-disabled': disabled,
      'select-error': error,
      'select-loading': loading,
    },
    className
  );

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery, searchable]);

  const handleSelect = (option: SelectOption) => {
    if (multiple) {
      const currentValues = Array.isArray(selectedValue) ? selectedValue : [];
      const newValues = currentValues.includes(option.value)
        ? currentValues.filter(v => v !== option.value)
        : [...currentValues, option.value];
      setSelectedValue(newValues);
      onChange?.(newValues);
    } else {
      setSelectedValue(option.value);
      onChange?.(option.value);
      setIsOpen(false);
    }
  };

  return (
    <div className="select-wrapper">
      {label && <label className="select-label">{label}</label>}
      <div className={selectClasses}>
        <div
          className="select-trigger"
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className="select-value">
            {selectedValue ? getSelectedLabel() : placeholder}
          </span>
          <ChevronDownIcon className="select-arrow" />
        </div>
        {isOpen && (
          <div className="select-dropdown">
            {searchable && (
              <div className="select-search">
                <Input
                  placeholder="搜索选项..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    onSearch?.(e.target.value);
                  }}
                  size="small"
                />
              </div>
            )}
            <div className="select-options">
              {filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn('select-option', {
                    'select-option-selected': isSelected(option.value),
                    'select-option-disabled': option.disabled,
                  })}
                  onClick={() => !option.disabled && handleSelect(option)}
                >
                  {multiple && (
                    <Checkbox
                      checked={isSelected(option.value)}
                      onChange={() => handleSelect(option)}
                    />
                  )}
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {error && <span className="select-error-text">{error}</span>}
      {hint && !error && <span className="select-hint">{hint}</span>}
    </div>
  );
};
```

### 3. 数据展示组件

```typescript
/**
 * 表格组件
 */
interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  filters?: { text: string; value: any }[];
  sorter?: (a: T, b: T) => number;
}

interface TableProps<T = any> {
  columns: TableColumn<T>[];
  dataSource: T[];
  rowKey?: string | ((record: T) => string);
  loading?: boolean;
  pagination?: PaginationConfig;
  selection?: {
    type: 'checkbox' | 'radio';
    selectedRowKeys?: string[];
    onChange?: (selectedRowKeys: string[], selectedRows: T[]) => void;
  };
  expandable?: {
    expandedRowRender: (record: T) => React.ReactNode;
    expandedRowKeys?: string[];
    onExpand?: (expanded: boolean, record: T) => void;
  };
  onRow?: (record: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
  className?: string;
}

const Table = <T extends Record<string, any>>({
  columns,
  dataSource,
  rowKey = 'id',
  loading,
  pagination,
  selection,
  expandable,
  onRow,
  className,
}: TableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [filters, setFilters] = useState<Record<string, any[]>>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>(
    selection?.selectedRowKeys || []
  );

  const tableClasses = cn(
    'table',
    {
      'table-loading': loading,
    },
    className
  );

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || index.toString();
  };

  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable) return;

    const newDirection =
      sortConfig?.key === column.key && sortConfig.direction === 'asc'
        ? 'desc'
        : 'asc';

    setSortConfig({
      key: column.key,
      direction: newDirection,
    });
  };

  const handleFilter = (columnKey: string, filterValues: any[]) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: filterValues,
    }));
  };

  const processedData = useMemo(() => {
    let result = [...dataSource];

    // 应用过滤器
    Object.entries(filters).forEach(([columnKey, filterValues]) => {
      if (filterValues.length > 0) {
        const column = columns.find(col => col.key === columnKey);
        if (column?.dataIndex) {
          result = result.filter(record =>
            filterValues.includes(record[column.dataIndex!])
          );
        }
      }
    });

    // 应用排序
    if (sortConfig) {
      const column = columns.find(col => col.key === sortConfig.key);
      if (column) {
        result.sort((a, b) => {
          if (column.sorter) {
            return sortConfig.direction === 'asc'
              ? column.sorter(a, b)
              : column.sorter(b, a);
          }

          const aValue = column.dataIndex ? a[column.dataIndex] : '';
          const bValue = column.dataIndex ? b[column.dataIndex] : '';

          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }

    return result;
  }, [dataSource, filters, sortConfig, columns]);

  return (
    <div className="table-wrapper">
      <table className={tableClasses}>
        <thead className="table-header">
          <tr>
            {selection && (
              <th className="table-selection-column">
                {selection.type === 'checkbox' && (
                  <Checkbox
                    checked={selectedRowKeys.length === dataSource.length}
                    indeterminate={
                      selectedRowKeys.length > 0 &&
                      selectedRowKeys.length < dataSource.length
                    }
                    onChange={(checked) => {
                      const newSelectedKeys = checked
                        ? dataSource.map((record, index) => getRowKey(record, index))
                        : [];
                      setSelectedRowKeys(newSelectedKeys);
                      selection.onChange?.(newSelectedKeys, checked ? dataSource : []);
                    }}
                  />
                )}
              </th>
            )}
            {expandable && <th className="table-expand-column"></th>}
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn('table-header-cell', {
                  'table-header-sortable': column.sortable,
                  'table-header-sorted':
                    sortConfig?.key === column.key,
                })}
                style={{ width: column.width, textAlign: column.align }}
                onClick={() => handleSort(column)}
              >
                <div className="table-header-content">
                  <span>{column.title}</span>
                  {column.sortable && (
                    <div className="table-sort-icons">
                      <SortAscIcon
                        className={cn('table-sort-icon', {
                          'table-sort-active':
                            sortConfig?.key === column.key &&
                            sortConfig.direction === 'asc',
                        })}
                      />
                      <SortDescIcon
                        className={cn('table-sort-icon', {
                          'table-sort-active':
                            sortConfig?.key === column.key &&
                            sortConfig.direction === 'desc',
                        })}
                      />
                    </div>
                  )}
                  {column.filterable && (
                    <TableFilter
                      column={column}
                      filters={filters[column.key] || []}
                      onChange={(filterValues) =>
                        handleFilter(column.key, filterValues)
                      }
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table-body">
          {loading ? (
            <tr>
              <td colSpan={columns.length + (selection ? 1 : 0) + (expandable ? 1 : 0)}>
                <TableSkeleton />
              </td>
            </tr>
          ) : (
            processedData.map((record, index) => (
              <TableRow
                key={getRowKey(record, index)}
                record={record}
                index={index}
                columns={columns}
                rowKey={getRowKey(record, index)}
                selection={selection}
                expandable={expandable}
                selectedRowKeys={selectedRowKeys}
                onSelectionChange={setSelectedRowKeys}
                onRow={onRow}
              />
            ))
          )}
        </tbody>
      </table>
      {pagination && (
        <div className="table-pagination">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
};
```

## 游戏功能组件

### 1. 游戏阶段组件

```typescript
/**
 * 游戏阶段指示器
 */
interface GamePhaseIndicatorProps {
  currentPhase: GamePhase;
  phases: GamePhase[];
  onPhaseClick?: (phase: GamePhase) => void;
  className?: string;
}

const GamePhaseIndicator: React.FC<GamePhaseIndicatorProps> = ({
  currentPhase,
  phases,
  onPhaseClick,
  className,
}) => {
  const phaseConfig = {
    [GamePhase.CONSTRUCTION]: {
      label: '建设阶段',
      icon: <BuildingIcon />,
      color: 'blue',
    },
    [GamePhase.OPERATION]: {
      label: '经营阶段',
      icon: <OperationIcon />,
      color: 'green',
    },
    [GamePhase.EXPLORATION]: {
      label: '探险阶段',
      icon: <ExploreIcon />,
      color: 'purple',
    },
    [GamePhase.COMPETITION]: {
      label: '竞争阶段',
      icon: <CompeteIcon />,
      color: 'red',
    },
    [GamePhase.EXPANSION]: {
      label: '扩张阶段',
      icon: <ExpandIcon />,
      color: 'orange',
    },
  };

  return (
    <div className={cn('game-phase-indicator', className)}>
      {phases.map((phase, index) => {
        const config = phaseConfig[phase];
        const isActive = phase === currentPhase;
        const isCompleted = phases.indexOf(currentPhase) > index;
        const isClickable = onPhaseClick && (isCompleted || isActive);

        return (
          <div
            key={phase}
            className={cn('phase-step', {
              'phase-step-active': isActive,
              'phase-step-completed': isCompleted,
              'phase-step-clickable': isClickable,
            })}
            onClick={() => isClickable && onPhaseClick(phase)}
          >
            <div className={`phase-icon phase-icon-${config.color}`}>
              {config.icon}
            </div>
            <div className="phase-label">{config.label}</div>
            {index < phases.length - 1 && (
              <div className="phase-connector" />
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * 游戏状态面板
 */
interface GameStatusPanelProps {
  gameState: GameState;
  className?: string;
}

const GameStatusPanel: React.FC<GameStatusPanelProps> = ({
  gameState,
  className,
}) => {
  const statusItems = [
    {
      label: '现金',
      value: formatCurrency(gameState.player.cash),
      icon: <CashIcon />,
      trend: gameState.player.cashTrend,
    },
    {
      label: '总资产',
      value: formatCurrency(gameState.player.totalAssets),
      icon: <AssetsIcon />,
      trend: gameState.player.assetsTrend,
    },
    {
      label: '月收入',
      value: formatCurrency(gameState.player.monthlyIncome),
      icon: <IncomeIcon />,
      trend: gameState.player.incomeTrend,
    },
    {
      label: '物业数量',
      value: gameState.properties.length.toString(),
      icon: <PropertyIcon />,
    },
    {
      label: '租户数量',
      value: gameState.tenants.length.toString(),
      icon: <TenantIcon />,
    },
    {
      label: '声誉',
      value: gameState.player.reputation.toString(),
      icon: <ReputationIcon />,
      trend: gameState.player.reputationTrend,
    },
  ];

  return (
    <Card className={cn('game-status-panel', className)} title="游戏状态">
      <div className="status-grid">
        {statusItems.map((item) => (
          <div key={item.label} className="status-item">
            <div className="status-icon">{item.icon}</div>
            <div className="status-content">
              <div className="status-label">{item.label}</div>
              <div className="status-value">
                {item.value}
                {item.trend && (
                  <TrendIndicator
                    trend={item.trend}
                    className="status-trend"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

/**
 * 趋势指示器
 */
interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'stable';
  value?: number;
  className?: string;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  trend,
  value,
  className,
}) => {
  const trendConfig = {
    up: {
      icon: <TrendUpIcon />,
      color: 'success',
      label: '上升',
    },
    down: {
      icon: <TrendDownIcon />,
      color: 'danger',
      label: '下降',
    },
    stable: {
      icon: <TrendStableIcon />,
      color: 'neutral',
      label: '稳定',
    },
  };

  const config = trendConfig[trend];

  return (
    <span className={cn('trend-indicator', `trend-${config.color}`, className)}>
      {config.icon}
      {value && (
        <span className="trend-value">
          {value > 0 ? '+' : ''}{value}%
        </span>
      )}
    </span>
  );
};
```

### 2. 物业管理组件

```typescript
/**
 * 物业卡片
 */
interface PropertyCardProps {
  property: Property;
  onSelect?: (property: Property) => void;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
  selected?: boolean;
  className?: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  onEdit,
  onDelete,
  selected,
  className,
}) => {
  const cardActions = (
    <div className="property-card-actions">
      {onEdit && (
        <Button
          variant="secondary"
          size="small"
          icon={<EditIcon />}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(property);
          }}
        >
          编辑
        </Button>
      )}
      {onDelete && (
        <Button
          variant="danger"
          size="small"
          icon={<DeleteIcon />}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(property);
          }}
        >
          删除
        </Button>
      )}
    </div>
  );

  return (
    <Card
      className={cn(
        'property-card',
        {
          'property-card-selected': selected,
        },
        className
      )}
      hoverable
      actions={cardActions}
      onClick={() => onSelect?.(property)}
    >
      <div className="property-card-content">
        <div className="property-image">
          <img
            src={property.imageUrl || '/images/property-placeholder.jpg'}
            alt={property.name}
            className="property-image-img"
          />
          <div className="property-type-badge">
            {getPropertyTypeLabel(property.type)}
          </div>
        </div>
        
        <div className="property-info">
          <h3 className="property-name">{property.name}</h3>
          <p className="property-address">{property.address}</p>
          
          <div className="property-stats">
            <div className="property-stat">
              <span className="stat-label">价值</span>
              <span className="stat-value">
                {formatCurrency(property.currentValue)}
              </span>
            </div>
            <div className="property-stat">
              <span className="stat-label">月收入</span>
              <span className="stat-value">
                {formatCurrency(property.monthlyIncome)}
              </span>
            </div>
            <div className="property-stat">
              <span className="stat-label">入住率</span>
              <span className="stat-value">
                {(property.occupancyRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="property-stat">
              <span className="stat-label">ROI</span>
              <span className="stat-value">
                {(property.roi * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="property-status">
            <PropertyStatusBadge status={property.status} />
            <PropertyConditionIndicator condition={property.condition} />
          </div>
        </div>
      </div>
    </Card>
  );
};

/**
 * 物业状态徽章
 */
interface PropertyStatusBadgeProps {
  status: PropertyStatus;
  className?: string;
}

const PropertyStatusBadge: React.FC<PropertyStatusBadgeProps> = ({
  status,
  className,
}) => {
  const statusConfig = {
    [PropertyStatus.AVAILABLE]: {
      label: '可用',
      color: 'success',
    },
    [PropertyStatus.OCCUPIED]: {
      label: '已出租',
      color: 'primary',
    },
    [PropertyStatus.MAINTENANCE]: {
      label: '维护中',
      color: 'warning',
    },
    [PropertyStatus.RENOVATION]: {
      label: '装修中',
      color: 'info',
    },
    [PropertyStatus.FOR_SALE]: {
      label: '待售',
      color: 'secondary',
    },
  };

  const config = statusConfig[status];

  return (
    <span className={cn('property-status-badge', `badge-${config.color}`, className)}>
      {config.label}
    </span>
  );
};

/**
 * 物业条件指示器
 */
interface PropertyConditionIndicatorProps {
  condition: number; // 0-100
  className?: string;
}

const PropertyConditionIndicator: React.FC<PropertyConditionIndicatorProps> = ({
  condition,
  className,
}) => {
  const getConditionLevel = (condition: number) => {
    if (condition >= 80) return { label: '优秀', color: 'success' };
    if (condition >= 60) return { label: '良好', color: 'primary' };
    if (condition >= 40) return { label: '一般', color: 'warning' };
    if (condition >= 20) return { label: '较差', color: 'danger' };
    return { label: '糟糕', color: 'danger' };
  };

  const level = getConditionLevel(condition);

  return (
    <div className={cn('property-condition-indicator', className)}>
      <div className="condition-label">状况: {level.label}</div>
      <div className="condition-bar">
        <div
          className={`condition-fill condition-fill-${level.color}`}
          style={{ width: `${condition}%` }}
        />
      </div>
      <div className="condition-value">{condition}%</div>
    </div>
  );
};
```

### 3. 租户管理组件

```typescript
/**
 * 租户列表
 */
interface TenantListProps {
  tenants: Tenant[];
  loading?: boolean;
  onTenantSelect?: (tenant: Tenant) => void;
  onTenantInteract?: (tenant: Tenant, action: string) => void;
  className?: string;
}

const TenantList: React.FC<TenantListProps> = ({
  tenants,
  loading,
  onTenantSelect,
  onTenantInteract,
  className,
}) => {
  const columns: TableColumn<Tenant>[] = [
    {
      key: 'avatar',
      title: '',
      width: 60,
      render: (_, tenant) => (
        <Avatar
          src={tenant.avatar}
          name={tenant.name}
          size="medium"
        />
      ),
    },
    {
      key: 'name',
      title: '姓名',
      dataIndex: 'name',
      sortable: true,
      render: (name, tenant) => (
        <div className="tenant-name-cell">
          <div className="tenant-name">{name}</div>
          <div className="tenant-category">
            {getTenantCategoryLabel(tenant.category)}
          </div>
        </div>
      ),
    },
    {
      key: 'property',
      title: '物业',
      render: (_, tenant) => (
        <div className="tenant-property-cell">
          <div className="property-name">{tenant.property?.name}</div>
          <div className="unit-number">单元 {tenant.unitNumber}</div>
        </div>
      ),
    },
    {
      key: 'rent',
      title: '租金',
      dataIndex: 'monthlyRent',
      sortable: true,
      align: 'right',
      render: (rent) => formatCurrency(rent),
    },
    {
      key: 'satisfaction',
      title: '满意度',
      dataIndex: 'satisfaction',
      sortable: true,
      render: (satisfaction) => (
        <SatisfactionIndicator
          value={satisfaction}
          showValue
        />
      ),
    },
    {
      key: 'leaseEnd',
      title: '租约到期',
      dataIndex: 'leaseEndDate',
      sortable: true,
      render: (date) => (
        <div className="lease-end-cell">
          <div className="lease-date">{formatDate(date)}</div>
          <div className="lease-remaining">
            {getDaysUntil(date)} 天后
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      filterable: true,
      filters: [
        { text: '正常', value: 'active' },
        { text: '逾期', value: 'overdue' },
        { text: '即将到期', value: 'expiring' },
        { text: '已搬出', value: 'moved_out' },
      ],
      render: (status) => <TenantStatusBadge status={status} />,
    },
    {
      key: 'actions',
      title: '操作',
      width: 200,
      render: (_, tenant) => (
        <div className="tenant-actions">
          <Button
            size="small"
            variant="secondary"
            onClick={() => onTenantInteract?.(tenant, 'contact')}
          >
            联系
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() => onTenantInteract?.(tenant, 'adjust_rent')}
          >
            调租
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() => onTenantInteract?.(tenant, 'renew_lease')}
          >
            续租
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={cn('tenant-list', className)}>
      <Table
        columns={columns}
        dataSource={tenants}
        loading={loading}
        rowKey="id"
        onRow={(tenant) => ({
          onClick: () => onTenantSelect?.(tenant),
          className: 'tenant-row',
        })}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `显示 ${range[0]}-${range[1]} 条，共 ${total} 条`,
        }}
      />
    </div>
  );
};

/**
 * 满意度指示器
 */
interface SatisfactionIndicatorProps {
  value: number; // 0-100
  showValue?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const SatisfactionIndicator: React.FC<SatisfactionIndicatorProps> = ({
  value,
  showValue,
  size = 'medium',
  className,
}) => {
  const getSatisfactionLevel = (value: number) => {
    if (value >= 80) return { label: '非常满意', color: 'success', icon: <HappyIcon /> };
    if (value >= 60) return { label: '满意', color: 'primary', icon: <SmileIcon /> };
    if (value >= 40) return { label: '一般', color: 'warning', icon: <NeutralIcon /> };
    if (value >= 20) return { label: '不满意', color: 'danger', icon: <SadIcon /> };
    return { label: '非常不满意', color: 'danger', icon: <AngryIcon /> };
  };

  const level = getSatisfactionLevel(value);

  return (
    <div className={cn('satisfaction-indicator', `satisfaction-${size}`, className)}>
      <div className="satisfaction-icon">{level.icon}</div>
      <div className="satisfaction-bar">
        <div
          className={`satisfaction-fill satisfaction-fill-${level.color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      {showValue && (
        <div className="satisfaction-value">{value}%</div>
      )}
    </div>
  );
};

/**
 * 租户状态徽章
 */
interface TenantStatusBadgeProps {
  status: TenantStatus;
  className?: string;
}

const TenantStatusBadge: React.FC<TenantStatusBadgeProps> = ({
  status,
  className,
}) => {
  const statusConfig = {
    active: { label: '正常', color: 'success' },
    overdue: { label: '逾期', color: 'danger' },
    expiring: { label: '即将到期', color: 'warning' },
    moved_out: { label: '已搬出', color: 'secondary' },
  };

  const config = statusConfig[status];

  return (
    <span className={cn('tenant-status-badge', `badge-${config.color}`, className)}>
      {config.label}
    </span>
  );
};
```

## 图表和数据可视化组件

### 1. 基础图表组件

```typescript
/**
 * 折线图组件
 */
interface LineChartProps {
  data: ChartDataPoint[];
  xKey: string;
  yKey: string;
  title?: string;
  height?: number;
  color?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  className?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  xKey,
  yKey,
  title,
  height = 300,
  color = '#1890ff',
  showGrid = true,
  showTooltip = true,
  className,
}) => {
  return (
    <div className={cn('line-chart', className)}>
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="chart-container" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            <Line
              type="monotone"
              dataKey={yKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/**
 * 柱状图组件
 */
interface BarChartProps {
  data: ChartDataPoint[];
  xKey: string;
  yKey: string;
  title?: string;
  height?: number;
  color?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  className?: string;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  xKey,
  yKey,
  title,
  height = 300,
  color = '#52c41a',
  showGrid = true,
  showTooltip = true,
  className,
}) => {
  return (
    <div className={cn('bar-chart', className)}>
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="chart-container" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            <Bar dataKey={yKey} fill={color} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/**
 * 饼图组件
 */
interface PieChartProps {
  data: PieChartDataPoint[];
  nameKey: string;
  valueKey: string;
  title?: string;
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
  className?: string;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  nameKey,
  valueKey,
  title,
  height = 300,
  colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'],
  showLegend = true,
  showTooltip = true,
  className,
}) => {
  const dataWithColors = data.map((item, index) => ({
    ...item,
    fill: colors[index % colors.length],
  }));

  return (
    <div className={cn('pie-chart', className)}>
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="chart-container" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={dataWithColors}
              dataKey={valueKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
```

### 2. 业务图表组件

```typescript
/**
 * 财务趋势图
 */
interface FinancialTrendChartProps {
  data: FinancialData[];
  metrics: ('income' | 'expense' | 'profit' | 'cash')[];
  timeRange: string;
  className?: string;
}

const FinancialTrendChart: React.FC<FinancialTrendChartProps> = ({
  data,
  metrics,
  timeRange,
  className,
}) => {
  const metricConfig = {
    income: { label: '收入', color: '#52c41a' },
    expense: { label: '支出', color: '#f5222d' },
    profit: { label: '利润', color: '#1890ff' },
    cash: { label: '现金', color: '#faad14' },
  };

  return (
    <Card className={cn('financial-trend-chart', className)} title="财务趋势">
      <div className="chart-controls">
        <Select
          value={timeRange}
          options={[
            { value: '7d', label: '最近7天' },
            { value: '30d', label: '最近30天' },
            { value: '90d', label: '最近90天' },
            { value: '1y', label: '最近1年' },
          ]}
        />
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <RechartsLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [
                formatCurrency(value as number),
                metricConfig[name as keyof typeof metricConfig]?.label,
              ]}
            />
            <Legend />
            {metrics.map((metric) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={metricConfig[metric].color}
                strokeWidth={2}
                name={metricConfig[metric].label}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

/**
 * 物业收益分析图
 */
interface PropertyROIChartProps {
  properties: Property[];
  className?: string;
}

const PropertyROIChart: React.FC<PropertyROIChartProps> = ({
  properties,
  className,
}) => {
  const chartData = properties.map((property) => ({
    name: property.name,
    roi: property.roi * 100,
    income: property.monthlyIncome,
    value: property.currentValue,
  }));

  return (
    <Card className={cn('property-roi-chart', className)} title="物业收益分析">
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => {
                if (name === 'roi') return [`${value}%`, 'ROI'];
                return [formatCurrency(value as number), name === 'income' ? '月收入' : '物业价值'];
              }}
            />
            <Legend />
            <Bar dataKey="roi" fill="#1890ff" name="ROI (%)" />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
```

## 组件样式系统

### CSS 变量和主题

```css
/* 主题变量 */
:root {
  /* 颜色系统 */
  --color-primary: #1890ff;
  --color-primary-hover: #40a9ff;
  --color-primary-active: #096dd9;
  
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-danger: #f5222d;
  --color-info: #13c2c2;
  
  --color-text-primary: #262626;
  --color-text-secondary: #595959;
  --color-text-disabled: #bfbfbf;
  
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #fafafa;
  --color-bg-disabled: #f5f5f5;
  
  --color-border: #d9d9d9;
  --color-border-light: #f0f0f0;
  
  /* 间距系统 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;
  
  /* 字体系统 */
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-xxl: 24px;
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* 圆角系统 */
  --border-radius-sm: 4px;
  --border-radius-md: 6px;
  --border-radius-lg: 8px;
  --border-radius-xl: 12px;
  
  /* 阴影系统 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.03);
  --shadow-md: 0 1px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.15);
  --shadow-xl: 0 8px 24px rgba(0, 0, 0, 0.2);
  
  /* 动画系统 */
  --transition-fast: 0.1s ease;
  --transition-normal: 0.2s ease;
  --transition-slow: 0.3s ease;
}

/* 暗色主题 */
[data-theme="dark"] {
  --color-text-primary: #ffffff;
  --color-text-secondary: #a6a6a6;
  --color-text-disabled: #595959;
  
  --color-bg-primary: #141414;
  --color-bg-secondary: #1f1f1f;
  --color-bg-disabled: #262626;
  
  --color-border: #434343;
  --color-border-light: #303030;
}
```

## 总结

这个组件设计文档提供了一个完整的前端组件架构，包括：

1. **分层架构**: 清晰的组件层次结构
2. **通用组件**: 可复用的基础 UI 组件
3. **业务组件**: 游戏特定的功能组件
4. **数据可视化**: 图表和分析组件
5. **样式系统**: 统一的设计令牌和主题
6. **类型安全**: 完整的 TypeScript 类型定义
7. **可访问性**: 符合 WCAG 标准的无障碍设计
8. **响应式设计**: 适配不同屏幕尺寸

这个设计为物业管理模拟器提供了可维护、可扩展的前端组件基础。