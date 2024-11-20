import React from 'react';

import classNames from '@/utils/classNames';

export interface DashboardTilesProps {
  onClick?: (ev: React.MouseEvent) => void;
  tileTitle: string;
  tilesColor: string;
  count?: string;
  onClickView?: (value: string) => void;
  isShowViewButton?: boolean;
  subTextNextToCount?: string;
}

export default function DashboardTiles({
  tileTitle = '',
  tilesColor = '',
  onClickView,
  count = '0',
  isShowViewButton = true,
  subTextNextToCount = '',
}: DashboardTilesProps) {
  return (
    <>
      <div
        className={classNames(
          ` w-full h-full p-4 bg-${tilesColor}-50 rounded-md border border-${tilesColor}-300 justify-start items-start flex`
        )}
      >
        <div className="flex h-full w-full flex-col justify-between gap-1">
          <div
            title={tileTitle}
            className={classNames(
              `text-${tilesColor}-500 text-sm font-medium leading-tight truncate items-start`
            )}
          >
            {tileTitle}
          </div>
          <div className="w-full">
            <div className="flex h-full shrink grow basis-0 items-end justify-between">
              <div className="inline-flex items-baseline justify-start gap-2">
                <div
                  className={classNames(
                    `text-${tilesColor}-500 text-xl font-extrabold leading-7`
                  )}
                >
                  {count}
                </div>
                <div
                  className={classNames(
                    `text-${tilesColor}-500 text-xs font-normal leading-none`
                  )}
                >
                  {subTextNextToCount}
                </div>
              </div>
              {isShowViewButton && (
                <button
                  className="text-xs font-normal leading-none text-cyan-500 underline"
                  onClick={() => {
                    if (onClickView) {
                      onClickView(tileTitle);
                    }
                  }}
                >
                  View All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
