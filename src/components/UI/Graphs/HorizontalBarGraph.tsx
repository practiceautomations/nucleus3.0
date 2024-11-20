import Chart from 'chart.js/auto';
import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import classNames from '@/utils/classNames';

import type { PopoverDropdownDataType } from '../PopoverDropdown/Index';

export interface HorizontalBarGraphProps {
  type: 'bar';
  label: string | null;
  data: any[];
  children: React.ReactNode;
  selectedDateRange?: PopoverDropdownDataType;
  dataSets: any[];
  dateLabels?: string[];
  yAxisLabelsAppendFront?: string;
  yAxisLabelsAppendEnd?: string;
  widthCls?: string;
  heightCls?: string;
  displayLegend?: boolean;
}

const HorizontalBarGraph = ({
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
}: HorizontalBarGraphProps) => {
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
        indexAxis: 'y',
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
        },
        scales: {
          x: {
            border: {
              display: false,
            },
            grid: {
              display: true,
            },
            beginAtZero: true,
            position: 'bottom',
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
          y: {
            border: {
              display: false,
            },
            grid: {
              display: false,
            },
            beginAtZero: true,
            ticks: {
              padding: 0,
              callback(value) {
                const labell =
                  typeof value === 'number' && labels ? labels[value] : '';
                if (
                  labell &&
                  labels &&
                  typeof value === 'number' &&
                  labell.length > 10 &&
                  labels.length > 3
                ) {
                  const substrings = [];
                  for (let i = 0; i < labell.length; i += 10) {
                    substrings.push(labell.substr(i, 10));
                  }
                  return `${substrings[0]}...`;
                }
                if (
                  labell &&
                  labels &&
                  typeof value === 'number' &&
                  labell.length > 10 &&
                  labels.length <= 3
                ) {
                  const splitableLabels = labell.replace(/ /g, ',');
                  return splitableLabels ? splitableLabels.split(',') : '';
                }

                return labell || '';
              },
            },
          },
        },
        layout: {
          padding: 2,
        },
      },
      plugins: [plugin],
    });

    setChartInstance(chart);

    // eslint-disable-next-line consistent-return
    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, [data, dataSetState]);

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
export default HorizontalBarGraph;
