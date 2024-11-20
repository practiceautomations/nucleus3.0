import { useState } from 'react';

import Icon from '@/components/Icon';
import Button, { ButtonType } from '@/components/UI/Button';
import CreateCrossover from '@/components/UI/CreateCrossover';
import Modal from '@/components/UI/Modal';
// eslint-disable-next-line import/no-cycle
import PaymentPosting from '@/components/UI/PaymentPosting';
import type { ClaimFinancials } from '@/store/shared/types';
import classNames from '@/utils/classNames';

type ClaimBalanceProp = {
  data: ClaimFinancials | undefined;
  groupID?: number;
  patientID?: number;
  reloadData: () => void;
};
const ClaimBalance = ({
  data,
  groupID,
  patientID,
  reloadData,
}: ClaimBalanceProp) => {
  const chargeAmountColor = (chargeValue: number) => {
    if (chargeValue === 0) {
      return 'text-green-500';
    }
    if (chargeValue > 0) {
      return 'text-red-500';
    }
    return 'text-yellow-500';
  };

  const chargePaidAmountColor = (value: number) => {
    if (value === 0) {
      return 'text-red-500';
    }
    if (value > 0) {
      return 'text-green-500';
    }
    return 'text-yellow-500';
  };
  const getTotalBalanceClass = (type: string) => {
    let divClassName =
      'drop-shadow-xl box-border h-full w-full rounded-md border border-solid ';
    let pClassName = 'text-sm ';
    let balanceClassName = 'p-1 pt-3 text-lg font-bold ';

    if (data?.totalClaimBalance && data?.totalClaimBalance > 0) {
      divClassName += 'border-red-500 bg-red-50 p-3 shadow-md';
      pClassName += 'text-red-500';
      balanceClassName += 'text-red-500';
    } else if (data?.totalClaimBalance === 0) {
      divClassName += 'border-green-500 bg-green-50 p-3 shadow-md';
      pClassName += 'text-green-500';
      balanceClassName += 'text-green-500';
    } else {
      divClassName += 'border-yellow-500 bg-yellow-50 p-3 shadow-md';
      pClassName += 'text-yellow-500';
      balanceClassName += 'text-yellow-500';
    }

    if (type === 'divClassName') {
      return divClassName;
    }
    if (type === 'pClassName') {
      return pClassName;
    }
    return balanceClassName;
  };
  const [showCrossoverClaimModal, setShowCrossoverClaimModal] =
    useState<boolean>(false);
  const [showPostPaymentModal, setShowPostPaymentModal] =
    useState<boolean>(false);
  const [patientPosting, setPatientPosting] = useState<boolean>(false);
  return (
    <>
      <div className="pt-6  pl-6 text-xl font-bold leading-7 text-gray-700">
        Claim Balance
      </div>
      <div
        className={`relative inline-flex items-start gap-8 text-gray-700 leading-6 text-left font-bold w-full h-full p-[20px] `}
      >
        <div
          className={
            'relative h-[550px] w-4/5 overflow-hidden rounded-lg bg-white bg-white px-4 pt-5 pb-4 text-left shadow-xl drop-shadow-xl transition-all'
          }
        >
          <Modal
            open={showCrossoverClaimModal}
            onClose={() => {}}
            modalContentClassName="relative w-[1232px] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
          >
            <CreateCrossover
              claimID={data?.claimID}
              groupID={groupID}
              patientID={patientID}
              onClose={() => {
                setShowCrossoverClaimModal(false);
                reloadData();
              }}
            />
          </Modal>
          <Modal
            open={showPostPaymentModal}
            onClose={() => {}}
            modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
          >
            <PaymentPosting
              claimID={data?.claimID || 0}
              groupID={groupID}
              patientID={patientID}
              patientPosting={patientPosting}
              onClose={() => {
                setShowPostPaymentModal(false);
                reloadData();
              }}
            />
          </Modal>
          <div className="flex items-center justify-start space-x-4">
            <p className="text-base font-bold leading-normal text-gray-500">
              Fee Adjustment
            </p>
          </div>
          <div className="mt-2 flex items-start justify-start space-x-2">
            <div className="flex w-1/5 items-start justify-start rounded-md">
              <div className="inline-flex flex-col items-start justify-start space-y-1">
                <p className="text-sm font-medium leading-tight text-gray-500">
                  Charges Fee
                </p>
                <div className="inline-flex items-end justify-start">
                  <div className="flex items-end justify-start space-x-2">
                    <p className="text-xl font-bold leading-7 text-gray-700">
                      $ {data?.chargesFee.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex w-1/5 items-start justify-start rounded-md">
              <div className="inline-flex flex-col items-start justify-start space-y-1">
                <p className="text-sm font-medium leading-tight text-gray-500">
                  Adjustment
                </p>
                <div className="inline-flex items-end justify-start">
                  <div className="flex items-end justify-start space-x-2">
                    <p
                      className={classNames(
                        'text-xl font-bold leading-7',
                        chargeAmountColor(data?.adjustments || 0)
                      )}
                    >
                      {' '}
                      $ {data?.adjustments.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex w-1/5 items-start justify-start rounded-md">
              <div className="inline-flex flex-col items-start justify-start space-y-1">
                <p className="text-sm font-medium leading-tight text-gray-500">
                  {' '}
                  Write-Off
                </p>
                <div className="inline-flex items-end justify-start">
                  <div className="flex items-end justify-start space-x-2">
                    <p
                      className={classNames(
                        'text-xl font-bold leading-7',
                        chargeAmountColor(data?.writeOFF || 0)
                      )}
                    >
                      {' '}
                      $ {data?.writeOFF.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex w-1/5 items-start justify-start rounded-md">
              <div className="inline-flex flex-col items-start justify-start space-y-1">
                <p className="text-sm font-medium leading-tight text-gray-500">
                  {' '}
                  Expected
                </p>
                <div className="inline-flex items-end justify-start">
                  <div className="flex items-end justify-start space-x-2">
                    <p
                      className={classNames(
                        'text-xl font-bold leading-7',
                        chargeAmountColor(data?.expected || 0)
                      )}
                    >
                      {' '}
                      $ {data?.expected?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mx-1 py-[30px]">
            <div className="h-px w-full bg-gray-200 " />
          </div>
          <div className="flex items-center justify-start space-x-4">
            <p className="text-base font-bold leading-normal text-gray-500">
              Insurance Balance
            </p>
          </div>
          <div className="inline-flex w-full pb-[20px]">
            <div className="mt-2 inline-flex">
              <p className="w-[220px] font-medium leading-tight text-gray-500">
                Ins. Responsibility
                <p
                  className={classNames(
                    'p-1 pt-3 text-lg font-bold text-gray-900'
                  )}
                >
                  $ {data?.insuranceAmount?.toFixed(2)}
                </p>
              </p>
              <p className="w-[220px] font-medium leading-tight text-gray-500">
                Ins. Adjustment
                <p
                  className={classNames(
                    'p-1 pt-3 text-lg font-bold',
                    chargeAmountColor(data?.insuranceAdjustment || 0)
                  )}
                >
                  $ {data?.insuranceAdjustment?.toFixed(2)}
                </p>
              </p>
              <p className="w-[220px] font-medium leading-tight text-gray-500">
                Ins. Paid
                <p
                  className={classNames(
                    'p-1 pt-3 text-lg font-bold',
                    chargePaidAmountColor(data?.insurancePaid || 0)
                  )}
                >
                  $ {data?.insurancePaid?.toFixed(2)}
                </p>
              </p>
              <p className="w-[220px] font-medium leading-tight text-gray-500">
                Ins. Balance
                <p
                  className={classNames(
                    'p-1 pt-3 text-lg font-bold',
                    chargeAmountColor(data?.insuranceBalance || 0)
                  )}
                >
                  $ {data?.insuranceBalance?.toFixed(2)}
                </p>
              </p>
            </div>
          </div>
          <div className="">
            <>
              <Button
                buttonType={ButtonType.primary}
                cls={`w-[220px] inline-flex px-4 py-2 gap-2 leading-5 ml-2.5`}
                onClick={async () => {
                  setShowPostPaymentModal(true);
                  setPatientPosting(false);
                }}
              >
                <Icon name={'payment'} size={18} />
                <p className="text-sm">Post Insurance Payment</p>
              </Button>
              <Button
                buttonType={ButtonType.primary}
                cls={`w-[220px] inline-flex px-4 py-2 gap-2 leading-5 ml-2.5`}
                onClick={async () => {
                  setShowPostPaymentModal(true);
                }}
              >
                <Icon name={'copy'} size={18} />
                <p className="text-sm">Create Crossover Claim</p>
              </Button>
            </>
          </div>
          <div className="mx-1 py-[30px]">
            <div className="h-px w-full bg-gray-200 " />
          </div>
          <div className="flex items-center justify-start space-x-4">
            <p className="text-base font-bold leading-normal text-gray-500">
              {' '}
              Patient Balance
            </p>
          </div>
          <div className="mt-2 inline-flex pb-[20px]">
            <div className="inline-flex">
              <p className="w-[220px] font-medium leading-tight text-gray-500">
                Patient Responsibility
                <p
                  className={classNames(
                    'p-1 pt-3 text-lg font-bold text-gray-900'
                  )}
                >
                  ${data?.patientAmount.toFixed(2)}
                </p>
              </p>
              <p className="w-[220px] font-medium leading-tight text-gray-500">
                Patient Adjustment
                <p
                  className={classNames(
                    'p-1 pt-3 text-lg font-bold',
                    chargeAmountColor(data?.patientAdjustment || 0)
                  )}
                >
                  $ {data?.patientAdjustment.toFixed(2)}
                </p>
              </p>
              <p className="w-[220px] font-medium leading-tight text-gray-500">
                Patient Paid
                <p
                  className={classNames(
                    'p-1 pt-3 text-lg font-bold',
                    chargePaidAmountColor(data?.patientPaid || 0)
                  )}
                >
                  $ {data?.patientPaid?.toFixed(2)}
                </p>
              </p>
              <p className="w-[220px] font-medium leading-tight text-gray-500">
                Patient Balance
                <p
                  className={classNames(
                    'p-1 pt-3 text-lg font-bold',
                    chargeAmountColor(data?.patientBalance || 0)
                  )}
                >
                  $ {data?.patientBalance?.toFixed(2)}
                </p>
              </p>
            </div>
          </div>
          <div className="">
            <Button
              buttonType={ButtonType.primary}
              cls={`w-[220px] inline-flex px-4 py-2 gap-2 leading-5 ml-2.5`}
              onClick={async () => {
                setPatientPosting(true);
                setShowPostPaymentModal(true);
              }}
            >
              <Icon name={'payment'} size={18} />
              <p className="text-sm">Post Patient Payment</p>
            </Button>
            <Button
              buttonType={ButtonType.primary}
              cls={`w-[220px] inline-flex px-4 py-2 gap-2 leading-5 ml-2.5`}
              onClick={() => {
                setPatientPosting(true);
                setShowPostPaymentModal(true);
              }}
            >
              <Icon name={'copy'} size={18} />
              <p className="text-sm">Create Crossover Claim</p>
            </Button>
          </div>
        </div>
        <div className="h-[550px] w-1/5  text-right">
          <div
            className={classNames(
              'text-base font-bold leading-normal text-right ',
              getTotalBalanceClass('divClassName')
            )}
          >
            <p className={getTotalBalanceClass('pClassName')}>
              Total Claim Balance
            </p>
            <div className="pt-[450px] text-right">
              <p className={getTotalBalanceClass('balanceClassName')}>
                $ {data?.totalClaimBalance?.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ClaimBalance;
