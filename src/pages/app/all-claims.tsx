import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import type { Theme } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import type {
  GridColTypeDef,
  GridRenderCellParams,
} from '@mui/x-data-grid-pro';
import {
  gridDetailPanelExpandedRowsContentCacheSelector,
  useGridApiContext,
  useGridSelector,
} from '@mui/x-data-grid-pro';
import { useRouter } from 'next/router';
import React, { isValidElement, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Icon from '@/components/Icon';
import Tabs from '@/components/OrganizationSelector/Tabs';
import PageHeader from '@/components/PageHeader';
import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';
import Button, { ButtonType } from '@/components/UI/Button';
import type { ButtonSelectDropdownDataType } from '@/components/UI/ButtonSelectDropdown';
// eslint-disable-next-line import/no-cycle
import ButtonSelectDropdownForExport from '@/components/UI/ButtonSelectDropdownForExport';
// eslint-disable-next-line import/no-cycle
import AppLayout from '@/layouts/AppLayout';
import type { PrintChildRef } from '@/screen/all-claims/all-claims-tab';
// eslint-disable-next-line import/no-cycle
import AllClaimsTab from '@/screen/all-claims/all-claims-tab';
// eslint-disable-next-line import/no-cycle
import ARClaimsTab from '@/screen/all-claims/ar-claims-tab';
import { getArManagerOpenAtGlanceSelector } from '@/store/shared/selectors';
import classNames from '@/utils/classNames';

export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});
export const usdPrice: GridColTypeDef = {
  type: 'number',
  width: 130,
  align: 'left',
  valueFormatter: ({ value }) => currencyFormatter.format(value),
  cellClassName: 'font-tabular-nums',
};
export function CustomDetailPanelToggle(
  props: Pick<GridRenderCellParams, 'id' | 'value'>
) {
  const { id, value: isExpanded } = props;
  const apiRef = useGridApiContext();
  // To avoid calling ´getDetailPanelContent` all the time, the following selector
  // gives an object with the detail panel content for each row id.
  const contentCache = useGridSelector(
    apiRef,
    gridDetailPanelExpandedRowsContentCacheSelector
  );
  // If the value is not a valid React element, it means that the row has no detail panel.
  const hasDetail = isValidElement(contentCache[id]);
  return (
    <IconButton
      size="small"
      tabIndex={-1}
      disabled={!hasDetail}
      aria-label={isExpanded ? 'Close' : 'Open'}
    >
      <ArrowForwardIosIcon
        sx={{
          transform: `rotateZ(${isExpanded ? 90 : 0}deg)`,
          transition: (theme: Theme) =>
            theme.transitions.create('transform', {
              duration: theme.transitions.duration.shortest,
            }),
        }}
        fontSize="inherit"
      />
    </IconButton>
  );
}

// Table Menu Tabs
interface TabProps {
  id: number | undefined;
  name: string;
}

export default function AllClaims() {
  const router = useRouter();

  const printRef = useRef<PrintChildRef>(null);

  // Function to call the child function
  const callPrintFunction = (res: ButtonSelectDropdownDataType[]) => {
    // Check if the ref to the child component exists
    if (printRef.current) {
      // Call the function in the child component
      printRef.current.childPrintFunction(res);
    }
  };
  const exportDropdownData: ButtonSelectDropdownDataType[] = [
    {
      id: 1,
      value: 'Export to PDF',
      icon: 'pdf',
    },
    {
      id: 2,
      value: 'Export to CSV',
      icon: 'csv',
    },
    {
      id: 3,
      value: 'Export to Google Drive',
      icon: 'drive',
    },
  ];
  const onSelectExportOption = (res: ButtonSelectDropdownDataType[]) => {
    callPrintFunction(res);
  };

  const screenTabs: TabProps[] = [
    { id: 1, name: 'All Claims' },
    { id: 2, name: 'AR Claims' },
  ];
  const [screenCurrentTab, setScreenCurrentTab] = useState(screenTabs[0]);
  const arManagernavigationData = useSelector(getArManagerOpenAtGlanceSelector);
  useEffect(() => {
    if (arManagernavigationData?.tabValue === 'openARClaim') {
      setScreenCurrentTab(screenTabs[1]);
    }
  }, [arManagernavigationData]);
  useEffect(() => {
    const {
      query: { tab },
    } = router;

    if (tab) {
      const tabId = parseInt(tab as string, 10);
      if (tabId === 2) {
        setScreenCurrentTab(screenTabs[1]);
      }
    }
  }, [router]);

  const handleTabChange = (tab: TabProps) => {
    setScreenCurrentTab(tab);
    const currentPath = router.pathname;
    const newPath = tab.id === 2 ? `${currentPath}?tab=${tab.id}` : currentPath;
    router.push(newPath);
  };
  const renderCurrentTab = () => {
    if (screenCurrentTab?.id === 1) {
      return <AllClaimsTab ref={printRef} />;
    }
    if (screenCurrentTab?.id === 2) {
      return <ARClaimsTab ref={printRef} />;
    }
    return <></>;
  };

  return (
    <AppLayout title="Nucleus - All Claims">
      <div className="relative m-0 h-full bg-gray-100 p-0">
        <div className="m-0 h-full w-full overflow-y-scroll bg-gray-100 p-0">
          <div className="flex w-full flex-col">
            <div className="m-0 h-full w-full overflow-y-auto overflow-x-hidden bg-gray-100 p-0">
              <div className="h-[125px] w-full">
                <div className="absolute top-0 z-[11] w-full">
                  <Breadcrumbs />
                  <PageHeader>
                    <div className="flex items-start justify-between gap-4 bg-white  px-7 pt-[33px] pb-[21px]">
                      <div className="flex h-[38px] gap-6">
                        <p className="self-center text-3xl font-bold text-cyan-700">
                          All Claims
                        </p>
                        <div>
                          <Button
                            cls={'h-[38px] truncate '}
                            buttonType={ButtonType.primary}
                            onClick={() => {
                              router.push('/app/create-claim');
                            }}
                          >
                            Create New Claim
                          </Button>
                        </div>
                      </div>
                      <div className="flex h-[38px]  items-center self-end px-6">
                        <ButtonSelectDropdownForExport
                          data={exportDropdownData}
                          onChange={onSelectExportOption}
                          isSingleSelect={true}
                          cls={'inline-flex'}
                          disabled={false}
                          buttonContent={
                            <button
                              id={uuidv4()}
                              className={classNames(
                                `bg-white inline-flex items-center justify-center gap-2 border border-solid border-gray-300  pt-[9px] pb-[9px] pl-[13px] pr-[17px] text-left font-medium leading-5 text-gray-700 transition-all rounded-md`
                              )}
                            >
                              <Icon name={'export'} size={18} />
                              <p className="text-sm">Export</p>
                            </button>
                          }
                        />
                      </div>
                    </div>
                    <div className={`px-7`}>
                      <div className={`h-[1px] w-full bg-gray-200`} />
                    </div>
                    <div className="w-full bg-white px-6">
                      <Tabs
                        tabs={screenTabs}
                        onChangeTab={(tab: any) => {
                          handleTabChange(tab);
                        }}
                        currentTab={screenCurrentTab}
                      />
                    </div>
                  </PageHeader>
                </div>
              </div>
              <div className="m-2 ">{renderCurrentTab()}</div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
