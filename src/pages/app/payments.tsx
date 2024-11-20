import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Tabs from '@/components/OrganizationSelector/Tabs';
import PageHeader from '@/components/PageHeader';
import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';
import Button, { ButtonType } from '@/components/UI/Button';
import AppLayout from '@/layouts/AppLayout';
import AddPaymentBatch from '@/screen/batch/addPaymentBatch';
import PaymentBatches from '@/screen/payments/paymentBatches';
import PaymentERA from '@/screen/payments/paymentERA';
import { getArManagerOpenAtGlanceSelector } from '@/store/shared/selectors';
import classNames from '@/utils/classNames';

interface TabProps {
  id: number;
  name: string;
}

const Payments = () => {
  const [openAddUpdateModealInfo, setOpenAddUpdateModealInfo] = useState<{
    open: boolean;
    type?: string;
    id?: number;
  }>({ open: false });

  const [refreshPaymentBatches, setRefreshPaymentBatches] = useState<string>();
  useEffect(() => {
    if (refreshPaymentBatches === 'refresh') {
      setRefreshPaymentBatches(undefined);
    }
  }, [refreshPaymentBatches]);

  const screenTabs: TabProps[] = [
    { id: 1, name: 'Manual Payment Postings (Payment Batches)' },
    { id: 2, name: 'Automatic Payment Postings (ERAs)' },
  ];
  const [screenCurrentTab, setScreenCurrentTab] = useState(screenTabs[0]);
  const arManagernavigationData = useSelector(getArManagerOpenAtGlanceSelector);
  useEffect(() => {
    if (arManagernavigationData?.tabValue === 'OpenBatches') {
      setScreenCurrentTab(screenTabs[0]);
    } else if (arManagernavigationData?.tabValue === 'OpenEras') {
      setScreenCurrentTab(screenTabs[1]);
    }
  }, [arManagernavigationData]);
  return (
    <AppLayout title="Nucleus - Payment Batch">
      <div className="relative m-0 h-full bg-gray-100 p-0">
        <div className="m-0 h-full w-full overflow-y-scroll bg-gray-100 p-0">
          <div className="flex w-full flex-col">
            <div className="m-0 h-full w-full overflow-y-auto overflow-x-hidden bg-gray-100 p-0">
              <div className="h-[178px] w-full">
                <div className="absolute top-0 z-[11] w-full">
                  <Breadcrumbs />
                  <PageHeader cls="!bg-white !drop-shadow">
                    <div className="flex items-start justify-between gap-4 px-7 pt-[33px] pb-[21px]">
                      <div className="flex h-[38px] gap-6">
                        <p className="self-center text-3xl font-bold text-cyan-700">
                          Payments
                        </p>
                        <div>
                          <Button
                            cls={'h-[38px] truncate '}
                            buttonType={ButtonType.primary}
                            onClick={() => {
                              setOpenAddUpdateModealInfo({
                                open: true,
                                type: 'create',
                              });
                            }}
                          >
                            Create New Manual Payment Batch
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className={`px-7`}>
                      <div className={`h-[1px] w-full bg-gray-200`} />
                    </div>
                    <div className="w-full bg-white px-6">
                      <Tabs
                        tabs={screenTabs}
                        onChangeTab={(tab: any) => {
                          setScreenCurrentTab(tab);
                        }}
                        currentTab={screenCurrentTab}
                      />
                    </div>
                  </PageHeader>
                </div>
              </div>
              <div
                className={classNames(
                  screenCurrentTab?.id === 1 ? '' : '!hidden'
                )}
              >
                <PaymentBatches refreshPaymentBatches={refreshPaymentBatches} />
              </div>
              <div
                className={classNames(
                  screenCurrentTab?.id === 2 ? '' : '!hidden'
                )}
              >
                <PaymentERA />
              </div>
            </div>
            {openAddUpdateModealInfo.type === 'create' && (
              <AddPaymentBatch
                open={openAddUpdateModealInfo.open}
                batchId={openAddUpdateModealInfo.id}
                onClose={(isAddedUpdated) => {
                  if (isAddedUpdated) {
                    setRefreshPaymentBatches('refresh');
                  }
                  setOpenAddUpdateModealInfo({ open: false });
                }}
                hideBackdrop={false}
              />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Payments;
