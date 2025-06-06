import React, { useEffect, useRef } from 'react';
import { MarketTrend } from '../../types/game-state';
import './MarketTrendChart.css';

export interface MarketTrendChartProps {
  /** 市场趋势数据 */
  trends: MarketTrend[];
  /** 图表宽度 */
  width?: number;
  /** 图表高度 */
  height?: number;
  /** 是否显示图例 */
  showLegend?: boolean;
  /** 是否显示网格 */
  showGrid?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 市场趋势图表组件
 * 用于可视化展示市场趋势变化
 */
const MarketTrendChart: React.FC<MarketTrendChartProps> = ({
  trends,
  width = 600,
  height = 300,
  showLegend = true,
  showGrid = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 绘制图表
  useEffect(() => {
    if (!canvasRef.current || trends.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 设置画布尺寸
    canvas.width = width;
    canvas.height = height;

    // 图表边距
    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // 找出数据范围
    const minEffect = Math.min(...trends.map(trend => trend.effect));
    const maxEffect = Math.max(...trends.map(trend => trend.effect));
    
    // 计算比例尺
    const xScale = chartWidth / (trends.length - 1 || 1);
    const yScale = chartHeight / (Math.max(Math.abs(minEffect), Math.abs(maxEffect)) * 2 || 1);

    // 绘制网格
    if (showGrid) {
      ctx.beginPath();
      ctx.strokeStyle = '#e8e8e8';
      ctx.lineWidth = 0.5;

      // 水平网格线
      for (let i = 0; i <= 10; i++) {
        const y = margin.top + chartHeight - (i / 10) * chartHeight;
        ctx.moveTo(margin.left, y);
        ctx.lineTo(margin.left + chartWidth, y);
      }

      // 垂直网格线
      for (let i = 0; i <= trends.length - 1; i++) {
        const x = margin.left + i * xScale;
        ctx.moveTo(x, margin.top);
        ctx.lineTo(x, margin.top + chartHeight);
      }

      ctx.stroke();
    }

    // 绘制x轴和y轴
    ctx.beginPath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    
    // x轴
    ctx.moveTo(margin.left, margin.top + chartHeight / 2);
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight / 2);
    
    // y轴
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);
    
    ctx.stroke();

    // 绘制趋势线
    ctx.beginPath();
    ctx.strokeStyle = '#1890ff';
    ctx.lineWidth = 2;
    
    // 移动到第一个点
    const firstY = margin.top + chartHeight / 2 - trends[0].effect * yScale;
    ctx.moveTo(margin.left, firstY);
    
    // 绘制线段连接各点
    for (let i = 1; i < trends.length; i++) {
      const x = margin.left + i * xScale;
      const y = margin.top + chartHeight / 2 - trends[i].effect * yScale;
      ctx.lineTo(x, y);
    }
    
    ctx.stroke();

    // 绘制数据点
    trends.forEach((trend, i) => {
      const x = margin.left + i * xScale;
      const y = margin.top + chartHeight / 2 - trend.effect * yScale;
      
      ctx.beginPath();
      ctx.fillStyle = trend.effect >= 0 ? '#52c41a' : '#f5222d';
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // 绘制图例
    if (showLegend) {
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      
      // x轴标签
      trends.forEach((trend, i) => {
        const x = margin.left + i * xScale;
        ctx.fillStyle = '#000';
        ctx.fillText(trend.name.substring(0, 10), x, height - 10);
      });
      
      // y轴标签
      ctx.textAlign = 'right';
      for (let i = 0; i <= 10; i++) {
        const y = margin.top + chartHeight - (i / 10) * chartHeight;
        const value = minEffect + (i / 10) * (maxEffect - minEffect);
        ctx.fillStyle = '#000';
        ctx.fillText(value.toFixed(1), margin.left - 5, y + 4);
      }
    }

  }, [trends, width, height, showLegend, showGrid]);

  return (
    <div className={`market-trend-chart ${className}`}>
      <h3 className="chart-title">市场趋势分析</h3>
      <canvas ref={canvasRef} width={width} height={height} />
      {showLegend && (
        <div className="trend-legend">
          {trends.map((trend, index) => (
            <div 
              key={index} 
              className={`trend-legend-item ${trend.effect >= 0 ? 'positive' : 'negative'}`}
            >
              <span className="trend-legend-color"></span>
              <span className="trend-legend-name">{trend.name}</span>
              <span className="trend-legend-value">{trend.effect > 0 ? '+' : ''}{trend.effect.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketTrendChart; 