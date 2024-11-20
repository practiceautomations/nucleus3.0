import type { HTMLInputTypeAttribute } from 'react';
import React from 'react';

import classNames from '@/utils/classNames';

export interface InputProps
  extends Omit<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    'value'
  > {
  cls?: string | undefined;
  inputCls?: string | undefined;
  type?: HTMLInputTypeAttribute | undefined;
  autoFocus?: boolean;
  value?: string | number | readonly string[] | undefined | null;
}

const InputField = ({
  disabled,
  cls = '',
  inputCls = '',
  type = 'text',
  autoFocus = false,
  value,
  ...rest
}: InputProps) => {
  const grayText = disabled ? 'text-gray-500 bg-gray-100' : 'bg-white';
  return (
    <div className={classNames(cls, `mt-1 `, grayText)}>
      <input
        {...rest}
        ref={(input) => {
          setTimeout(() => {
            if (autoFocus && input) input.focus();
          }, 500);
        }}
        value={value === null ? '' : value}
        disabled={disabled}
        className={classNames(
          'h-[38px] w-full placeholder:text-gray-400 sm:text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:ring-offset-0 rounded-md focus:border-gray-300     border-solid border border-gray-300 gap-2 inline-flex items-center rounded-md text-gray-900 leading-5 text-left font-normal  w-full overflow-clip',
          disabled ? 'bg-gray-100' : 'bg-white',
          grayText,
          inputCls
        )}
        type={type}
      />
    </div>
  );
};

export default InputField;
