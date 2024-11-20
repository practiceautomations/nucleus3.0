import React from 'react';

import classNames from '@/utils/classNames';

export interface SingleItemWidgetProps {
  title?: string;
  isClickable?: boolean;
  onClick?: () => void;
  text: string;
  icon?: JSX.Element;
  subText?: string;
  subText1?: string;
}
const SingleItemWidget = ({
  title,
  isClickable = false,
  onClick,
  text,
  icon,
  subText,
  subText1,
}: SingleItemWidgetProps) => {
  return (
    <div className=" flex h-full w-auto gap-2  p-[16px] text-left ">
      {icon}
      <div className="flex flex-col self-center text-left">
        {title && (
          <p className="text-sm font-bold leading-5 text-gray-600">
            {title}&nbsp;
          </p>
        )}
        <div
          className={classNames(
            'text-sm font-semibold leading-tight ',
            isClickable
              ? 'text-cyan-500 underline cursor-pointer'
              : 'text-gray-600 cursor-default'
          )}
          onClick={onClick}
        >
          {text}
        </div>
        {subText && (
          <p className="text-sm font-normal leading-4 text-gray-400 ">
            {subText}
          </p>
        )}
        {subText1 && (
          <p className="text-sm font-normal leading-4 text-gray-400">
            {subText1}
          </p>
        )}
      </div>
    </div>
  );
};

export default SingleItemWidget;
