export type User = {
  name: string;
  role: string;
  token: string;
  expireDate: string;
  loginAuditID: number;
  organizationSelectorType: number;
  userImagePath: string | null;
  defaultModuleURL: string | null;
  menuData: MenuData;
  userTimeZone: string;
  userTimeZoneCode: string;
  tfaEnable: boolean;
};

export type UserWithToken = User & {
  token: string;
};

interface MenuType {
  id: number;
  title: string;
  icon?: string;
  order: number;
  parentID: number | null;
}

interface Menu {
  id: number;
  title: string;
  icon?: string;
  link: string;
  order: number;
  parentID: number;
}

interface MenuData {
  menuTypes: MenuType[];
  menus: Menu[];
}
