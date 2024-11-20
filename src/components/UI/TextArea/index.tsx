import React from 'react';

import classNames from '@/utils/classNames';

export interface TextAreaProps
  extends React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  > {
  cls?: string;
}

export default function TextArea({ cls, ...rest }: TextAreaProps) {
  const isDisabled = rest.disabled;
  return (
    <textarea
      data-testid="noteDescription"
      {...rest}
      className={classNames(
        'form-control m-0 block h-full w-full rounded border border-solid border-gray-300  bg-white bg-clip-padding px-3 py-1.5 text-sm font-normal leading-5 text-gray-900 focus:border-gray-300 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300',
        isDisabled ? 'bg-gray-100 text-gray-500 ' : '',
        cls || ''
      )}
    ></textarea>
  );
}
