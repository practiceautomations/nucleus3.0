import type { GridColDef } from '@mui/x-data-grid-pro';
// import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import SavedSearchCriteria from '@/components/PatientSearch/SavedSearchCriteria';
import AppDatePicker from '@/components/UI/AppDatePicker';
import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';
import Button, { ButtonType } from '@/components/UI/Button';
import type { ButtonSelectDropdownDataType } from '@/components/UI/ButtonSelectDropdown';
import ButtonSelectDropdownForExport from '@/components/UI/ButtonSelectDropdownForExport';
import CloseButton from '@/components/UI/CloseButton';
import InputField from '@/components/UI/InputField';
import Modal from '@/components/UI/Modal';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import SectionHeading from '@/components/UI/SectionHeading';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppLayout from '@/layouts/AppLayout';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  addToastNotification,
  fetchFacilityDataRequest,
  fetchPatientInsranceDataRequest,
  fetchPracticeDataRequest,
  getLookupDropdownsRequest,
  setGlobalModal,
} from '@/store/shared/actions';
import {
  checkEligibility,
  fetchEligiblityCheckListData,
  fetchInsuranceData,
  getEligibilityCheckResponse,
  getPatientLookup,
  searchPatientAsyncAPI,
} from '@/store/shared/sagas';
import {
  getAllInsuranceDataSelector,
  getFacilityDataSelector,
  getPatientInsuranceDataSelector,
  getPracticeDataSelector,
} from '@/store/shared/selectors';
import {
  type AllInsuranceData,
  type EligibilityCheckListSearchCriteria,
  type EligibilityCheckListSearchResult,
  type EligibilityRequestData,
  type GroupData,
  type PatientInsuranceData,
  type PatientLookupDropdown,
  type PatientSearchOutput,
  type PracticeData,
  ToastType,
} from '@/store/shared/types';
import type {
  DownloadDataPDFDataType,
  PDFColumnInput,
  PDFRowInput,
} from '@/utils';
import { ExportDataToCSV, ExportDataToDrive, ExportDataToPDF } from '@/utils';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import {
  DateToStringPipe,
  StringToDatePipe,
} from '@/utils/dateConversionPipes';

