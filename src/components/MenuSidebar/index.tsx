import Tooltip from '@mui/material/Tooltip';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import MenuSidebarDropdown from '@/components/MenuSidebarDropdown';
import MenuSidebarItem from '@/components/MenuSidebarItem';
import type { MenuItemType } from '@/store/login/types';
import { expandSideMenuBar } from '@/store/shared/actions';
import { getExpandSideMenuSelector } from '@/store/shared/selectors';
import { AppConfig } from '@/utils/AppConfig';
import classNames from '@/utils/classNames';

import Icon from '../Icon';

type MenuSidebarProps = {
  items: MenuItemType[];
};

const MenuSidebar = ({ items }: MenuSidebarProps) => {
  const dispatch = useDispatch();
  const isOpened = useSelector(getExpandSideMenuSelector);
  const [tooltipTitle, setTooltipTitle] = useState('');
  useEffect(() => {
    if (isOpened) {
      setTooltipTitle('Collapse');
    } else {
      setTooltipTitle('Expand');
    }
  }, [isOpened]);

  const [asideWidth, setAsideWidth] = useState(0);
  const asideRef = useRef<HTMLElement>(null);

  const handleSetAsideWidth = () => {
    if (asideRef.current) {
      const divWidth = asideRef.current.clientWidth;
      setAsideWidth(divWidth);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleSetAsideWidth);
    return () => {
      window.removeEventListener('resize', handleSetAsideWidth);
    };
  }, []);

  useEffect(() => {
    handleSetAsideWidth();
  }, []);

  return (
    <aside
      ref={asideRef}
      className={
        !isOpened
          ? 'flex h-full !w-[80px] flex-col border-2 border-slate-200 bg-gray-100 transition-all'
          : 'flex h-full !w-[256px] flex-col border-2 border-slate-200 bg-gray-100 transition-all '
      }
      aria-label="MenuSidebar"
    >
      <div
        className={classNames(
          'absolute z-[12] h-[24px] w-[24px] cursor-pointer top-[69px]'
        )}
        style={{ left: isOpened ? asideWidth - 10 : 67 }}
      >
        <div
          className="h-6 w-6 items-center rounded-full border border-gray-300 bg-gray-50 shadow"
          onClick={() => {
            dispatch(expandSideMenuBar(!isOpened));
          }}
        >
          <div className={classNames(isOpened ? 'ml-[6px]' : 'ml-[7px]')}>
            <Tooltip title={tooltipTitle} arrow placement="top">
              <Icon
                name="expand"
                size={10}
                className={classNames('w-6 h-6', isOpened ? 'rotate-180' : '')}
              />
            </Tooltip>
          </div>
        </div>
      </div>
      <div className="group flex-1 overflow-y-auto rounded p-[16px]">
        <ul className="space-y-2 overflow-hidden">
          {items.map((item) => (
            <li key={item.title}>
              {item.children ? (
                <MenuSidebarDropdown
                  item={item}
                  isMenuSidebarOpened={isOpened}
                />
              ) : (
                <div className="h-auto rounded-b-lg bg-white">
                  <MenuSidebarItem item={item} isMenuSidebarOpened={isOpened} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex shrink-0 items-center p-[16px]">
        <div className="flex flex-col space-y-[3px] text-xs font-normal leading-none text-gray-500">
          <p>© 2023 - Practice Automations Healthtech, Inc.</p>
          <p>{AppConfig.appVersion}</p>
        </div>
      </div>
      {/* <div className="flex shrink-0 border-t border-gray-400 p-5">
        <MenuSidebarItem
          item={{
            title: 'Organization Settings',
            icon: 'cog',
            link: '/app/organization-settings/',
          }}
          isMenuSidebarOpened={isOpened}
        />
      </div> */}
    </aside>
  );
};

export default MenuSidebar;
