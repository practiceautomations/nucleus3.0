import React from 'react';

import Icon from '@/components/Icon';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

export interface TProps {
  value: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
  testId?: string;
}

export default function ToggleButton({
  value,
  disabled,
  onChange,
  testId,
}: TProps) {
  return (
    <button
      data-testid={`ToggleBtn-${testId}`}
      className={classNames(
        value ? 'bg-cyan-500' : 'bg-gray-200',
        'relative flex items-center h-[25px] w-[44px] h-full rounded-full'
      )}
      onClick={() => {
        if (onChange) onChange(!value);
      }}
      disabled={!onChange || disabled}
    >
      <div
        className={classNames(
          value
            ? 'right-[2px] p-[5px] mt-[1px]'
            : 'left-[2px] p-[6px] ml-[0.5px] mt-[0.5px]',
          'absolute w-[20px] h-[20px] flex items-center justify-center bg-white shadow rounded-full'
        )}
      >
        <Icon
          name={value ? 'tickBolt' : 'closeBolt'}
          size={12}
          color={IconColors.GRAY_300}
        />
      </div>
    </button>
  );
}
