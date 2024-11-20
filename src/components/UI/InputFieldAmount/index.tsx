import React from 'react';

import classNames from '@/utils/classNames';

export interface InputProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  showCurrencyName?: boolean;
  testId?: string;
}

const InputFieldAmount = ({
  showCurrencyName = true,
  disabled,
  testId,
  ...rest
}: InputProps) => {
  const grayText = disabled ? 'text-gray-500' : '';
  return (
    <div
      className={classNames(
        `h-[38px] mt-1 border-solid border border-gray-300 gap-2 inline-flex items-center rounded-md text-gray-900 leading-5 text-left font-normal pl-[13px] pr-[13px] pt-[9px] pb-[9px] w-full overflow-clip`,
        disabled ? 'bg-gray-100' : 'bg-white',
        'focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-transparent'
      )}
      data-testid={`inputFeildValue-${testId}`}
    >
      <p className={classNames('text-sm m-0', grayText)}>{'$'}</p>
      <input
        {...rest}
        disabled={disabled}
        type={'number'}
        step={'0.01'}
        className={classNames(
          'w-full border-none placeholder:text-gray-400 focus:outline-none focus:ring-white sm:text-sm px-0',
          grayText,
          disabled ? 'bg-gray-100' : 'bg-white'
        )}
      />
      {showCurrencyName ? (
        <p className={classNames('text-sm m-0', grayText)}>{'USD'}</p>
      ) : (
        ''
      )}
    </div>
  );
};

export default InputFieldAmount;
