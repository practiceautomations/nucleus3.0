import React from 'react';

export interface StageWidgetProps {
  label: string;
  count: string;
  onClick?: (ev: React.MouseEvent) => void;
  color?: string;
}
export default function StageWidget({
  label,
  count,
  onClick,
  color = 'gray',
}: StageWidgetProps) {
  return (
    <div
      className={`w-full rounded-md border border-${color}-300 bg-${color}-100 p-6 `}
    >
      <div title={label} className="flex flex-col gap-1 ">
        <p
          className={`block self-stretch truncate text-base font-normal leading-6 text-${color}-700`}
        >
          {label}
        </p>
        <div className="flex justify-between gap-2">
          <p
            className={`self-stretch text-2xl font-extrabold leading-8 text-${color}-700`}
          >
            {count}
          </p>
          <button
            onClick={onClick}
            className="items-center self-end bg-transparent text-cyan-500 "
          >
            view all
          </button>
        </div>
      </div>
    </div>
  );
}
