import React from 'react';

import Icon from '@/components/Icon';
import classNames from '@/utils/classNames';

export interface ButtonsGroupDataType {
  id: number;
  name: string;
  icon: string;
  disabled?: boolean;
}

export interface ButtonsGroupProps {
  data: ButtonsGroupDataType[];
  onClick: (v: ButtonsGroupDataType) => void;
  cls?: string;
  btnCls?: string;
}

const ButtonsGroup = ({ data, onClick, cls, btnCls }: ButtonsGroupProps) => {
  return (
    <div className={classNames('h-[38px] flex', cls)}>
      {data.map((d, i) => {
        return (
          <button
            key={i}
            className={classNames(
              `flex items-center justify-center gap-2 border border-solid border-gray-300 py-[9px] pl-[13px] pr-[17px] text-left font-medium text-gray-700`,
              i === 0 ? 'rounded-l-md' : '',
              i + 1 === data.length ? 'rounded-r-md' : '',
              d.disabled ? 'bg-gray-50' : 'bg-white',
              btnCls
            )}
            disabled={d.disabled}
            onClick={() => {
              onClick(d);
            }}
          >
            <Icon name={d.icon} size={18} />
            <p className="text-sm">{d.name}</p>
          </button>
        );
      })}
    </div>
  );
};

export default ButtonsGroup;
