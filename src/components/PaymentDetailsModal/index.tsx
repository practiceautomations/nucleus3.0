import { useEffect, useState } from 'react';

import { getPaymentLedgerDetail } from '@/store/shared/sagas';
import type { ClaimDnaPaymentDetails } from '@/store/shared/types';
import { currencyFormatter } from '@/utils';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

import Icon from '../Icon';
// eslint-disable-next-line import/no-cycle
import PatientDetailModal from '../PatientDetailModal';
import AppDatePicker from '../UI/AppDatePicker';
import Button, { ButtonType } from '../UI/Button';
// eslint-disable-next-line import/no-cycle
import CloseButton from '../UI/CloseButton';
import DashboardTiles from '../UI/DashboardTiles';
import InputField from '../UI/InputField';
import Modal from '../UI/Modal';
import SingleItemWidget from '../UI/SingleItemWidget';
import TextArea from '../UI/TextArea';

interface PaymentDetailModalProp {
  paymentLedgerID: number | null;
  onClose: () => void;
}

export function PaymentDetailModal({
  paymentLedgerID,
  onClose,
}: PaymentDetailModalProp) {
  const initialData: ClaimDnaPaymentDetails = {
    paymentLedgerID,
    patientID: undefined,
    patient: '',
    claimID: undefined,
    chargeID: undefined,
    ledgerAccount: '',
    paymentType: '',
    paymentBatchID: undefined,
    checkNumber: '',
    postingDate: '',
    checkDate: '',
    depositDate: '',
    advancePayDOS: null,
    amount: null,
    comments: '',
    denialReason: '',
    adjustmentCodes: '',
    remarkCodes: '',
    parentPaymentLedgerID: null,
    externalLedgerID: null,
    isReconsiled: false,
    reconsileOn: null,
    reconsileBy: '',
    createdOn: '',
    createdBy: '',
    updatedOn: null,
    updatedBy: undefined,
    paymentBatchDescription: '',
  };
  const [dataResult, setDataResult] =
    useState<ClaimDnaPaymentDetails>(initialData);
  const getPaymentDetailsData = async (ledgerID: number) => {
    const res = await getPaymentLedgerDetail(ledgerID);
    if (res) {
      setDataResult(res);
    }
  };
  useEffect(() => {
    if (paymentLedgerID) {
      getPaymentDetailsData(paymentLedgerID);
    }
  }, [paymentLedgerID]);
  const [patientDetailsModal, setPatientDetailsModal] = useState<{
    open: boolean;
    id: number | null;
  }>({
    open: false,
    id: null,
  });
  // const [icdRows, setIcdRows] = useState<IcdData[]>([]);
  // const [openChargeStatusModal, setOpenChargeStatusModal] = useState(false);
  // const priorityOrderRender = (n: number | undefined) => {
  //   return (
  //     <div
  //       className={`relative mr-3 h-5 w-5 text-clip rounded bg-[rgba(6,182,212,1)] text-left font-['Nunito'] font-semibold text-white [box-shadow-width:1px] [box-shadow:0px_0px_0px_1px_rgba(6,_182,_212,_1)_inset]`}
  //     >
  //       <p className="absolute left-1.5 top-0.5 m-0 text-xs leading-4">{n}</p>
  //     </div>
  //   );
  // };
  // const getClaimSummaryData = async (id: number) => {
  //   const res = await getClaimDetailSummaryById(id);
  //   if (res) {
  //     const icdsRows = res.icds?.map((m) => {
  //       return {
  //         icd10Code: m.code,
  //         order: m.order,
  //         description: m.description,
  //         selectedICDObj: { id: m.id, value: m.code },
  //       };
  //     });
  //     setIcdRows(icdsRows);
  //     setOpenChargeStatusModal(true);
  //   }
  // };
  return (
    <div className="flex h-full w-full cursor-default flex-col rounded-lg bg-white text-left">
      <div id={'header'} className="mt-3 w-full max-w-full p-4">
        <div className="flex w-full flex-row justify-between">
          <div>
            <h1 className=" ml-2  text-left text-xl font-bold leading-7 text-gray-700">
              {`Payment Details`}
            </h1>
          </div>
          <div className="">
            <CloseButton onClick={onClose} />
          </div>
        </div>
        <div className="mt-3 h-px w-full bg-gray-300" />
      </div>

      <div
        id={'body'}
        className="flex h-full w-full flex-col overflow-x-hidden overflow-y-scroll  px-6 pb-4"
      >
        <div className="flex h-full w-full flex-col">
          <div className="flex gap-4">
            <SingleItemWidget
              title={''}
              text={`Ledger ID: ${
                dataResult.paymentLedgerID?.toString() || ''
              }`}
              subText={`Parent Ledger ID: ${
                dataResult.parentPaymentLedgerID?.toString() || ''
              }`}
              subText1={`External Ledger ID: ${
                dataResult.externalLedgerID?.toString() || ''
              }`}
              isClickable={false}
              icon={<Icon name={'desktop'} size={20} />}
            />
            <div className=" h-[80%] self-center border-l  border-gray-300"></div>

            <SingleItemWidget
              title={'Patient'}
              text={dataResult.patient}
              isClickable={true}
              icon={
                <Icon color={IconColors.GRAY_500} name={'user'} size={22} />
              }
              onClick={() => {
                if (dataResult.patientID) {
                  setPatientDetailsModal({
                    open: true,
                    id: dataResult.patientID,
                  });
                }
              }}
            />
            <div className=" h-[80%] self-center border-l  border-gray-300"></div>
            <SingleItemWidget
              title={'Claim ID'}
              text={dataResult.claimID?.toString() || ''}
              // isClickable={true}
              icon={
                <Icon
                  color={IconColors.GRAY_500}
                  name={'documentText'}
                  size={16}
                />
              }
              // onClick={() => {
              //   if (dataResult.claimID) {
              //     dispatch(
              //       setGlobalModal({
              //         type: 'Claim Detail',
              //         id: dataResult.claimID,
              //         isPopup: true,
              //       })
              //     );
              //   }
              // }}
            />
            <div className=" h-[80%] self-center border-l  border-gray-300"></div>
            <SingleItemWidget
              title={'Charge ID'}
              text={dataResult.chargeID?.toString() || ''}
              // isClickable={true}
              // onClick={() => {
              //   if (dataResult.claimID) {
              //     getClaimSummaryData(dataResult.claimID);
              //   }
              // }}
              icon={
                <Icon
                  color={IconColors.GRAY_500}
                  name={'documentText'}
                  size={16}
                />
              }
            />
            <div className="h-[80%] self-center border-l  border-gray-300"></div>
            <SingleItemWidget
              title={''}
              text={`Reconciled: ${dataResult.isReconsiled ? 'Yes' : 'No'}`}
              subText1={`Reconciled On: ${
                dataResult.reconsileOn
                  ? DateToStringPipe(new Date(dataResult.reconsileOn), 2)
                  : ''
              }`}
              subText={`Reconciled By: ${dataResult.reconsileBy}`}
              isClickable={false}
              icon={
                <Icon
                  color={IconColors.GRAY_500}
                  name={'clipboardCheck'}
                  size={20}
                />
              }
            />
            <div className=" h-[80%] self-center border-l border-gray-300"></div>
            <SingleItemWidget
              title={''}
              text={`Created By: ${dataResult.createdBy?.toString() || ''}`}
              subText={` Created On: 
                ${
                  dataResult.createdOn
                    ? DateToStringPipe(new Date(dataResult.createdOn), 2)
                    : ''
                }`}
              isClickable={false}
              icon={<Icon name={'calendar'} size={20} />}
            />
          </div>
          <div className="my-4 w-full border-t border-gray-300"></div>
          <div className="inline-flex h-full w-full flex-col items-start justify-start space-y-4 ">
            <p className="text-base font-bold leading-normal text-gray-700">
              Payment Details
            </p>
            <div className="inline-flex w-full items-start justify-start space-x-6">
              <div className="inline-flex w-60 flex-col items-start justify-start space-y-1">
                <p className="text-sm font-medium leading-tight">Payor</p>
                <div className="w-[240px]">
                  <InputField
                    placeholder=""
                    disabled={true}
                    onChange={() => {}}
                    value={dataResult.ledgerAccount}
                  />
                </div>
              </div>
              <div className="inline-flex w-60 flex-col items-start justify-start space-y-1">
                <p className="text-sm font-medium leading-tight">
                  Payment Type
                </p>
                <div data-testid="paymentType" className="w-[240px]">
                  {/* <SingleSelectGridDropDown
                placeholder=""
                showSearchBar={true}
                disabled={true}
                data={}
                selectedValue={}
                onSelect={(e) => {}}
              />  */}
                  <InputField
                    placeholder=""
                    disabled={true}
                    onChange={() => {}}
                    value={dataResult.paymentType}
                  />
                </div>
              </div>
              <div
                title={`${dataResult.paymentBatchID} | ${dataResult.paymentBatchDescription}`}
                className="inline-flex flex-col items-start justify-start space-y-1"
              >
                <div className="inline-flex items-center justify-start space-x-2">
                  <p className="text-sm font-medium leading-tight">
                    Payment Batch
                  </p>
                </div>
                <div className="inline-flex items-center justify-start space-x-2">
                  <div data-testid="paymentBatch" className="w-[240px]">
                    <InputField
                      placeholder=""
                      disabled={true}
                      onChange={() => {}}
                      value={`${dataResult.paymentBatchID} | ${dataResult.paymentBatchDescription}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={'w-full py-4'}>
            <div className={`h-[1px] w-full bg-gray-300`} />
          </div>
          <div className="inline-flex w-full flex-col items-start justify-start space-y-4">
            <p className="text-base font-bold leading-normal text-gray-700">
              Payment Dates
            </p>
            <div className="inline-flex w-full items-start justify-start space-x-6">
              <div className="inline-flex flex-col items-start justify-start space-y-1">
                <div className="inline-flex items-start justify-start space-x-1">
                  <p className="mr-0.5 text-sm font-medium leading-tight">
                    Check Date
                  </p>
                </div>
                <AppDatePicker
                  placeholderText="mm/dd/yyyy"
                  cls="w-[180px]"
                  onChange={() => {}}
                  disabled={true}
                  selected={dataResult?.checkDate}
                />
              </div>
              <div className="inline-flex flex-col items-start justify-start space-y-1">
                <div className="inline-flex items-start justify-start space-x-1">
                  <p className="mr-0.5 text-sm font-medium leading-tight">
                    Posting Date
                  </p>
                </div>
                <AppDatePicker
                  testId="posting_date_testid"
                  placeholderText="mm/dd/yyyy"
                  cls="w-[180px]"
                  disabled={true}
                  onChange={() => {}}
                  selected={dataResult?.postingDate}
                />
              </div>
              <div className="inline-flex flex-col items-start justify-start space-y-1">
                <div className="inline-flex items-start justify-start space-x-1">
                  <p className="mr-0.5 text-sm font-medium leading-tight">
                    Deposit Date
                  </p>
                </div>
                <AppDatePicker
                  placeholderText="mm/dd/yyyy"
                  cls="w-[180px]"
                  disabled={true}
                  onChange={() => {}}
                  selected={dataResult?.depositDate}
                />
              </div>
              <div className="inline-flex flex-col items-start justify-start space-y-1">
                <div className="inline-flex items-start justify-start space-x-1">
                  <p className="mr-0.5 text-sm font-medium leading-tight">
                    Advance Pay. DoS
                  </p>
                </div>
                <AppDatePicker
                  placeholderText="mm/dd/yyyy"
                  cls="w-[180px]"
                  disabled={true}
                  onChange={() => {}}
                  selected={dataResult?.advancePayDOS}
                />
              </div>
              <div className="inline-flex w-72 flex-col items-start justify-start space-y-1">
                <p className="text-sm font-medium leading-tight">
                  Check Number
                </p>
                <InputField
                  placeholder=""
                  disabled={true}
                  onChange={() => {}}
                  value={dataResult?.checkNumber}
                />
              </div>
            </div>
          </div>
          <div className={'w-full py-4'}>
            <div className={`h-[1px] w-full bg-gray-300`} />
          </div>
          <div className="flex h-full flex-col gap-4">
            <div className="flex gap-4">
              <div className="w-[50%]">
                <DashboardTiles
                  tileTitle={'Amount'}
                  tilesColor={
                    dataResult?.amount && dataResult?.amount < 0
                      ? 'red'
                      : 'green'
                  }
                  isShowViewButton={false}
                  count={currencyFormatter.format(dataResult?.amount || 0)}
                />
              </div>
              <div className="w-[50%]">
                <TextArea
                  id="textarea"
                  value={`Comments: ${dataResult.comments}`}
                  cls="!w-full text-sm leading-tight text-gray-500 flex-1 h-full px-3 py-2 bg-white shadow border rounded-md border-gray-300"
                  placeholder={''}
                  disabled={true}
                  onChange={() => {}}
                />
              </div>
            </div>

            {/* <div className="flex gap-4"> */}
            <DashboardTiles
              tileTitle={'Denial Reason'}
              tilesColor={'gray'}
              isShowViewButton={false}
              count={dataResult?.adjustmentCodes}
            />

            <div className="flex h-full w-full items-start justify-start rounded-md border border-gray-300 bg-gray-50 p-4">
              <div className="flex h-full w-full flex-col justify-between gap-1">
                <div
                  title={'Remark Codes'}
                  className="items-start truncate text-sm font-medium leading-tight text-gray-500"
                >
                  {'Remark Codes'}
                </div>
                <div className="w-full">
                  <div className="flex h-full shrink grow basis-0 items-end justify-between">
                    <div className="inline-flex items-baseline justify-start gap-2">
                      <div className="text-lg font-extrabold leading-7 text-gray-500">
                        <ul className="list-outside list-disc pl-4">
                          {dataResult.remarkCodes &&
                            dataResult.remarkCodes
                              .split(',')
                              .map((remark, index) => (
                                <li key={index}>{remark}</li>
                              ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                {/* </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className=" py-6">
        <div className="h-[45px] "></div>
      </div>
      <div id={'footer'} className={classNames('absolute bottom-0 w-full')}>
        <div className="flex w-full items-center justify-center self-end rounded-b-lg bg-gray-200 py-6">
          <div className="flex w-full items-center justify-end space-x-4 px-7">
            <Button
              buttonType={ButtonType.secondary}
              cls={`w-[102px] `}
              onClick={() => {
                // setCustomDate({
                //   toDate: null,
                //   fromDate: null,
                // });
                onClose();
              }}
            >
              {' '}
              Cancel
            </Button>
          </div>
        </div>
      </div>
      <Modal
        open={patientDetailsModal.open}
        modalContentClassName="relative w-[93%] h-[94%] text-left overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
        onClose={() => {}}
      >
        <PatientDetailModal
          isPopup={patientDetailsModal.open}
          selectedPatientID={patientDetailsModal.id}
          onCloseModal={() => {
            setPatientDetailsModal({
              open: false,
              id: null,
            });
          }}
          onSave={() => {
            // onClickSearch();
          }}
        />
      </Modal>
      {/* <Modal
        open={openChargeStatusModal}
        onClose={() => {
          setOpenChargeStatusModal(false);
        }}
        modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
      >
        <ViewChargeDetails
          icdRows={icdRows}
          chargeID={dataResult.chargeID}
          patientID={dataResult.patientID}
          sortOrder={0}
          dxCodeDropdownData={
            icdRows && icdRows.length > 0
              ? (icdRows.map((a) => ({
                  ...a.selectedICDObj,
                  appendText: a.description,
                  leftIcon: priorityOrderRender(a.order),
                })) as MultiSelectGridDropdownDataType[])
              : []
          }
          onClose={() => {
            setOpenChargeStatusModal(false);
          }}
        />
      </Modal> */}
    </div>
  );
}
