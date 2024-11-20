import Chart from 'chart.js/auto';
import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { PopoverDropdownDataType } from '../PopoverDropdown/Index';

export interface DataSetType {
  label: string;
  data: any[];
  backgroundColor: string;
  barPercentage: number;
  categoryPercentage: number;
}
export interface GraphProps {
  type: 'bar' | 'line';
  label: string | null;
  data: any[];
  children?: React.ReactNode;
  selectedDateRange?: PopoverDropdownDataType;
  dataSets: any[];
  dateLabels?: string[];
  yAxisLabelsAppendFront?: string;
  yAxisLabelsAppendEnd?: string;
  widthCls?: string;
  heightCls?: string;
  displayLegend?: boolean;
}
const BarGraph = ({
  type,
  label,
  data,
  children,
  dataSets,
  dateLabels,
  yAxisLabelsAppendFront = '',
  yAxisLabelsAppendEnd = '',
  widthCls = '',
  heightCls = '414px',
  displayLegend = true,
}: GraphProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);
  const [dataSetState, setDataSetState] = useState<any[]>([]);
  useEffect(() => {
    if (dataSets) {
      setDataSetState(dataSets);
    }
  }, [dataSets]);
  useEffect(() => {
    if (chartInstance) {
      chartInstance.destroy();
    }
    const ctx = chartRef.current?.getContext('2d');
    if (!ctx) {
      return;
    }
    if (ctx) {
      const labels = dateLabels;
      const plugin = {
        id: 'customCanvasBackgroundColor',
        beforeDraw: (chart: Chart, _args: any, options: { color?: string }) => {
          const { ctx: chartContext } = chart;
          chartContext.save();
          chartContext.globalCompositeOperation = 'destination-over';
          chartContext.fillStyle = options.color || 'white';
          chartContext.fillRect(0, 0, chart.width, chart.height);
          chartContext.restore();
        },
      };
      const chart = new Chart(ctx, {
        type,
        data: {
          labels,
          datasets: dataSets,
        },
        options: {
          // Disable the default animation
          animations: {
            // Set the animation for each axis separately
            x: {
              type: 'number',
              easing: 'linear',
              duration: 100,
              from: NaN,
              delay(ctx1) {
                return ctx1.dataIndex * 100;
              },
            },
            y: {
              type: 'number',
              easing: 'linear',
              duration: 500,
              from: (ctx2) => ctx2.chart.scales.y?.getPixelForValue(0),
              delay(ctx3) {
                return ctx3.dataIndex * 100;
              },
            },
          },
          transitions: {},
          maintainAspectRatio: false, // Add this line to prevent height changes

          plugins: {
            legend: {
              display: displayLegend,
              position: 'bottom', // Position at the bottom
              labels: {
                font: {
                  size: 14,
                },
                usePointStyle: true, // Circular icon for legend
              },
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                font: {
                  size: 14,
                },
              },
            },
            y: {
              grid: {},
              beginAtZero: true,
              position: 'left',
              ticks: {
                font: {
                  size: 14,
                },
                callback(value) {
                  return (
                    yAxisLabelsAppendFront +
                    value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
                    yAxisLabelsAppendEnd
                  );
                },
              },
            },
          },
          layout: {
            padding: {
              left: 10,
              right: 10,
              top: 20,
              bottom: 20,
            },
          },
        },
        plugins: [plugin],
      });
      setChartInstance(chart);
    }
  }, [data, dataSetState]);
  return (
    <div
      style={{
        width: '100%',
        backgroundColor: 'white',
        color: '#707070', // Use appropriate color value for text
        ...(label
          ? {
              borderRadius: '0.375rem',
              border: '1px solid #D1D5DB', // Use appropriate border color
            }
          : {}),
      }}
    >
      <div className="flex flex-col px-[16px]">
        {label && (
          <>
            <div className="py-[19px] text-base font-bold  leading-6">
              {label}
            </div>
            <div className={``}>
              <div className={`h-[1px] w-full bg-gray-200`} />
            </div>
          </>
        )}
        <div>
          <canvas
            id={uuidv4()}
            ref={chartRef}
            style={{ height: heightCls, width: widthCls }}
          />
        </div>

        {children}
      </div>
    </div>
  );
};
export default BarGraph;
