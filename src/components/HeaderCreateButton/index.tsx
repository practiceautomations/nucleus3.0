import { Menu, Transition } from '@headlessui/react';
import { useRouter } from 'next/router';
import React, { Fragment } from 'react';

import Icon from '@/components/Icon';
import classNames from '@/utils/classNames';

const menuItems = [
  {
    id: 1,
    title: 'Create a Claim',
    href: '/app/create-claim',
    showBottomDivider: true,
  },
  {
    id: 2,
    title: 'Add Charge Batch',
    href: '#',
    showBottomDivider: false,
  },
  {
    id: 3,
    title: 'Add Payment Batch',
    href: '#',
    showBottomDivider: true,
  },
  {
    id: 4,
    title: 'Add Medical Case',
    href: '#',
    showBottomDivider: true,
  },
  // {
  //   title: 'Create Monthly Report',
  //   href: '#',
  //   showBottomDivider: false,
  // },
];
export interface HeaderCreateButtonProp {
  onSelect: (id: number) => void;
}
const HeaderCreateButton = ({ onSelect }: HeaderCreateButtonProp) => {
  const router = useRouter();
  return (
    <div className="flex w-10 items-center sm:w-28">
      <Menu as="div" className="relative flex w-full rounded-full">
        <Menu.Button className="relative inline-flex w-10 items-center justify-center rounded-md border border-transparent bg-cyan-500 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 sm:w-full md:justify-around md:px-4">
          <span className="mr-0 flex h-5 w-5 content-center justify-center sm:mr-2">
            <Icon name="plus" />
          </span>
          <span className="hidden sm:block">Create</span>
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
          <Menu.Items className="absolute right-0 top-12 z-[14] w-56 origin-top-right divide-y rounded-md bg-cyan-500 shadow-lg ring-1 ring-black/5 focus:outline-none">
            <div className="flex flex-col">
              {menuItems.map((menuItem) => (
                <Menu.Item key={menuItem.title}>
                  <button
                    className={classNames(
                      menuItem.showBottomDivider
                        ? 'border-b border-cyan-400 hover:border-b hover:border-cyan-400 text-left'
                        : 'hover:border-0',
                      'w-full cursor-pointer py-2 px-4 text-white hover:opacity-75 focus:outline-none text-left'
                    )}
                    onClick={() => {
                      if (menuItem.id === 1) {
                        router.push(menuItem.href);
                      } else {
                        onSelect(menuItem.id);
                      }
                    }}
                  >
                    {menuItem.title}
                  </button>
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default HeaderCreateButton;