const EligibilityCheckList = () => {
  // const router = useRouter();

  const practiceData = useSelector(getPracticeDataSelector);
  const [practiceDropdown, setPracticeDropdown] = useState<PracticeData[]>([]);
  const [showWarningModal, setWarningModal] = useState(false);
  const facilitiesData = useSelector(getFacilityDataSelector);
  const dispatch = useDispatch();
  const [hideSearchParameters, setHideSearchParameters] =
    useState<boolean>(true);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const [groupDropdown, setGroupDropdown] = useState<GroupData[]>([]);
  const [statusModalInfo, setStatusModalInfo] = useState({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
    showCloseBUtton: StatusModalType.WARNING,
  });
  const defaultSearchCriteria: EligibilityCheckListSearchCriteria = {
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    sortColumn: '',
    sortOrder: '',
    getAllData: false,
    userID: '',
    patientFirstName: '',
    patientLastName: '',
    patientDateOfBirth: null,
    patientID: '',
    groupID: null,
    practiceID: null,
    facilityID: null,
    insuranceID: null,
    serviceTypeID: null,
    fromRequestDate: null,
    toRequestDate: null,
    fromDOS: null,
    toDOS: null,
  };
  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const [renderSearchCriteriaView, setRenderSearchCriteriaView] = useState(
    uuidv4()
  );
  const [searchResult, setSearchResult] = useState<
    EligibilityCheckListSearchResult[]
  >([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const setSearchCriteriaFields = (
    value: EligibilityCheckListSearchCriteria
  ) => {
    setSearchCriteria(value);
  };
  const insuranceData = useSelector(getAllInsuranceDataSelector);
  const [insuranceAllData, setInsuanceAllData] = useState<AllInsuranceData[]>(
    []
  );
  const handleInsuanceAllData = (groupID: number) => {
    setInsuanceAllData([...insuranceData.filter((m) => m.groupID === groupID)]);
  };

  useEffect(() => {
    if (searchCriteria?.groupID) handleInsuanceAllData(searchCriteria?.groupID);
  }, [searchCriteria?.groupID, insuranceData]);
  const getSearchData = async (obj: EligibilityCheckListSearchCriteria) => {
    const res = await fetchEligiblityCheckListData(obj);
    if (res) {
      setSearchResult(res);
      setTotalCount(res[0]?.total || 0);
      setLastSearchCriteria(obj);
    } else {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Error',
        type: StatusModalType.ERROR,
        text: 'A system error occurred while searching for results.\nPlease try again.',
      });
    }
  };
  const onSelectFacility = (value: SingleSelectDropDownDataType) => {
    const f = facilitiesData?.filter((m) => m.id === value.id)[0];
    if (f) {
      setSearchCriteriaFields({
        ...searchCriteria,
        facilityID: value.id,
      });
    } else {
      setSearchCriteriaFields({
        ...searchCriteria,
        facilityID: value.id,
      });
    }
  };
  // Search bar
  const onClickSearch = async () => {
    const obj = {
      ...searchCriteria,
      sortColumn: '',
      sortOrder: '',
      pageNumber: 1,
    };
    setSearchCriteria(obj);
    getSearchData(obj);
  };
  const [patientlookupData, setPatientlookupData] =
    useState<PatientLookupDropdown>();
  const [eligibilityCheckData, setEligibilityCheckData] =
    useState<EligibilityRequestData>({
      patientInsuranceID: null,
      insuranceID: null,
      serviceTypeCodeID: null,
      dos: '',
    });
  const [insuranceDropdownData, setInsruanceDropdownData] = useState<
    PatientInsuranceData[]
  >([]);
  // const getPatientInsuranceData = async (patientID: number) => {
  //   const res = await getPatientInsuranceTabData(patientID);
  //   if (res) {
  //      setInsruanceDropdownData(
  //       res.map((m) => ({
  //         id: m.insuranceID,
  //         value: m.insuranceName,
  //       }))
  //     );
  //   }
  // };

  const patientLookupData = async () => {
    const res = await getPatientLookup();
    if (res) {
      setPatientlookupData(res);
    }
  };
  const initProfile = () => {
    dispatch(getLookupDropdownsRequest());
    fetchInsuranceData();
    patientLookupData();
  };
  useEffect(() => {
    initProfile();
  }, []);
  useEffect(() => {
    setPracticeDropdown(practiceData || []);
  }, [practiceData]);
  useEffect(() => {
    const groupId = searchCriteria?.groupID;
    if (groupId) {
      setPracticeDropdown([]);
      dispatch(fetchPracticeDataRequest({ groupID: groupId }));
      dispatch(fetchFacilityDataRequest({ groupID: groupId }));
    }
  }, [searchCriteria?.groupID]);
  const onViewEligibilityResponse = (data: string) => {
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(data);
      newTab.document.close();
    }
  };
  const [open270Response, setOpen270Response] = useState({
    open: false,
    response: '',
  });
  const columns: GridColDef[] = [
    {
      field: 'patientID',
      headerName: 'Patient ID',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={() => {
                // router.push(`/app/register-patient/${params.row.patientID}`);
                dispatch(
                  setGlobalModal({
                    type: 'Patient Detail',
                    id: params.row.patientID,
                    isPopup: true,
                  })
                );
              }}
            >
              #{params.value || ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'patientLastName',
      headerName: 'Last Name',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={() => {
                // router.push(`/app/register-patient/${params.row.patientID}`);
                dispatch(
                  setGlobalModal({
                    type: 'Patient Detail',
                    id: params.row.patientID,
                    isPopup: true,
                  })
                );
              }}
            >
              {params.value || ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'patientFirstName',
      headerName: 'First Name',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={() => {
                // router.push(`/app/register-patient/${params.row.patientID}`);
                dispatch(
                  setGlobalModal({
                    type: 'Patient Detail',
                    id: params.row.patientID,
                    isPopup: true,
                  })
                );
              }}
            >
              {params.value || ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'insurance',
      headerName: 'Insurance Name',
      flex: 1,
      minWidth: 220,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={() => {
                // router.push(`/app/register-patient/${params.row.patientID}`);
              }}
            >
              {params.value || ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'dos',
      headerName: 'DoS',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            {params.value} {params.row.dos ? `- ${params.row.dosTo}` : ''}
          </div>
        );
      },
    },
    {
      field: 'eligibilityRequestDate',
      headerName: 'Eligibility Request Date',
      flex: 1,
      minWidth: 230,
      disableReorder: true,
    },
    {
      field: 'serviceType',
      headerName: 'Service Type',
      flex: 1,
      minWidth: 280,
      disableReorder: true,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 312,
      hideSortIcons: true,
      disableReorder: true,
      cellClassName: '!bg-cyan-50 PinnedColumLeftBorder',
      headerClassName: '!bg-cyan-100 !text-center PinnedColumLeftBorder',
      renderCell: (params) => {
        return (
          <div className="flex flex-row gap-2">
            <Button
              buttonType={ButtonType.primary}
              cls={`!w-[134px] !h-[30px] pl-[9px] pr-[11px] py-[7px] inline-flex px-4 py-2 gap-2 leading-5 bg-cyan-500 !rounded`}
              onClick={async () => {
                const res = await getEligibilityCheckResponse(params.row.id);
                if (res) {
                  onViewEligibilityResponse(res.eligibilityBenefit);
                }
              }}
            >
              <div className="flex h-4 w-4 items-center justify-center px-[0.37px] py-[2.40px]">
                <Icon name={'eyeWhite'} size={18} />
              </div>
              <div className="min-w-[70px] text-xs font-medium leading-none text-white">
                View Response
              </div>
            </Button>
            <Button
              buttonType={ButtonType.primary}
              disabled={!params.row.message270}
              cls={`!w-[120px] !h-[30px] pl-[9px] pr-[11px] py-[7px] inline-flex px-4 py-2 gap-2 leading-5 !rounded`}
              onClick={() => {
                setOpen270Response({
                  open: true,
                  response: params.row.message270,
                });
              }}
            >
              <div className="flex h-4 w-4 items-center justify-center px-[0.37px] py-[2.40px]">
                <Icon
                  name={'eyeWhite'}
                  size={18}
                  color={
                    params.row.statusID === 3 ? IconColors.GRAY_500 : undefined
                  }
                />
              </div>
              <div className="min-w-[75px] text-xs font-medium leading-none">
                View 270
              </div>
            </Button>
          </div>
        );
      },
    },
  ];
  useEffect(() => {
    setGroupDropdown(selectedWorkedGroup?.groupsData || []);
    setSearchCriteria({
      ...searchCriteria,
      groupID: selectedWorkedGroup?.groupsData[0]?.id || 0,
    });
  }, [selectedWorkedGroup]);
  const [openEligibilityCheckModal, setOpenEligibilityCheckModal] =
    useState(false);
  const checkEligibilityForInsurance = async () => {
    const res = await checkEligibility(eligibilityCheckData);
    if (res) {
      onViewEligibilityResponse(res.response);
      setOpenEligibilityCheckModal(false);
    }
  };
  const [patientSearchData, setPatientSearchData] = useState<
    PatientSearchOutput[]
  >([]);
  const [selectedPatient, setSelectedPatient] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const onSearchPatient = async (value: string) => {
    const res = await searchPatientAsyncAPI({
      searchValue: value,
      groups: selectedWorkedGroup?.groupsData.map((m) => m.id) || [],
      practices: selectedWorkedGroup?.practicesData.map((m) => m.id) || [],
      facilities: selectedWorkedGroup?.facilitiesData.map((m) => m.id) || [],
      providers: selectedWorkedGroup?.providersData.map((m) => m.id) || [],
    });
    if (res) {
      setPatientSearchData(res);
    }
  };
  useEffect(() => {
    if (selectedPatient) {
      dispatch(
        fetchPatientInsranceDataRequest({ patientID: selectedPatient.id })
      );
    }
  }, [selectedPatient]);
  const patientInsuranceData = useSelector(getPatientInsuranceDataSelector);

  useEffect(() => {
    if (patientInsuranceData) {
      setInsruanceDropdownData(patientInsuranceData);
    }
  }, [patientInsuranceData]);
  const downloadTextFile = (textData: string) => {
    const blob = new Blob([textData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = '270.txt'; // Set the filename for the downloaded file
    document.body.appendChild(anchor);

    anchor.click();

    // Clean up by revoking the URL and removing the anchor element
    URL.revokeObjectURL(url);
    document.body.removeChild(anchor);
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
  // const [statusModalInfo, setStatusModalInfo] = useState({
  //   show: false,
  //   heading: '',
  //   text: '',
  //   type: StatusModalType.WARNING,
  //   showCloseBUtton: StatusModalType.WARNING,
  // });
  const downloadPdf = (pdfExportData: EligibilityCheckListSearchResult[]) => {
    if (!pdfExportData) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Alert',
        type: StatusModalType.WARNING,
        text: 'No Record to Export!',
      });
      return false;
    }
    const data: DownloadDataPDFDataType[] = [];
    // implement criteria
    const criteriaArray: PDFRowInput[] = [];

    if (searchCriteria.patientFirstName) {
      criteriaArray.push({
        Criteria: 'First Name',
        Value: searchCriteria?.patientFirstName || '',
      });
    }

    if (searchCriteria.patientLastName) {
      criteriaArray.push({
        Criteria: 'Last Name',
        Value: searchCriteria?.patientLastName || '',
      });
    }

    if (searchCriteria.patientDateOfBirth) {
      criteriaArray.push({
        Criteria: 'DOB',
        Value: searchCriteria.patientDateOfBirth,
      });
    }
    if (searchCriteria.patientID) {
      criteriaArray.push({
        Criteria: 'Patient ID',
        Value: searchCriteria?.patientID?.toString() || '',
      });
    }
    if (searchCriteria.groupID) {
      const groupName = groupDropdown.filter(
        (m) => m.id === searchCriteria.groupID
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Group', Value: groupName || '' });
    }

    if (searchCriteria.practiceID) {
      const pName = practiceData?.filter(
        (m) => m.id === searchCriteria.practiceID
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Practice', Value: pName || '' });
    }
    if (searchCriteria.facilityID && facilitiesData) {
      const Provider = facilitiesData.filter(
        (m) => m.id === Number(searchCriteria.facilityID)
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Facility', Value: Provider || '' });
    }

    if (searchCriteria.insuranceID) {
      const insurance = insuranceAllData?.filter(
        (m) => m.id === Number(searchCriteria.insuranceID)
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Insurance', Value: insurance || '' });
    }
    if (searchCriteria.serviceTypeID) {
      const insurance = patientlookupData?.serviceType?.filter(
        (m) => m.id === Number(searchCriteria.serviceTypeID)
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Service Type', Value: insurance || '' });
    }
    if (searchCriteria.fromRequestDate) {
      criteriaArray.push({
        Criteria: 'Request Date - From',
        Value: searchCriteria.fromRequestDate,
      });
    }
    if (searchCriteria.toRequestDate) {
      criteriaArray.push({
        Criteria: 'Request Date - To',
        Value: searchCriteria.toRequestDate,
      });
    }
    if (searchCriteria.fromDOS) {
      criteriaArray.push({
        Criteria: 'Date of Service - From',
        Value: searchCriteria.fromDOS,
      });
    }
    if (searchCriteria.toDOS) {
      criteriaArray.push({
        Criteria: 'Date of Service - To',
        Value: searchCriteria.toDOS,
      });
    }
    const criteriaColumns: PDFColumnInput[] = [];
    const keyNames1 =
      criteriaArray && criteriaArray[0] && Object.keys(criteriaArray[0]);
    if (keyNames1) {
      for (let i = 0; i < keyNames1.length; i += 1) {
        criteriaColumns.push({ title: keyNames1[i], dataKey: keyNames1[i] });
      }
    }
    data.push({ columns: criteriaColumns, body: criteriaArray });
    // implement data
    const searchData: PDFRowInput[] = pdfExportData.map((n) => {
      return {
        'Patient ID': n.patientID.toString(),
        'Last Name': n.patientLastName,
        'First Name': n.patientFirstName,
        'Insurance Name': n.insurance,
        DoS: `${n.dos} - ${n.dosTo}`,
        'Eligibility Request Date': n.eligibilityRequestDate,
        'Service Type': n.serviceType,
      };
    });
    const dataColumns: PDFColumnInput[] = [];
    const keyNames = searchData[0] && Object.keys(searchData[0]);
    if (keyNames) {
      for (let i = 0; i < keyNames.length; i += 1) {
        dataColumns.push({ title: keyNames[i], dataKey: keyNames[i] });
      }
    }
    data.push({ columns: dataColumns, body: searchData });
    ExportDataToPDF(data, 'Eligibility Check List');
    dispatch(
      addToastNotification({
        text: 'Export Successful',
        toastType: ToastType.SUCCESS,
        id: '',
      })
    );
    return true;
  };
  const ExportData = async (type: string) => {
    const obj: EligibilityCheckListSearchCriteria = {
      patientFirstName: searchCriteria.patientFirstName,
      patientLastName: searchCriteria.patientLastName,
      patientDateOfBirth: searchCriteria.patientDateOfBirth,
      patientID: searchCriteria.patientID,
      groupID: searchCriteria.groupID,
      practiceID: searchCriteria.practiceID,
      facilityID: searchCriteria.facilityID,
      insuranceID: searchCriteria.insuranceID,
      serviceTypeID: searchCriteria.serviceTypeID,
      fromRequestDate: searchCriteria.fromRequestDate,
      toRequestDate: searchCriteria.toRequestDate,
      fromDOS: searchCriteria.fromDOS,
      toDOS: searchCriteria.toDOS,
      pageNumber: 0,
      pageSize: 10,
      sortColumn: '',
      sortOrder: '',
      getAllData: true,
      userID: '',
    };
    const res = await fetchEligiblityCheckListData(obj);
    if (res) {
      if (type === 'pdf') {
        downloadPdf(res);
      } else {
        const exportDataArray = res.map((n) => {
          return {
            'Patient ID': n.patientID.toString(),
            'Last Name': n.patientLastName,
            'First Name': n.patientFirstName,
            'Insurance Name': n.insurance,
            DoS: `${n.dos} - ${n.dosTo}`,
            'Eligibility Request Date': n.eligibilityRequestDate,
            'Service Type': n.serviceType,
          };
        });
        if (exportDataArray.length !== 0) {
          const headerArray = Object.keys(exportDataArray[0] || {});
          let criteriaObj: { [key: string]: string } = {
            ...exportDataArray[0],
          };

          const criteriaArray = [];

          // Clear out the initial criteria object values
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));

          // Replace the initial criteria headers
          criteriaObj = {
            ...criteriaObj,
            'Patient ID': 'Criteria',
            'Last Name': 'Value',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          if (searchCriteria?.patientFirstName) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Patient First Name',
              'Last Name': searchCriteria?.patientFirstName?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.patientLastName) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Patient Last Name',
              'Last Name': searchCriteria?.patientLastName?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.patientDateOfBirth) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Date of Birth',
              'Last Name': searchCriteria.patientDateOfBirth,
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.patientID) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Patient ID',
              'Last Name': searchCriteria?.patientID?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.groupID) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Group',
              'Last Name':
                groupDropdown.filter(
                  (m) => m.id === Number(searchCriteria.groupID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }

          if (searchCriteria.practiceID && practiceDropdown) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Practice',
              'Last Name':
                practiceDropdown.filter(
                  (m) => m.id === Number(searchCriteria.practiceID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }

          if (searchCriteria.facilityID && facilitiesData) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Facility',
              'Last Name':
                facilitiesData.filter(
                  (m) => m.id === Number(searchCriteria.facilityID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }

          if (searchCriteria.insuranceID) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Insurance',
              'Last Name':
                insuranceAllData?.filter(
                  (m) => m.id === Number(searchCriteria.insuranceID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.serviceTypeID) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Service Type',
              'Last Name':
                patientlookupData?.serviceType?.filter(
                  (m) => m.id === Number(searchCriteria.serviceTypeID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.fromRequestDate) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Request Date - From',
              'Last Name': searchCriteria.fromRequestDate || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.toRequestDate) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Request Date - To',
              'Last Name': searchCriteria.toRequestDate || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.fromDOS) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Date of Service - From',
              'Last Name': searchCriteria.fromDOS || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.toDOS) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Date of Service - To',
              'Last Name': searchCriteria.toDOS || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));

          criteriaObj = {
            ...criteriaObj,
            'Patient ID': 'Eligibility Check List Details',
            'Last Name': '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = Object.fromEntries(
            headerArray.map((key) => [key, key])
          );
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          const exportArray = criteriaArray.concat(exportDataArray);

          if (!exportArray) {
            setStatusModalInfo({
              ...statusModalInfo,
              show: true,
              heading: 'Alert',
              type: StatusModalType.WARNING,
              text: 'No Data to Export!',
            });
            return;
          }
          if (type === 'csv') {
            ExportDataToCSV(exportArray, 'Eligibility Check List');
            dispatch(
              addToastNotification({
                text: 'Export Successful',
                toastType: ToastType.SUCCESS,
                id: '',
              })
            );
          } else {
            ExportDataToDrive(exportArray, 'Eligibility Check List', dispatch);
          }
        }
      }
    } else {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Error',
        type: StatusModalType.ERROR,
        text: 'A system error prevented the report to be exported. \nPlease try again.',
      });
    }
  };
  const onSelectExportOption = (res: ButtonSelectDropdownDataType[]) => {
    if (!searchResult.length) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Alert',
        type: StatusModalType.WARNING,
        text: 'No Record to Export!',
      });
      return;
    }
    const id = res[0]?.id || 0;
    if (id === 1) {
      ExportData('pdf');
    }
    if (id === 2) {
      ExportData('csv');
    }
    if (id === 3) {
      ExportData('download');
    }
  };

  return (
    <AppLayout title="Nucleus - Eligibility Check List">
      <div className="relative m-0 h-full bg-gray-100 p-0">
        <div className="m-0 h-full w-full overflow-y-scroll bg-gray-100 p-0">
          <div className="flex w-full flex-col">
            <div className="m-0 h-full w-full overflow-y-auto overflow-x-hidden bg-gray-100 p-0">
              <div className="h-[125px] w-full">
                <div className="absolute top-0 z-[11] w-full">
                  <Breadcrumbs />
                  <PageHeader>
                    <div className="flex h-[90px] items-start justify-between !bg-white  px-7 pt-8">
                      <div className="flex h-[38px] gap-6">
                        <p className="self-center text-3xl font-bold text-cyan-600">
                          Eligibility Check List
                        </p>

                        <div>
                          <Button
                            cls={'h-[38px] truncate '}
                            buttonType={ButtonType.primary}
                            onClick={() => {
                              setOpenEligibilityCheckModal(true);
                              setEligibilityCheckData({
                                ...eligibilityCheckData,
                                patientInsuranceID: null,
                                insuranceID: null,
                                serviceTypeCodeID: 29,
                                dos: DateToStringPipe(new Date(), 1),
                              });
                              setSelectedPatient(undefined);
                              setPatientSearchData([]);
                            }}
                          >
                            New Eligibility Check
                          </Button>
                        </div>
                      </div>
                      <div className="flex h-[38px]  items-center px-6">
                        <ButtonSelectDropdownForExport
                          data={exportDropdownData}
                          onChange={onSelectExportOption}
                          isSingleSelect={true}
                          cls={'inline-flex'}
                          disabled={false}
                          buttonContent={
                            <button
                              id={''}
                              className={classNames(
                                `bg-white inline-flex items-center justify-center gap-2 border border-solid border-gray-300 bg-white pt-[9px] pb-[9px] pl-[13px] pr-[17px] text-left font-medium leading-5 text-gray-700 transition-all rounded-md`
                              )}
                            >
                              <Icon name={'export'} size={18} />
                              <p className="text-sm">Export</p>
                            </button>
                          }
                        />
                      </div>
                    </div>
                  </PageHeader>
                </div>
              </div>
              <div className={'bg-gray-50 px-[25px] pb-[25px]'}>
                <div className="flex items-center py-[20px] px-[5px]">
                  <div
                    className={`text-left font-bold text-gray-700 inline-flex items-center pr-[29px]`}
                  >
                    <p className={`text-xl m-0 sm:text-xl`}>
                      Search Parameters
                    </p>
                  </div>
                  <div className={`flex items-start`}>
                    <SavedSearchCriteria
                      jsonValue={JSON.stringify(searchCriteria)}
                      onApply={(selectedItem) => {
                        if (selectedItem) {
                          setSearchCriteriaFields(selectedItem);
                          setRenderSearchCriteriaView(uuidv4());
                        }
                      }}
                      addNewButtonActive={true}
                    />
                  </div>
                </div>
                <div className={`px-[5px]`}>
                  <div className={`h-[1px] w-full bg-gray-200`} />
                </div>
                {hideSearchParameters && (
                  <div key={renderSearchCriteriaView} className="pt-[20px]">
                    <div className="w-full">
                      <div className="px-[5px] pb-[5px]">
                        <p className="text-base font-bold leading-normal text-gray-700">
                          Patient Details
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div className={`lg:w-[80%] w-[50%] px-[5px] flex`}>
                          <div className={`w-[25%] pr-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Patient First Name
                              </div>
                              <div className="w-full">
                                <InputField
                                  placeholder="Patient First Name"
                                  value={searchCriteria?.patientFirstName || ''}
                                  onChange={(evt) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      patientFirstName: evt.target.value
                                        ? evt.target.value
                                        : '',
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[25%] pl-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Patient Last Name
                              </div>
                              <div className="w-full">
                                <InputField
                                  placeholder="Patient Last Name"
                                  value={searchCriteria?.patientLastName || ''}
                                  onChange={(evt) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      patientLastName: evt.target.value
                                        ? evt.target.value
                                        : '',
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[25%] pl-[10px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Patient Date of Birth
                              </div>
                              <div className="w-full">
                                <AppDatePicker
                                  cls="!mt-1"
                                  selected={searchCriteria?.patientDateOfBirth}
                                  onChange={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      patientDateOfBirth: DateToStringPipe(
                                        value,
                                        1
                                      ),
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[25%] pl-[10px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Patient ID
                              </div>
                              <div className="w-full">
                                <InputField
                                  placeholder="Patient ID"
                                  value={searchCriteria?.patientID || ''}
                                  onChange={(evt) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      patientID: evt.target.value
                                        ? evt.target.value
                                        : '',
                                    });
                                  }}
                                  type={'number'}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={'py-[15px] px-[5px]'}>
                      <div className={`h-[1px] w-full bg-gray-200`} />
                    </div>
                    <div className="w-full">
                      <div className="px-[5px] pb-[5px]">
                        <p className="text-base font-bold leading-normal text-gray-700">
                          Location
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div className={`lg:w-[80%] w-[50%] px-[5px] flex`}>
                          <div className={`w-[25%] pr-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Group
                              </div>
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="-"
                                  disabled={false}
                                  data={
                                    groupDropdown as SingleSelectDropDownDataType[]
                                  }
                                  // isOptional={true}
                                  // onDeselectValue={() => {
                                  //   setSearchCriteriaFields({
                                  //     ...searchCriteria,
                                  //     groupID: null,
                                  //   });
                                  // }}
                                  selectedValue={
                                    groupDropdown.filter(
                                      (f) => f.id === searchCriteria?.groupID
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      groupID: value.id,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[25%] pl-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Practice
                              </div>
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="-"
                                  disabled={false}
                                  data={practiceDropdown}
                                  selectedValue={
                                    practiceDropdown.filter(
                                      (f) => f.id === searchCriteria?.practiceID
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      practiceID: value.id,
                                    });
                                  }}
                                  isOptional={true}
                                  onDeselectValue={() => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      practiceID: null,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[25%] pl-[10px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Facility
                              </div>
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="-"
                                  disabled={false}
                                  data={
                                    facilitiesData?.length !== 0
                                      ? (facilitiesData as SingleSelectDropDownDataType[])
                                      : [
                                          {
                                            id: 1,
                                            value: 'No Record Found',
                                            active: false,
                                          },
                                        ]
                                  }
                                  selectedValue={
                                    facilitiesData?.filter(
                                      (f) => f.id === searchCriteria?.facilityID
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    onSelectFacility(value);
                                  }}
                                  isOptional={true}
                                  onDeselectValue={() => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      facilityID: null,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={'py-[15px] px-[5px]'}>
                      <div className={`h-[1px] w-full bg-gray-200`} />
                    </div>
                    <div className="w-full">
                      <div className="px-[5px] pb-[5px]">
                        <p className="text-base font-bold leading-normal text-gray-700">
                          Other
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div className={`lg:w-[90%] w-[50%] px-[5px] flex`}>
                          <div className={`w-[25%] pl-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Insurance
                              </div>
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="-"
                                  disabled={false}
                                  data={
                                    insuranceAllData
                                      ? (insuranceAllData as SingleSelectDropDownDataType[])
                                      : []
                                  }
                                  selectedValue={
                                    insuranceAllData.filter(
                                      (m) => m.id === searchCriteria.insuranceID
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      insuranceID: value.id,
                                    });
                                  }}
                                  isOptional={true}
                                  onDeselectValue={() => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      insuranceID: null,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[25%] pl-[10px] pr-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Service Type
                              </div>
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="-"
                                  disabled={false}
                                  data={patientlookupData?.serviceType || []}
                                  selectedValue={
                                    patientlookupData?.serviceType.filter(
                                      (a) =>
                                        a.id === searchCriteria.serviceTypeID
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      serviceTypeID: value.id,
                                    });
                                  }}
                                  isOptional={true}
                                  onDeselectValue={() => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      serviceTypeID: null,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`lg:w-[35%] w-[50%] px-[5px] flex`}>
                            <div className={`w-[50%] pr-[5px]`}>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                  Request Date - From
                                </div>
                                <div className="w-full">
                                  <AppDatePicker
                                    cls="!mt-1"
                                    selected={searchCriteria?.fromRequestDate}
                                    onChange={(value) => {
                                      setSearchCriteriaFields({
                                        ...searchCriteria,
                                        fromRequestDate: DateToStringPipe(
                                          value,
                                          1
                                        ),
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className={`w-[50%] pl-[5px]`}>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                  Request Date - To
                                </div>
                                <div className="w-full">
                                  <AppDatePicker
                                    cls="!mt-1"
                                    selected={searchCriteria?.toRequestDate}
                                    onChange={(value) => {
                                      setSearchCriteriaFields({
                                        ...searchCriteria,
                                        toRequestDate: DateToStringPipe(
                                          value,
                                          1
                                        ),
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className={`lg:w-[35%] w-[50%] px-[5px] flex`}>
                            <div className={`w-[50%] pr-[5px]`}>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                  Date of Service - From
                                </div>
                                <div className="w-full">
                                  <AppDatePicker
                                    cls="!mt-1"
                                    selected={searchCriteria?.fromDOS}
                                    onChange={(value) => {
                                      setSearchCriteriaFields({
                                        ...searchCriteria,
                                        fromDOS: DateToStringPipe(value, 1),
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className={`w-[50%] pl-[5px]`}>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                  Date of Service - To
                                </div>
                                <div className="w-full">
                                  <AppDatePicker
                                    cls="!mt-1"
                                    selected={searchCriteria?.toDOS}
                                    onChange={(value) => {
                                      setSearchCriteriaFields({
                                        ...searchCriteria,
                                        toDOS: DateToStringPipe(value, 1),
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
                )}
              </div>
              <div className="flex h-20 items-start justify-between gap-4 bg-gray-200 px-7 pt-[25px] pb-[15px]">
                <div className="flex w-full items-center justify-between">
                  <div className="flex w-[50%] items-center justify-start">
                    <Button
                      cls={
                        'h-[33px] inline-flex items-center justify-center w-56 py-2 bg-cyan-500 shadow rounded-md'
                      }
                      buttonType={ButtonType.primary}
                      onClick={onClickSearch}
                    >
                      <p className="text-sm font-medium leading-tight text-white">
                        Search
                      </p>
                    </Button>
                  </div>
                  <div className="flex w-[50%] items-end justify-end">
                    <div
                      onClick={() => {
                        setHideSearchParameters(!hideSearchParameters);
                      }}
                      className="flex cursor-pointer items-center px-6"
                    >
                      <Icon
                        className={classNames(
                          'w-5 h-5 rounded-lg',
                          hideSearchParameters === false ? '' : '-rotate-180'
                        )}
                        name={
                          hideSearchParameters === false
                            ? 'chevronDown'
                            : 'chevronDown'
                        }
                        size={16}
                        color={IconColors.GRAY_500}
                      />
                      <p className="pl-[5px] text-sm font-medium uppercase leading-tight tracking-wide text-gray-500">
                        {hideSearchParameters === false ? 'Show' : 'Hide'}{' '}
                        Search Parameters
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex w-full w-full flex-col gap-4 p-5 pt-[20px]">
                <div className="h-full">
                  <SearchDetailGrid
                    pageNumber={lastSearchCriteria.pageNumber}
                    pageSize={lastSearchCriteria.pageSize}
                    pinnedColumns={{
                      right: ['actions'],
                    }}
                    persistLayoutId={5}
                    totalCount={totalCount}
                    rows={searchResult}
                    columns={columns}
                    checkboxSelection={false}
                    onPageChange={(page: number) => {
                      const obj: EligibilityCheckListSearchCriteria = {
                        ...lastSearchCriteria,
                        pageNumber: page,
                      };
                      setLastSearchCriteria(obj);
                      getSearchData(obj);
                    }}
                    onSortChange={(
                      field: string | undefined,
                      sort: 'asc' | 'desc' | null | undefined
                    ) => {
                      if (searchResult.length) {
                        const obj: EligibilityCheckListSearchCriteria = {
                          ...lastSearchCriteria,
                          sortColumn: field || '',
                          sortOrder: sort || '',
                        };
                        setLastSearchCriteria(obj);
                        getSearchData(obj);
                      }
                    }}
                    onPageSizeChange={(pageSize: number, page: number) => {
                      if (searchResult.length) {
                        const obj: EligibilityCheckListSearchCriteria = {
                          ...lastSearchCriteria,
                          pageSize,
                          pageNumber: page,
                        };
                        setLastSearchCriteria(obj);
                        getSearchData(obj);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={openEligibilityCheckModal}
        onClose={() => {
          setOpenEligibilityCheckModal(false);
        }}
        modalContentClassName="rounded-lg bg-gray-100  text-left shadow-xl  h-[464px] w-[960px]"
      >
        <div className="m-5 text-gray-700">
          <SectionHeading label={'Eligibility Check'} />
          <div className="flex items-center justify-end gap-5">
            <CloseButton
              onClick={() => {
                setOpenEligibilityCheckModal(false);
              }}
            />
          </div>
        </div>
        <div className="mt-[36px] bg-gray-100"></div>
        <div className="ml-[27px]">
          <p className="mt-[8px] mb-[4px] w-16  text-base font-bold leading-normal text-gray-700">
            Insurance
          </p>

          <div className="flex w-full gap-4">
            <div className={`gap-1 w-auto `}>
              <label className="text-sm font-medium leading-5 text-gray-700">
                Search Patient
                <span className="text-cyan-500">*</span>
              </label>
              <div
                className={`w-full gap-1 justify-center flex flex-col items-start self-stretch `}
              >
                <div data-testid="addClaimPatient" className="w-[280px]">
                  <SingleSelectDropDown
                    placeholder="Patient Name"
                    forcefullyShowSearchBar={true}
                    data={
                      patientSearchData?.length !== 0
                        ? (patientSearchData as SingleSelectDropDownDataType[])
                        : [
                            {
                              id: 1,
                              value: 'No Record Found',
                              active: false,
                            },
                          ]
                    }
                    selectedValue={selectedPatient}
                    onSelect={(value) => {
                      setSelectedPatient(value);
                    }}
                    onSearch={(value) => {
                      onSearchPatient(value);
                    }}
                  />
                </div>
              </div>
            </div>
            <div className={`gap-1 w-auto `}>
              <label className="text-sm font-medium leading-5 text-gray-700">
                Select Insurance Plan
                <span className="text-cyan-500">*</span>
              </label>
              <div
                className={`w-full gap-1 justify-center flex flex-col items-start self-stretch `}
              >
                <div className="w-[240px] ">
                  <SingleSelectDropDown
                    placeholder="-"
                    showSearchBar={false}
                    data={
                      insuranceDropdownData
                        ? (insuranceDropdownData as SingleSelectDropDownDataType[])
                        : []
                    }
                    selectedValue={
                      insuranceDropdownData.filter(
                        (m) => m.id === eligibilityCheckData.patientInsuranceID
                      )[0]
                    }
                    onSelect={(value) => {
                      setEligibilityCheckData({
                        ...eligibilityCheckData,
                        patientInsuranceID: value.id,
                        insuranceID:
                          insuranceDropdownData
                            .filter((m) => m.id === value.id)
                            .map((m) => m.insuranceID)[0] || null,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className=" ml-[27px]">
          <p className="mt-[32px] mb-[4px] w-16  text-base font-bold leading-normal text-gray-700">
            Service
          </p>
          <div className="flex w-auto gap-2 ">
            <div className={`gap-1 w-auto`}>
              <label className="text-sm font-medium leading-5 text-gray-700">
                Service Type
                <span className="text-cyan-500">*</span>
              </label>
              <div
                className={`w-full gap-1 justify-center flex flex-col items-start self-stretch`}
              >
                <div className="w-[240px] ">
                  <SingleSelectDropDown
                    placeholder="-"
                    showSearchBar={true}
                    disabled={false}
                    data={
                      patientlookupData
                        ? (patientlookupData.serviceType as SingleSelectDropDownDataType[])
                        : []
                    }
                    selectedValue={
                      patientlookupData &&
                      patientlookupData.serviceType.filter(
                        (m) => m.id === eligibilityCheckData.serviceTypeCodeID
                      )[0]
                    }
                    onSelect={(value) => {
                      setEligibilityCheckData({
                        ...eligibilityCheckData,
                        serviceTypeCodeID: value.id,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            <div className={` items-start self-stretch`}>
              <label className="text-sm font-medium leading-loose text-gray-900">
                Service date
                <span className="text-cyan-500">*</span>
              </label>
              <div className=" h-[38px] w-[240px]">
                <AppDatePicker
                  placeholderText="mm/dd/yyyy"
                  cls=""
                  onChange={(date) => {
                    if (date) {
                      setEligibilityCheckData({
                        ...eligibilityCheckData,
                        dos: DateToStringPipe(date, 1),
                      });
                    }
                  }}
                  selected={StringToDatePipe(eligibilityCheckData.dos)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="pt-[77px] ">
          <div className={`h-[86px] bg-gray-200 rounded-lg`}>
            <div className="w-full">
              <div className="h-px w-full bg-gray-300" />
            </div>
            <div className="py-[24px] pr-[27px]">
              <div className={`gap-4 flex justify-end `}>
                <div>
                  <Button
                    buttonType={ButtonType.secondary}
                    cls={` `}
                    onClick={() => {
                      setEligibilityCheckData({
                        patientInsuranceID: null,
                        serviceTypeCodeID: null,
                        insuranceID: null,
                        dos: '',
                      });
                      setOpenEligibilityCheckModal(false);
                    }}
                  >
                    {' '}
                    Cancel
                  </Button>
                </div>
                <div>
                  <Button
                    buttonType={ButtonType.primary}
                    cls={` `}
                    onClick={() => {
                      checkEligibilityForInsurance();
                    }}
                  >
                    {' '}
                    Check Eligibility
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        open={open270Response.open}
        onClose={() => {
          setOpen270Response({
            open: false,
            response: '',
          });
        }}
        modalContentClassName="rounded-lg text-left shadow-xl bg-white h-[464px] w-[960px]"
      >
        <div className="flex h-full flex-col justify-between bg-white">
          <div className="bg-gray-100 ">
            <div className="m-5 text-gray-700  ">
              <SectionHeading label={'270 Viewer'} />
              <div className="flex items-center justify-end gap-5">
                <CloseButton
                  onClick={() => {
                    setOpen270Response({
                      open: false,
                      response: '',
                    });
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex bg-white">
            <div className="w-full self-center break-words px-[160px] text-justify">
              {open270Response.response}
            </div>
          </div>
          <div className=" ">
            <div className={`h-[86px] bg-gray-200 rounded-lg`}>
              <div className="w-full">
                <div className="h-px w-full bg-gray-300" />
              </div>
              <div className="py-[24px] pr-[27px]">
                <div className={`gap-4 flex justify-end `}>
                  <div>
                    <Button
                      buttonType={ButtonType.secondary}
                      cls={` `}
                      onClick={() => {
                        setOpen270Response({
                          open: false,
                          response: '',
                        });
                      }}
                    >
                      {' '}
                      Close
                    </Button>
                  </div>
                  <div>
                    <Button
                      buttonType={ButtonType.primary}
                      cls={` `}
                      onClick={() => {
                        downloadTextFile(open270Response.response);
                      }}
                    >
                      {' '}
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <StatusModal
        open={statusModalInfo.show}
        heading={statusModalInfo.heading}
        description={statusModalInfo.text}
        statusModalType={statusModalInfo.type}
        showCloseButton={false}
        closeOnClickOutside={true}
        onChange={() => {
          setStatusModalInfo({
            ...statusModalInfo,
            show: false,
            heading: '',
            text: '',
          });
        }}
        onClose={() => {
          setStatusModalInfo({
            ...statusModalInfo,
            show: false,
            heading: '',
            text: '',
          });
        }}
      />
      <StatusModal
        open={showWarningModal}
        heading={''}
        description={''}
        okButtonText={''}
        closeButtonText={'Cancel'}
        okButtonColor={ButtonType.tertiary}
        statusModalType={StatusModalType.WARNING}
        showCloseButton={true}
        closeOnClickOutside={false}
        onClose={() => {
          setWarningModal(false);
        }}
        onChange={async () => {}}
      />
    </AppLayout>
  );
};
export default EligibilityCheckList;
