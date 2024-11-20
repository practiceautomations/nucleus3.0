import React from 'react';

import Icon from '@/components/Icon';

interface SectionHeadingInterface {
  label: string;
  isCollapsable?: boolean;
  onClick?: (ev: React.MouseEvent) => void;
  isCollapsed?: boolean;
  hideBottomDivider?: boolean;
  rightContent?: React.ReactNode;
}

export default function SectionHeading({
  label,
  isCollapsable = false,
  onClick,
  isCollapsed,
  hideBottomDivider = false,
  rightContent,
}: SectionHeadingInterface) {
  return (
    <div className="relative text-left font-bold text-gray-700">
      <div className={`absolute left-0 top-0 gap-2 inline-flex items-center `}>
        <div
          className="inline-flex !cursor-pointer items-center gap-2"
          onClick={onClick}
        >
          {isCollapsable && (
            <Icon
              name={'chevronDown'}
              size={18}
              className={isCollapsed ? '-rotate-90' : ''}
            />
          )}
          <p className={`text-xl m-0 sm:text-xl`}>{label}</p>
        </div>
        {rightContent}
      </div>
      <div
        hidden={hideBottomDivider}
        className={`h-5 absolute left-0 top-8 w-full`}
      >
        <div
          className={`inset-x-0 h-px absolute bg-gray-300 top-[calc(50%_-_0.5px_+_0.5px)]`}
        ></div>
      </div>
    </div>
  );
}
