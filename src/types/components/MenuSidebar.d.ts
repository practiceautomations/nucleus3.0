import type { MenuSidebarDropdown } from './MenuSidebarDropdown';
import type { MenuSidebarItem } from './MenuSidebarItem';

export type MenuSidebarProps = {
  items: (MenuSidebarDropdown | MenuSidebarItem)[];
};
