import React, { useEffect, useState } from 'react';

import Button, { ButtonType } from '@/components/UI/Button';
import {
  fetchPostingDate,
  getPatientLookup,
  setAdvancePayament,
} from '@/store/shared/sagas';
import type {
  PatientLookupDropdown,
  PostingDateCriteria,
  SaveAdvancePayment,
} from '@/store/shared/types';
import {
  DateToStringPipe,
  StringToDatePipe,
} from '@/utils/dateConversionPipes';

import AppDatePicker from '../UI/AppDatePicker';
import CloseButton from '../UI/CloseButton';
import InputField from '../UI/InputField';
import InputFieldAmount from '../UI/InputFieldAmount';
import type { SingleSelectDropDownDataType } from '../UI/SingleSelectDropDown';
import SingleSelectDropDown from '../UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '../UI/StatusModal';
import TextArea from '../UI/TextArea';

interface TProps {
  title?: string;
  groupID?: number;
  selectedPatientID: number | null;
  onClose: () => void;
  refreshDate: () => void;
}
export function AddAdvancePayement({
  groupID,
  onClose,
  selectedPatientID,
  refreshDate,
}: TProps) {
  const [insuranceFinderModalState, setInsuranceFinderModalState] = useState<{
    open: boolean;
    heading: string;
    description: string;
    okButtonText: string;
    closeButtonText: string;
    statusModalType: StatusModalType;
    showCloseButton: boolean;
    closeOnClickOutside: boolean;
  }>({
    open: false,
    heading: '',
    description: '',
    okButtonText: '',
    closeButtonText: '',
    statusModalType: StatusModalType.WARNING,
    showCloseButton: true,
    closeOnClickOutside: true,
  });
  const [confirmationModal, setConfirmationModal] = useState<{
    show: boolean;
    showCloseButton?: boolean;
    heading: string;
    text: string;
    type: StatusModalType;
    okButtonText?: string;
    okButtonColor?: ButtonType;
  }>();
  const [patientlookupData, setPatientlookupData] =
    useState<PatientLookupDropdown>();
  const [AdvancePaymentData, setAdvancePaymentData] =
    useState<SaveAdvancePayment>({
      appointmentID: null,
      patientID: selectedPatientID,
      paymentDate: '',
      postingDate: '',
      dos: '',
      amount: 0,
      paymentTypeID: null,
      ledgerAccounID: null,
      paymentNumber: '',
      comments: '',
      insuranceID: null,
      subscriberRelationID: null,
      subscriberFirstName: '',
      subscriberMiddleName: '',
      subscriberLastName: '',
      subscriberGenderID: 0,
      subscriberAddress1: '',
      subscriberCity: '',
      subscriberState: '',
      subscriberZipCode: '',
    });

  const patientLookupData = async () => {
    const res = await getPatientLookup();
    if (res) {
      setPatientlookupData(res);
    }
  };

  useEffect(() => {
    patientLookupData();
    // setIsEditMode(false);
  }, []);

  const postingDateCriteria: PostingDateCriteria = {
    id: groupID,
    type: 'charge',
    postingDate: DateToStringPipe(AdvancePaymentData.postingDate, 1),
  };
  const onClickAddPayment = async () => {
    if (
      !AdvancePaymentData.paymentDate ||
      !AdvancePaymentData.postingDate ||
      !AdvancePaymentData.amount ||
      !AdvancePaymentData.comments ||
      !AdvancePaymentData.ledgerAccounID
    ) {
      setInsuranceFinderModalState({
        ...insuranceFinderModalState,
        open: true,
        heading: 'Alert',
        statusModalType: StatusModalType.WARNING,
        description:
          'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
      });
    } else {
      const dateRes = await fetchPostingDate(postingDateCriteria);
      if (dateRes && dateRes.postingCheck === false) {
        setInsuranceFinderModalState({
          ...insuranceFinderModalState,
          open: true,
          heading: 'Error',
          statusModalType: StatusModalType.ERROR,
          description: dateRes.message,
        });
        return;
      }
      onClose();
      const updatePaymentData: SaveAdvancePayment = {
        appointmentID: AdvancePaymentData.appointmentID,
        patientID: AdvancePaymentData.patientID,
        paymentDate: AdvancePaymentData.paymentDate,
        postingDate: AdvancePaymentData.postingDate,
        dos: AdvancePaymentData.dos,
        amount: AdvancePaymentData.amount,
        paymentTypeID: AdvancePaymentData.paymentTypeID,
        ledgerAccounID: AdvancePaymentData.ledgerAccounID,
        paymentNumber: AdvancePaymentData.paymentNumber,
        comments: AdvancePaymentData.comments,
        insuranceID: AdvancePaymentData.insuranceID,
        subscriberRelationID: AdvancePaymentData.subscriberRelationID,
        subscriberFirstName: AdvancePaymentData.subscriberFirstName,
        subscriberMiddleName: AdvancePaymentData.subscriberMiddleName,
        subscriberLastName: AdvancePaymentData.subscriberLastName,
        subscriberGenderID: AdvancePaymentData.subscriberGenderID,
        subscriberAddress1: AdvancePaymentData.subscriberAddress1,
        subscriberCity: AdvancePaymentData.subscriberCity,
        subscriberState: AdvancePaymentData.subscriberState,
        subscriberZipCode: AdvancePaymentData.subscriberZipCode,
      };
      if (updatePaymentData) {
        const res = await setAdvancePayament(updatePaymentData);
        if (!res) {
          setInsuranceFinderModalState({
            ...insuranceFinderModalState,
            open: true,
            heading: 'Error',
            showCloseButton: false,
            statusModalType: StatusModalType.ERROR,
            description: 'Something Went Wrong',
          });
        } else {
          refreshDate();
        }
      }
    }
  };

  return (
    <div className="h-[607px] w-[1232px] ">
      <div className="mx-[27px] flex h-[60px] items-center justify-between gap-4">
        <div className="flex h-[24px]">
          <p className="self-center text-xl font-bold leading-7 text-gray-700">
            Add Advanced Payment
          </p>
        </div>
        <div className=" flex items-center justify-end gap-5">
          <div className={``}></div>
          <div data-testid="CloseBtnAdvancePayment" className="">
            <CloseButton
              onClick={() => {
                setConfirmationModal({
                  show: true,
                  showCloseButton: true,
                  heading: 'Cancel Confirmation',
                  text: `Are you sure you want to cancel creating this advance payment? Clicking "Confirm" will result in the loss of all changes.`,
                  type: StatusModalType.WARNING,
                  okButtonText: 'Confirm',
                  okButtonColor: ButtonType.primary,
                });
              }}
            />
          </div>
        </div>
      </div>
      <div className="px-[27px]">
        <div className="h-px w-full bg-gray-300" />
      </div>
      <div className="mt-[16px] px-[27px]">
        <div className="flow-root flex-col">
          <div
            className={`relative flex items-start gap-8 text-gray-700 leading-6 text-left font-bold w-full h-full `}
          >
            <div className={`gap-6 flex flex-col items-start`}>
              <div className={`relative w-[280px] h-[62px] flex gap-2`}>
                <div className={`w-full items-start self-stretch`}>
                  <label className="text-sm font-medium leading-5 text-gray-900">
                    Check Date<span className="text-cyan-500">*</span>
                  </label>
                  <div className="w-[144px]">
                    <AppDatePicker
                      testId="checkDate"
                      placeholderText="mm/dd/yyyy"
                      cls=""
                      onChange={(date) => {
                        if (date) {
                          setAdvancePaymentData({
                            ...AdvancePaymentData,
                            paymentDate: DateToStringPipe(date, 1),
                          });
                        }
                      }}
                      selected={StringToDatePipe(
                        AdvancePaymentData.paymentDate
                      )}
                    />
                  </div>
                </div>
                <div className={`w-full items-start self-stretch`}>
                  <label className="text-sm font-medium leading-5 text-gray-900">
                    Posting Date<span className="text-cyan-500">*</span>
                  </label>
                  <div className="w-[144px]">
                    <AppDatePicker
                      testId="checkDate"
                      placeholderText="mm/dd/yyyy"
                      cls=""
                      onChange={(date) => {
                        if (date) {
                          setAdvancePaymentData({
                            ...AdvancePaymentData,
                            postingDate: DateToStringPipe(date, 1),
                          });
                        }
                      }}
                      selected={StringToDatePipe(
                        AdvancePaymentData.postingDate
                      )}
                    />
                  </div>
                </div>
                <div className={`w-full items-start self-stretch`}>
                  <label className="text-sm font-medium leading-5 text-gray-900">
                    DoS - From
                  </label>
                  <div className="w-[144px]">
                    <AppDatePicker
                      testId="dosFrom"
                      placeholderText="mm/dd/yyyy"
                      cls=""
                      onChange={(date) => {
                        if (date) {
                          setAdvancePaymentData({
                            ...AdvancePaymentData,
                            dos: DateToStringPipe(date, 1),
                          });
                        }
                      }}
                      selected={StringToDatePipe(AdvancePaymentData.dos)}
                    />
                  </div>
                </div>
                <div className={`w-full items-start self-stretch`}>
                  <label className="text-sm font-medium leading-5 text-gray-900">
                    DoS - To
                  </label>
                  <div className="w-[144px]">
                    <AppDatePicker
                      placeholderText="mm/dd/yyyy"
                      cls=""
                      onChange={(date) => {
                        if (date) {
                          setAdvancePaymentData({
                            ...AdvancePaymentData,
                            dos: DateToStringPipe(date, 1),
                          });
                        }
                      }}
                      selected={StringToDatePipe(AdvancePaymentData.dos)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex w-auto gap-2">
                <div className={`gap-1 w-auto`}>
                  <label className="text-sm font-medium leading-5 text-gray-700">
                    Payment Amount
                    <span className="text-cyan-500">*</span>
                  </label>
                  <div
                    className={`w-full gap-1 justify-center flex flex-col items-start self-stretch`}
                  >
                    <div
                      data-testid="payment_amount"
                      className=" h-[38px] w-[240px]"
                    >
                      <InputFieldAmount
                        placeholder="0.00"
                        showCurrencyName={false}
                        value={AdvancePaymentData?.amount || ''}
                        onChange={(evt) =>
                          setAdvancePaymentData({
                            ...AdvancePaymentData,
                            amount: Number(evt.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className={`gap-1 w-auto`}>
                  <label className="text-sm font-medium leading-5 text-gray-700">
                    Payment Type
                  </label>
                  <div
                    className={`w-full gap-1 justify-center flex flex-col items-start self-stretch`}
                  >
                    <div className="w-[240px] ">
                      <SingleSelectDropDown
                        placeholder="-"
                        showSearchBar={false}
                        data={
                          patientlookupData
                            ? (patientlookupData?.paymentTypes as SingleSelectDropDownDataType[])
                            : []
                        }
                        selectedValue={
                          patientlookupData?.paymentTypes.filter(
                            (m) => m.id === AdvancePaymentData.paymentTypeID
                          )[0]
                        }
                        onSelect={(evt) => {
                          setAdvancePaymentData({
                            ...AdvancePaymentData,
                            paymentTypeID: evt.id,
                          });
                        }}
                        isOptional={true}
                        onDeselectValue={() => {
                          setAdvancePaymentData({
                            ...AdvancePaymentData,
                            paymentTypeID: null,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className={` items-start self-stretch`}>
                  <label className="text-sm font-medium leading-5 text-gray-900">
                    Account Type <span className="text-cyan-500">*</span>
                  </label>
                  <div data-testId="account_type" className="w-[240px] ">
                    <SingleSelectDropDown
                      placeholder="-"
                      showSearchBar={true}
                      data={
                        patientlookupData
                          ? (patientlookupData?.accountTypes as SingleSelectDropDownDataType[])
                          : []
                      }
                      selectedValue={
                        patientlookupData?.accountTypes.filter(
                          (m) => m.id === AdvancePaymentData.ledgerAccounID
                        )[0]
                      }
                      onSelect={(evt) => {
                        setAdvancePaymentData({
                          ...AdvancePaymentData,
                          ledgerAccounID: evt.id,
                        });
                      }}
                    />
                  </div>
                </div>
                <div className={`gap-1 w-auto`}>
                  <label className="text-sm font-medium leading-5 text-gray-700">
                    Payment Number
                  </label>
                  <div
                    className={`w-full gap-1 justify-center flex flex-col items-start self-stretch`}
                  >
                    <div className=" h-[38px] w-[240px]">
                      <InputField
                        placeholder="-"
                        value={AdvancePaymentData?.paymentNumber || ''}
                        onChange={(evt) =>
                          setAdvancePaymentData({
                            ...AdvancePaymentData,
                            paymentNumber: evt.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-[27px] pt-[26px]">
        <div className="h-px w-full bg-gray-300" />
      </div>
      <div className="px-[27px] pt-[25px]">
        <div className={`gap-1 w-auto`}>
          <label className="text-sm font-medium leading-5 text-gray-700">
            Comment
            <span className="text-cyan-500">*</span>
          </label>
          <div
            className={`w-full gap-1 justify-center flex flex-col items-start self-stretch`}
          >
            <div
              data-testid="advancePayment_comment"
              className=" h-[38px] w-[240px]"
            >
              <TextArea
                id="textarea"
                cls="!w-[1184px] text-sm leading-tight text-gray-500 flex-1 h-[160px] px-3 py-2 bg-white shadow border rounded-md border-gray-300"
                placeholder={'Click here to write comment'}
                value={AdvancePaymentData?.comments || ''}
                onChange={(evt) =>
                  setAdvancePaymentData({
                    ...AdvancePaymentData,
                    comments: evt.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
      <div className=" pt-[188px]">
        <div className={`h-full bg-gray-200`}>
          <div className="w-full">
            <div className="h-px w-full bg-gray-300" />
          </div>
          <div className="py-[24px] pr-[27px]">
            <div className={`gap-4 flex justify-end `}>
              <div>
                <Button
                  buttonType={ButtonType.secondary}
                  cls={`w-[102px] `}
                  onClick={() => {
                    onClose();
                  }}
                >
                  {' '}
                  Cancel
                </Button>
              </div>
              <div>
                <Button
                  buttonType={ButtonType.primary}
                  onClick={() => {
                    onClickAddPayment();
                  }}
                >
                  {' '}
                  Save New Advanced Payment
                </Button>
                <StatusModal
                  open={insuranceFinderModalState.open}
                  heading={insuranceFinderModalState.heading}
                  description={insuranceFinderModalState.description}
                  closeButtonText={'Ok'}
                  statusModalType={insuranceFinderModalState.statusModalType}
                  showCloseButton={false}
                  closeOnClickOutside={false}
                  onChange={() => {
                    setInsuranceFinderModalState({
                      ...insuranceFinderModalState,
                      open: false,
                    });
                  }}
                />
                <StatusModal
                  open={!!confirmationModal?.show}
                  heading={confirmationModal?.heading}
                  description={confirmationModal?.text}
                  statusModalType={confirmationModal?.type}
                  showCloseButton={confirmationModal?.showCloseButton}
                  okButtonText={confirmationModal?.okButtonText}
                  okButtonColor={confirmationModal?.okButtonColor}
                  closeOnClickOutside={true}
                  onChange={() => {
                    onClose();
                  }}
                  onClose={() => {
                    setConfirmationModal(undefined);
                  }}
                />
              </div>
            </div>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
