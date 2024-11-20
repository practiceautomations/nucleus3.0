import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import validator from 'validator';

import Icon from '@/components/Icon';
import { addToastNotification } from '@/store/shared/actions';
import {
  getPatientLookup,
  saveGaurantorData,
  updateGuarantorInsurance,
} from '@/store/shared/sagas';
import type {
  GetPatientRequestData,
  PatientGuarantorTabData,
  PatientLookupDropdown,
  SaveGauranterData,
  UpdateGauranterData,
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
import InputField from '../UI/InputField';
import RadioButton from '../UI/RadioButton';
import SectionHeading from '../UI/SectionHeading';
import type { SingleSelectDropDownDataType } from '../UI/SingleSelectDropDown';
import SingleSelectDropDown from '../UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '../UI/StatusModal';

export interface PatientGarantorProps {
  onClose: () => void;
  selectedPatientID: number | null;
  onSelectSelf: (value: boolean) => void;
  groupID: number | null;
  gaurSubscriberData: GetPatientRequestData | null;
  selectedGaurData: PatientGuarantorTabData | null;
  isViewMode: boolean;
  isEditMode: boolean;
}

export default function PatientGarantor({
  onClose,
  selectedPatientID,
  onSelectSelf,
  groupID,
  gaurSubscriberData,
  selectedGaurData,
  isViewMode = false,
  isEditMode = true,
}: PatientGarantorProps) {
  const [patientGarantorData, setPatientGarantorData] =
    useState<PatientGuarantorTabData>({
      id: undefined,
      patientID: undefined,
      relationID: null,
      relation: '',
      active: 'true',
      firstName: '',
      middleName: '',
      lastName: '',
      genderID: null,
      dob: '',
      address1: '',
      address2: '',
      zipCodeExtension: '',
      city: '',
      state: '',
      zipCode: '',
      homePhone: '',
      cell: '',
      officePhone: '',
      fax: '',
      email: '',
      socialSecurityNumber: '',
    });
  const [selectedDOB, setSelectedDOB] = useState<Date | null>(null);
  const onSelectSubSelf = (id: number) => {
    setPatientGarantorData({
      ...patientGarantorData,
      relationID: id,
      firstName:
        gaurSubscriberData && gaurSubscriberData.firstName
          ? gaurSubscriberData.firstName
          : '',
      middleName:
        gaurSubscriberData && gaurSubscriberData.middleName
          ? gaurSubscriberData?.middleName
          : '',
      lastName:
        gaurSubscriberData && gaurSubscriberData.lastName
          ? gaurSubscriberData?.lastName
          : '',
      dob:
        gaurSubscriberData && gaurSubscriberData.dob
          ? gaurSubscriberData?.dob.split('T')[0] || ''
          : '',
      address1:
        gaurSubscriberData && gaurSubscriberData.address1
          ? gaurSubscriberData?.address1
          : '',
      address2:
        gaurSubscriberData && gaurSubscriberData.address2
          ? gaurSubscriberData?.address2
          : '',
      genderID:
        gaurSubscriberData && gaurSubscriberData.genderID
          ? gaurSubscriberData?.genderID
          : null,
      zipCodeExtension:
        gaurSubscriberData && gaurSubscriberData.zipCodeExtension
          ? gaurSubscriberData?.zipCodeExtension
          : '',
      city:
        gaurSubscriberData && gaurSubscriberData.city
          ? gaurSubscriberData?.city
          : '',
      state:
        gaurSubscriberData && gaurSubscriberData.state
          ? gaurSubscriberData?.state
          : '',
      zipCode:
        gaurSubscriberData && gaurSubscriberData.zipCode
          ? gaurSubscriberData?.zipCode
          : '',
      homePhone:
        gaurSubscriberData?.homePhone?.replace(
          /(\d{3})(\d{3})(\d{4})/,
          '$1-$2-$3'
        ) || '',
      cell:
        gaurSubscriberData?.cellPhone?.replace(
          /(\d{3})(\d{3})(\d{4})/,
          '$1-$2-$3'
        ) || '',
      officePhone:
        gaurSubscriberData?.workPhone?.replace(
          /(\d{3})(\d{3})(\d{4})/,
          '$1-$2-$3'
        ) || '',
      fax:
        gaurSubscriberData?.fax?.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') ||
        '',
      email:
        gaurSubscriberData && gaurSubscriberData.email
          ? gaurSubscriberData?.email
          : '',
    });
    if (gaurSubscriberData && gaurSubscriberData.dob) {
      setSelectedDOB(StringToDatePipe(gaurSubscriberData.dob));
    }
  };
  const [selectedGuarRelationID, setSelectedGuarRelationID] =
    useState<number>();
  useOnceEffect(() => {
    if (selectedGuarRelationID) {
      onSelectSubSelf(selectedGuarRelationID);
    }
  }, [selectedGuarRelationID]);

  useEffect(() => {
    if (selectedGaurData) {
      setPatientGarantorData({
        ...patientGarantorData,
        patientID: selectedGaurData.patientID,
        relationID: selectedGaurData.relationID,
        patientGuarantorID: selectedGaurData.patientGuarantorID,
        firstName: selectedGaurData.firstName,
        middleName: selectedGaurData.middleName,
        lastName: selectedGaurData.lastName,
        genderID: selectedGaurData.genderID,
        dob: selectedGaurData.dob
          ? selectedGaurData.dob.split('T')[0] || ''
          : '',
        address1: selectedGaurData.address1,
        address2: selectedGaurData.address2,
        city: selectedGaurData.city,
        state: selectedGaurData.state,
        zipCodeExtension: selectedGaurData.zipCodeExtension,
        zipCode: selectedGaurData.zipCode,
        homePhone: selectedGaurData.homePhone
          ? selectedGaurData.homePhone.replace(/-/g, '')
          : '',
        officePhone: selectedGaurData.officePhone
          ? selectedGaurData.officePhone.replace(/-/g, '')
          : '',
        cell: selectedGaurData.cell
          ? selectedGaurData.cell.replace(/-/g, '')
          : '',
        fax: selectedGaurData.fax ? selectedGaurData.fax.replace(/-/g, '') : '',
        email: selectedGaurData.email,
      });
      const dob = StringToDatePipe(selectedGaurData.dob);
      setSelectedDOB(dob);
    }
  }, [selectedGaurData]);
  const dispatch = useDispatch();
  const guarantorValidation = () => {
    const extensionV = /^\d{4}$/;
    const zipV = /^\d{5}$/;
    if (
      patientGarantorData.zipCodeExtension &&
      patientGarantorData.zipCodeExtension?.length > 0 &&
      !extensionV.test(patientGarantorData.zipCodeExtension)
    ) {
      dispatch(
        addToastNotification({
          text: 'Contact Info. extenstion must be consist of 4 digits',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      return false;
    }
    if (
      patientGarantorData.zipCode &&
      patientGarantorData.zipCode?.length > 0 &&
      !zipV.test(patientGarantorData.zipCode)
    ) {
      dispatch(
        addToastNotification({
          text: 'Contact Info. ZIP Code must be consist of 5 digits',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      return false;
    }

    if (
      patientGarantorData.email &&
      patientGarantorData.email?.length > 0 &&
      !validator.isEmail(patientGarantorData.email)
    ) {
      dispatch(
        addToastNotification({
          text: 'Invalid Email Format.',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      return false;
    }
    const phoneValidation = /^\d{3}-\d{3}-\d{4}$/;
    if (
      patientGarantorData.homePhone &&
      patientGarantorData.homePhone.length > 0 &&
      !phoneValidation.test(patientGarantorData.homePhone)
    ) {
      dispatch(
        addToastNotification({
          text: 'Home Phone Format should be 000-000-0000',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      return false;
    }

    if (
      patientGarantorData.officePhone &&
      patientGarantorData.officePhone.length > 0 &&
      !phoneValidation.test(patientGarantorData.officePhone)
    ) {
      dispatch(
        addToastNotification({
          text: 'Work Phone Format should be 000-000-0000',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      return false;
    }

    if (
      patientGarantorData.cell &&
      patientGarantorData.cell.length > 0 &&
      !phoneValidation.test(patientGarantorData.cell)
    ) {
      dispatch(
        addToastNotification({
          text: 'Cell Phone Format should be 000-000-0000',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      return false;
    }

    if (
      patientGarantorData.fax &&
      patientGarantorData.fax.length > 0 &&
      !phoneValidation.test(patientGarantorData.fax)
    ) {
      dispatch(
        addToastNotification({
          text: 'Phone Fax Format should be 000-000-0000',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      return false;
    }
    return true;
    // onSaveGaurantorDate();
  };
  const onSaveGaurantorDate = async () => {
    const validationCheck = guarantorValidation();
    if (validationCheck) {
      const GarantorData: SaveGauranterData = {
        patientID: selectedPatientID,
        guarantorRelationID: patientGarantorData.relationID || null,
        active: false,
        groupID,
        firstName: patientGarantorData.firstName,
        middleName: patientGarantorData.middleName,
        lastName: patientGarantorData.lastName,
        genderID: patientGarantorData.genderID,
        dob: patientGarantorData.dob,
        address1: patientGarantorData.address1,
        address2: patientGarantorData.address2,
        zipCodeExtension: patientGarantorData.zipCodeExtension,
        city: patientGarantorData.city,
        state: patientGarantorData.state,
        zipCode: patientGarantorData.zipCode,
        homePhone: patientGarantorData.homePhone
          ? patientGarantorData.homePhone.replace(/-/g, '')
          : '',
        officePhone: patientGarantorData.officePhone
          ? patientGarantorData.officePhone.replace(/-/g, '')
          : '',
        cell: patientGarantorData.cell
          ? patientGarantorData.cell.replace(/-/g, '')
          : '',
        fax: patientGarantorData.fax
          ? patientGarantorData.fax.replace(/-/g, '')
          : '',
        email: patientGarantorData.email,
        ssn: patientGarantorData.socialSecurityNumber,
        relation: '',
      };
      await saveGaurantorData(GarantorData);
      onClose();
    }
  };
  const [patientlookupData, setPatientlookupData] =
    useState<PatientLookupDropdown>();
  const formatPhoneNumber = (digits: string) => {
    const digitRegex = /(\d{1,3})(\d{1,3})(\d{1,3})/;
    const formatted = digits.replace(digitRegex, '$1-$2-$3');
    return formatted;
  };
  const handleHomePhoneChange = (evt: { target: { value: any } }) => {
    const input = evt.target.value;
    const digitsOnly = input.replace(/\D/g, ''); // Remove non-digit characters
    const formatted = formatPhoneNumber(digitsOnly); // Apply runtime masking
    setPatientGarantorData({
      ...patientGarantorData,
      homePhone: formatted,
    });
  };
  const handleOfficePhoneChange = (evt: { target: { value: any } }) => {
    const input = evt.target.value;
    const digitsOnly = input.replace(/\D/g, ''); // Remove non-digit characters
    const formatted = formatPhoneNumber(digitsOnly); // Apply runtime masking
    setPatientGarantorData({
      ...patientGarantorData,
      officePhone: formatted,
    });
  };
  const handlecellChange = (evt: { target: { value: any } }) => {
    const input = evt.target.value;
    const digitsOnly = input.replace(/\D/g, ''); // Remove non-digit characters
    const formatted = formatPhoneNumber(digitsOnly); // Apply runtime masking
    setPatientGarantorData({
      ...patientGarantorData,
      cell: formatted,
    });
  };
  const handleFaxChange = (evt: { target: { value: any } }) => {
    const input = evt.target.value;
    const digitsOnly = input.replace(/\D/g, ''); // Remove non-digit characters
    const formatted = formatPhoneNumber(digitsOnly); // Apply runtime masking
    setPatientGarantorData({
      ...patientGarantorData,
      fax: formatted,
    });
  };
  const [GarantorModalState, setGarantorModalState] = useState<{
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
  const patientLookupData = async () => {
    const res = await getPatientLookup();
    if (res) {
      setPatientlookupData(res);
    }
  };
  useEffect(() => {
    patientLookupData();
  }, []);
  return (
    <>
      <div className="px-[24px] pt-5 pb-4">
        <div className="mb-[16px] bg-gray-100">
          <SectionHeading label="Add New Guarantor" isCollapsable={false} />
          <div className=" flex items-center justify-end gap-5">
            <div className="">
              <CloseButton
                onClick={() => {
                  onClose();
                }}
              />
            </div>
          </div>
        </div>
        <div className="pt-[16px]">
          <div className="mb-[56px] bg-gray-100">
            <SectionHeading label="New Guarantor Info." isCollapsable={false} />
          </div>
        </div>
        <div className={`gap-1 w-auto `}>
          <div className="flex">
            <div>
              <label className="text-sm font-medium leading-5 text-gray-700">
                Relation to Patient*
              </label>
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
                        ? (patientlookupData?.guarantorRelation as SingleSelectDropDownDataType[])
                        : []
                    }
                    selectedValue={
                      patientlookupData?.guarantorRelation.filter(
                        (m) => m.id === patientGarantorData.relationID
                      )[0]
                    }
                    onSelect={async (value) => {
                      setPatientGarantorData({
                        ...patientGarantorData,
                        relationID: value.id,
                      });
                      if (value.value === 'Self') {
                        await onSelectSelf(true);
                        setSelectedGuarRelationID(value.id);
                        onSelectSubSelf(value.id);
                      } else {
                        setPatientGarantorData({
                          ...patientGarantorData,
                          relationID: value.id,
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
            </div>
            <div className="ml-[16px] flex w-auto gap-2">
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
                    checkedValue={patientGarantorData?.active}
                    disabled={isViewMode}
                    onChange={(evt) => {
                      setPatientGarantorData({
                        ...patientGarantorData,
                        active: evt.target.value,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-[24px] w-full bg-gray-300" style={{ height: 1 }} />
          <div
            className={`relative flex items-start gap-8 text-gray-700 leading-6 text-left font-bold w-full h-full pt-[16px] pb-[16px] `}
          >
            <div className={`gap-6 flex flex-col items-start`}>
              <div className={`relative w-full h-[62px] flex gap-2`}>
                <div className={`w-full items-start self-stretch`}>
                  <label className="text-sm font-medium leading-5 text-gray-900">
                    First Name*
                  </label>
                  <div
                    data-testid="guarantorfn"
                    className="mb-[24px] h-[38px] w-[240px]"
                  >
                    <InputField
                      value={patientGarantorData?.firstName || ''}
                      disabled={isViewMode}
                      onChange={(evt) =>
                        setPatientGarantorData({
                          ...patientGarantorData,
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
                      value={patientGarantorData?.middleName || ''}
                      disabled={isViewMode}
                      onChange={(evt) =>
                        setPatientGarantorData({
                          ...patientGarantorData,
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
                  <div data-testid="guarantorln" className="h-[38px] w-[240px]">
                    <InputField
                      value={patientGarantorData?.lastName || ''}
                      disabled={isViewMode}
                      onChange={(evt) =>
                        setPatientGarantorData({
                          ...patientGarantorData,
                          lastName: evt.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className={`w-full items-start self-stretch`}>
                  <label className="text-sm font-medium leading-5 text-gray-900">
                    Gender*
                  </label>
                  <div className="w-[240px] ">
                    <SingleSelectDropDown
                      placeholder="-"
                      showSearchBar={false}
                      disabled={isViewMode}
                      data={
                        patientlookupData
                          ? (patientlookupData?.gender as SingleSelectDropDownDataType[])
                          : []
                      }
                      selectedValue={
                        patientlookupData?.gender.filter(
                          (m) => m.id === patientGarantorData?.genderID
                        )[0]
                      }
                      onSelect={(value) => {
                        setPatientGarantorData({
                          ...patientGarantorData,
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
                  <div data-testid="guarantor_dob" className="w-[144px]">
                    <AppDatePicker
                      placeholderText="mm/dd/yyyy"
                      cls=""
                      disabled={isViewMode}
                      onChange={(date) => {
                        setSelectedDOB(date);
                        setPatientGarantorData({
                          ...patientGarantorData,
                          dob: date ? DateToStringPipe(date, 1) || '' : '',
                        });
                      }}
                      selected={selectedDOB}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-[16px] w-full bg-gray-300" style={{ height: 1 }} />
          <div className="flex flex-row">
            <div>
              <div
                className={`mt-[24px] relative flex flex-col items-start gap-6 text-gray-700 leading-6 text-left font-bold w-full h-full `}
              >
                <div className={`gap-2 flex flex-row items-start`}>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-700">
                      Address 1<span className="text-cyan-500">*</span>
                    </label>
                    <div
                      data-testid="guarantor_address"
                      className="h-[38px] w-[372px]"
                    >
                      <InputField
                        disabled={isViewMode}
                        value={patientGarantorData?.address1 || ''}
                        placeholder="Ex.: 142 Palm Avenue"
                        onChange={(evt) =>
                          setPatientGarantorData({
                            ...patientGarantorData,
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
                    <div className="h-[38px] w-[372px]">
                      <InputField
                        disabled={isViewMode}
                        value={patientGarantorData?.address2 || ''}
                        placeholder="-"
                        onChange={(evt) =>
                          setPatientGarantorData({
                            ...patientGarantorData,
                            address2: evt.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className={`gap-2 flex flex-row items-start`}>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-700">
                      City
                      <span className="text-cyan-500">*</span>
                    </label>
                    <div
                      data-testid="guarantor_city"
                      className="h-[38px] w-[240px]"
                    >
                      <InputField
                        disabled={isViewMode}
                        value={patientGarantorData?.city || ''}
                        placeholder="Ex. Tampa"
                        onChange={(evt) =>
                          setPatientGarantorData({
                            ...patientGarantorData,
                            city: evt.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-700">
                      State
                      <span className="text-cyan-500">*</span>
                    </label>
                    <div
                      className={`w-full gap-4 justify-center flex flex-col items-start self-stretch`}
                    >
                      <div className="h-[38px] w-[240px]">
                        <SingleSelectDropDown
                          placeholder="-"
                          showSearchBar={false}
                          disabled={isViewMode}
                          data={
                            patientlookupData?.states
                              ? (patientlookupData.states as SingleSelectDropDownDataType[])
                              : []
                          }
                          selectedValue={
                            patientGarantorData &&
                            patientlookupData?.states.filter(
                              (m) => m.value === patientGarantorData?.state
                            )[0]
                          }
                          onSelect={(value) => {
                            if (value) {
                              if (value) {
                                setPatientGarantorData({
                                  ...patientGarantorData,
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
                      <span className="text-cyan-500">*</span>
                    </label>
                    <div
                      data-testid="guarantor_zipcode"
                      className="h-[38px] w-[120px]"
                    >
                      <InputField
                        value={patientGarantorData?.zipCode || ''}
                        placeholder="-"
                        disabled={isViewMode}
                        maxLength={5}
                        onChange={(evt) => {
                          let input = evt.target.value;
                          const numericInput = input.replace(/\D/g, ''); // Remove non-digit characters
                          if (input !== numericInput) {
                            input = numericInput; // Update the input field value
                          }
                          setPatientGarantorData({
                            ...patientGarantorData,
                            zipCode: numericInput,
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-700">
                      Extension
                    </label>
                    <div className="h-[38px] w-[120px]">
                      <InputField
                        disabled={isViewMode}
                        value={patientGarantorData?.zipCodeExtension || ''}
                        placeholder="-"
                        maxLength={4}
                        onChange={(evt) => {
                          let input = evt.target.value;
                          const numericInput = input.replace(/\D/g, ''); // Remove non-digit characters
                          if (input !== numericInput) {
                            input = numericInput; // Update the input field value
                          }
                          setPatientGarantorData({
                            ...patientGarantorData,
                            zipCodeExtension: numericInput,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="ml-[16px] mt-[16px] w-px">
                <div
                  className={`relative [rotate:90deg] origin-top-left h-0 bg-gray-300 w-[215px] outline outline-1 outline-[rgba(209,213,219,1)]`}
                >
                  {' '}
                </div>
              </div>
              <div className={`gap-4 flex flex-col items-start ml-[32px]`}>
                <div className={`gap-2 inline-flex items-end w-[372.px] `}>
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
                                value={patientGarantorData?.homePhone || ''}
                                placeholder="000-000-0000"
                                maxLength={12}
                                onChange={handleHomePhoneChange}
                                disabled={isViewMode}
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
                            Work phone
                          </label>
                          <div className="flex gap-2 ">
                            <div className="h-[38px] w-[240px]">
                              <InputField
                                value={patientGarantorData?.officePhone || ''}
                                placeholder="000-000-0000"
                                disabled={isViewMode}
                                maxLength={12}
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
                          <div className="flex gap-2 ">
                            <div className="h-[38px] w-[240px]">
                              <InputField
                                value={patientGarantorData?.cell || ''}
                                placeholder="000-000-0000"
                                disabled={isViewMode}
                                maxLength={12}
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
            </div>
            <div className="ml-[16px] mt-[16px]">
              <div className={`gap-6 flex flex-col items-start`}>
                <div className={`w-full items-start self-stretch`}>
                  <label className="text-sm font-medium leading-5 text-gray-900">
                    Fax
                  </label>
                  <div className="relative flex gap-1 ">
                    <div className="h-[38px] w-[240px] ">
                      <InputField
                        disabled={isViewMode}
                        value={patientGarantorData?.fax || ''}
                        placeholder="000-000-0000"
                        maxLength={12}
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
                        value={patientGarantorData?.email || ''}
                        placeholder="example@example.com"
                        disabled={isViewMode}
                        onChange={(evt) =>
                          setPatientGarantorData({
                            ...patientGarantorData,
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
      <div className=" pt-[35px]">
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
                    if (!isViewMode) {
                      setGarantorModalState({
                        ...GarantorModalState,
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
                <StatusModal
                  open={GarantorModalState.open}
                  heading={GarantorModalState.heading}
                  description={GarantorModalState.description}
                  closeButtonText={'Ok'}
                  statusModalType={GarantorModalState.statusModalType}
                  showCloseButton={false}
                  closeOnClickOutside={false}
                  onChange={() => {
                    onClose();
                    setGarantorModalState({
                      ...GarantorModalState,
                      open: false,
                    });
                  }}
                />
              </div>
              {!isViewMode && (
                <div>
                  <Button
                    data-testid="RegisterPatientGuarantorTabUpdateBtnTestId"
                    buttonType={ButtonType.primary}
                    onClick={async () => {
                      if (
                        !patientGarantorData.firstName ||
                        !patientGarantorData.lastName ||
                        !patientGarantorData.genderID ||
                        !patientGarantorData.dob ||
                        !patientGarantorData.address1 ||
                        !patientGarantorData.city ||
                        !patientGarantorData.state ||
                        !patientGarantorData.zipCode ||
                        !patientGarantorData.relationID
                      ) {
                        setGarantorModalState({
                          ...GarantorModalState,
                          open: true,
                          heading: 'Alert',
                          statusModalType: StatusModalType.WARNING,
                          description:
                            'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
                        });
                      } else if (patientGarantorData) {
                        const todaysDate = new Date();
                        todaysDate.setHours(0, 0, 0, 0);
                        const ptDateofbirth = patientGarantorData.dob
                          ? new Date(patientGarantorData.dob)
                          : null;

                        if (ptDateofbirth && ptDateofbirth > todaysDate) {
                          dispatch(
                            addToastNotification({
                              id: '',
                              text: 'DOB should not be in future',
                              toastType: ToastType.ERROR,
                            })
                          );
                          return;
                        }
                        if (!selectedGaurData) {
                          onSaveGaurantorDate();
                        } else {
                          const updatePatientGaurantorData: UpdateGauranterData =
                            {
                              patientGuarantorID: selectedGaurData.id,
                              guarantorRelationID:
                                selectedGuarRelationID || undefined,
                              patientID: selectedPatientID,
                              firstName: patientGarantorData.firstName,
                              middleName: patientGarantorData.middleName,
                              lastName: patientGarantorData.lastName,
                              genderID: patientGarantorData.genderID,
                              dob: selectedDOB
                                ? DateToStringPipe(selectedDOB, 1)
                                : '',
                              active: patientGarantorData.active === 'true',
                              address1: patientGarantorData.address1,
                              address2: patientGarantorData.address2,
                              city: patientGarantorData.city,
                              state: patientGarantorData.state,
                              zipCodeExtension: Number(
                                patientGarantorData.zipCodeExtension
                              ),
                              zipCode: Number(patientGarantorData.zipCode),
                              homePhone: patientGarantorData.homePhone
                                ? patientGarantorData.homePhone.replace(
                                    /-/g,
                                    ''
                                  )
                                : '',
                              officePhone: patientGarantorData.officePhone
                                ? patientGarantorData.officePhone.replace(
                                    /-/g,
                                    ''
                                  )
                                : '',
                              cell: patientGarantorData.cell
                                ? patientGarantorData.cell.replace(/-/g, '')
                                : '',
                              fax: patientGarantorData.fax
                                ? patientGarantorData.fax.replace(/-/g, '')
                                : '',
                              email: patientGarantorData.email,
                              relation: patientGarantorData.relation,
                              ssn: patientGarantorData.socialSecurityNumber,
                              groupID,
                            };
                          if (updatePatientGaurantorData) {
                            const res = await updateGuarantorInsurance(
                              updatePatientGaurantorData
                            );
                            if (res) {
                              dispatch(
                                addToastNotification({
                                  text: 'Gaurantor updated successfully',
                                  toastType: ToastType.SUCCESS,
                                  id: '',
                                })
                              );
                            } else if (!res) {
                              setGarantorModalState({
                                ...GarantorModalState,
                                open: true,
                                heading: 'Error',
                                statusModalType: StatusModalType.ERROR,
                                description: 'Something Went Wrong',
                              });
                            } else {
                              onClose();
                            }
                            onClose();
                          }
                        }
                      }
                    }}
                  >
                    {' '}
                    {!isEditMode ? 'Save New Guarantor' : 'Save Guarantor'}
                  </Button>
                  <StatusModal
                    open={GarantorModalState.open}
                    heading={GarantorModalState.heading}
                    description={GarantorModalState.description}
                    closeButtonText={'Ok'}
                    statusModalType={GarantorModalState.statusModalType}
                    showCloseButton={false}
                    closeOnClickOutside={false}
                    onChange={() => {
                      setGarantorModalState({
                        ...GarantorModalState,
                        open: false,
                      });
                    }}
                  />
                </div>
              )}
            </div>
            <div></div>
          </div>
        </div>
      </div>
    </>
  );
}
