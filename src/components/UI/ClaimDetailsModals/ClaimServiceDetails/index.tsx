import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import AdditionalFiedlsSection from '@/components/CreateClaimModals/AdditionalFieldsSection';
import SearchProvider from '@/components/CreateClaimModals/SearchProvider';
import Icon from '@/components/Icon';
// eslint-disable-next-line import/no-cycle
import MedicalCase from '@/components/MedicalCases';
// eslint-disable-next-line import/no-cycle
import PatientDetailModal from '@/components/PatientDetailModal';
import Modal from '@/components/UI/Modal';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import type { ProvidersData } from '@/store/chrome/types';
import {
  addToastNotification,
  fetchAssignClaimToDataRequest,
  fetchClaimPatientInsranceDataRequest,
  fetchFacilityDataRequest,
  fetchGroupDataRequest,
  // fetchPatientInsranceDataRequest,
  fetchPatientSearchDataRequest,
  fetchPracticeDataRequest,
  fetchProviderDataRequest,
  fetchReferringProviderDataRequest,
  getLookupDropdownsRequest,
} from '@/store/shared/actions';
import { getMedicalCaseForClaim } from '@/store/shared/sagas';
import {
  getClaimPatientInsuranceDataSelector,
  getFacilityDataSelector,
  getGroupDataSelector,
  getLookupDropdownsDataSelector,
  // getPatientInsuranceDataSelector,
  getPatientSearchDataSelector,
  getPracticeDataSelector,
  getProviderDataSelector,
  getReferringProviderDataSelector,
} from '@/store/shared/selectors';
import type {
  AdditionalFiedlsPayload,
  ClaimDataByClaimIDResult,
  FacilityData,
  GetLinkableClaimsForMedicalCaseCriteria,
  PatientInsuranceData,
  PatientSearchCriteria,
  PatientSearchOutput,
  ReferringProviderData,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import { IconColors } from '@/utils/ColorFilters';
import {
  DateToStringPipe,
  StringToDatePipe,
} from '@/utils/dateConversionPipes';
import useOnceEffect from '@/utils/useOnceEffect';

import AppDatePicker from '../../AppDatePicker';
import Button, { ButtonType } from '../../Button';
import InfoToggle from '../../InfoToggle';
import InputField from '../../InputField';
import type { SingleSelectDropDownDataType } from '../../SingleSelectDropDown';
import SingleSelectDropDown from '../../SingleSelectDropDown';

export interface ClaimServiceDetailsProps {
  isEditMode: boolean;
  data: ClaimDataByClaimIDResult;
  onClickEdit: () => void;
  onChange: (data: ClaimDataByClaimIDResult) => void;
  onSave: boolean;
  onSaveChanges: () => void;
}
export default function ClaimServiceDetails({
  isEditMode,
  data,
  onClickEdit,
  onChange,
  onSave,
  onSaveChanges,
}: ClaimServiceDetailsProps) {
  const [selectedPatient, setSelectedPatient] =
    useState<SingleSelectDropDownDataType>();
  const [selectedPatientData, setSelectedPatientData] =
    useState<PatientSearchOutput>();
  // Additional feilds
  const referringProviderDataSet = useSelector(
    getReferringProviderDataSelector
  );
  const [selectedAdditionalFields, setSelectedAdditionalFields] =
    useState<AdditionalFiedlsPayload | null>(null);
  const [isAddtionalEditMode, setIsAddtionalEditMode] = useState(false);

  // Service Details
  const [isEditServiceMode, setIsServiceEditMode] = useState(false);
  const [selectedGroup, setSelectedGroup] =
    useState<SingleSelectDropDownDataType>();
  const [selectedPractice, setSelectedPractice] =
    useState<SingleSelectDropDownDataType>();
  const [supervisingProviderData, setSupervisingProviderData] = useState<
    ProvidersData[]
  >([]);
  // const patientInsuranceData = useSelector(getPatientInsuranceDataSelector);
  const claimPatientInsuranceData = useSelector(
    getClaimPatientInsuranceDataSelector
  );
  const groupsData = useSelector(getGroupDataSelector);
  const practicesData = useSelector(getPracticeDataSelector);
  const facilityDropdownData = useSelector(getFacilityDataSelector);
  const [facilitiesData, setFacilitiesData] = useState<FacilityData[]>([]);
  useEffect(() => {
    if (
      facilityDropdownData?.length &&
      selectedPractice &&
      selectedPractice.id
    ) {
      setFacilitiesData(
        facilityDropdownData.filter((m) => m.practiceID === selectedPractice.id)
      );
    }
  }, [facilityDropdownData, selectedPractice]);
  const providersData = useSelector(getProviderDataSelector);
  const [referringProviderData, setReferringProviderData] = useState<
    ReferringProviderData[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Bill Claim To
  const [primaryInsuranceData, setPrimaryInsuranceData] =
    useState<PatientInsuranceData[]>();
  const [selectedSubscriberRelation, setSelectedSubscriberRelation] =
    useState<string>();
  const [isClaimEditMode, setIsClaimEditMode] = useState(false);
  // Patient Section api
  const lookupsData = useSelector(getLookupDropdownsDataSelector);
  const patientSearchData = useSelector(getPatientSearchDataSelector);
  const [isPatientEditMode, setIsPatientEditMode] = useState(false);
  const [patientsearch, setPatientsearch] = useState<PatientSearchCriteria>({
    searchValue: '',
    groups: [],
    practices: [],
    facilities: [],
    providers: [],
  });
  const [jsonData, setJsonData] = useState<ClaimDataByClaimIDResult>(data);
  const [selectedRefProvider, setselectedRefProvider] =
    useState<SingleSelectDropDownDataType>();

  const isChangeValue = (cc: ClaimDataByClaimIDResult) => {
    setJsonData({ ...jsonData, ...cc });
    onChange({ ...jsonData, ...cc });
  };

  const onSelectPrimaryInsurance = (value: SingleSelectDropDownDataType) => {
    if (selectedPatient) {
      if (claimPatientInsuranceData) {
        const selectedPrimaryInsuranceFiltered =
          claimPatientInsuranceData.filter((m) => m.id === value.id)[0];
        if (selectedPrimaryInsuranceFiltered) {
          setSelectedSubscriberRelation(
            selectedPrimaryInsuranceFiltered.subscriberRelation
          );
          isChangeValue({
            ...jsonData,
            assignmentBelongsToID:
              selectedPrimaryInsuranceFiltered.assignmentBelongsToID,
          });
        }
      }
    }
  };

  useEffect(() => {
    if (
      isEditServiceMode ||
      isPatientEditMode ||
      isClaimEditMode ||
      isAddtionalEditMode
    ) {
      onClickEdit();
    }
  }, [
    isEditServiceMode,
    isAddtionalEditMode,
    isClaimEditMode,
    isPatientEditMode,
  ]);

  useEffect(() => {
    setIsServiceEditMode(isEditMode);
    setIsPatientEditMode(isEditMode);
    setIsClaimEditMode(isEditMode);
    setIsAddtionalEditMode(isEditMode);
  }, [isEditMode]);

  useEffect(() => {
    if (onSave) {
      setIsServiceEditMode(false);
      setIsPatientEditMode(false);
      setIsClaimEditMode(false);
      setIsAddtionalEditMode(false);
      onSaveChanges();
    }
  }, [onSave]);

  const selectedWorkGroupData = useSelector(getselectdWorkGroupsIDsSelector);

  useEffect(() => {
    if (selectedWorkGroupData) {
      setPatientsearch({
        ...patientsearch,
        groups:
          selectedWorkGroupData.groupsData &&
          selectedWorkGroupData.groupsData.length > 0
            ? selectedWorkGroupData.groupsData.map((m) => m.id)
            : [],
        practices:
          selectedWorkGroupData.practicesData &&
          selectedWorkGroupData.practicesData.length > 0
            ? selectedWorkGroupData.practicesData.map((m) => m.id)
            : [],
        facilities:
          selectedWorkGroupData.facilitiesData &&
          selectedWorkGroupData.facilitiesData.length > 0
            ? selectedWorkGroupData.facilitiesData.map((m) => m.id)
            : [],
        providers:
          selectedWorkGroupData.providersData &&
          selectedWorkGroupData.providersData.length > 0
            ? selectedWorkGroupData.providersData.map((m) => m.id)
            : [],
      });
    }
  }, [selectedWorkGroupData]);

  useEffect(() => {
    if (referringProviderDataSet) {
      setReferringProviderData(referringProviderDataSet);
    }
  }, [referringProviderDataSet]);

  useEffect(() => {
    if (providersData) {
      setSupervisingProviderData(providersData);
    }
  }, [providersData]);

  const dispatch = useDispatch();
  useOnceEffect(() => {
    if (patientsearch.searchValue !== '') {
      if (selectedWorkGroupData !== null) {
        dispatch(fetchPatientSearchDataRequest(patientsearch));
      } else {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Please Select a Group/Workgroup from Organization Selector',
            toastType: ToastType.ERROR,
          })
        );
        patientsearch.searchValue = '';
      }
    }
  }, [patientsearch.searchValue]);
  const initProfile = () => {
    dispatch(getLookupDropdownsRequest());
    dispatch(fetchGroupDataRequest());
  };
  useEffect(() => {
    initProfile();
  }, []);

  useEffect(() => {
    if (selectedPatientData) {
      setJsonData({ ...jsonData, facilityID: selectedPatientData?.facilityID });
    }
    if (data) {
      setJsonData({ ...jsonData, facilityID: data?.facilityID });
    }
  }, []);

  useEffect(() => {
    if (selectedPatientData && practicesData) {
      setSelectedPractice(
        practicesData.filter((m) => m.id === selectedPatientData?.practiceID)[0]
      );
    }
    if (data && practicesData) {
      setSelectedPractice(
        practicesData.filter((m) => m.id === data?.practiceID)[0]
      );
    }
  }, [practicesData]);

  useOnceEffect(() => {
    if (selectedPatient?.id) {
      dispatch(fetchClaimPatientInsranceDataRequest({ claimID: data.claimID }));
      // dispatch(
      //   fetchPatientInsranceDataRequest({ patientID: selectedPatient.id })
      // );
      const selectedPatientFiltered = patientSearchData?.filter(
        (m) => m.id === selectedPatient?.id
      )[0];
      const groupID = selectedPatientFiltered?.groupID
        ? selectedPatientFiltered?.groupID
        : data?.groupID;

      if (groupID) {
        setSelectedPatientData(selectedPatientFiltered);
        dispatch(
          fetchReferringProviderDataRequest({
            groupID,
          })
        );
        dispatch(
          fetchAssignClaimToDataRequest({
            clientID: groupID,
          })
        );
        dispatch(fetchPracticeDataRequest({ groupID }));
        dispatch(fetchFacilityDataRequest({ groupID }));
        dispatch(fetchProviderDataRequest({ groupID }));
      }
    }
  }, [selectedPatient]);

  useEffect(() => {
    if (selectedPatientData) {
      setSelectedGroup(
        groupsData?.filter((m) => m.id === selectedPatientData.groupID)[0]
      );
      setJsonData({
        ...jsonData,
        posID: selectedPatientData?.placeOfServiceID,
      });
    }
    if (data) {
      setSelectedGroup(groupsData?.filter((m) => m.id === data.groupID)[0]);
      setJsonData({ ...jsonData, posID: data.posID });
    }
  }, [selectedPatientData]);

  const onSelectFacility = (value: SingleSelectDropDownDataType) => {
    const f = facilitiesData?.filter((m) => m.id === value.id)[0];
    isChangeValue({
      ...jsonData,
      facilityID: value.id,
      posID: f ? f.placeOfServiceID : jsonData.posID,
    });
  };

  useEffect(() => {
    if (providersData) {
      setSupervisingProviderData(providersData);
    }
  }, [providersData]);

  useEffect(() => {
    if (claimPatientInsuranceData) {
      const insuranceDataFiltered = claimPatientInsuranceData?.filter(
        (patientInsurance) =>
          patientInsurance.insuranceResponsibility === 'P' ||
          patientInsurance.insuranceResponsibility === 'S'
      );
      setPrimaryInsuranceData(insuranceDataFiltered);

      if (insuranceDataFiltered.length && insuranceDataFiltered[0]) {
        onSelectPrimaryInsurance(insuranceDataFiltered[0]);
      }
    }
  }, [claimPatientInsuranceData]);

  useEffect(() => {
    if (selectedRefProvider) {
      setJsonData({ ...jsonData, referringProviderID: selectedRefProvider.id });

      const name = selectedRefProvider.value.split(' ');
      isChangeValue({
        ...jsonData,
        referringProviderID: selectedRefProvider.id,
        referringProviderLastName: name[0] || '',
        referringProviderFirstName: name[1] || '',
      });
    }
  }, [selectedRefProvider]);
  const [admissionDate, setAdmissionDate] = useState<Date | null>(null);
  useEffect(() => {
    setSelectedPatient({
      id: data.patientID,
      value: data.patientName,
    });

    const selectedRendProvider = providersData?.filter(
      (m) => m.id === data.providerID
    )[0];
    const selectedSupProvider = providersData?.filter(
      (m) => m.id === data.supervisingProviderID
    )[0];
    const selectedAssignmentBelong = lookupsData?.assignmentBelongsTo.filter(
      (m) => m.id === data.assignmentBelongsToID
    )[0];
    const selectedReffProvider = providersData?.filter(
      (m) => m.id === data.referringProviderID
    )[0];
    if (selectedReffProvider) {
      setselectedRefProvider(selectedReffProvider);
    }
    setJsonData({
      ...jsonData,
      referringProviderID: selectedReffProvider
        ? selectedReffProvider.id
        : null,
      // providerID: selectedRendProvider.id,
      supervisingProviderID: selectedSupProvider
        ? selectedSupProvider.id
        : null,
      referralNumber: data.referralNumber,
      panNumber: data.panNumber,
      // assignmentBelongsToID: selectedAssignmentBelong ? selectedAssignmentBelong.id : null,
      dosFrom: data.dosFrom ? data.dosFrom : '',
      dosTo: data.dosTo ? data.dosTo : '',
    });
    if (data.additionalFieldsData.admissionDate) {
      setAdmissionDate(
        StringToDatePipe(data.additionalFieldsData.admissionDate)
      );
    }
    if (selectedRendProvider)
      setJsonData({ ...jsonData, providerID: selectedRendProvider.id });
    // if (selectedSupProvider)
    //   setJsonData({
    //     ...jsonData,
    //     supervisingProviderID: selectedSupProvider.id,
    //   });

    // setJsonData({ ...jsonData, referralNumber: data.referralNumber });
    // setJsonData({ ...jsonData, panNumber: data.panNumber });
    if (selectedAssignmentBelong)
      setJsonData({
        ...jsonData,
        assignmentBelongsToID: selectedAssignmentBelong.id,
      });

    // setJsonData({
    //   ...jsonData,
    //   dosFrom: data.dosFrom ? data.dosFrom : '',
    //   dosTo: data.dosTo ? data.dosTo : '',
    // });
    // setJsonData({ ...jsonData, dosTo: data.dosTo ? data.dosTo : '' });
    setSelectedAdditionalFields(data.additionalFieldsData);
  }, []);
  const [medicalCaseDropdownData, setMedicalCaseDropdownData] = useState<
    SingleSelectDropDownDataType[]
  >([]);
  const getMedicalCaseForClaimData = async (
    obj: GetLinkableClaimsForMedicalCaseCriteria
  ) => {
    const res = await getMedicalCaseForClaim(obj);
    if (res) {
      setMedicalCaseDropdownData(res);
    }
  };
  // useEffect(() => {
  //   if (medicalCaseDropdownData && !jsonData.medicalCaseID) {
  //     setJsonData({
  //       ...jsonData,
  //       medicalCaseID: medicalCaseDropdownData[0]?.id,
  //     });
  //   }
  // }, [medicalCaseDropdownData]);
  useEffect(() => {
    if (
      selectedPatient &&
      jsonData.facilityID &&
      jsonData.patientInsuranceID &&
      !jsonData.medicalCaseID
    ) {
      getMedicalCaseForClaimData({
        patientID: selectedPatient.id,
        facilityID: jsonData.facilityID,
        patientInsuranceID: jsonData.patientInsuranceID,
        medicalCaseID: undefined,
      });
    } else if (
      selectedPatient &&
      jsonData.facilityID &&
      jsonData.patientInsuranceID &&
      jsonData.medicalCaseID
    ) {
      getMedicalCaseForClaimData({
        patientID: selectedPatient.id,
        facilityID: jsonData.facilityID,
        patientInsuranceID: jsonData.patientInsuranceID,
        medicalCaseID: jsonData.medicalCaseID,
      });
    }
  }, [
    selectedPatient,
    jsonData.facilityID,
    jsonData.patientInsuranceID,
    jsonData.medicalCaseID,
  ]);
  const [isMedicalCaseModalOpen, setMedicalCaseModalOpen] = useState(false);
  const [isViewMedicalCaseMode, setIsViewMedicalCaseMode] = useState(false);
  const [selectedMedicalCaseID, setSelectedMedicalCaseID] = useState<
    number | null
  >(null);
  const [patientDetailsModal, setPatientDetailsModal] = useState<{
    open: boolean;
    id: number | null;
  }>({
    open: false,
    id: null,
  });
  return (
    <div className="w-full bg-gray-100">
      <div className="flex flex-col gap-[72px] px-[24px] pt-[40px]">
        {/* Patient Section */}
        <div className=" flex flex-col">
          <div className="flex flex-row gap-6">
            <div className="flex items-center justify-start">
              <p className="text-xl font-bold leading-7 text-gray-700">
                Patient
              </p>
            </div>
            {/* <div className=" items-start justify-end ">
              <Button
                buttonType={ButtonType.secondary}
                cls={`inline-flex px-3 py-2 gap-2 leading-5`}
                onClick={() => {
                  setIsPatientEditMode(true);
                }}
              >
                <Icon name={'pencil'} size={16} color={IconColors.NONE} />
                <p className="text-sm font-medium leading-tight text-gray-700">
                  Edit
                </p>
              </Button>
            </div> */}
          </div>
          <div className={`pt-[16px] flex flex-row gap-6 items-start `}>
            <div className={`gap-2 flex items-end`}>
              <div className={`gap-1 w-auto`}>
                <div className="flex gap-1">
                  <label className="text-sm font-medium leading-5 text-gray-700">
                    Choose an existing patient or add a new one
                  </label>
                  <InfoToggle
                    position="right"
                    text={
                      <div>
                        {' '}
                        CMS1500: BOX2 <br /> X12: LOOP 2010CA - NM103
                      </div>
                    }
                  />
                </div>
                <div
                  className={`w-full gap-1 flex flex-col items-start self-stretch`}
                >
                  <div className="w-[280px]">
                    <SingleSelectDropDown
                      placeholder="Patient Name"
                      forcefullyShowSearchBar
                      disabled={true}
                      data={[]}
                      selectedValue={selectedPatient}
                      onSelect={() => {}}
                    />
                  </div>
                </div>
              </div>
              <Button
                disabled={!isPatientEditMode}
                buttonType={ButtonType.secondary}
                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                onClick={() => {
                  // setRoutePath(`/app/register-patient/${data.patientID}`);
                  setPatientDetailsModal({
                    open: true,
                    id: data.patientID || null,
                  });
                }}
              >
                <Icon name={'pencil'} size={18} color={IconColors.GRAY} />
              </Button>
            </div>
            {/* <div className={`flex gap-2 items-end`}>
              <div className={`gap-1 w-auto`}>
                <label className="text-sm font-medium leading-5 text-gray-700">
                  Link claim to patient treatment
                </label>
                <div
                  className={`w-full gap-1 justify-center flex flex-col items-start self-stretch`}
                >
                  <div className="w-[280px] ">
                    <SingleSelectDropDown
                      placeholder="Select Treatment or add a new one"
                      showSearchBar={false}
                      disabled={!isPatientEditMode}
                      data={[
                        { id: 1, value: 'Diabetes' },
                        { id: 2, value: 'Back Pain PT' },
                      ]}
                      onSelect={() => {}}
                    />
                  </div>
                </div>
              </div>
              <Button
                disabled={!isPatientEditMode}
                buttonType={ButtonType.secondary}
                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 text-sm inline-flex `}
              >
                <Icon name={'pencil'} size={18} color={IconColors.GRAY} />
              </Button>
              <Button
                disabled={!isPatientEditMode}
                buttonType={ButtonType.secondary}
                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
              >
                <Icon name={'plus1'} size={18} color={IconColors.GRAY} />
              </Button>
            </div> */}
          </div>
        </div>
        {/* Bill Claim To */}
        <div className=" flex flex-col">
          <div className="flex flex-row gap-6">
            <div className="flex items-center justify-start">
              <p className="text-xl font-bold leading-7 text-gray-700">
                Claim Bill To
              </p>
            </div>
            {/* <div className="flex items-start justify-end ">
              <Button
                buttonType={ButtonType.secondary}
                cls={`inline-flex px-3 py-2 gap-2 leading-5`}
                onClick={() => {
                  setIsClaimEditMode(true);
                }}
              >
                <Icon name={'pencil'} size={16} color={IconColors.NONE} />
                <p className="text-sm font-medium leading-tight text-gray-700">
                  Edit
                </p>
              </Button>
            </div> */}
          </div>
          <div className={`pt-[16px] flex flex-row gap-6 items-start `}>
            <div className={`gap-2 flex items-end`}>
              <div className={`gap-1 w-auto`}>
                <label className="text-sm font-medium leading-5 text-gray-700">
                  Assignment Belongs to
                </label>
                <div className="w-[280px]">
                  <SingleSelectDropDown
                    placeholder="Assignment Belongs to"
                    showSearchBar={false}
                    disabled={true}
                    data={
                      lookupsData?.assignmentBelongsTo
                        ? (lookupsData.assignmentBelongsTo as SingleSelectDropDownDataType[])
                        : []
                    }
                    selectedValue={
                      lookupsData?.assignmentBelongsTo.filter(
                        (f) => f.id === jsonData.assignmentBelongsToID
                      )[0]
                    }
                    onSelect={(value) => {
                      isChangeValue({
                        ...jsonData,
                        assignmentBelongsToID: value.id,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={`relative `}>
            <div className={`inset-0 relative gap-6 flex items-start`}>
              <div className={``}>
                <div className={`gap-2 flex items-end`}>
                  <div className="pt-[14px]">
                    <div className={`gap-1 w-[280px]`}>
                      <div className={`w-full items-start self-stretch`}>
                        <div className="flex gap-1">
                          <label className="text-sm font-medium leading-5 text-gray-900">
                            Primary Insurance
                          </label>
                          <InfoToggle
                            position="right"
                            text={
                              <div>
                                {' '}
                                CMS1500 : BOX11-C <br /> X12 : LOOP 2010BB -
                                NM103
                              </div>
                            }
                          />
                        </div>
                        <div className="w-[280px]">
                          <SingleSelectDropDown
                            placeholder="Primary Insurance"
                            showSearchBar={false}
                            disabled={!isClaimEditMode}
                            data={
                              primaryInsuranceData
                                ? (primaryInsuranceData as SingleSelectDropDownDataType[])
                                : []
                            }
                            selectedValue={
                              primaryInsuranceData?.filter(
                                (f) => f.id === jsonData.patientInsuranceID
                              )[0]
                            }
                            onSelect={(value) => {
                              onSelectPrimaryInsurance(value);
                              isChangeValue({
                                ...jsonData,
                                patientInsuranceID: value.id,
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    disabled={!isClaimEditMode}
                    buttonType={ButtonType.secondary}
                    cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 text-sm inline-flex `}
                  >
                    <Icon name={'pencil'} size={18} color={IconColors.GRAY} />
                  </Button>
                  <div className={`flex pl-[24px]`}>
                    <div className={`gap-1 w-[280px]`}>
                      <div className={`w-full items-start self-stretch`}>
                        <div className="flex gap-1">
                          <label className="text-sm font-medium leading-5 text-gray-900">
                            Relation to Insurance Subscriber
                          </label>
                          <InfoToggle
                            position="right"
                            text={
                              <div>
                                {' '}
                                CMS1500 : BOX11 <br /> X12 : LOOP 2010BA - NM109
                              </div>
                            }
                          />
                        </div>
                        <div className="w-[280px]">
                          <InputField
                            placeholder="Relation to Insurance Subscriber"
                            disabled={true}
                            value={selectedSubscriberRelation}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Service Details */}
        <div className=" flex flex-col">
          <div className="flex flex-row gap-6">
            <div className="flex items-center justify-start">
              <p className="text-xl font-bold leading-7 text-gray-700">
                Service Details
              </p>
            </div>
            {/* <div className="flex items-start justify-end ">
              <Button
                buttonType={ButtonType.secondary}
                cls={`inline-flex px-3 py-2 gap-2 leading-5`}
                onClick={() => {
                  setIsServiceEditMode(true);
                }}
              >
                <Icon name={'pencil'} size={16} color={IconColors.NONE} />
                <p className="text-sm font-medium leading-tight text-gray-700">
                  Edit
                </p>
              </Button>
            </div> */}
          </div>
          <div className="flex-col pt-[30px]">
            <div className={`relative flex gap-4 `}>
              <div>
                <div className="flex gap-1">
                  <label className="text-sm font-medium leading-5 text-gray-900">
                    DoS - From
                  </label>
                  <InfoToggle
                    position="right"
                    text={
                      <div>
                        {' '}
                        CMS1500 : BOX24-A <br /> X12 : LOOP 2400 - DTP03 (472)
                      </div>
                    }
                  />
                </div>
                <div className="w-[144px]">
                  <AppDatePicker
                    placeholderText="mm/dd/yyyy"
                    cls=""
                    disabled={true}
                    onChange={(date) =>
                      date &&
                      isChangeValue({
                        ...jsonData,
                        dosFrom: JSON.stringify(date),
                      })
                    }
                    selected={
                      jsonData.dosFrom
                        ? DateToStringPipe(jsonData.dosFrom, 1)
                        : null
                    }
                  />
                </div>
              </div>
              <div>
                <div className="flex gap-1">
                  <label className="text-sm font-medium leading-5 text-gray-900">
                    DoS - To
                  </label>
                  <InfoToggle
                    position="right"
                    text={
                      <div>
                        {' '}
                        CMS1500 : BOX24-A <br /> X12 : LOOP 2400 - DTP03 (472)
                      </div>
                    }
                  />
                </div>
                <div className="w-[144px]">
                  <AppDatePicker
                    placeholderText="mm/dd/yyyy"
                    cls=""
                    disabled={true}
                    onChange={(date) =>
                      date &&
                      isChangeValue({
                        ...jsonData,
                        dosTo: JSON.stringify(date),
                      })
                    }
                    selected={
                      jsonData.dosTo
                        ? DateToStringPipe(jsonData.dosTo, 1)
                        : null
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="relative w-full pt-[40px]">
            <div
              className={`relative flex items-start gap-8 text-gray-700 leading-6 text-left font-bold w-full h-full `}
            >
              <div className={`gap-6 flex flex-col items-start`}>
                <p className={`text-base inline m-0`}>{'Location'}</p>
                <div className={`w-[280px]`}>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      Group
                    </label>
                    <div className="w-[280px]">
                      <InputField
                        placeholder="Group"
                        disabled={true}
                        value={selectedGroup?.value}
                      />
                    </div>
                  </div>
                </div>
                <div className={`w-[280px]`}>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      Practice
                    </label>
                    <div className="w-[280px]">
                      <InputField
                        placeholder="Practice"
                        disabled={true}
                        value={selectedPractice?.value}
                      />
                    </div>
                  </div>
                </div>
                <div className={`w-[280px]`}>
                  <div className={`w-full items-start self-stretch`}>
                    <div className="flex gap-1">
                      <label className="text-sm font-medium leading-5 text-gray-900">
                        Facility
                      </label>
                      <InfoToggle
                        position="right"
                        text={
                          <div>
                            {' '}
                            CMS1500 : BOX32 <br /> X12 : LOOP 2310C - NM103
                          </div>
                        }
                      />
                    </div>
                    <div className="w-[280px]">
                      <SingleSelectDropDown
                        placeholder="Facility"
                        showSearchBar={true}
                        disabled={!isEditServiceMode}
                        data={
                          facilitiesData
                            ? (facilitiesData as SingleSelectDropDownDataType[])
                            : []
                        }
                        selectedValue={
                          facilitiesData?.filter(
                            (f) => f.id === jsonData.facilityID
                          )[0]
                        }
                        onSelect={(value) => {
                          onSelectFacility(value);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className={`w-[280px]`}>
                  <div className={`w-full items-start self-stretch`}>
                    <div className="flex gap-1">
                      <label className="text-sm font-medium leading-5 text-gray-900">
                        Place of Service
                      </label>
                      <InfoToggle
                        position="right"
                        text={
                          <div>
                            {' '}
                            CMS1500 : BOX24-B <br /> X12 : LOOP 2400 - SV105
                          </div>
                        }
                      />
                    </div>
                    <div className="w-[280px]">
                      <SingleSelectDropDown
                        placeholder="Place of Service"
                        showSearchBar={true}
                        disabled={!isEditServiceMode}
                        data={
                          lookupsData?.placeOfService
                            ? (lookupsData?.placeOfService as SingleSelectDropDownDataType[])
                            : []
                        }
                        selectedValue={
                          lookupsData?.placeOfService.filter(
                            (f) => f.id === jsonData.posID
                          )[0]
                        }
                        onSelect={(value) => {
                          isChangeValue({ ...jsonData, posID: value.id });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-px">
                <div
                  className={` [rotate:90deg] origin-top-left bg-gray-300 w-[400px] outline outline-1 outline-[rgba(209,213,219,1)]`}
                ></div>
              </div>

              <div
                className={`relative gap-6 inline-flex flex-col items-start text-gray-700 leading-6 text-left font-bold  `}
              >
                <p className={`text-base m-0`}>{'Provider'}</p>
                <div className={`gap-2 flex items-end`}>
                  <div className={`relative w-[280px] h-[66px] content-end`}>
                    <div className={`w-[372.77px] items-start self-stretch`}>
                      <div className="flex gap-1">
                        <label className="text-sm font-medium leading-5 text-gray-900">
                          Rendering Provider
                        </label>
                        <InfoToggle
                          position="right"
                          text={
                            <div>
                              {' '}
                              CMS1500 : BOX31 <br /> X12 : LOOP 2310B - NM103
                            </div>
                          }
                        />
                      </div>
                      <div className="w-[280px]">
                        <SingleSelectDropDown
                          placeholder="Search or add new provider"
                          showSearchBar={true}
                          disabled={!isEditServiceMode}
                          data={
                            providersData
                              ? (providersData as SingleSelectDropDownDataType[])
                              : []
                          }
                          selectedValue={
                            providersData?.filter(
                              (f) => f.id === jsonData.providerID
                            )[0]
                          }
                          onSelect={(value) => {
                            isChangeValue({
                              ...jsonData,
                              providerID: value.id,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    disabled={!isEditServiceMode}
                    buttonType={ButtonType.secondary}
                    cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                  >
                    <Icon name={'pencil'} size={18} color={IconColors.GRAY} />
                  </Button>
                  <Button
                    disabled={!isEditServiceMode}
                    buttonType={ButtonType.secondary}
                    cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                  >
                    <Icon name={'plus1'} size={18} color={IconColors.GRAY} />
                  </Button>
                </div>
                <div className={`gap-2 flex items-end`}>
                  <div className={`relative w-[280px] h-[65px] content-end`}>
                    <div className={`w-full items-start self-stretch`}>
                      <div className="flex gap-1">
                        <label className="text-sm font-medium leading-5 text-gray-900">
                          Referring Provider
                        </label>
                        <InfoToggle
                          position="right"
                          text={
                            <div>
                              {' '}
                              CMS1500 : BOX17 <br /> X12 : LOOP 2310A - NM103
                            </div>
                          }
                        />
                      </div>
                      <div className="w-[280px]">
                        <SingleSelectDropDown
                          placeholder="Click search button to add provider"
                          showSearchBar={true}
                          disabled={!isEditServiceMode}
                          data={
                            referringProviderData
                              ? (referringProviderData as SingleSelectDropDownDataType[])
                              : []
                          }
                          selectedValue={
                            referringProviderData?.filter(
                              (f) => f.id === jsonData.referringProviderID
                            )[0]
                          }
                          onSelect={(value) => {
                            setselectedRefProvider(value);
                          }}
                          isOptional={true}
                          onDeselectValue={() => {
                            setselectedRefProvider(undefined);
                            setJsonData({
                              ...jsonData,
                              referringProviderID: null,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    disabled={!isEditServiceMode}
                    buttonType={ButtonType.secondary}
                    cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Icon name={'search1'} size={18} color={IconColors.GRAY} />
                  </Button>
                  <Modal
                    open={isModalOpen}
                    onClose={() => {}}
                    modalContentClassName="relative w-[1232px] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
                  >
                    <SearchProvider
                      onClose={() => setIsModalOpen(false)}
                      onSelect={(value) => {
                        const newProvider = [
                          ...(referringProviderData || []),
                          value,
                        ];
                        setReferringProviderData(newProvider);
                        setselectedRefProvider(value);
                      }}
                    />
                  </Modal>
                </div>
                <div className={`relative w-[280px] h-[62px]`}>
                  <div className={`w-full items-start self-stretch`}>
                    <div className="flex gap-1">
                      <label className="text-sm font-medium leading-5 text-gray-900">
                        Referral Number
                      </label>
                      <InfoToggle
                        position="right"
                        text={
                          <div>
                            {' '}
                            CMS1500 : BOX23 <br /> X12 : LOOP 2300 - REF02 (9F)
                          </div>
                        }
                      />
                    </div>
                    <div className="w-[280px]">
                      <InputField
                        disabled={!isEditServiceMode}
                        value={jsonData.referralNumber || ''}
                        onChange={(evt) => {
                          isChangeValue({
                            ...jsonData,
                            referralNumber: evt.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-px">
                <div
                  className={`relative [rotate:90deg] origin-top-left h-0 bg-gray-300 w-[400px] outline outline-1 outline-[rgba(209,213,219,1)]`}
                ></div>
              </div>
              <div className={`gap-6 flex flex-col items-start`}>
                <p className={` text-base inline m-0`}>{'Other'}</p>
                <div className={`gap-2 inline-flex items-end w-[372.px] `}>
                  <div className={`relative w-[280px] h-[66px]  content-end`}>
                    <div className={`w-full items-start self-stretch`}>
                      <div className="flex gap-1">
                        <label className="text-sm font-medium leading-5 text-gray-900">
                          Supervising Provider
                        </label>
                        <InfoToggle
                          position="right"
                          text={
                            <div>
                              {' '}
                              CMS1500 : BOX17 <br /> X12 : LOOP 2310D - NM103
                              (DQ)
                            </div>
                          }
                        />
                      </div>
                      <div className="w-[280px]">
                        <SingleSelectDropDown
                          placeholder="Supervising Provider"
                          showSearchBar={true}
                          disabled={!isEditServiceMode}
                          data={
                            supervisingProviderData
                              ? (supervisingProviderData as SingleSelectDropDownDataType[])
                              : []
                          }
                          selectedValue={
                            supervisingProviderData?.filter(
                              (f) => f.id === jsonData.supervisingProviderID
                            )[0]
                          }
                          onSelect={(value) => {
                            isChangeValue({
                              ...jsonData,
                              supervisingProviderID: value.id,
                            });
                          }}
                          isOptional={true}
                          onDeselectValue={() => {
                            isChangeValue({
                              ...jsonData,
                              supervisingProviderID: null,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    disabled={!isEditServiceMode}
                    buttonType={ButtonType.secondary}
                    cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                  >
                    <Icon name={'pencil'} size={18} color={IconColors.GRAY} />
                  </Button>
                  <Button
                    disabled={!isEditServiceMode}
                    buttonType={ButtonType.secondary}
                    cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                  >
                    <Icon name={'plus1'} size={18} color={IconColors.GRAY} />
                  </Button>
                </div>
                <div className={` w-[280px] `}>
                  <div className={` gap-2 w-[280px]`}>
                    <div className={`w-full items-start self-stretch`}>
                      <div className="flex gap-1">
                        <label className="text-sm font-medium leading-5 text-gray-900">
                          Billing Provider
                        </label>
                        <InfoToggle
                          position="right"
                          text={
                            <div>
                              {' '}
                              CMS1500 : BOX33 <br /> X12 : LOOP 2010AA - NM103
                            </div>
                          }
                        />
                      </div>
                      <div className="w-[280px]">
                        <InputField
                          placeholder="Billing Provider"
                          disabled={true}
                          value={selectedPractice?.value}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`relative w-[280px] `}>
                  <div className={`w-full items-start self-stretch`}>
                    <div className="flex gap-1">
                      <label className="text-sm font-medium leading-5 text-gray-900">
                        Prior Authorization Number
                      </label>
                      <InfoToggle
                        position="right"
                        text={
                          <div>
                            {' '}
                            CMS1500 : BOX23 <br /> X12 : LOOP 2300 - REF02 (G1)
                          </div>
                        }
                      />
                    </div>
                    <div className="w-[280px]">
                      <InputField
                        disabled={!isEditServiceMode}
                        value={jsonData.panNumber || ''}
                        onChange={(evt) => {
                          isChangeValue({
                            ...jsonData,
                            panNumber: evt.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className={`relative w-[280px] `}>
                  <div className={`w-full items-start self-stretch`}>
                    <div className="flex gap-1">
                      <label className="text-sm font-medium leading-5 text-gray-900">
                        Admission Date
                      </label>
                      <InfoToggle
                        position="right"
                        text={
                          <div>
                            {' '}
                            CMS1500 : BOX18 <br /> X12 : LOOP 2300 - DTP03 (435)
                          </div>
                        }
                      />
                    </div>
                    <div className="w-[280px]">
                      <AppDatePicker
                        placeholderText="mm/dd/yyyy"
                        cls="mt-1"
                        disabled={!isEditServiceMode}
                        onChange={(date) => {
                          isChangeValue({
                            ...jsonData,
                            additionalFieldsData: {
                              ...jsonData.additionalFieldsData,
                              admissionDate: DateToStringPipe(date, 1),
                            },
                          });
                          setAdmissionDate(date);
                        }}
                        selected={admissionDate}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <div className={`relative w-[280px] h-[66px]`}>
                    <div className={`w-full items-start self-stretch`}>
                      <div className="flex gap-1">
                        <label className="text-sm font-medium leading-5 text-gray-900">
                          Medical Case
                        </label>
                      </div>
                      <div className="w-[280px]">
                        <SingleSelectDropDown
                          placeholder="Medical Case"
                          showSearchBar={true}
                          disabled={!isEditServiceMode}
                          data={
                            medicalCaseDropdownData
                              ? (medicalCaseDropdownData as SingleSelectDropDownDataType[])
                              : []
                          }
                          selectedValue={
                            medicalCaseDropdownData?.filter(
                              (f) => f.id === jsonData.medicalCaseID
                            )[0]
                          }
                          onSelect={(value) => {
                            isChangeValue({
                              ...jsonData,
                              medicalCaseID: value.id,
                            });
                          }}
                          isOptional={true}
                          onDeselectValue={() => {
                            isChangeValue({
                              ...jsonData,
                              medicalCaseID: undefined,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pb-1">
                    <Button
                      disabled={!isEditServiceMode}
                      buttonType={ButtonType.secondary}
                      onClick={() => {
                        setSelectedMedicalCaseID(
                          jsonData.medicalCaseID || null
                        );
                        setIsViewMedicalCaseMode(true);
                        setMedicalCaseModalOpen(true);
                      }}
                      cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                    >
                      <Icon name={'pencil'} size={18} color={IconColors.GRAY} />
                    </Button>
                    <Button
                      disabled={!isEditServiceMode}
                      buttonType={ButtonType.secondary}
                      cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                      onClick={() => {
                        setSelectedMedicalCaseID(null);
                        setIsViewMedicalCaseMode(false);
                        setMedicalCaseModalOpen(true);
                      }}
                    >
                      <Icon name={'plus1'} size={18} color={IconColors.GRAY} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Additional Information */}
        <div className=" flex flex-col">
          <div className="flex flex-row gap-6">
            <div className="flex items-center justify-start">
              <p className="text-xl font-bold leading-7 text-gray-700">
                Additional Information
              </p>
            </div>
            {/* <div className="flex items-start justify-end ">
              <Button
                buttonType={ButtonType.secondary}
                cls={`inline-flex px-3 py-2 gap-2 leading-5`}
                onClick={() => {
                  setIsAddtionalEditMode(true);
                }}
              >
                <Icon name={'pencil'} size={16} color={IconColors.NONE} />
                <p className="text-sm font-medium leading-tight text-gray-700">
                  Edit
                </p>
              </Button>
            </div> */}
          </div>
          <div className=" inline-flex gap-6 pb-[200px]">
            <div className="flex items-center justify-start">
              <p className="text-xl font-bold leading-7 text-gray-700">
                <AdditionalFiedlsSection
                  disable={!isAddtionalEditMode}
                  selectedData={selectedAdditionalFields}
                  onAddAdditionalFields={(value) => {
                    isChangeValue({
                      ...jsonData,
                      additionalFieldsData: value,
                    });
                  }}
                />
              </p>
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={isMedicalCaseModalOpen}
        onClose={() => {
          // setMedicalCaseModalOpen(false);
          // setIsViewMedicalCaseMode(false);
        }}
        modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
      >
        <MedicalCase
          onClose={() => {
            setIsViewMedicalCaseMode(false);
            setMedicalCaseModalOpen(false);
            getMedicalCaseForClaimData({
              patientID: selectedPatient?.id,
              facilityID: jsonData.facilityID,
              patientInsuranceID: jsonData.patientInsuranceID,
              medicalCaseID: jsonData.medicalCaseID,
            });
          }}
          selectedPatientID={selectedPatient?.id || null}
          groupID={selectedGroup?.id || undefined}
          isViewMode={isViewMedicalCaseMode}
          medicalCaseID={selectedMedicalCaseID}
        />
      </Modal>
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
          onSave={() => {}}
        />
      </Modal>
    </div>
  );
}
