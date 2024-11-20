import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AppSpinner from '@/components/AppSpinner';
// eslint-disable-next-line import/no-cycle
import ClaimDetail from '@/components/ClaimDetailMain';
import ContentSidebar from '@/components/ContentSidebar';
// eslint-disable-next-line import/no-cycle
import Header from '@/components/Header';
import MenuSidebar from '@/components/MenuSidebar';
// eslint-disable-next-line import/no-cycle
import PatientDetailModal from '@/components/PatientDetailModal';
import store from '@/store';
import { getMenuItemsSelector } from '@/store/login/selectors';
import { setGlobalModal, setRouteHistory } from '@/store/shared/actions';
import {
  getAppSpinnerState,
  getExpandSideMenuSelector,
  getGlobalModalSelector,
} from '@/store/shared/selectors';
import type { GlobalModalData, RouteHistoryData } from '@/store/shared/types';
import classNames from '@/utils/classNames';

import { Meta } from './Meta';

// const defaultMenus: MenuItemType[] = [
//   {
//     title: 'Dashboard',
//     icon: 'chartBar',
//     children: [
//       { title: 'Monthly Summary', link: '/app/monthly-summary-report' },
//     ],
//   },
//   {
//     title: 'Claims',
//     icon: 'documentText',
//     children: [
//       { title: 'All Claims', link: '/app/all-claims' },
//       { title: 'Claims child 2', link: '/app/claims#2' },
//     ],
//   },
//   {
//     title: 'Patients',
//     icon: 'patient',
//     children: [
//       { title: 'Patient Search', link: '/app/patient-search' },
//       { title: 'Eligibility Check List', link: '/app/eligibility-check-list' },
//       { title: 'Patient Statement', link: '/app/patient-statement' },
//     ],
//   },
//   {
//     title: 'Batch Intake',
//     icon: 'documentDownload2',
//     children: [
//       { title: 'Charge Batch', link: '/app/charge-batch' },
//       { title: 'Payment Batch', link: '/app/payment-batch' },
//       { title: 'Document Batch', link: '/app/document-batch' },
//       { title: 'Document Search', link: '/app/document-search' },
//     ],
//   },
//   {
//     title: 'Remittance',
//     icon: 'currencyDolar',
//     children: [
//       { title: 'Payments', link: '/app/payments' },
//       { title: 'Bulk Write-Off', link: '/app/bulk-write-off' },
//       { title: 'Payment Reconciliation', link: '/app/payment-reconciliation' },
//       { title: 'ERA Check', link: '/app/era-check' },
//     ],
//   },
//   {
//     title: 'Reports',
//     icon: 'clipboard',
//     children: [
//       {
//         title: 'Payment Reports',
//         children: [{ title: 'Payments Report', link: '/app/payments-report' }],
//       },
//       {
//         title: 'Provider Reports',
//         children: [
//           {
//             title: 'Plan Procedure Report',
//             link: '/app/plan-procedure-report',
//           },
//           {
//             title: 'Insurance Profile Report',
//             link: '/app/insurance-profile-report',
//           },
//         ],
//       },
//     ],
//   },
//   {
//     title: 'Settings',
//     icon: 'cog',
//     children: [
//       {
//         title: 'GROUP SETTINGS',
//         children: [
//           { title: 'Group', link: '/setting/group' },
//           { title: 'Practices', link: '/setting/practices' },
//           { title: 'Facilities', link: '/setting/facilities' },
//           { title: 'Providers', link: '/setting/providers' },
//           { title: 'Insurances', link: '/setting/insurances' },
//           { title: 'Fee Schedule', link: '/setting/fee-schedule' },
//           { title: 'CPD-NDC', link: '/setting/cpd-ndc' },
//         ],
//       },
//       {
//         title: 'SYSTEM SETTINGS',
//         children: [
//           { title: 'Users', link: '/setting/users' },
//           { title: 'Modules', link: '/setting/modules' },
//           { title: 'Menu Roles', link: '/setting/menu-roles' },
//           { title: 'Data Roles', link: '/setting/data-roles' },
//         ],
//       },
//     ],
//   },
// ];

export type Layout = {
  children: ReactNode;
  title?: string;
  hideHeaderFooter?: boolean;
};

