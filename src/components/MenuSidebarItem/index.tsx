import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import Icon from '@/components/Icon';
// import { selectedMenuItemData } from '@/store/login/actions';
import type { MenuItemType } from '@/store/login/types';
import { getExpandSideMenuSelector } from '@/store/shared/selectors';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

export type MenuSidebarItemProps = {
  item: MenuItemType;
  isMenuSidebarOpened?: boolean;
  hideIcon?: boolean;
};

const MenuSidebarItem = ({ item, hideIcon = false }: MenuSidebarItemProps) => {
  const isOpened = useSelector(getExpandSideMenuSelector);
  const router = useRouter();

  const constructUrlWithQuery = (path: string) => {
    const query = Object.entries(router.query)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    return query ? `${path}?${query}` : path;
  };
  return (
    <Link href={item.link || ''}>
      <a
        // eslint-disable-next-line tailwindcss/no-custom-classname
        className={classNames(
          'group-1 flex h-[36px] w-full items-center focus:outline-cyan-500 border-0  px-2 text-sm hover:border-0 bg-white'
        )}
      >
        <div
          // eslint-disable-next-line tailwindcss/no-custom-classname
          className={classNames(
            'flex w-full items-center text-sm h-full',
            (!Object.keys(router.query).length &&
              item.link === router.pathname) ||
              (Object.keys(router.query).length &&
                item.link === constructUrlWithQuery(router.pathname))
              ? 'border-[2px] border-cyan-500 rounded'
              : 'border-0',
            (!Object.keys(router.query).length &&
              item.link === router.pathname) ||
              (Object.keys(router.query).length &&
                item.link === constructUrlWithQuery(router.pathname))
              ? 'bg-cyan-50 text-cyan-500 font-bold'
              : 'bg-white text-black font-normal'
          )}
        >
          {!hideIcon && item.icon && (
            <Icon
              name={item.icon}
              size={20}
              color={
                item.link === router.pathname
                  ? IconColors.WHITE
                  : IconColors.NONE
              }
              layout="fixed"
              className="min-w-[24px] transition-none"
            />
          )}
          <span
            className={`${!isOpened ? 'hidden' : 'block'} ${
              hideIcon && ''
            } ml-3 text-sm truncate  delay-1000`}
          >
            {item.title}
          </span>
        </div>
      </a>
    </Link>
  );
};

export default MenuSidebarItem;
