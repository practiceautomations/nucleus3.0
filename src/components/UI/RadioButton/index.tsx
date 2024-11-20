import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import classNames from '@/utils/classNames';

export interface RadioGroupDataType {
  value: string;
  label?: string;
}
export interface RadioButtonProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  checkedValue?: string;
  cls?: string;
  data: RadioGroupDataType[];
}
export default function RadioButton({
  checkedValue,
  disabled,
  cls = '',
  data,
  ...rest
}: RadioButtonProps) {
  const radioFeildName = uuidv4();
  return (
    <div className="inline-flex flex-wrap space-x-4">
      {data.map((radioData, index) => (
        <>
          <div key={`${index}`} className="flex space-x-1 ">
            <input
              data-testid="radiobuttons"
              {...rest}
              type="radio"
              disabled={disabled}
              value={radioData.value}
              name={radioFeildName}
              checked={checkedValue === radioData.value}
              className={classNames(
                'min-w-4 min-h-4 p-1 rounded-full',
                disabled
                  ? 'focus:ring-gray-500 text-gray-500 '
                  : 'focus:ring-cyan-500 text-cyan-500 ',
                cls || ''
              )}
            />
            <p className="text-sm font-medium leading-tight text-gray-700">
              {radioData.label}
            </p>
          </div>
        </>
      ))}
    </div>
  );
}
