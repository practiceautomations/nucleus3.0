import type { MenuSidebarItem } from './MenuSidebarItem';

export type MenuSidebarDropdownProps = {
  item: MenuSidebarDropdown;
  isMenuSidebarOpened?: boolean;
};

export type MenuSidebarDropdown = Pick<MenuSidebarItem, 'title' | 'icon'> & {
  children: MenuSidebarItem[];
};
