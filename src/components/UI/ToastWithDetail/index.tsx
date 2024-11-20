import type { ReactElement } from 'react';

import Icon from '@/components/Icon';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

export interface ToastWithDetailProps {
  text: string;
  detail: string;
  onClose?: () => void;
  toastType?: ToastType;
}

const bgColorsByType: { [key in ToastType]: string } = {
  [ToastType.SUCCESS]: 'bg-green-50 border-green-500',
  [ToastType.ERROR]: 'bg-red-50 border-red-500',
  [ToastType.WARNING]: 'bg-yellow-50 border-yellow-500',
  [ToastType.INFO]: 'bg-cyan-50 border-cyan-500',
};

const fontColorsByType: { [key in ToastType]: string } = {
  [ToastType.SUCCESS]: 'text-green-800',
  [ToastType.ERROR]: 'text-red-800',
  [ToastType.WARNING]: 'text-yellow-800',
  [ToastType.INFO]: 'text-cyan-800',
};
const detailColorsByType: { [key in ToastType]: string } = {
  [ToastType.SUCCESS]: 'text-green-700',
  [ToastType.ERROR]: 'text-red-700',
  [ToastType.WARNING]: 'text-yellow-700',
  [ToastType.INFO]: 'text-cyan-700',
};

const iconByType: { [key in ToastType]: ReactElement } = {
  [ToastType.SUCCESS]: (
    <Icon name="checkCircle" color={IconColors.GREEN} aria-hidden="true" />
  ),
  [ToastType.ERROR]: (
    <Icon name="xCircle" color={IconColors.RED} aria-hidden="true" />
  ),
  [ToastType.WARNING]: (
    <Icon name="warning" color={IconColors.NONE} aria-hidden="true" />
  ),
  [ToastType.INFO]: (
    <Icon name="toastInfo" color={IconColors.NONE} aria-hidden="true" />
  ),
};

const ToastWithDetail = ({
  text,
  detail,
  onClose = () => {},
  toastType = ToastType.INFO,
}: ToastWithDetailProps) => {
  return (
    <div
      className={classNames(
        'pointer-events-auto  p-4 w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 border-[1px] mb-2',
        bgColorsByType[toastType],
        fontColorsByType[toastType]
      )}
    >
      <div className="flex items-center">
        <div className="flex items-center">{iconByType[toastType]}</div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p
            className={classNames(
              'text-sm font-medium',
              fontColorsByType[toastType]
            )}
          >
            {text}
          </p>
        </div>
      </div>
      <div className="inline-flex flex-1 flex-col items-start justify-start space-y-2.5 pl-7">
        <div className="flex w-full flex-col items-start justify-start space-y-2">
          <p
            className={classNames(
              'w-full text-sm leading-tigh',
              detailColorsByType[toastType]
            )}
          >
            {detail}
          </p>
        </div>
        <div className="inline-flex h-1/5 w-full items-center justify-start space-x-10">
          <div
            className="flex cursor-pointer items-center justify-center rounded-md"
            onClick={onClose}
          >
            <p
              className={classNames(
                'text-sm leading-tight underline',
                fontColorsByType[toastType]
              )}
            >
              Dismiss
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastWithDetail;
