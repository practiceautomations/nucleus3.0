import React from 'react';

import classNames from '@/utils/classNames';

export interface CheckBoxProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  cls?: string;
}

export default function CheckBox({ cls = '', ...rest }: CheckBoxProps) {
  return (
    <input
      {...rest}
      type="checkbox"
      value=""
      className={classNames(
        '!cursor-pointer w-4 h-4 text-cyan-500 bg-gray-100 rounded border-gray-300 focus:ring-cyan-500  dark:ring-offset-gray-100 focus:ring-2 dark:bg-gray-300 dark:border-gray-100',
        cls || ''
      )}
    />
  );
}
