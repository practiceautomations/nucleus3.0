import type { MenuData } from '@/types/store/Login';

import {
  LOGIN_ATTEMPTS,
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
} from './actionTypes';
import type { LoginActions, LoginState, MenuItemType } from './types';

const convertDBMenusToAppMenus = (m: MenuData) => {
  const menus: MenuItemType[] = m.menuTypes
    .filter((f) => !f.parentID)
    .map((d) => {
      const subMenu2: MenuItemType[] = m.menuTypes
        .filter((f) => f.parentID === d.id)
        .map((d2) => {
          return {
            title: d2.title,
            order: d2.order,
            children: m.menus
              .filter((f) => f.parentID === d2.id)
              .map((d4) => {
                return {
                  title: d4.title,
                  link: d4.link,
                  order: d4.order,
                };
              })
              .sort((a, b) => a.order - b.order),
          };
        })
        .filter((f) => !!f.children?.length);

      const subMenu3: MenuItemType[] = m.menus
        .filter((f) => f.parentID === d.id)
        .map((d3) => {
          return { title: d3.title, link: d3.link, order: d3.order };
        });

      return {
        title: d.title,
        icon: d.icon,
        children: subMenu2
          .concat(subMenu3)
          .sort((a, b) => (a.order || 0) - (b.order || 0)),
      };
    });
  return menus.filter((f) => !!f.children?.length);
};

const initialState: LoginState = {
  loading: false,
  user: null,
  error: null,
  email: '',
  loginAttempts: 0,
  menuItems: [],
  // selectedMenuItem: null,
};

// eslint-disable-next-line @typescript-eslint/default-param-last
const loginReducer = (state = initialState, action: LoginActions) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        email: action.payload.email,
      };
    case LOGIN_ATTEMPTS:
      return {
        ...state,
        loginAttempts: action.payload,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        error: null,
        loginAttempts: 0,
        menuItems: convertDBMenusToAppMenus(action.payload.user.menuData),
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        user: null,
        error: action.payload.error,
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        user: null,
        menuItems: [],
      };
    // case SELECTED_SIDEBAR_MENU_ITEM:
    //   return {
    //     ...state,
    //     selectedMenuItem: action.payload,
    //   };
    default:
      return {
        ...state,
      };
  }
};

export default loginReducer;