const AppLayout = ({
  children,
  title = 'Nucleus',
  hideHeaderFooter = false,
}: Layout) => {
  const router = useRouter();
  const menuItems = useSelector(getMenuItemsSelector);
  const isOpenSideMenu = useSelector(getExpandSideMenuSelector);
  const showAppSpinnerRequest = useSelector(getAppSpinnerState);
  const dispatch = useDispatch();

  const globalModal = useSelector(getGlobalModalSelector);
  const [globalModalOpen, setGlobalModalOpen] = useState<
    GlobalModalData | undefined
  >();

  useEffect(() => {
    const routeHistory: RouteHistoryData[] = JSON.parse(
      JSON.stringify(store.getState().shared.routeHistory)
    );
    const topValue = routeHistory[routeHistory.length - 1];
    if (topValue?.url !== router.asPath) {
      routeHistory.push({ url: router.asPath });
      dispatch(setRouteHistory(routeHistory));
    }
  }, [router.asPath]);

  useEffect(() => {
    setGlobalModalOpen(globalModal);

    let routeHistory: RouteHistoryData[] = JSON.parse(
      JSON.stringify(store.getState().shared.routeHistory)
    );

    if (
      globalModal &&
      globalModal.type === 'Claim Detail' &&
      !globalModal?.isPopup
    ) {
      const url = `/app/claim-detail/${globalModal.id}`;
      if (globalModal.fromTab) {
        routeHistory = routeHistory.map((row) => {
          return {
            ...row,
            displayName:
              row.url === '/app/all-claims'
                ? globalModal.fromTab
                : row.displayName,
          };
        });
      }
      routeHistory.push({ url, isModal: true });
      window.history.pushState(url, '', url);
      dispatch(setRouteHistory(routeHistory));
    }
  }, [globalModal]);

  const onBackScreen = () => {
    if (!globalModalOpen?.isPopup) {
      const routeHistory: RouteHistoryData[] = JSON.parse(
        JSON.stringify(store.getState().shared.routeHistory)
      );

      const topValue = routeHistory[routeHistory.length - 1];
      const secLastVal = routeHistory[routeHistory.length - 2];
      if (secLastVal && topValue?.url !== secLastVal?.url) {
        routeHistory.push({ url: secLastVal?.url || '' });
        dispatch(setRouteHistory(routeHistory));
      }
      if (window.location.pathname !== secLastVal?.url) {
        window.history.pushState(secLastVal?.url, '', secLastVal?.url);
      }
    }
    dispatch(setGlobalModal(undefined));
  };

  // Browser back button functionality
  useEffect(() => {
    const handleBackButton = (event: PopStateEvent) => {
      const routeHistory: RouteHistoryData[] = JSON.parse(
        JSON.stringify(store.getState().shared.routeHistory)
      );
      if (routeHistory[routeHistory.length - 1]?.isModal) {
        onBackScreen();
      } else {
        router.push(event.state);
      }
    };

    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, []);

  const renderChildren = (child: ReactNode) => {
    return (
      <>
        {globalModalOpen && globalModalOpen.type === 'Claim Detail' && (
          <>
            {!globalModalOpen.isPopup ? (
              <ClaimDetail
                claimID={globalModalOpen.id}
                onCloseModal={() => {
                  onBackScreen();
                }}
              />
            ) : (
              <div
                className="!absolute inset-0 z-[12] flex h-full w-full items-center justify-center p-[1.5%]"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
              >
                <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-white shadow">
                  <ClaimDetail
                    isPopup
                    claimID={globalModalOpen.id}
                    onCloseModal={() => {
                      onBackScreen();
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}
        {globalModalOpen && globalModalOpen.type === 'Patient Detail' && (
          <>
            {!globalModalOpen.isPopup ? (
              <PatientDetailModal
                selectedPatientID={globalModalOpen.id}
                onCloseModal={() => {
                  onBackScreen();
                }}
                onSave={() => {}}
              />
            ) : (
              <div
                className="!absolute inset-0 z-[12] flex h-full w-full items-center justify-center p-[1.5%]"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
              >
                <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-white shadow">
                  <PatientDetailModal
                    isPopup
                    selectedPatientID={globalModalOpen.id}
                    onCloseModal={() => {
                      onBackScreen();
                    }}
                    onSave={() => {}}
                  />
                </div>
              </div>
            )}
          </>
        )}
        {child}
      </>
    );
  };

  return (
    <>
      <div
        className={classNames(
          'w-full h-full',
          showAppSpinnerRequest.length ? '!pointer-events-none' : ''
        )}
      >
        {!hideHeaderFooter && (
          <>
            <Meta title={title} description={title} />
            <Header />
          </>
        )}
        <AppSpinner />
        {/* 64px is the Header height */}
        {!hideHeaderFooter ? (
          <>
            <div className="flex h-[calc(100%-64px)]">
              <MenuSidebar items={menuItems} />
              <div
                className={classNames(
                  isOpenSideMenu
                    ? 'w-[calc(100%-256px)]'
                    : 'w-[calc(100%-80px)]',
                  'h-full'
                )}
              >
                {renderChildren(children)}
              </div>
              <ContentSidebar />
            </div>
          </>
        ) : (
          <div className="">{renderChildren(children)}</div>
        )}
      </div>
    </>
  );
};

export default AppLayout;
