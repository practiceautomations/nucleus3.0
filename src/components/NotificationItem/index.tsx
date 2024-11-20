import type { Notification } from '@/types/components/Notification';
import classNames from '@/utils/classNames';

import NotificationMenu from '../NotificationMenu';

type NotificationItemProps = {
  notification: Notification;
};

const NotificationItem = ({ notification }: NotificationItemProps) => {
  const {
    title,
    description,
    ctaText,
    group,
    timedate = new Date().toISOString(),
    viewTimedate,
  } = notification;

  return (
    <div
      className={classNames(
        !viewTimedate ? 'bg-cyan-50' : '',
        'block h-24 border-y border-solid hover:bg-cyan-100'
      )}
    >
      <div className="flex h-full px-3 py-4 sm:px-6">
        <div className="mr-4 flex flex-1 items-center justify-start">
          <div className="mr-4 flex w-24 content-center justify-center">
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
              {group}
            </span>
          </div>

          <div className="flex flex-col items-start justify-between">
            <span className="text-sm font-semibold">{title}</span>
            <span className="text-sm font-normal text-gray-500">
              {description}
            </span>
            {ctaText && (
              <button className="text-sm font-normal text-cyan-500">
                {ctaText}
              </button>
            )}
          </div>
        </div>
        <NotificationMenu notificationTime={timedate} />
      </div>
    </div>
  );
};

export default NotificationItem;
