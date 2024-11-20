import Chart from 'chart.js/auto';
import type { AnnotationType } from 'chartjs-plugin-annotation';
import annotationPlugin from 'chartjs-plugin-annotation';
import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import classNames from '@/utils/classNames';

import type { PopoverDropdownDataType } from '../PopoverDropdown/Index';

export interface DataSetType {
  label: string;
  data: any[];
  backgroundColor: string;
  barPercentage: number;
  categoryPercentage: number;
}
export interface GraphWithAnnotationsProps {
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
  annotationType?: AnnotationType;
  annotationValue?: number;
  annotations?: any;
}
const GraphWithAnnotations = ({
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
  // annotationType = 'line',
  // annotationValue = 0,
  annotations,
}: GraphWithAnnotationsProps) => {
  Chart.register(annotationPlugin);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);

  useEffect(() => {
    if (chartInstance) {
      chartInstance.destroy();
    }

    const ctx = chartRef.current?.getContext('2d');

    if (ctx && dataSets.length > 0) {
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
              position: 'bottom',
              labels: {
                usePointStyle: true,
              },
            },
            annotation: {
              common: {
                drawTime: 'beforeDraw',
              },
              annotations,
            },
          },
          scales: {
            x: {
              // grace: '20%',
              border: {
                display: false,
              },
              grid: {
                drawOnChartArea: false,
                display: false,
              },
              beginAtZero: true,
            },
            y: {
              // grace: '20%',
              border: {
                display: false,
              },
              grid: {
                // drawOnChartArea: false,
              },
              stacked: true,
              beginAtZero: true,
              position: 'left',
              ticks: {
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
            padding: 24,
          },
        },
        plugins: [plugin],
      });
      setChartInstance(chart);
    }

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [dataSets, dateLabels, data]);

  return (
    <div
      className={classNames(
        'w-full bg-white text-gray-700',
        label ? 'rounded-md border border-gray-300' : ''
      )}
    >
      <div className="flex flex-col">
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
export default GraphWithAnnotations;
