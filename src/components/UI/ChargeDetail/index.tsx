import React, { useEffect, useState } from 'react';
import type { MultiValue } from 'react-select';

import Icon from '@/components/Icon';
import Modal from '@/components/UI/Modal';
import type { IcdData } from '@/screen/createClaim';
import { deleteChargeSaga } from '@/store/shared/sagas';
import type {
  ChargeDiagnosisFieldsUpdate,
  SummaryBillingCharges,
} from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

import Badge from '../Badge';
import Button, { ButtonType } from '../Button';
import CloseButton from '../CloseButton';
import InfoToggle from '../InfoToggle';
import type { MultiSelectDropDownDataType } from '../MultiSelectDropDown';
import type { MultiSelectGridDropdownDataType } from '../MultiSelectGridDropdown';
import MultiSelectGridDropdown from '../MultiSelectGridDropdown';
import StatusModal, { StatusModalType } from '../StatusModal';
// eslint-disable-next-line import/no-cycle
import { ViewChargeDetails } from './view-charge-detail';

export interface ChargeDetailProps {
  data: SummaryBillingCharges;
  icdRows: IcdData[];
  dxCodeDropdownData: MultiSelectDropDownDataType[];
  cls: string;
  reloadData: () => void;
  onCrossOverClaimClick?: () => void;
  onPaymentClaimClick?: () => void;
  openViewChargeDetails: (v: boolean) => void;
  patientID?: number;
  onSaveDiagnosis: (obj: ChargeDiagnosisFieldsUpdate) => void;
  closeDiagnosisPopup: boolean;
  onIsDXpopupOpened: () => void;
}
export default function ChargeDetail({
  data,
  dxCodeDropdownData,
  icdRows,
  cls,
  onPaymentClaimClick,
  onCrossOverClaimClick,
  openViewChargeDetails,
  reloadData,
  patientID,
  onSaveDiagnosis,
  closeDiagnosisPopup = false,
  onIsDXpopupOpened,
}: ChargeDetailProps) {
  const badgeClasses = (chargeValue: string) => {
    if (chargeValue.includes('Paid')) {
      return 'bg-green-100 text-green-800 rounded-[2px]';
    }
    if (chargeValue.includes('Denied')) {
      return 'bg-red-100 text-red-800 rounded-[2px]';
    }
    if (chargeValue.includes('Responsib')) {
      return 'bg-yellow-100 text-yellow-800 rounded-[2px]';
    }
    return 'bg-gray-100 text-gray-800 rounded-[2px]';
  };
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
  const totalBalanceColor = (balance: number) => {
    if (balance === 0) {
      return ' bg-green-50 border-green-300';
    }
    if (balance > 0) {
      return 'bg-red-50 border-red-300';
    }
    return 'bg-yellow-50 border-yellow-300';
  };
  const badgeIcon = (chargeStatus: string) => {
    if (chargeStatus.includes('Paid')) {
      return IconColors.GREEN;
    }
    if (chargeStatus.includes('Denied')) {
      return IconColors.RED;
    }
    if (chargeStatus.includes('Responsib')) {
      return IconColors.Yellow;
    }
    return IconColors.GRAY;
  };
  const [isOpen, setIsOpen] = useState(false);
  const [openDXPopup, setOpenDXPopup] = useState(false);
  useEffect(() => {
    if (closeDiagnosisPopup) {
      setOpenDXPopup(false);
    }
  }, [closeDiagnosisPopup]);
  const defaultStatusModalState = {
    open: false,
    heading: '',
    description: '',
    okButtonText: 'Ok',
    closeButtonText: 'Close',
    statusModalType: StatusModalType.ERROR,
    showCloseButton: false,
    closeOnClickOutside: false,
    confirmActionType: '',
  };
  const [statusModalState, setStatusModalState] = useState<{
    open: boolean;
    showCloseButton?: boolean;
    heading: string;
    description: string;
    statusModalType: StatusModalType;
    confirmActionType?: string;
    okButtonText?: string;
    okButtonColor?: ButtonType;
    closeButtonText: string;
    closeOnClickOutside: boolean;
  }>(defaultStatusModalState);
  useEffect(() => {
    if (openViewChargeDetails) openViewChargeDetails(isOpen);
  }, [isOpen]);

  const [dxCode, setdxCode] = useState<
    MultiValue<MultiSelectGridDropdownDataType> | []
  >([]);
  useEffect(() => {
    if (openDXPopup) {
      setdxCode(
        dxCodeDropdownData
          .filter((a) =>
            [data.icd1, data.icd2, data.icd3, data.icd4].includes(a.value)
          )
          .sort(function (obj1, obj2) {
            let a = 0;
            let b = 0;
            if (obj1.value === data.icd1) a = 1;
            if (obj1.value === data.icd2) a = 2;
            if (obj1.value === data.icd3) a = 3;
            if (obj1.value === data.icd4) a = 4;
            if (obj2.value === data.icd1) b = 1;
            if (obj2.value === data.icd2) b = 2;
            if (obj2.value === data.icd3) b = 3;
            if (obj2.value === data.icd4) b = 4;
            return a - b;
          })
          .map((a) => ({
            ...a,
          })) || []
      );
    }
  }, [openDXPopup]);

  const updateChargeDiagnosis = async () => {
    const pointerArr = [];
    pointerArr.push(
      dxCode &&
        dxCode?.length > 0 &&
        dxCode[0] &&
        icdRows
          ?.filter((a) => a.icd10Code === dxCode[0]?.value)
          .map((a) => a.order)[0]
        ? icdRows
            ?.filter((a) => a.icd10Code === dxCode[0]?.value)
            .map((a) => a.order)[0]
        : ''
    );
    pointerArr.push(
      dxCode &&
        dxCode?.length > 1 &&
        dxCode[1] &&
        icdRows
          ?.filter((a) => a.icd10Code === dxCode[1]?.value)
          .map((a) => a.order)[0]
        ? icdRows
            ?.filter((a) => a.icd10Code === dxCode[1]?.value)
            .map((a) => a.order)[0]
        : ''
    );
    pointerArr.push(
      dxCode &&
        dxCode?.length > 2 &&
        dxCode[2] &&
        icdRows
          ?.filter((a) => a.icd10Code === dxCode[2]?.value)
          .map((a) => a.order)[0]
        ? icdRows
            ?.filter((a) => a.icd10Code === dxCode[2]?.value)
            .map((a) => a.order)[0]
        : ''
    );
    pointerArr.push(
      dxCode &&
        dxCode?.length > 3 &&
        dxCode[3] &&
        icdRows
          ?.filter((a) => a.icd10Code === dxCode[3]?.value)
          .map((a) => a.order)[0]
        ? icdRows
            ?.filter((a) => a.icd10Code === dxCode[3]?.value)
            .map((a) => a.order)[0]
        : ''
    );
    const pointerStr =
      pointerArr.length > 0 ? pointerArr.filter((a) => a !== '').join(',') : '';
    const obj: ChargeDiagnosisFieldsUpdate = {
      chargeID: data.chargeID,
      icd1: dxCode && dxCode?.length > 0 && dxCode[0] ? dxCode[0].value : '',
      icd2: dxCode && dxCode?.length > 1 && dxCode[1] ? dxCode[1].value : null,
      icd3: dxCode && dxCode?.length > 2 && dxCode[2] ? dxCode[2].value : null,
      icd4: dxCode && dxCode?.length > 3 && dxCode[3] ? dxCode[3].value : null,
      pointers: pointerStr,
    };
    onSaveDiagnosis(obj);
  };
  const onClickDelete = async () => {
    const res = await deleteChargeSaga(data.chargeID);
    if (res) {
      reloadData();
    }
  };
  return (
    <div
      className={classNames(
        cls,
        'relative rounded-lg border border-gray-300 bg-white'
      )}
      style={{ width: 1232, height: 418 }}
    >
      <div
        className="absolute inline-flex flex-col items-start justify-start space-y-1"
        style={{ width: 1184, height: 62, left: 24, top: 24 }}
      >
        <div
          className="flex items-center justify-between space-x-4"
          style={{ width: 1184, height: 38 }}
        >
          <div className="flex items-center justify-start space-x-4">
            <Icon name={'drag'} size={19} color={IconColors.GRAY_300} />
            <p className=" flex whitespace-nowrap text-sm font-bold leading-tight text-gray-500">
              Charge ID # {data.chargeID}
            </p>
            <Badge
              cls={badgeClasses(data.chargeStatus)}
              text={data.chargeStatus}
              icon={
                <Icon
                  name={
                    data.chargeStatus.includes('Responsib') ? 'user' : 'desktop'
                  }
                  color={badgeIcon(data.chargeStatus)}
                />
              }
            />
          </div>
          <div className="flex items-start justify-start space-x-2">
            <Button
              buttonType={ButtonType.secondary}
              cls={`inline-flex px-4 py-2 gap-2 leading-5`}
              onClick={() => {
                setIsOpen(true);
              }}
            >
              <Icon name={'eye'} size={16} color={IconColors.NONE} />
              <p className="whitespace-nowrap text-sm font-medium leading-tight text-gray-700">
                View Charge Details
              </p>
            </Button>
            <>
              <Modal
                open={openDXPopup}
                onClose={() => {
                  // setOpenDXPopup(false);
                }}
                modalContentClassName=" bg-gray-100  rounded-lg bg-white pt-5 text-left shadow-xl  w-[600px] "
              >
                <div
                  className="inline-flex flex-col items-center justify-start space-y-6 rounded-lg bg-gray-100 "
                  style={{ width: 600, height: 300 }}
                >
                  <div
                    className="flex h-full w-full flex-col items-start justify-start gap-4  pt-1"
                    // style={{ width: 600, height: 76 }}
                  >
                    <div
                      className=" inline-flex w-full items-center justify-between px-[18px]"
                      // style={{ width: 550, height: 28 }}
                    >
                      <div className="flex items-center justify-start ">
                        <p className="text-xl font-bold leading-7 text-gray-700">
                          DX Codes
                        </p>
                        <InfoToggle
                          position="right"
                          text={
                            <div>
                              {' '}
                              CMS1500 : BOX24-E <br /> X12 : LOOP 2400 - SV107
                            </div>
                          }
                        />
                      </div>
                      <CloseButton
                        onClick={() => {
                          // reloadData();
                          setOpenDXPopup(false);
                        }}
                      />
                    </div>
                    <div className="h-[1px] w-full bg-gray-300 px-[18px]" />
                    {/* <div
                      className="inline-flex items-center justify-center pb-2"
                      style={{ width: 580, height: 20 }}
                    >
                     
                    </div> */}
                    <div className=" flex h-full w-full flex-col justify-between">
                      <div className="self-start px-[18px]">
                        <MultiSelectGridDropdown
                          placeholder=""
                          openFullWidthMenu={true}
                          data={dxCodeDropdownData}
                          disabled={false}
                          selectedValue={dxCode}
                          cls="min-w-[456px]"
                          onSelect={(e) => {
                            if (e && e.length < 5) {
                              setdxCode(e);
                            }
                          }}
                        />
                        {/* <MultiSelectDropDown
                          placeholder=""
                          cls="min-w-[456px]"
                          showSearchBar={true}
                          showSelectionInfo={true}
                          disabled={false}
                          data={dxCodeDropdownData}
                          selectedValue={dxCode}
                          onSelect={(e) => {
                            if (e && e.length < 5) {
                              setdxCode(e);
                            }
                          }}
                          // appendTextClass={'text-gray-500'}
                        /> */}
                      </div>
                      <div className="w-full self-end rounded-b-lg bg-gray-200">
                        <div className=" p-3" style={{ textAlign: 'end' }}>
                          <Button
                            buttonType={ButtonType.primary}
                            onClick={updateChargeDiagnosis}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Modal>
              <Modal
                open={isOpen}
                onClose={() => {
                  // setIsOpen(false);
                }}
                modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
              >
                <ViewChargeDetails
                  icdRows={icdRows}
                  chargeID={data.chargeID}
                  patientID={patientID}
                  sortOrder={data.sortOrder}
                  dxCodeDropdownData={dxCodeDropdownData}
                  onClose={() => {
                    setIsOpen(false);
                    reloadData();
                  }}
                />
              </Modal>
            </>
            <Button
              buttonType={ButtonType.secondary}
              cls={`inline-flex px-4 py-2 gap-2 leading-5`}
              onClick={() => {}}
            >
              <Icon name={'pencil'} size={16} color={IconColors.NONE} />
              <p className="whitespace-nowrap text-sm font-medium leading-tight text-gray-700">
                Change Charge Status
              </p>
            </Button>
            <Button
              buttonType={ButtonType.primary}
              cls={`inline-flex px-4 py-2 gap-2 leading-5`}
              onClick={onPaymentClaimClick || (() => '')}
            >
              <Icon name={'payment'} size={16} color={IconColors.NONE} />
              <p className="whitespace-nowrap text-sm font-medium leading-tight text-white">
                Post Payment
              </p>
            </Button>
            <Button
              buttonType={ButtonType.primary}
              cls={`inline-flex px-4 py-2 gap-2 leading-5`}
              onClick={onCrossOverClaimClick || (() => '')}
            >
              <Icon name={'copy'} size={16} color={IconColors.NONE} />
              <p className="whitespace-nowrap text-sm font-medium leading-tight text-white">
                Create Crossover Claim
              </p>
            </Button>
            <Button
              buttonType={ButtonType.secondary}
              onClick={() => {
                setStatusModalState({
                  ...statusModalState,
                  open: true,
                  heading: 'Delete Charge Confirmation',
                  okButtonText: 'Yes',
                  okButtonColor: ButtonType.tertiary,
                  description: `Would you like to permanently delete this Charge? Once deleted, it cannot be recovered.`,
                  closeButtonText: 'No',
                  statusModalType: StatusModalType.WARNING,
                  showCloseButton: true,
                  closeOnClickOutside: false,
                  confirmActionType: 'delete',
                });
              }}
              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
            >
              <Icon name={'trash'} size={18} color={IconColors.NONE} />
            </Button>
          </div>
        </div>
        <div className="inline-flex items-center justify-center pt-2.5 pb-2">
          <div className="bg-gray-200" style={{ width: 1184, height: 1 }} />
        </div>
        <div className="inline-flex items-center ">
          {/* CPT SEction */}
          <div
            className="inline-flex flex-col items-start justify-start space-y-6 rounded-lg border border-gray-200 bg-gray-50 p-4 "
            style={{ width: 538, height: 302 }}
          >
            <div
              className="flex w-full flex-col items-start justify-start space-y-4"
              // style={{ width: 506, height: 114 }}
            >
              <div className="flex w-full justify-between gap-4">
                <div className="flex w-[73%] flex-col items-start justify-start">
                  <p className="text-xs font-medium leading-none text-gray-500">
                    CPT Code
                  </p>
                  <p className="text-base font-bold leading-normal text-gray-700">
                    {data.cpt} | {data.cptDescription}
                  </p>
                </div>
                <div className="flex w-[27%] flex-col items-start pt-[4px] text-xs font-bold text-gray-700">
                  <div>DOS:</div>
                  <div className="">From: {data.fromDOS}</div>
                  <div className="">To: {data.toDOS}</div>
                </div>
              </div>
              <div
                className="inline-flex flex-col  items-start justify-start "
                style={{ width: 506, height: 58 }}
              >
                <div className="flex gap-1">
                  <p className="text-xs font-medium leading-none text-gray-500">
                    DX
                  </p>
                  <InfoToggle
                    position="right"
                    text={
                      <div>
                        {' '}
                        CMS1500 : BOX24-E <br /> X12 : LOOP 2400 - SV107
                      </div>
                    }
                  />
                </div>
                <div
                  className="inline-flex items-center justify-start space-x-2"
                  style={{ width: 506, height: 42 }}
                >
                  <MultiSelectGridDropdown
                    placeholder=""
                    openFullWidthMenu={true}
                    data={dxCodeDropdownData}
                    disabled={true}
                    selectedValue={
                      dxCodeDropdownData
                        .filter((a) =>
                          [data.icd1, data.icd2, data.icd3, data.icd4].includes(
                            a.value
                          )
                        )
                        .sort(function (obj1, obj2) {
                          let a = 0;
                          let b = 0;
                          if (obj1.value === data.icd1) a = 1;
                          if (obj1.value === data.icd2) a = 2;
                          if (obj1.value === data.icd3) a = 3;
                          if (obj1.value === data.icd4) a = 4;
                          if (obj2.value === data.icd1) b = 1;
                          if (obj2.value === data.icd2) b = 2;
                          if (obj2.value === data.icd3) b = 3;
                          if (obj2.value === data.icd4) b = 4;
                          return a - b;
                        })
                        .map((a) => ({
                          ...a,
                        })) as MultiValue<MultiSelectGridDropdownDataType>
                    }
                    showSearchBar={true}
                    cls="min-w-[456px]"
                    onSelect={() => {}}
                    onSearch={() => {}}
                  />

                  <Button
                    buttonType={ButtonType.secondary}
                    cls={`inline-flex px-3 py-2 gap-2 leading-5 h-[39px]`}
                    onClick={() => {
                      onIsDXpopupOpened();
                      setOpenDXPopup(true);
                    }}
                  >
                    <Icon name={'pencil'} size={16} color={IconColors.NONE} />
                  </Button>
                </div>
              </div>
            </div>
            <div
              className="no-scrollbar inline-flex items-start justify-start space-x-4 overflow-y-auto"
              style={{ width: 537, height: 216 }}
            >
              <div className="inline-flex flex-col items-start justify-start space-y-1">
                <p className="text-xs font-medium leading-none text-gray-500">
                  Charge Status
                </p>
                <Badge
                  cls={badgeClasses(data.chargeStatus)}
                  text={`${data.chargeStatus}`}
                  icon={
                    <Icon
                      name={
                        data.chargeStatus.includes('Responsib')
                          ? 'user'
                          : 'desktop'
                      }
                      color={badgeIcon(data.chargeStatus)}
                    />
                  }
                />
              </div>
              <div
                className="inline-flex flex-col items-start justify-start space-y-1"
                style={{ width: 398, height: 216 }}
              >
                <p className="text-xs font-medium leading-none text-gray-500">
                  Charge Status Details
                </p>
                <div
                  className="flex flex-col items-start justify-start space-y-2"
                  style={{ width: 398 }}
                >
                  <div
                    className="flex flex-col items-start justify-center"
                    style={{ width: 398 }}
                  >
                    <p
                      className="text-xs font-medium uppercase leading-none tracking-wide text-gray-500"
                      style={{ width: 398 }}
                    >
                      GROUP CODE:
                    </p>
                    {data &&
                      data.groupCodes &&
                      data.groupCodes.map((val) => (
                        <p
                          key={val.code}
                          className="text-xs font-semibold leading-none text-gray-700"
                          style={{ width: 398 }}
                        >
                          {`${val.code}|${val.description}`}
                        </p>
                      ))}
                  </div>
                  <div
                    className="border-gray-200"
                    style={{ width: 398, height: 1 }}
                  />
                  <div
                    className="flex flex-col items-start justify-center"
                    style={{ width: 398 }}
                  >
                    <p
                      className="text-xs font-medium uppercase leading-none tracking-wide text-gray-500"
                      style={{ width: 398 }}
                    >
                      Reason Code:
                    </p>
                    {data &&
                      data.reasonCodes &&
                      data.reasonCodes.map((value) => (
                        <p
                          key={value.code}
                          className="text-xs font-semibold leading-none text-gray-700"
                          style={{ width: 398 }}
                        >
                          {`${value.code}|${value.description}`}
                        </p>
                      ))}
                  </div>
                  <div
                    className="border-gray-200"
                    style={{ width: 398, height: 1 }}
                  />
                  <div
                    className="flex flex-col items-start justify-center"
                    style={{ width: 398 }}
                  >
                    <p
                      className="text-xs font-medium uppercase leading-none tracking-wide text-gray-500"
                      style={{ width: 1184 }}
                    >
                      Remark Code:
                    </p>
                    <div
                      className="flex flex-col items-start justify-start space-y-1"
                      style={{ width: 390 }}
                    >
                      {data &&
                        data.remarkCodes &&
                        data.remarkCodes.map((codes) => (
                          <p
                            key={codes.code}
                            className="text-xs font-semibold leading-none text-gray-700"
                            style={{ width: 398 }}
                          >
                            {`${codes.code}|${codes.description}`}
                          </p>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Financial Section */}
          <div
            className=" m-3 inline-flex flex-col items-start justify-start space-y-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2"
            style={{ width: 440, height: 302 }}
          >
            <div
              className="flex flex-col items-start justify-start rounded-lg py-2"
              style={{ width: 408, height: 84 }}
            >
              <div
                className="flex flex-col items-start justify-start space-y-2"
                style={{ width: 408, height: 68 }}
              >
                <div className="flex items-center justify-start space-x-4">
                  <div className="flex items-center justify-start space-x-4">
                    <p className="text-sm font-bold leading-tight text-gray-500">
                      Fee Adjustments
                    </p>
                  </div>
                </div>
                <div
                  className="inline-flex items-start justify-start space-x-10"
                  style={{ width: 408, height: 40 }}
                >
                  <div className="flex h-full w-1/6 items-start justify-start rounded-md">
                    <div className="inline-flex flex-col items-start justify-start space-y-1">
                      <p className="text-xs font-medium leading-none text-gray-500">
                        Charge Fee
                      </p>
                      <div className="inline-flex items-end justify-start">
                        <div className="flex items-end justify-start space-x-2">
                          <p className="text-sm font-bold leading-tight text-gray-700">
                            $ {data.fee.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-1/6 items-start justify-start rounded-md">
                    <div className="inline-flex flex-col items-start justify-start space-y-1">
                      <p className="text-xs font-medium leading-none text-gray-500">
                        Adjustments
                      </p>
                      <div className="inline-flex items-end justify-start">
                        <div className="flex items-end justify-start space-x-2">
                          <p
                            className={classNames(
                              'text-sm font-bold leading-tight',
                              chargeAmountColor(data.adjustments)
                            )}
                          >
                            $ {data.adjustments.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-1/6 items-start justify-start rounded-md">
                    <div className="inline-flex flex-col items-start justify-start space-y-1">
                      <p className="text-xs font-medium leading-none text-gray-500">
                        Write-Off
                      </p>
                      <div className="inline-flex items-end justify-start">
                        <div className="flex items-end justify-start space-x-2">
                          <p
                            className={classNames(
                              'text-sm font-bold leading-tight',
                              chargeAmountColor(data.writeOFF)
                            )}
                          >
                            $ {data.writeOFF.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-1/6 items-start justify-start rounded-md">
                    <div className="inline-flex flex-col items-start justify-start space-y-1">
                      <p className="text-xs font-medium leading-none text-gray-500">
                        Expected
                      </p>
                      <div className="inline-flex items-end justify-start">
                        <div className="flex items-end justify-start space-x-2">
                          <p
                            className={classNames(
                              'text-sm font-bold leading-tight',
                              chargeAmountColor(data.expected)
                            )}
                          >
                            $ {data.expected.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-200" style={{ width: 408, height: 1 }} />
            <div
              className="flex flex-col items-start justify-start rounded-lg py-2"
              style={{ width: 408, height: 84 }}
            >
              <div
                className="flex flex-col items-start justify-start space-y-2"
                style={{ width: 408, height: 68 }}
              >
                <div
                  className="inline-flex items-center justify-start"
                  style={{ width: 408, height: 20 }}
                >
                  <div className="flex items-center justify-start space-x-4">
                    <div className="flex items-center justify-start space-x-4">
                      <p className="text-sm font-bold leading-tight text-gray-500">
                        Insurance Balance
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="inline-flex items-start justify-start space-x-10"
                  style={{ width: 408, height: 40 }}
                >
                  <div className="flex h-full w-1/6 items-start justify-start rounded-md">
                    <div className="inline-flex flex-col items-start justify-start space-y-1">
                      <p className="text-xs font-medium leading-none text-gray-500">
                        Ins. Resp.
                      </p>
                      <div className="inline-flex items-end justify-start">
                        <div className="flex items-end justify-start space-x-2">
                          <p className="text-sm font-bold leading-tight text-gray-700">
                            $ {data.insuranceAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-full w-1/6 items-start justify-start rounded-md">
                    <div className="inline-flex flex-col items-start justify-start space-y-1">
                      <p className="text-xs font-medium leading-none text-gray-500">
                        Ins. Adjust.
                      </p>
                      <div className="inline-flex items-end justify-start">
                        <div className="flex items-end justify-start space-x-2">
                          <p
                            className={classNames(
                              'text-sm font-bold leading-tight',
                              chargeAmountColor(data.insuranceAdjustment)
                            )}
                          >
                            $ {data.insuranceAdjustment.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-full w-1/6 items-start justify-start rounded-md">
                    <div className="inline-flex flex-col items-start justify-start space-y-1">
                      <p className="text-xs font-medium leading-none text-gray-500">
                        Ins. Paid
                      </p>
                      <div className="inline-flex items-end justify-start">
                        <div className="flex items-end justify-start space-x-2">
                          <p
                            className={classNames(
                              'text-sm font-bold leading-tight',
                              chargePaidAmountColor(data.insurancePaid)
                            )}
                          >
                            $ {data.insurancePaid.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-full w-1/6 items-start justify-start rounded-md">
                    <div className="inline-flex flex-col items-start justify-start space-y-1">
                      <p className="text-xs font-medium leading-none text-gray-500">
                        Ins. Balance
                      </p>
                      <div className="inline-flex items-end justify-start">
                        <div className="flex items-end justify-start space-x-2">
                          <p
                            className={classNames(
                              'text-sm font-bold leading-tight',
                              chargeAmountColor(data.insuranceBalance)
                            )}
                          >
                            $ {data.insuranceBalance.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-200" style={{ width: 408, height: 1 }} />
            <div
              className="flex flex-col items-start justify-start rounded-lg py-2"
              style={{ width: 408, height: 84 }}
            >
              <div
                className="flex flex-col items-start justify-start space-y-2"
                style={{ width: 408, height: 68 }}
              >
                <div className="flex items-center justify-start space-x-4">
                  <div className="flex items-center justify-start space-x-4">
                    <p className="text-sm font-bold leading-tight text-gray-500">
                      Patient Balance
                    </p>
                  </div>
                </div>
                <div
                  className="inline-flex items-start justify-start space-x-10"
                  style={{ width: 408, height: 40 }}
                >
                  <div className="flex h-full w-1/6 items-start justify-start rounded-md">
                    <div className="inline-flex flex-col items-start justify-start space-y-1">
                      <p className="text-xs font-medium leading-none text-gray-500">
                        Pat. Resp.
                      </p>
                      <div className="inline-flex items-end justify-start">
                        <div className="flex items-end justify-start space-x-2">
                          <p className="text-sm font-bold leading-tight text-gray-700">
                            $ {data.patientAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-full w-1/6 items-start justify-start rounded-md">
                    <div className="inline-flex flex-col items-start justify-start space-y-1">
                      <p className="text-xs font-medium leading-none text-gray-500">
                        Pat. Adjust.
                      </p>
                      <div className="inline-flex items-end justify-start">
                        <div className="flex items-end justify-start space-x-2">
                          <p
                            className={classNames(
                              'text-sm font-bold leading-tight',
                              chargeAmountColor(data.patientAdjustment)
                            )}
                          >
                            $ {data.patientAdjustment.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-full w-1/6 items-start justify-start rounded-md">
                    <div className="inline-flex flex-col items-start justify-start space-y-1">
                      <p className="text-xs font-medium leading-none text-gray-500">
                        Pat. Paid
                      </p>
                      <div className="inline-flex items-end justify-start">
                        <div className="flex items-end justify-start space-x-2">
                          <p
                            className={classNames(
                              'text-sm font-bold leading-tight',
                              chargePaidAmountColor(data.patientPaid)
                            )}
                          >
                            $ {data.patientPaid.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-full w-1/6 items-start justify-start rounded-md">
                    <div className="inline-flex flex-col items-start justify-start space-y-1">
                      <p className="text-xs font-medium leading-none text-gray-500">
                        Pat. Balance
                      </p>
                      <div className="inline-flex items-end justify-start">
                        <div className="flex items-end justify-start space-x-2">
                          <p
                            className={classNames(
                              'text-sm font-bold leading-tight',
                              chargeAmountColor(data.patientBalance)
                            )}
                          >
                            $ {data.patientBalance.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Total Card */}
          <div
            className={classNames(
              'h-[302px] inline-flex flex-col justify-between justify-end h-72 px-4 py-2  border rounded-lg',
              totalBalanceColor(data.totalBalance)
            )}
          >
            <div className="flex flex-1 flex-col items-end justify-between space-y-2">
              <div className="flex items-center justify-start space-x-4">
                <div className="flex items-center justify-start space-x-4">
                  <p
                    className={classNames(
                      'text-sm font-bold leading-tight text-right',
                      chargeAmountColor(data.totalBalance)
                    )}
                  >
                    Total Charge Balance
                  </p>
                </div>
              </div>
              <div className="h-full basis-0 items-end justify-end rounded-md">
                <div className="inline-flex flex-col items-end justify-end space-y-1">
                  <div className="inline-flex items-end justify-end">
                    <div className="flex items-end justify-end space-x-2">
                      <p
                        className={classNames(
                          'text-base font-bold leading-normal',
                          chargeAmountColor(data.totalBalance)
                        )}
                      >
                        $ {data.totalBalance}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <StatusModal
        open={statusModalState.open}
        heading={statusModalState.heading}
        description={statusModalState.description}
        okButtonText={statusModalState.okButtonText}
        closeButtonText={statusModalState.closeButtonText}
        statusModalType={statusModalState.statusModalType}
        showCloseButton={statusModalState.showCloseButton}
        closeOnClickOutside={statusModalState.closeOnClickOutside}
        onClose={() => {
          setStatusModalState({
            ...statusModalState,
            open: false,
          });
        }}
        onChange={() => {
          // if (statusModalState.confirmActionType === 'reversePayment') {
          //   setPostingDateModel(true);
          // }
          // if (statusModalState.confirmActionType === 'saveConfirmation') {
          //   saveChargesWithClaim();
          // }
          if (statusModalState.confirmActionType === 'delete') {
            onClickDelete();
          }
          setStatusModalState({
            ...statusModalState,
            open: false,
          });
        }}
      />
    </div>
  );
}
