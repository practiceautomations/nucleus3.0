import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import Icon from '@/components/Icon';
import MenuSidebarItem from '@/components/MenuSidebarItem';
import type { MenuItemType } from '@/store/login/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

type MenuSidebarDropdownProps = {
  item: MenuItemType;
  isMenuSidebarOpened?: boolean;
};

const MenuSidebarDropdown2 = ({
  item,
  isMenuSidebarOpened,
}: MenuSidebarDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  // This effect is to close the dropdown when the MenuSidebar is closed
  useEffect(() => {
    return () => {
      setIsOpen(false);
    };
  }, [isMenuSidebarOpened]);

  const isActive = item?.children?.find((a) => a.link === router.pathname);
  const isOpenCondition = isActive || isOpen;

  return (
    <div className="flex flex-col items-start transition-all hover:transition-all">
      <button
        type="button"
        // eslint-disable-next-line tailwindcss/no-custom-classname
        className={classNames(
          'bg-white group-2 flex max-h-10 w-full items-center justify-start p-2 text-base font-normal',
          isOpenCondition ? 'text-cyan-500' : 'text-black',
          isActive ? 'font-bold' : 'font-normal'
        )}
        aria-controls="dropdown-example"
        onClick={() => {
          if (isMenuSidebarOpened) {
            setIsOpen(!isOpen);
          }
        }}
      >
        {item.icon && (
          <Icon
            name={item.icon}
            color={isOpenCondition ? IconColors.WHITE : IconColors.NONE}
            size={20}
            layout="fixed"
          />
        )}
        <span
          className={`${
            !isOpen && !isMenuSidebarOpened && 'hidden'
          } ml-3 group-2-hover:block flex-1 text-left text-sm truncate`}
        >
          {item.title}
        </span>
        {isMenuSidebarOpened && (
          <Icon
            name="caret"
            size={20}
            style={{
              transform: isOpen ? 'rotate(90deg)' : '',
            }}
            color={isOpenCondition ? IconColors.Cyan : IconColors.NONE}
          />
        )}
      </button>
      <ul
        className={`${
          !isOpen && 'hidden'
        } w-full  transition-all hover:transition-all`}
      >
        <div className="h-auto  rounded-b-lg">
          {item.children?.map((child2) => (
            <li key={child2.title}>
              <MenuSidebarItem
                item={child2}
                isMenuSidebarOpened={isOpen}
                hideIcon
              />
            </li>
          ))}
        </div>
      </ul>
    </div>
  );
};

const MenuSidebarDropdown = ({
  item,
  isMenuSidebarOpened,
}: MenuSidebarDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  // This effect is to close the dropdown when the MenuSidebar is closed
  useEffect(() => {
    return () => {
      setIsOpen(false);
    };
  }, [isMenuSidebarOpened]);

  const isActive = item?.children?.find(
    (a) =>
      a.link === router.pathname ||
      a.children?.find((b) => b.link === router.pathname)
  );
  const isOpenCondition = isActive || isOpen;

  return (
    <div className="flex flex-col items-start rounded-lg px-[2px] transition-all hover:transition-all">
      <button
        type="button"
        // eslint-disable-next-line tailwindcss/no-custom-classname
        className={classNames(
          'group-2 flex min-h-[40px] max-h-[40px] w-full items-center justify-start rounded-lg border-0 p-2 text-base font-normal  hover:border-0 focus:outline-cyan-500',
          isOpenCondition ? 'bg-cyan-500' : 'bg-gray-100',
          isOpenCondition ? 'text-white' : 'text-black',
          isActive ? 'font-bold' : 'font-normal'
        )}
        aria-controls="dropdown-example"
        onClick={() => {
          if (isMenuSidebarOpened) {
            setIsOpen(!isOpen);
          }
        }}
      >
        {item.icon && (
          <Icon
            name={item.icon}
            color={isOpenCondition ? IconColors.WHITE : IconColors.NONE}
            size={20}
            layout="fixed"
          />
        )}
        <span
          className={`${
            !isOpen && !isMenuSidebarOpened && 'hidden'
          } ml-3 group-2-hover:block flex-1 text-left text-sm truncate`}
        >
          {item.title}
        </span>
        {isMenuSidebarOpened && (
          <Icon
            name="caret"
            size={20}
            style={{
              transform: isOpen ? 'rotate(90deg)' : '',
            }}
            color={isOpenCondition ? IconColors.WHITE : IconColors.NONE}
          />
        )}
      </button>
      <ul
        className={`${
          !isOpen && 'hidden'
        } w-full ransition-all hover:transition-all px-[2px]`}
      >
        <div className="h-auto py-1.5">
          {item?.children?.map((child) => (
            <li key={child.title}>
              {child.children ? (
                <MenuSidebarDropdown2
                  item={child}
                  isMenuSidebarOpened={isOpen}
                />
              ) : (
                <MenuSidebarItem
                  item={child}
                  isMenuSidebarOpened={isOpen}
                  hideIcon
                />
              )}
            </li>
          ))}
        </div>
      </ul>
    </div>
  );
};

export default MenuSidebarDropdown;
