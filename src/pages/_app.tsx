import '../styles/global.css';

import { LicenseInfo } from '@mui/x-license-pro';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import { updateToken } from '@/api/http-client';
import ToastContainer from '@/components/ToastContainer';
import store from '@/store';
import { logoutRequest } from '@/store/login/actions';
import { getMenuItemsSelector, getUserSelector } from '@/store/login/selectors';
import type { MenuItemType } from '@/store/login/types';
import { isScreenInActive, setGlobalModal } from '@/store/shared/actions';

import NotFound from './404';
import UseScreenInactivity from './screenInactivityHook';

declare const window: any;
const persistor = persistStore(store);

if (process.env.NEXT_PUBLIC_USE_MSW_MOCK_API === 'true') {
  import('@/mocks').then(({ setupMocks }) => {
    setupMocks();
  });
}

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};
LicenseInfo.setLicenseKey(
  'c6e7fa17578eab30ee07202e72ddf492Tz01NzE5OCxFPTE3MDQ1OTUzODI4NjgsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI='
);

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);

  const HandleMainApp = () => {
    const user = useSelector(getUserSelector);
    const menuItems = useSelector(getMenuItemsSelector);
    const router = useRouter();
    const dispatch = useDispatch();

    const { pathname } = window.location;
    const defaultAllowedLinks = [
      '/login',
      '/forgot-password',
      '/',
      '/tfa-verification',
    ];
    const [pageIsAuth, setPageIsAuth] = useState<boolean>();

    dispatch(setGlobalModal(undefined));

    const getAllLinks = async (
      menuItemsData: MenuItemType[]
    ): Promise<string[]> => {
      let links: string[] = [];

      const traverseMenuItems = (items: MenuItemType[]): void => {
        // eslint-disable-next-line no-restricted-syntax
        for (const item of items) {
          if (item.link) {
            links.push(item.link);
            if (item.link === '/app/all-claims') {
              links = links.concat([
                '/app/create-claim',
                '/app/create-claim/[claim_id]',
                '/app/claim-detail/[claim_id]',
                '/app/expanded-view/[claim_id]',
              ]);
            }
            if (item.link === '/app/patient-search') {
              links = links.concat([
                '/app/register-patient',
                '/app/register-patient/[patient_id]',
              ]);
            }
            if (item.link === '/setting/providers') {
              links = links.concat(['/setting/providers/[provider_id]']);
            }
            if (item.link === '/setting/group') {
              links = links.concat(['/setting/group/[group_id]']);
            }
            if (item.link === '/setting/insurances') {
              links = links.concat(['/setting/insurances/[insurance_id]']);
            }
            if (item.link === '/setting/users') {
              links = links.concat(['/setting/users/[user_email]']);
            }
          }

          if (item.children) {
            traverseMenuItems(item.children);
          }
        }
      };

      await traverseMenuItems(menuItemsData);

      // Screen(s) for only required login.
      if (user?.token) {
        links = links.concat(['/setting/users-settings']);
      }

      return links;
    };

    const handlePageIsAuth = (linksStr: string[]) => {
      const isAllowedLink = linksStr.some((item) => {
        if (item === pathname) {
          return true;
        }

        const itemParts = item.split('/');
        const inputParts = pathname.split('/');

        if (itemParts.length !== inputParts.length) {
          return false;
        }

        return itemParts.every((itemPart, i) => {
          const inputPart = inputParts[i];

          return (
            !itemPart ||
            itemPart === inputPart ||
            itemPart.startsWith('[') ||
            itemPart.endsWith(']')
          );
        });
      });
      setPageIsAuth(isAllowedLink);
    };

    const updateAppToken = async (token: string | boolean) => {
      await updateToken(token);

      if (token === false && (pageIsAuth || pathname === '/')) {
        // If 'token' is not exist
        // and 'pageIsAuth' is true, meaning the user is authenticated,
        // or current URL is 'HomePage/RootPage'
        // navigate to the 'LoginPAge'
        await router.push('/login');
      }

      const allowedLinksRes = await getAllLinks(menuItems);
      // Check if the 'token' is exist
      if (typeof token === 'string') {
        dispatch(isScreenInActive(false));
        // Check if the current URL is 'Login' or 'HomePage/RootPage'
        if (
          pathname === '/login' ||
          pathname === '/' ||
          pathname === '/tfa-verification'
        ) {
          if (
            user?.defaultModuleURL &&
            allowedLinksRes.includes(user.defaultModuleURL)
          ) {
            // navigate to the 'User default URL'
            await router.push(user.defaultModuleURL);
          } else if (allowedLinksRes.length > 0) {
            // navigate to the '1st URL' from list
            await router.push(allowedLinksRes[0] || '');
          } else if (pathname === '/login') {
            // navigate to the 'HomePage/RootPage' if routing data not found
            await router.push('/');
          }
        }
      }
      handlePageIsAuth(allowedLinksRes);
    };

    useEffect(() => {
      updateAppToken(user?.token ? user.token : false);
    }, [user?.token]);

    // Handling logout on token expiration.
    const isTokenExpired = () => {
      if (user?.expireDate) {
        const date = new Date().getUTCDate(); // Current Date
        const month = new Date().getUTCMonth() + 1; // Current Month
        const year = new Date().getUTCFullYear(); // Current Year
        const hours = new Date().getUTCHours(); // Current Hours
        const min = new Date().getUTCMinutes(); // Current Minutes
        const sec = new Date().getUTCSeconds(); // Current Seconds

        const utcNow = new Date(
          `${year}-${month}-${date} ${hours}:${min}:${sec}`
        );

        const tokenExpiration = new Date(user.expireDate);

        const rest = tokenExpiration.getTime() - utcNow.getTime();

        return Number.isNaN(rest) || rest < 0;
      }
      return true;
    };
    useEffect(() => {
      if (user?.token && isTokenExpired() && user.loginAuditID) {
        dispatch(
          logoutRequest({
            loginAuditID: user.loginAuditID,
          })
        );
      }
    }, [router.asPath]);

    useEffect(() => {
      window.logout = () => {
        if (user && user.loginAuditID) {
          dispatch(
            logoutRequest({
              loginAuditID: user.loginAuditID,
            })
          );
        }
      };
    }, []);

    return (
      <>
        {pageIsAuth || defaultAllowedLinks.includes(pathname) ? (
          <>
            <ToastContainer />
            <UseScreenInactivity />
            <Component {...pageProps} />
          </>
        ) : (
          <>{pageIsAuth === false && <NotFound />}</>
        )}
      </>
    );
  };

  return getLayout(
    <Provider store={store}>
      <style jsx global>{`
        #__next {
          height: 100%;
        }
      `}</style>
      <PersistGate loading={null} persistor={persistor}>
        <HandleMainApp />
      </PersistGate>
    </Provider>
  );
}
