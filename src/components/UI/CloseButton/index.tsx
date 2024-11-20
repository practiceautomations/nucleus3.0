import React from 'react';

import Icon from '@/components/Icon';

export interface CloseButtonProps {
  onClick?: (ev: React.MouseEvent) => void;
}

export default function CloseButton({ onClick }: CloseButtonProps) {
  return (
    <button
      data-testid="closeBtnPaymentPosting"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center justify-center text-clip rounded-md border border-solid border-gray-300 bg-white"
    >
      <Icon name={'close'} size={24} />
    </button>
  );
}
