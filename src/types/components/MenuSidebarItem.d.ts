export type MenuSidebarItemProps = {
  item: MenuSidebarItem;
  isMenuSidebarOpened?: boolean;
  hideIcon?: boolean;
};

export type MenuSidebarItem = {
  title: string;
  icon?: string;
  link: string;
};
