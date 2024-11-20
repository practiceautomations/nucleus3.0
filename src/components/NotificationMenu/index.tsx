import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

import Icon from '@/components/Icon';
import { IconColors } from '@/utils/ColorFilters';
import getRelativeTime from '@/utils/getRelativeTime';

type NotificationMenuProps = {
  notificationTime: string;
};

const NotificationMenu = ({ notificationTime }: NotificationMenuProps) => {
  return (
    <div className="flex w-24 flex-col items-center justify-between">
      <Menu
        as="div"
        className="relative ml-auto flex rounded-full p-1 text-gray-400 hover:text-gray-500"
      >
        <Menu.Button className="self-end">
          <Icon name="ellipsisHorizontal" size={16} color={IconColors.GRAY} />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 top-5 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
            <div className="flex flex-col px-3  py-1">
              <Menu.Item>
                <div className="w-full cursor-pointer rounded-md py-2 px-1 text-gray-700 hover:text-gray-500">
                  Mark as Read
                </div>
              </Menu.Item>
              <Menu.Item>
                <div className="w-full cursor-pointer rounded-md py-2 px-1 text-gray-700 hover:text-gray-500">
                  Mark as Unread
                </div>
              </Menu.Item>
              <Menu.Item>
                <div className="w-full cursor-pointer rounded-md py-2 px-1 text-gray-700 hover:text-gray-500">
                  Removed
                </div>
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
      <span className="text-right text-xs font-normal text-gray-400">
        {getRelativeTime(new Date(notificationTime))}
      </span>
    </div>
  );
};

export default NotificationMenu;
