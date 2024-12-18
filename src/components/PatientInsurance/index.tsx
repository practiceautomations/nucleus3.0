import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';

import Icon from '@/components/Icon';
import { addToastNotification } from '@/store/shared/actions';
import {
  addPatientInsurance,
  getPatientActiveInsurances,
  getPatientLookup,
  updatePatientInsurance,
} from '@/store/shared/sagas';
import type {
  GetPatientRequestData,
  PatientBasedInsuranceDropdown,
  PatientInsuranceTabData,
  PatientLookupDropdown,
  PatientProfileInsuranceData,
  UpdatePatientInsuranceData,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import {
  DateToStringPipe,
  StringToDatePipe,
} from '@/utils/dateConversionPipes';
import useOnceEffect from '@/utils/useOnceEffect';

import AppDatePicker from '../UI/AppDatePicker';
import Button, { ButtonType } from '../UI/Button';
import CloseButton from '../UI/CloseButton';
import CrossoverInsurancePayment from '../UI/CrossoverInsurancePayment';
import InputField from '../UI/InputField';
import InputFieldAmount from '../UI/InputFieldAmount';
import Modal from '../UI/Modal';
import RadioButton from '../UI/RadioButton';
import SectionHeading from '../UI/SectionHeading';
import type { SingleSelectDropDownDataType } from '../UI/SingleSelectDropDown';
import SingleSelectDropDown from '../UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '../UI/StatusModal';

export interface PatientInsuranceProps {
  onClose: () => void;
  groupID: number | undefined;
  selectedPatientID: number | null;
  selectedPatientInsuranceData: PatientInsuranceTabData | null;
  onSelectSelf: (value: boolean) => void;
  insuranceSubscriberData: GetPatientRequestData | null;
  isViewMode: boolean;
}

export default function PatientInsurance({
  onClose,
  groupID,
  selectedPatientID,
  selectedPatientInsuranceData,
  onSelectSelf,
  insuranceSubscriberData,
  isViewMode = false,
}: PatientInsuranceProps) {
  const [patientInsuranceData, setPatientInsranceData] =
    useState<PatientProfileInsuranceData>({
      patientID: null,
      insuranceID: null,
      payerResponsibilityID: 1,
      insuranceNumber: '',
      wcClaimNumber: '',
      groupName: '',
      groupNumber: '',
      policyStartDate: '',
      policyEndDate: '',
      mspTypeID: null,
      copay: null,
      comment: '',
      active: 'true',
      assignment: 'true',
      insuredRelationID: null,
      firstName: '',
      middleName: '',
      lastName: '',
      genderID: null,
      dob: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zipCodeExtension: '',
      zipCode: '',
      homePhone: '',
      officePhone: '',
      cell: '',
      fax: '',
      email: '',
      officePhoneExtension: '',
      accidentDate: '',
      accidentTypeID: null,
      accidentStateID: null,
    });
  const dispatch = useDispatch();
  const [selectedPolicyStartDate, setSelectedPolicyStartDate] =
    useState<Date | null>(null);
  const [selectedPolicyEndDate, setSelectedPolicyEndDate] =
    useState<Date | null>(null);
  const [selectedDOB, setSelectedDOB] = useState<Date | null>(null);

  const [showCrossoverClaimModal, setShowCrossoverClaimModal] =
    useState<boolean>(false);
  // const [selectedCrossOverChargeId, setSelectedCrossOverChargeId] =
  //    useState<number>();

  useEffect(() => {
    if (selectedPatientID) {
      setPatientInsranceData({
        ...patientInsuranceData,
        patientID: selectedPatientID,
      });
    }
  }, [selectedPatientID]);
  useEffect(() => {
    if (selectedPatientInsuranceData) {
      setSelectedPolicyStartDate(
        new Date(selectedPatientInsuranceData.policyStartDate)
      );
      setSelectedPolicyEndDate(
        new Date(selectedPatientInsuranceData.policyEndDate)
      );
      setPatientInsranceData({
        ...patientInsuranceData,
        patientID: selectedPatientInsuranceData.patientID,
        insuranceID: selectedPatientInsuranceData.insuranceID,
        payerResponsibilityID:
          selectedPatientInsuranceData.payerResponsibilityID,
        insuranceNumber: selectedPatientInsuranceData.insuranceNumber,
        wcClaimNumber: selectedPatientInsuranceData.wcClaimNumber,
        groupName: selectedPatientInsuranceData.groupName,
        groupNumber: selectedPatientInsuranceData.groupNumber,
        policyStartDate: selectedPatientInsuranceData.policyStartDate
          ? selectedPatientInsuranceData.policyStartDate.split('T')[0] || null
          : null,
        policyEndDate: selectedPatientInsuranceData.policyEndDate
          ? selectedPatientInsuranceData.policyEndDate.split('T')[0] || null
          : null,
        mspTypeID: selectedPatientInsuranceData.mspTypeID,
        copay: selectedPatientInsuranceData.copay,
        comment: selectedPatientInsuranceData.comment,
        active: selectedPatientInsuranceData.active ? 'true' : 'false',
        assignment: selectedPatientInsuranceData.assignment ? 'true' : 'false',
        insuredRelationID: selectedPatientInsuranceData.relationID,
        firstName: selectedPatientInsuranceData.firstName,
        middleName: selectedPatientInsuranceData.middleName,
        lastName: selectedPatientInsuranceData.lastName,
        genderID: selectedPatientInsuranceData.genderID,
        dob: selectedPatientInsuranceData.dob
          ? selectedPatientInsuranceData.dob.split('T')[0] || ''
          : '',
        address1: selectedPatientInsuranceData.address1,
        address2: selectedPatientInsuranceData.address2,
        city: selectedPatientInsuranceData.city,
        state: selectedPatientInsuranceData.state,
        zipCodeExtension: selectedPatientInsuranceData.zipCodeExtension,
        zipCode: selectedPatientInsuranceData.zipCode,
        homePhone: selectedPatientInsuranceData.homePhone,
        officePhone: selectedPatientInsuranceData.officePhone,
        cell: selectedPatientInsuranceData.cell,
        fax: selectedPatientInsuranceData.fax,
        email: selectedPatientInsuranceData.email,
        officePhoneExtension: selectedPatientInsuranceData.officePhoneExtension,
        accidentDate: selectedPatientInsuranceData.accidentDate,
        accidentTypeID: selectedPatientInsuranceData.accidentTypeID,
        accidentStateID: selectedPatientInsuranceData.accidentStateID,
      });
      const dob = StringToDatePipe(selectedPatientInsuranceData.dob);
      const policyStartDate = StringToDatePipe(
        selectedPatientInsuranceData.policyStartDate
      );
      const policyEndDate = StringToDatePipe(
        selectedPatientInsuranceData.policyEndDate
      );
      setSelectedDOB(dob);
      setSelectedPolicyStartDate(policyStartDate);
      setSelectedPolicyEndDate(policyEndDate);
    }
  }, [selectedPatientInsuranceData]);
  const [insuranceModalState, setInsuranceModalState] = useState<{
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

  const formatPhoneNumber = (digits: string) => {
    const digitRegex = /(\d{1,3})(\d{1,3})(\d{1,3})/;
    const formatted = digits.replace(digitRegex, '$1-$2-$3');
    return formatted;
  };

  const handleHomePhoneChange = (evt: { target: { value: any } }) => {
    const input = evt.target.value;
    const digitsOnly = input.replace(/\D/g, ''); // Remove non-digit characters
    const formatted = formatPhoneNumber(digitsOnly); // Apply runtime masking
    setPatientInsranceData({
      ...patientInsuranceData,
      homePhone: formatted,
    });
  };

  const handleOfficePhoneChange = (evt: { target: { value: any } }) => {
    const input = evt.target.value;
    const digitsOnly = input.replace(/\D/g, ''); // Remove non-digit characters
    const formatted = formatPhoneNumber(digitsOnly); // Apply runtime masking
    setPatientInsranceData({
      ...patientInsuranceData,
      officePhone: formatted,
    });
  };

  const handlecellChange = (evt: { target: { value: any } }) => {
    const input = evt.target.value;
    const digitsOnly = input.replace(/\D/g, ''); // Remove non-digit characters
    const formatted = formatPhoneNumber(digitsOnly); // Apply runtime masking
    setPatientInsranceData({
      ...patientInsuranceData,
      cell: formatted,
    });
  };

  const handleFaxChange = (evt: { target: { value: any } }) => {
    const input = evt.target.value;
    const digitsOnly = input.replace(/\D/g, ''); // Remove non-digit characters
    const formatted = formatPhoneNumber(digitsOnly); // Apply runtime masking
    setPatientInsranceData({
      ...patientInsuranceData,
      fax: formatted,
    });
  };

  const [patientlookupData, setPatientlookupData] =
    useState<PatientLookupDropdown>();
  const patientLookupData = async () => {
    const res = await getPatientLookup();
    if (res) {
      setPatientlookupData(res);
    }
  };

  const [patientBasedInsurance, setPatientBasedInsurance] =
    useState<PatientBasedInsuranceDropdown[]>();
  const patientActiveInsuranceData = async () => {
    const res = await getPatientActiveInsurances(
      groupID,
      selectedPatientInsuranceData?.id
    );
    if (res) {
      setPatientBasedInsurance(res);
    }
  };
  useEffect(() => {
    patientLookupData();
    patientActiveInsuranceData();
  }, []);
  const [isWarningAlert, setIsWarningAlert] = useState(false);
  const [selectedInsuredRelationID, setSelectedInsuredRelationID] =
    useState<number>();

  const onSelectSubSelf = (id: number) => {
    setPatientInsranceData({
      ...patientInsuranceData,
      insuredRelationID: id,
      firstName:
        insuranceSubscriberData && insuranceSubscriberData.firstName
          ? insuranceSubscriberData.firstName
          : '',
      middleName:
        insuranceSubscriberData && insuranceSubscriberData.middleName
          ? insuranceSubscriberData?.middleName
          : '',
      lastName:
        insuranceSubscriberData && insuranceSubscriberData.lastName
          ? insuranceSubscriberData?.lastName
          : '',
      dob:
        insuranceSubscriberData && insuranceSubscriberData.dob
          ? insuranceSubscriberData?.dob.split('T')[0] || ''
          : '',
      address1:
        insuranceSubscriberData && insuranceSubscriberData.address1
          ? insuranceSubscriberData?.address1
          : '',
      address2:
        insuranceSubscriberData && insuranceSubscriberData.address2
          ? insuranceSubscriberData?.address2
          : '',
      genderID:
        insuranceSubscriberData && insuranceSubscriberData.genderID
          ? insuranceSubscriberData?.genderID
          : null,
      zipCodeExtension:
        insuranceSubscriberData && insuranceSubscriberData.zipCodeExtension
          ? insuranceSubscriberData?.zipCodeExtension
          : '',
      city:
        insuranceSubscriberData && insuranceSubscriberData.city
          ? insuranceSubscriberData?.city
          : '',
      state:
        insuranceSubscriberData && insuranceSubscriberData.state
          ? insuranceSubscriberData?.state
          : '',
      zipCode:
        insuranceSubscriberData && insuranceSubscriberData.zipCode
          ? insuranceSubscriberData?.zipCode
          : '',
      homePhone:
        insuranceSubscriberData?.homePhone?.replace(
          /(\d{3})(\d{3})(\d{4})/,
          '$1-$2-$3'
        ) || '',
      cell:
        insuranceSubscriberData?.cellPhone?.replace(
          /(\d{3})(\d{3})(\d{4})/,
          '$1-$2-$3'
        ) || '',
      officePhone:
        insuranceSubscriberData?.workPhone?.replace(
          /(\d{3})(\d{3})(\d{4})/,
          '$1-$2-$3'
        ) || '',
      fax:
        insuranceSubscriberData?.fax?.replace(
          /(\d{3})(\d{3})(\d{4})/,
          '$1-$2-$3'
        ) || '',
      email:
        insuranceSubscriberData && insuranceSubscriberData.email
          ? insuranceSubscriberData?.email
          : '',
    });
    if (insuranceSubscriberData && insuranceSubscriberData.dob) {
      setSelectedDOB(StringToDatePipe(insuranceSubscriberData.dob));
    }
  };

  useOnceEffect(() => {
    if (selectedInsuredRelationID) {
      onSelectSubSelf(selectedInsuredRelationID);
    }
  }, [selectedInsuredRelationID]);

  const onClickPatientInsurance = async () => {
    if (
      !patientInsuranceData?.payerResponsibilityID ||
      !patientInsuranceData?.insuranceID ||
      !patientInsuranceData?.insuranceNumber ||
      !patientInsuranceData?.insuredRelationID ||
      !patientInsuranceData?.firstName ||
      !patientInsuranceData?.lastName ||
      !patientInsuranceData?.dob
    ) {
      setIsWarningAlert(true);
      setInsuranceModalState({
        ...insuranceModalState,
        open: true,
        heading: 'Alert',
        statusModalType: StatusModalType.WARNING,
        description:
          'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
      });
    } else if (patientInsuranceData) {
      const todaysDate = new Date();
      todaysDate.setHours(0, 0, 0, 0);
      const ptDateofbirth = patientInsuranceData.dob
        ? new Date(patientInsuranceData.dob)
        : null;

      if (ptDateofbirth && ptDateofbirth > todaysDate) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Subscriber Date of Birth should not be in future.',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }
      if (!selectedPatientInsuranceData) {
        if (
          patientInsuranceData.email &&
          !validator.isEmail(patientInsuranceData.email)
        ) {
          dispatch(
            addToastNotification({
              text: 'Invalid Email Format.',
              toastType: ToastType.ERROR,
              id: uuidv4(),
            })
          );
          return;
        }
        if (patientInsuranceData.insuranceNumber.length >= 29) {
          dispatch(
            addToastNotification({
              text: 'Insurance number must be less than 29 characters',
              toastType: ToastType.ERROR,
              id: uuidv4(),
            })
          );
          return;
        }
        const res = await addPatientInsurance(patientInsuranceData);
        if (!res) {
          setInsuranceModalState({
            ...insuranceModalState,
            open: true,
            heading: 'Error',
            statusModalType: StatusModalType.ERROR,
            description: 'Something Went Wrong',
          });
        } else if (patientInsuranceData.payerResponsibilityID !== 1) {
          setShowCrossoverClaimModal(true);
        } else {
          onClose();
        }
      } else {
        if (
          patientInsuranceData.email &&
          !validator.isEmail(patientInsuranceData.email)
        ) {
          dispatch(
            addToastNotification({
              text: 'Invalid Email Format.',
              toastType: ToastType.ERROR,
              id: '',
            })
          );
          return;
        }
        const updatePatientInsuranceData: UpdatePatientInsuranceData = {
          patientInsuranceID: selectedPatientInsuranceData.id,
          patientID: selectedPatientInsuranceData.patientID,
          insuranceID: patientInsuranceData.insuranceID,
          payerResponsibilityID: patientInsuranceData.payerResponsibilityID,
          insuranceNumber: patientInsuranceData.insuranceNumber,
          wcClaimNumber: patientInsuranceData.wcClaimNumber,
          groupName: patientInsuranceData.groupName,
          groupNumber: patientInsuranceData.groupNumber,
          policyStartDate: patientInsuranceData.policyStartDate,
          policyEndDate: patientInsuranceData.policyEndDate,
          mspTypeID: patientInsuranceData.mspTypeID,
          copay: patientInsuranceData.copay
            ? patientInsuranceData.copay.toString()
            : '',
          comment: patientInsuranceData.comment,
          active: patientInsuranceData.active === 'true',
          assignment: patientInsuranceData.assignment === 'true',
          insuredRelationID: patientInsuranceData.insuredRelationID,
          firstName: patientInsuranceData.firstName,
          middleName: patientInsuranceData.middleName,
          lastName: patientInsuranceData.lastName,
          genderID: patientInsuranceData.genderID,
          dob: selectedDOB ? DateToStringPipe(selectedDOB, 1) : '',
          address1: patientInsuranceData.address1,
          address2: patientInsuranceData.address2,
          city: patientInsuranceData.city,
          state: patientInsuranceData.state,
          zipCodeExtension: patientInsuranceData.zipCodeExtension
            ? patientInsuranceData.zipCodeExtension
            : '',
          zipCode: Number(patientInsuranceData.zipCode),
          homePhone:
            patientInsuranceData?.homePhone?.replace(
              /(\d{3})(\d{3})(\d{4})/,
              '$1-$2-$3'
            ) || '',
          cell:
            patientInsuranceData?.cell?.replace(
              /(\d{3})(\d{3})(\d{4})/,
              '$1-$2-$3'
            ) || '',
          officePhone:
            patientInsuranceData?.officePhone?.replace(
              /(\d{3})(\d{3})(\d{4})/,
              '$1-$2-$3'
            ) || '',
          fax:
            patientInsuranceData?.fax?.replace(
              /(\d{3})(\d{3})(\d{4})/,
              '$1-$2-$3'
            ) || '',
          email: patientInsuranceData.email,
          officePhoneExtension: patientInsuranceData.officePhoneExtension,
          accidentDate: patientInsuranceData.accidentDate,
          accidentTypeID: patientInsuranceData.accidentTypeID,
          accidentStateID: patientInsuranceData.accidentStateID,
        };
        if (updatePatientInsuranceData) {
          const res = await updatePatientInsurance(updatePatientInsuranceData);
          if (!res) {
            setInsuranceModalState({
              ...insuranceModalState,
              open: true,
              heading: 'Error',
              statusModalType: StatusModalType.ERROR,
              description: 'Something Went Wrong',
            });
          } else {
            onClose();
          }
        }
      }
    }
  };
  return (
    <>
      <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-gray-100 shadow">
        <div className="flex w-full flex-col items-start justify-start p-6">
          <div className="inline-flex w-full items-center justify-between">
            <div className="flex items-center justify-start space-x-2">
              <p className="text-xl font-bold leading-7 text-gray-700">
                Add New Insurance
              </p>
            </div>
            <CloseButton
              onClick={() => {
                onClose();
              }}
            />
          </div>
        </div>
        <div className={'w-full px-6'}>
          <div className={`h-[1px] w-full bg-gray-300`} />
        </div>
        <div className="w-full flex-1 overflow-y-auto p-6">
          <div className="">
            <div className="flow-root flex-col">
              <SectionHeading label="New Insurance Info." />
              <div
                className={`relative flex items-start gap-8 text-gray-700 leading-6 text-left font-bold w-full h-full pt-[75px] `}
              >
                <div className={`gap-6 flex flex-col items-start`}>
                  <div className={`relative w-[240px] h-[62px] flex gap-2`}>
                    <div className={`w-full items-start self-stretch`}>
                      <label className="text-sm font-medium leading-5 text-gray-900">
                        Insurance Name*
                      </label>
                      <div
                        className={`w-full gap-1 justify-center flex flex-col items-start self-stretch`}
                      >
                        <div className="w-[240px] ">
                          <SingleSelectDropDown
                            placeholder="-"
                            showSearchBar={true}
                            disabled={isViewMode}
                            data={
                              patientBasedInsurance
                                ? (patientBasedInsurance as SingleSelectDropDownDataType[])
                                : []
                            }
                            selectedValue={
                              patientBasedInsurance?.filter(
                                (m) =>
                                  m.id === patientInsuranceData?.insuranceID
                              )[0]
                            }
                            onSelect={(value) => {
                              if (value) {
                                setPatientInsranceData({
                                  ...patientInsuranceData,
                                  insuranceID: value.id,
                                });
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className={`w-full items-start self-stretch`}>
                      <label className="text-sm font-medium leading-5 text-gray-900">
                        Insurance Responsibility*
                      </label>
                      <div
                        className={`w-full gap-1 justify-center flex flex-col items-start self-stretch`}
                      >
                        <div className="w-[240px] ">
                          <SingleSelectDropDown
                            placeholder="-"
                            showSearchBar={false}
                            disabled={isViewMode}
                            data={
                              patientlookupData
                                ? (patientlookupData?.insuranceResponsibility as SingleSelectDropDownDataType[])
                                : []
                            }
                            selectedValue={
                              patientlookupData?.insuranceResponsibility.filter(
                                (m) =>
                                  m.id ===
                                  patientInsuranceData?.payerResponsibilityID
                              )[0]
                            }
                            onSelect={(value) => {
                              setPatientInsranceData({
                                ...patientInsuranceData,
                                payerResponsibilityID: value.id,
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className={`w-full items-start self-stretch`}>
                      <label className="text-sm font-medium leading-5 text-gray-900">
                        Insurance Number*
                      </label>
                      <div
                        data-testid="insnumber"
                        className="mb-[24px] h-[38px] w-[240px]"
                      >
                        <InputField
                          value={patientInsuranceData?.insuranceNumber || ''}
                          disabled={isViewMode}
                          placeholder="-"
                          onChange={(evt) =>
                            setPatientInsranceData({
                              ...patientInsuranceData,
                              insuranceNumber: evt.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className={`w-full items-start self-stretch`}>
                      <label className="text-sm font-medium leading-5 text-gray-900">
                        WC Claim Number
                      </label>
                      <div className="mb-[24px] h-[38px] w-[240px]">
                        <InputField
                          value={patientInsuranceData?.wcClaimNumber || ''}
                          placeholder="-"
                          disabled={isViewMode}
                          onChange={(evt) =>
                            setPatientInsranceData({
                              ...patientInsuranceData,
                              wcClaimNumber: evt.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex w-auto gap-2">
                    <div className={`gap-1 w-auto`}>
                      <label className="text-sm font-medium leading-5 text-gray-700">
                        Group Name
                      </label>
                      <div className="h-[38px] w-[240px] ">
                        <InputField
                          value={patientInsuranceData?.groupName || ''}
                          placeholder="-"
                          disabled={isViewMode}
                          onChange={(evt) =>
                            setPatientInsranceData({
                              ...patientInsuranceData,
                              groupName: evt.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className={`gap-1 w-auto`}>
                      <label className="text-sm font-medium leading-5 text-gray-700">
                        Group Number
                      </label>
                      <div
                        className={`w-full gap-1 justify-center flex flex-col items-start self-stretch`}
                      >
                        <div className="w-[240px] ">
                          <InputField
                            value={patientInsuranceData?.groupNumber || ''}
                            placeholder="-"
                            disabled={isViewMode}
                            onChange={(evt) =>
                              setPatientInsranceData({
                                ...patientInsuranceData,
                                groupNumber: evt.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium leading-loose text-gray-900">
                        Policy Start Date
                      </label>
                      <div className="w-[144px]">
                        <AppDatePicker
                          placeholderText="mm/dd/yyyy"
                          cls=""
                          disabled={isViewMode}
                          onChange={(date) => {
                            setSelectedPolicyStartDate(date);
                            setPatientInsranceData({
                              ...patientInsuranceData,
                              policyStartDate: date
                                ? DateToStringPipe(date, 1) // date.toISOString().split('T')[0] || ''
                                : '',
                            });
                          }}
                          selected={selectedPolicyStartDate}
                          // onDeselectValue={() => {
                          //   setSelectedPolicyStartDate(null);
                          //   setPatientInsranceData({
                          //     ...patientInsuranceData,
                          //     policyStartDate: '',
                          //   });
                          // }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium leading-loose text-gray-900">
                        Policy End Date
                      </label>
                      <div className="w-[144px]">
                        <AppDatePicker
                          placeholderText="mm/dd/yyyy"
                          cls=""
                          disabled={isViewMode}
                          onChange={(date) => {
                            setSelectedPolicyEndDate(date);
                            setPatientInsranceData({
                              ...patientInsuranceData,
                              policyEndDate: date
                                ? DateToStringPipe(date, 1)
                                : '',
                            });
                          }}
                          selected={selectedPolicyEndDate}
                          // onDeselectValue={() => {
                          //   setSelectedPolicyEndDate(null);
                          //   setPatientInsranceData({
                          //     ...patientInsuranceData,
                          //     policyEndDate: '',
                          //   });
                          // }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className={`relative w-[240px] h-[62px] flex gap-2`}>
                    <div className={`w-full items-start self-stretch`}>
                      <label className="text-sm font-medium leading-5 text-gray-900">
                        MSP Type
                      </label>
                      <div
                        className={`w-full gap-1 justify-center flex flex-col items-start self-stretch`}
                      >
                        <div className="w-[240px] ">
                          <SingleSelectDropDown
                            placeholder="-"
                            showSearchBar={false}
                            isOptional={true}
                            onDeselectValue={() => {
                              setPatientInsranceData({
                                ...patientInsuranceData,
                                mspTypeID: null,
                              });
                            }}
                            disabled={isViewMode}
                            data={
                              patientlookupData
                                ? (patientlookupData?.mspType as SingleSelectDropDownDataType[])
                                : []
                            }
                            selectedValue={
                              patientlookupData?.mspType.filter(
                                (m) => m.id === patientInsuranceData.mspTypeID
                              )[0]
                            }
                            onSelect={(value) => {
                              setPatientInsranceData({
                                ...patientInsuranceData,
                                mspTypeID: value.id,
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className={`w-full items-start self-stretch`}>
                      <label className="text-sm font-medium leading-5 text-gray-900">
                        Advanced Payment
                      </label>
                      <div className="mb-[24px] h-[38px] w-[240px]">
                        <InputFieldAmount
                          disabled={isViewMode}
                          value={patientInsuranceData.copay || ''}
                          placeholder="0.00"
                          onChange={(evt) =>
                            setPatientInsranceData({
                              ...patientInsuranceData,
                              copay: Number(evt.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className={`w-full items-start self-stretch`}>
                      <label className="text-sm font-medium leading-5 text-gray-900">
                        Comments
                      </label>
                      <div className="mb-[24px] h-[38px] w-[240px]">
                        <InputField
                          value={patientInsuranceData?.comment || ''}
                          placeholder="-"
                          disabled={isViewMode}
                          onChange={(evt) =>
                            setPatientInsranceData({
                              ...patientInsuranceData,
                              comment: evt.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex w-auto gap-2">
                      <div className={`w-[100px] h-[62px] top-[4px] relative`}>
                        <label className="text-sm font-medium leading-loose  text-gray-700">
                          Active
                        </label>
                        <div className="mt-2">
                          <RadioButton
                            data={[
                              {
                                value: 'true',
                                label: 'Yes',
                              },
                              { value: 'false', label: 'No' },
                            ]}
                            checkedValue={patientInsuranceData?.active}
                            disabled={isViewMode}
                            onChange={(evt) => {
                              setPatientInsranceData({
                                ...patientInsuranceData,
                                active: evt.target.value,
                              });
                            }}
                          />
                        </div>
                      </div>
                      <div className="relative w-[10px]">
                        <div
                          className={` [rotate:90deg] origin-top-left bg-gray-200 w-[62px] outline outline-1 outline-[rgba(209,213,219,1)]`}
                        >
                          {' '}
                        </div>
                      </div>
                      <div className={`w-[240px] h-[62px] top-[4px] relative`}>
                        <label className="text-sm font-medium leading-loose  text-gray-700">
                          Assignment
                        </label>
                        <div className="mt-2">
                          <RadioButton
                            data={[
                              {
                                value: 'true',
                                label: 'Yes',
                              },
                              { value: 'false', label: 'No' },
                            ]}
                            disabled={isViewMode}
                            checkedValue={patientInsuranceData?.assignment}
                            onChange={(evt) => {
                              setPatientInsranceData({
                                ...patientInsuranceData,
                                assignment: evt.target.value,
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-[22px]">
            <div className="mb-[56px] bg-gray-100">
              <SectionHeading label="Subscriber Info." isCollapsable={false} />
            </div>
          </div>
          <div className={`gap-1 w-auto`}>
            <div className="flex w-full items-start">
              <label className="text-sm font-medium leading-5 text-gray-700 ">
                Relation to Subscriber*
              </label>
            </div>
            <div
              className={`w-full gap-1 justify-center flex flex-col items-start self-stretch `}
            >
              <div className="w-[240px] ">
                <SingleSelectDropDown
                  placeholder="-"
                  showSearchBar={false}
                  disabled={isViewMode}
                  data={
                    patientlookupData
                      ? (patientlookupData?.insuranceRelation as SingleSelectDropDownDataType[])
                      : []
                  }
                  selectedValue={
                    patientlookupData?.insuranceRelation.filter(
                      (m) => m.id === patientInsuranceData?.insuredRelationID
                    )[0]
                  }
                  onSelect={async (value) => {
                    setPatientInsranceData({
                      ...patientInsuranceData,
                      insuredRelationID: value.id,
                    });
                    if (value.value === 'Self') {
                      await onSelectSelf(true);
                      setSelectedInsuredRelationID(value.id);
                      onSelectSubSelf(value.id);
                    } else {
                      setPatientInsranceData({
                        ...patientInsuranceData,
                        insuredRelationID: value.id,
                        firstName: '',
                        middleName: '',
                        lastName: '',
                        dob: '',
                        address1: '',
                        address2: '',
                        genderID: null,
                        zipCodeExtension: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        homePhone: '',
                        cell: '',
                        officePhone: '',
                        fax: '',
                        email: '',
                      });
                      setSelectedDOB(null);
                    }
                  }}
                />
              </div>
            </div>
            <div
              className="mt-[24px] w-full bg-gray-300"
              style={{ height: 1 }}
            />
            <div
              className={`relative flex items-start gap-8 text-gray-700 leading-6 text-left font-bold w-full h-full pt-[16px] pb-[16px] `}
            >
              <div className={`gap-6 flex flex-col items-start`}>
                <div className={`relative w-full h-[62px] flex gap-2`}>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      First Name*
                    </label>
                    <div className="mb-[24px] h-[38px] w-[240px]">
                      <InputField
                        value={patientInsuranceData?.firstName || ''}
                        disabled={isViewMode}
                        onChange={(evt) =>
                          setPatientInsranceData({
                            ...patientInsuranceData,
                            firstName: evt.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      Middle Name
                    </label>
                    <div className="mb-[24px] h-[38px] w-[240px]">
                      <InputField
                        value={patientInsuranceData?.middleName || ''}
                        disabled={isViewMode}
                        onChange={(evt) =>
                          setPatientInsranceData({
                            ...patientInsuranceData,
                            middleName: evt.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      Last Name*
                    </label>
                    <div className="h-[38px] w-[240px]">
                      <InputField
                        value={patientInsuranceData?.lastName || ''}
                        disabled={isViewMode}
                        onChange={(evt) =>
                          setPatientInsranceData({
                            ...patientInsuranceData,
                            lastName: evt.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      Gender
                    </label>
                    <div className="w-[240px] ">
                      <SingleSelectDropDown
                        placeholder="-"
                        showSearchBar={false}
                        isOptional={true}
                        onDeselectValue={() => {
                          setPatientInsranceData({
                            ...patientInsuranceData,
                            genderID: null,
                          });
                        }}
                        disabled={isViewMode}
                        data={
                          patientlookupData
                            ? (patientlookupData?.gender as SingleSelectDropDownDataType[])
                            : []
                        }
                        selectedValue={
                          patientlookupData?.gender.filter(
                            (m) => m.id === patientInsuranceData?.genderID
                          )[0]
                        }
                        onSelect={(value) => {
                          setPatientInsranceData({
                            ...patientInsuranceData,
                            genderID: value.id,
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium leading-loose text-gray-900">
                      Date of birth*
                    </label>
                    <div className="w-[144px]">
                      <AppDatePicker
                        placeholderText="mm/dd/yyyy"
                        cls=""
                        disabled={isViewMode}
                        onChange={(date) => {
                          setSelectedDOB(date);
                          setPatientInsranceData({
                            ...patientInsuranceData,
                            dob: date ? DateToStringPipe(date, 1) || '' : '',
                          });
                        }}
                        selected={selectedDOB}
                        // onDeselectValue={() => {
                        //   setSelectedDOB(null);
                        //   setPatientInsranceData({
                        //     ...patientInsuranceData,
                        //     dob: '',
                        //   });
                        // }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="mt-[16px] w-full bg-gray-300"
              style={{ height: 1 }}
            />
            <div className="mb-[16px] flex-col pt-[16px]">
              <div
                className={`relative flex items-start gap-6 text-gray-700 leading-6 text-left font-bold w-full h-full `}
              >
                <div className={`gap-2 flex flex-col items-start`}>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-700">
                      Address 1
                    </label>
                    <div className="h-[38px] w-[240px]">
                      <InputField
                        disabled={isViewMode}
                        value={patientInsuranceData?.address1 || ''}
                        placeholder="Ex.: 142 Palm Avenue"
                        onChange={(evt) =>
                          setPatientInsranceData({
                            ...patientInsuranceData,
                            address1: evt.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-700">
                      Address 2
                    </label>
                    <div className="h-[38px] w-[240px]">
                      <InputField
                        disabled={isViewMode}
                        value={patientInsuranceData?.address2 || ''}
                        placeholder="-"
                        onChange={(evt) =>
                          setPatientInsranceData({
                            ...patientInsuranceData,
                            address2: evt.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-700">
                      Extension
                    </label>
                    <div className="h-[38px] w-[240px]">
                      <InputField
                        disabled={isViewMode}
                        value={patientInsuranceData?.zipCodeExtension || ''}
                        placeholder="-"
                        maxLength={4}
                        onChange={(evt) =>
                          setPatientInsranceData({
                            ...patientInsuranceData,
                            zipCodeExtension: evt.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="w-px">
                  <div
                    className={` [rotate:90deg] origin-top-left bg-gray-300 w-[218px] outline outline-1 outline-[rgba(209,213,219,1)]`}
                  >
                    {' '}
                  </div>
                </div>
                <div
                  className={`relative gap-4 inline-flex flex-col items-start text-gray-700 leading-6 text-left font-bold  `}
                >
                  <div className={`gap-2 flex flex-col items-start`}>
                    <div className={`w-full items-start self-stretch`}>
                      <label className="text-sm font-medium leading-5 text-gray-700">
                        City
                      </label>
                      <div className="h-[38px] w-[240px]">
                        <InputField
                          disabled={isViewMode}
                          value={patientInsuranceData?.city || ''}
                          placeholder="Ex. Tampa"
                          onChange={(evt) =>
                            setPatientInsranceData({
                              ...patientInsuranceData,
                              city: evt.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className={`w-full items-start self-stretch`}>
                      <label className="text-sm font-medium leading-5 text-gray-700">
                        State
                      </label>
                      <div
                        className={`w-full gap-4 justify-center flex flex-col items-start self-stretch`}
                      >
                        <div className="h-[38px] w-[240px]">
                          <SingleSelectDropDown
                            placeholder="-"
                            showSearchBar={false}
                            disabled={isViewMode}
                            isOptional={true}
                            onDeselectValue={() => {
                              setPatientInsranceData({
                                ...patientInsuranceData,
                                state: '',
                              });
                            }}
                            data={
                              patientlookupData?.states
                                ? (patientlookupData.states as SingleSelectDropDownDataType[])
                                : []
                            }
                            selectedValue={
                              patientInsuranceData &&
                              patientlookupData?.states.filter(
                                (m) => m.value === patientInsuranceData?.state
                              )[0]
                            }
                            onSelect={(value) => {
                              if (value) {
                                if (value) {
                                  setPatientInsranceData({
                                    ...patientInsuranceData,
                                    state: value.value,
                                  });
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className={`w-full items-start self-stretch`}>
                      <label className="text-sm font-medium leading-5 text-gray-700">
                        ZIP Code
                      </label>
                      <div className="h-[38px] w-[240px]">
                        <InputField
                          value={patientInsuranceData?.zipCode || ''}
                          placeholder="-"
                          disabled={isViewMode}
                          maxLength={5}
                          onChange={(evt) =>
                            setPatientInsranceData({
                              ...patientInsuranceData,
                              zipCode: evt.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-px">
                  <div
                    className={`relative [rotate:90deg] origin-top-left h-0 bg-gray-300 w-[215px] outline outline-1 outline-[rgba(209,213,219,1)]`}
                  >
                    {' '}
                  </div>
                </div>
                <div className={`gap-4 flex flex-col items-start`}>
                  <div className={`gap-2 inline-flex items-end`}>
                    <div className={`relative w-[240px] leading-5 `}>
                      <div className={`w-full items-start self-stretch`}>
                        <div className={`gap-2 flex flex-col items-start`}>
                          <div className={`w-full items-start self-stretch`}>
                            <label className="text-sm font-medium leading-5 text-gray-700">
                              Home phone
                            </label>
                            <div className="flex gap-2">
                              <div className="h-[38px] w-[240px]">
                                <InputField
                                  value={patientInsuranceData?.homePhone || ''}
                                  placeholder="000-000-000"
                                  disabled={isViewMode}
                                  maxLength={11}
                                  onChange={handleHomePhoneChange}
                                />
                              </div>
                              <Button
                                buttonType={ButtonType.secondary}
                                disabled={true}
                                cls={`h-[38px] w-[38px] leading-5 justify-center mt-[4px] bg-cyan-500 !px-2 !py-1 inline-flex gap-2 leading-5`}
                              >
                                <Icon name={'phone'} size={14} />
                              </Button>
                            </div>
                          </div>
                          <div className={`w-full items-start self-stretch`}>
                            <label className="text-sm font-medium leading-5 text-gray-700">
                              Work phone
                            </label>
                            <div className="flex gap-2">
                              <div className="h-[38px] w-[240px]">
                                <InputField
                                  value={
                                    patientInsuranceData?.officePhone || ''
                                  }
                                  placeholder="000-000-000"
                                  disabled={isViewMode}
                                  maxLength={11}
                                  onChange={handleOfficePhoneChange}
                                />
                              </div>
                              <Button
                                buttonType={ButtonType.secondary}
                                disabled={true}
                                cls={`h-[38px] w-[38px] leading-5 justify-center  mt-[4px] bg-cyan-500 !px-2 !py-1 inline-flex gap-2 leading-5`}
                              >
                                <Icon name={'phone'} size={14} />
                              </Button>
                            </div>
                          </div>
                          <div className={`w-full items-start self-stretch`}>
                            <label className="text-sm font-medium leading-5 text-gray-700">
                              Cell phone
                            </label>
                            <div className="flex gap-2">
                              <div className="h-[38px] w-[240px]">
                                <InputField
                                  value={patientInsuranceData?.cell || ''}
                                  placeholder="000-000-000"
                                  maxLength={11}
                                  disabled={isViewMode}
                                  onChange={handlecellChange}
                                />
                              </div>
                              <Button
                                disabled={true}
                                buttonType={ButtonType.secondary}
                                cls={`h-[38px] w-[38px] justify-center mt-[4px] bg-cyan-500 !px-2 !py-1 inline-flex gap-2 leading-5`}
                              >
                                <Icon name={'phone'} size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`gap-6 flex flex-col items-start`}>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      Fax
                    </label>
                    <div className="relative flex gap-1 ">
                      <div className="h-[38px] w-[240px] ">
                        <InputField
                          disabled={isViewMode}
                          value={patientInsuranceData?.fax || ''}
                          placeholder="000-000-000"
                          maxLength={11}
                          onChange={handleFaxChange}
                        />
                      </div>
                    </div>
                    <div className={`w-full items-start self-stretch mt-[8px]`}>
                      <label className="text-sm font-medium leading-5 text-gray-900">
                        Email
                      </label>
                      <div className="h-[38px] w-[240px] ">
                        <InputField
                          value={patientInsuranceData?.email || ''}
                          placeholder="example@example.com"
                          disabled={isViewMode}
                          onChange={(evt) =>
                            setPatientInsranceData({
                              ...patientInsuranceData,
                              email: evt.target.value,
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
        <div className="flex w-full items-center justify-center rounded-b-lg bg-gray-200 py-6">
          <div className="flex w-full items-center justify-end space-x-4 px-7">
            <Button
              buttonType={ButtonType.secondary}
              cls={`w-[102px] `}
              onClick={() => {
                if (!isViewMode) {
                  setInsuranceModalState({
                    ...insuranceModalState,
                    open: true,
                    heading: 'Alert',
                    statusModalType: StatusModalType.WARNING,
                    description: 'Changes will not be saved…',
                  });
                } else {
                  onClose();
                }
              }}
            >
              {' '}
              Cancel
            </Button>
            <Button
              buttonType={ButtonType.primary}
              cls={` `}
              onClick={async () => {
                onClickPatientInsurance();
              }}
            >
              Save New Insurance
            </Button>

            <Modal
              open={showCrossoverClaimModal}
              onClose={() => {}}
              modalContentClassName="relative w-[1232px] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
            >
              <CrossoverInsurancePayment
                patientID={selectedPatientID || 0}
                insResponsibilityType={
                  // eslint-disable-next-line no-nested-ternary
                  patientInsuranceData.payerResponsibilityID === 2
                    ? 'Primary'
                    : patientInsuranceData.payerResponsibilityID === 3
                    ? 'Secondary'
                    : ''
                }
                groupID={groupID || 0}
                onClose={() => {
                  setShowCrossoverClaimModal(false);
                  // setSelectedCrossOverChargeId(undefined);
                  onClose();
                }}
              />
            </Modal>
          </div>
        </div>
      </div>
      <StatusModal
        open={insuranceModalState.open}
        heading={insuranceModalState.heading}
        description={insuranceModalState.description}
        closeButtonText={'Ok'}
        statusModalType={insuranceModalState.statusModalType}
        showCloseButton={false}
        closeOnClickOutside={false}
        onChange={() => {
          if (!isWarningAlert) {
            onClose();
          }
          setInsuranceModalState({
            ...insuranceModalState,
            open: false,
          });
        }}
      />
    </>
  );
}
