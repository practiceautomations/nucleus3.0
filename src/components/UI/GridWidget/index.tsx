import React from 'react';

import classNames from '@/utils/classNames';

export enum GridWidgetColor {
  RED = 'red',
  YELLOW = 'yellow',
  GREEN = 'green',
  GRAY = 'gray',
}
export interface GridWidgetProps {
  label: string;
  count: string;
  onClickHeaderViewAll?: (ev: React.MouseEvent) => void;
  gridWidgetColor: GridWidgetColor;
  onClickGridViewAll?: (id: number) => void;
  gridData: GridDataType[];
}
export interface GridDataType {
  id: number;
  count: number;
  value: string;
  isDraft?: boolean;
}

const bgColorsByType: { [key in GridWidgetColor]: string } = {
  [GridWidgetColor.RED]: 'bg-red-100',
  [GridWidgetColor.YELLOW]: 'bg-yellow-100',
  [GridWidgetColor.GREEN]: 'bg-green-100',
  [GridWidgetColor.GRAY]: 'bg-gray-100',
};

const fontColorsByType: { [key in GridWidgetColor]: string } = {
  [GridWidgetColor.RED]: 'text-red-800',
  [GridWidgetColor.YELLOW]: 'text-yellow-800',
  [GridWidgetColor.GREEN]: 'text-green-800',
  [GridWidgetColor.GRAY]: 'text-gray-800',
};
const borderColorsByType: { [key in GridWidgetColor]: string } = {
  [GridWidgetColor.RED]: ' border-red-300',
  [GridWidgetColor.YELLOW]: 'border-yellow-300',
  [GridWidgetColor.GREEN]: 'border-green-300',
  [GridWidgetColor.GRAY]: 'border-gray-300',
};

export default function GridWidget({
  label,
  count,
  onClickHeaderViewAll,
  gridWidgetColor = GridWidgetColor.RED,
  onClickGridViewAll,
  gridData,
}: GridWidgetProps) {
  return (
    <div
      className={classNames(
        'flex flex-col w-full h-full rounded-md box-border border',
        borderColorsByType[gridWidgetColor]
      )}
    >
      <div
        className={classNames(
          'w-full rounded-md',
          bgColorsByType[gridWidgetColor]
        )}
      >
        <div
          className={classNames(
            'flex flex-col  gap-1 py-[8px] px-[24px]',
            fontColorsByType[gridWidgetColor]
          )}
        >
          <p
            title={label}
            className="self-stretch truncate text-base font-normal leading-6"
          >
            {label}
          </p>
          <div className="flex justify-between gap-2">
            <p className="self-stretch text-2xl font-extrabold leading-8 ">
              {count}
            </p>
            <button
              onClick={onClickHeaderViewAll}
              className="items-center self-end bg-transparent text-cyan-500 "
            >
              view all
            </button>
          </div>
        </div>
      </div>
      <div className="no-scrollbar max-h-[275px] w-full overflow-y-auto rounded-b-md bg-white">
        <div className="flex w-full flex-col gap-4 p-6">
          {gridData.map((row) => {
            return (
              <div
                key={row.id}
                className={classNames(
                  'flex text-xs justify-between font-medium  gap-2',
                  row?.isDraft === true
                    ? fontColorsByType[GridWidgetColor.GRAY]
                    : fontColorsByType[gridWidgetColor]
                )}
              >
                <div className="self-end">
                  <div
                    className={classNames(
                      ' rounded-[10px] px-2.5 py-0.5 text-center justify-center leading-4',
                      row?.isDraft === true
                        ? bgColorsByType[GridWidgetColor.GRAY]
                        : bgColorsByType[gridWidgetColor]
                    )}
                  >
                    {row.count}
                  </div>
                </div>
                <div className="w-[68%] self-end">
                  <div
                    className={classNames(
                      ' rounded w-fit px-2.5 py-0.5 text-satrt justify-center leading-4',
                      row?.isDraft === true
                        ? bgColorsByType[GridWidgetColor.GRAY]
                        : bgColorsByType[gridWidgetColor]
                    )}
                  >
                    {row.value}
                  </div>
                </div>
                <div className="h-[20px] self-end">
                  <button
                    onClick={() => {
                      if (onClickGridViewAll) onClickGridViewAll(row.id);
                    }}
                    className="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "
                  >
                    view all
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
