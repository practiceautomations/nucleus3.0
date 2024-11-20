import type { GridColDef, GridRowId } from '@mui/x-data-grid-pro';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import PatientDetailModal from '@/components/PatientDetailModal';
import SavedSearchCriteria from '@/components/PatientSearch/SavedSearchCriteria';
import AppDatePicker from '@/components/UI/AppDatePicker';
import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';
import Button, { ButtonType } from '@/components/UI/Button';
import type { ButtonSelectDropdownDataType } from '@/components/UI/ButtonSelectDropdown';
import ButtonSelectDropdownForExport from '@/components/UI/ButtonSelectDropdownForExport';
import InputField from '@/components/UI/InputField';
import Modal from '@/components/UI/Modal';
import RadioButton from '@/components/UI/RadioButton';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppLayout from '@/layouts/AppLayout';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  addToastNotification,
  fetchGroupDataRequest,
  fetchPracticeDataRequest,
  fetchProviderDataRequest,
} from '@/store/shared/actions';
import {
  fetchAllPatientsSearchData,
  fetchInsuranceData,
} from '@/store/shared/sagas';
import {
  getAllInsuranceDataSelector,
  getGroupDataSelector,
  getPracticeDataSelector,
  getProviderDataSelector,
} from '@/store/shared/selectors';
import {
  type AllInsuranceData,
  type GetAllPatientsSearchDataCriteria,
  type GetAllPatientsSearchDataResult,
  type GroupData,
  type PracticeData,
  type ProviderData,
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
import { DateToStringPipe } from '@/utils/dateConversionPipes';

const PatientSearch = () => {
  const dispatch = useDispatch();
  const providersData = useSelector(getProviderDataSelector);
  const groupData = useSelector(getGroupDataSelector);
  const practiceData = useSelector(getPracticeDataSelector);
  const [isSavedReportErrorModalOpen, setIsSavedReportErrorModalOpen] =
    useState(false);
  const [selectedRenderingProvider, setSelectedRenderingProvider] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const [patientFirstName, setPatientFirstName] = useState<string | null>();
  const [patientLastName, setPatientLastName] = useState<string | null>();
  const [patientSearchID, setPatientSearchID] = useState<number | undefined>();
  const [dateOfBirth, setDateOfBirth] = useState<Date | null | undefined>();
  const [hideSearchParameters, setHideSearchParameters] =
    useState<boolean>(true);
  const [selectedRenderingGroup, setSelectedRenderingGroup] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const [selectedRenderingPractice, setSelectedRenderingPractice] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const insuranceData = useSelector(getAllInsuranceDataSelector);
  const [selectedInsurance, setSelectedInsurance] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const [insuranceAllData, setInsuanceAllData] = useState<AllInsuranceData[]>();
  const [groupDropdown, setGroupDropdown] = useState<GroupData[]>([]);
  const [practiceDropdown, setPracticeDropdown] = useState<
    PracticeData[] | null
  >();
  const [providerDropdown, setProviderDropdown] = useState<
    ProviderData[] | null
  >();
  const [activeCheck, setActive] = useState('Y');

  const [searchResult, setSearchResult] = useState<
    GetAllPatientsSearchDataResult[]
  >([]);
  const [totalCount, setTotalCount] = useState<number>();
  const [addNewSearch, setAddNewSearch] = useState<Boolean>();

  const [detailPanelExpandedRowIds, setDetailPanelExpandedRowIds] = useState<
    GridRowId[]
  >([]);
  const handleDetailPanelExpandedRowIdsChange = useCallback(
    (newIds: GridRowId[]) => {
      setDetailPanelExpandedRowIds(newIds);
    },
    []
  );
  const gridRef = useRef<HTMLTableRowElement>(null);

  const [selectedItemJson, setSelectedItemJson] = useState<string>();
  const [savedSearchProvider, setSavedSearchProvider] = useState<
    number | null
  >();
  const [savedSearchPractice, setSavedSearchPractice] = useState<
    number | null
  >();
  // const [routePath, setRoutePath] = useState<string | undefined>();
  // useEffect(() => {
  //   if (routePath) {
  //     router.push(routePath);
  //   }
  // }, [routePath]);
  useEffect(() => {
    setGroupDropdown(selectedWorkedGroup?.groupsData || []);
    if (selectedWorkedGroup && selectedWorkedGroup?.workGroupId) {
      setPracticeDropdown(selectedWorkedGroup.practicesData);
      setProviderDropdown(selectedWorkedGroup.providersData);
      setSelectedRenderingGroup(undefined);
      setSelectedRenderingPractice(undefined);
      setSelectedRenderingProvider(undefined);
      const groupIds = selectedWorkedGroup.groupsData.map((m) => m.id);
      setInsuanceAllData(
        insuranceData.filter((m) => groupIds.includes(m.groupID))
      );
    }
    if (
      selectedWorkedGroup &&
      selectedWorkedGroup?.groupsData.length !== null
    ) {
      setPracticeDropdown(practiceData);
      setProviderDropdown(providersData);
      const group = selectedWorkedGroup?.groupsData[0];
      const practice = selectedWorkedGroup?.practicesData[0];
      const provider = selectedWorkedGroup?.providersData[0];
      setSelectedRenderingGroup(group);
      setSelectedRenderingPractice(practice);
      setSelectedRenderingProvider(provider);
      if (group) {
        dispatch(fetchPracticeDataRequest({ groupID: group?.id }));
        dispatch(fetchProviderDataRequest({ groupID: group?.id }));
        setInsuanceAllData(
          insuranceData.filter((m) => m.groupID === group?.id)
        );
      }
    }
  }, [selectedWorkedGroup]);

  useEffect(() => {
    if (selectedRenderingGroup?.id)
      setInsuanceAllData([
        ...insuranceData.filter(
          (m) => m.groupID === selectedRenderingGroup?.id
        ),
      ]);
  }, [selectedRenderingGroup?.id, insuranceData]);

  const getAllPatientsSearchData = async (
    criterea: GetAllPatientsSearchDataCriteria
  ) => {
    const obj: GetAllPatientsSearchDataCriteria = {
      ...criterea,
    };
    const res = await fetchAllPatientsSearchData(obj);
    if (res) {
      setTotalCount(res[0]?.totalCount || 0);
      setSearchResult(res);
    }
  };
  const [patientDetailsModal, setPatientDetailsModal] = useState<{
    open: boolean;
    id: number | null;
  }>({
    open: false,
    id: null,
  });
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Patient ID',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            onClick={() => {
              // setRoutePath(`/app/register-patient/${params.row.id}`);
              setPatientDetailsModal({
                open: true,
                id: params.row.id || null,
              });
            }}
            data-testid="PatientSearchPatientID"
          >
            {`#${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'lastName',
      headerName: 'Last Name',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            onClick={() => {
              // setRoutePath(`/app/register-patient/${params.row.id}`);
              setPatientDetailsModal({
                open: true,
                id: params.row.id || null,
              });
            }}
          >
            {`${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'firstName',
      headerName: 'First Name',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            onClick={() => {
              // setRoutePath(`/app/register-patient/${params.row.id}`);
              setPatientDetailsModal({
                open: true,
                id: params.row.id || null,
              });
            }}
          >
            {`${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'gender',
      headerName: 'Gender',
      minWidth: 120,
      disableReorder: true,
    },
    {
      field: 'dob',
      flex: 1,
      minWidth: 150,
      headerName: 'DOB',
      disableReorder: true,
      renderCell: (params) => {
        return <div data-testid="dob">{DateToStringPipe(params.value, 2)}</div>;
      },
    },
    {
      field: 'groupName',
      flex: 1,
      minWidth: 160,
      headerName: 'Group',
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              data-testid="org"
              className="cursor-pointer text-cyan-500"
              onClick={() => {}}
            >
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {`EIN: ${params.row.groupEIN}`}
            </div>
          </div>
        );
      },
    },
    {
      field: 'practiceName',
      headerName: 'Practice',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              data-testid="practice"
              className="cursor-pointer text-cyan-500"
              onClick={() => {}}
            >
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.practiceAddress}
            </div>
          </div>
        );
      },
    },
    {
      field: 'primaryInsurance',
      headerName: 'Primary Insurance',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div data-testid="ins" className="cursor-pointer text-cyan-500">
            {`${params.value || ''}`}
          </div>
        );
      },
    },
    {
      field: 'address',
      headerName: 'Address',
      flex: 1,
      minWidth: 300,
      disableReorder: true,
    },
    {
      field: 'createdOn',
      headerName: 'Created On',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      renderCell: (params) => {
        return <div>{DateToStringPipe(params.value, 2)}</div>;
      },
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.createdByRole}
            </div>
          </div>
        );
      },
    },
    {
      field: 'active',
      headerName: 'Active',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
  ];

  const [searchDataCriteria, setSearchDataCriteria] =
    useState<GetAllPatientsSearchDataCriteria>({
      groupID: undefined,
      practiceID: undefined,
      facilityID: undefined,
      providerID: undefined,
      patientID: undefined,
      insuranceID: undefined,
      firstName: '',
      lastName: '',
      dob: undefined,
      active: null,
      pageNumber: 1,
      pageSize: globalPaginationConfig.activePageSize,
      sortColumn: '',
      sortOrder: '',
      getAllData: false,
      exportData: false,
    });

  // Search bar
  const onClickSearch = () => {
    const insuranceID = selectedInsurance ? selectedInsurance?.id : undefined;
    const groupID = selectedRenderingGroup
      ? selectedRenderingGroup?.id
      : undefined;
    const providerID = selectedRenderingProvider
      ? selectedRenderingProvider?.id
      : undefined;
    const practiceID = selectedRenderingPractice
      ? selectedRenderingPractice?.id
      : undefined;
    const firstName = patientFirstName || '';
    const lastName = patientLastName || '';
    const patientID = patientSearchID;
    const dob = dateOfBirth || undefined;
    let active = null;
    if (activeCheck === 'N') {
      active = false;
    }
    if (activeCheck === 'Y') {
      active = true;
    }
    if (activeCheck === 'B') {
      active = null;
    }

    const obj = {
      ...searchDataCriteria,
      insuranceID,
      groupID,
      providerID,
      practiceID,
      firstName,
      lastName,
      patientID,
      dob,
      active,
    };
    setSearchDataCriteria(obj);
    getAllPatientsSearchData(obj);
  };

  useEffect(() => {
    onClickSearch();
  }, []);

  useEffect(() => {
    dispatch(fetchGroupDataRequest());
    fetchInsuranceData();
  }, []);

  const setProvider = () => {
    if (selectedItemJson) {
      const provider: SingleSelectDropDownDataType[] = providersData?.filter(
        (m) => m.id === savedSearchProvider
      )
        ? providersData?.filter((m) => m.id === savedSearchProvider)
        : [];
      if (provider) {
        dispatch(fetchGroupDataRequest());
        setSelectedRenderingProvider(provider[0]);
      }
    }
  };
  const setPractice = () => {
    if (selectedItemJson) {
      const practice: SingleSelectDropDownDataType[] = practiceData?.filter(
        (m) => m.id === savedSearchPractice
      )
        ? practiceData?.filter((m) => m.id === savedSearchPractice)
        : [];
      if (practice) {
        setSelectedRenderingPractice(practice[0]);
      }
    }
  };
  useEffect(() => {
    if (practiceData) {
      setPracticeDropdown(practiceData);
    }
    if (savedSearchProvider) {
      // setProvider();
      setPractice();
    }
  }, [practiceData]);

  useEffect(() => {
    if (providersData) {
      setProviderDropdown(providersData);
    }
    if (savedSearchProvider) {
      setProvider();
    }
  }, [providersData]);

  useEffect(() => {
    if (
      selectedRenderingGroup &&
      selectedRenderingGroup.id !== selectedWorkedGroup?.groupsData[0]?.id
    ) {
      dispatch(
        fetchPracticeDataRequest({ groupID: selectedRenderingGroup?.id })
      );
      dispatch(
        fetchProviderDataRequest({ groupID: selectedRenderingGroup?.id })
      );
      setSelectedRenderingPractice(undefined);
      setSelectedRenderingProvider(undefined);
      setSelectedInsurance(undefined);
    }

    setInsuanceAllData(
      insuranceData.filter((m) => m.groupID === selectedRenderingGroup?.id)
    );
  }, [selectedRenderingGroup]);

  useEffect(() => {
    setAddNewSearch(true);
  }, [activeCheck]);

  useEffect(() => {
    if (
      (patientFirstName !== undefined && patientFirstName !== '') ||
      (patientLastName !== undefined && patientLastName !== '') ||
      dateOfBirth !== undefined ||
      selectedRenderingProvider !== undefined ||
      selectedRenderingPractice !== undefined ||
      selectedRenderingGroup !== undefined ||
      selectedInsurance !== undefined
    ) {
      setAddNewSearch(true);
    } else {
      setAddNewSearch(false);
    }
  }, [
    patientFirstName,
    patientLastName,
    dateOfBirth,
    selectedInsurance,
    selectedRenderingProvider,
    selectedRenderingPractice,
    selectedRenderingGroup,
  ]);

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
  const [statusModalInfo, setStatusModalInfo] = useState({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
    showCloseBUtton: StatusModalType.WARNING,
  });
  const downloadPdf = (pdfExportData: GetAllPatientsSearchDataResult[]) => {
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

    if (searchDataCriteria.patientID) {
      criteriaArray.push({
        Criteria: 'Patient ID',
        Value: searchDataCriteria?.patientID?.toString() || '',
      });
    }

    if (searchDataCriteria.firstName) {
      criteriaArray.push({
        Criteria: 'First Name',
        Value: searchDataCriteria?.firstName || '',
      });
    }

    if (searchDataCriteria.lastName) {
      criteriaArray.push({
        Criteria: 'Last Name',
        Value: searchDataCriteria?.lastName || '',
      });
    }

    if (searchDataCriteria.dob) {
      criteriaArray.push({
        Criteria: 'DOB',
        Value: DateToStringPipe(searchDataCriteria.dob, 1),
      });
    }
    if (searchDataCriteria.groupID) {
      const groupName = groupDropdown.filter(
        (m) => m.id === searchDataCriteria.groupID
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Group', Value: groupName || '' });
    }

    if (searchDataCriteria.practiceID) {
      const pName = practiceData?.filter(
        (m) => m.id === searchDataCriteria.practiceID
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Practice', Value: pName || '' });
    }
    if (searchDataCriteria.providerID && providerDropdown) {
      const Provider = providerDropdown.filter(
        (m) => m.id === Number(searchDataCriteria.providerID)
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Provider', Value: Provider || '' });
    }

    if (searchDataCriteria.insuranceID) {
      const insurance = insuranceAllData?.filter(
        (m) => m.id === Number(searchDataCriteria.insuranceID)
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Insurance', Value: insurance || '' });
    }

    if (searchDataCriteria.active !== undefined) {
      let activeStatus;
      if (searchDataCriteria.active === null) {
        activeStatus = 'Both';
      } else if (searchDataCriteria.active) {
        activeStatus = 'Yes';
      } else {
        activeStatus = 'No';
      }
      criteriaArray.push({ Criteria: 'Active', Value: activeStatus });
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
        'Patient ID': n.id,
        'Last Name': n.lastName,
        'First Name': n.firstName,
        Gender: n.gender,
        DOB: DateToStringPipe(n.dob, 2),
        Group: n.groupName,
        'Group EIN': n.groupEIN,
        Practice: n.practiceName,
        'Practice Address': n.practiceAddress,
        'Primary Insurance': n.primaryInsurance,
        Address: n.address,
        'Created On': DateToStringPipe(n.createdOn, 2),
        'Created By': n.createdBy,
        Active: n.active,
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
    ExportDataToPDF(data, 'Patient Search', undefined, {
      'Patient ID': { cellWidth: 13 },
      'Last Name': { cellWidth: 15 },
      'First Name': { cellWidth: 15 },
      Gender: { cellWidth: 16 },
      DOB: { cellWidth: 14 },
      Group: { cellWidth: 20 },
      'Group EIN': { cellWidth: 17 },
      Practice: { cellWidth: 17 },
      'Practice Address': { cellWidth: 25 },
      'Primary Insurance': { cellWidth: 25 },
      Address: { cellWidth: 25 },
    });
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
    const obj: GetAllPatientsSearchDataCriteria = {
      groupID: searchDataCriteria.groupID,
      practiceID: searchDataCriteria.practiceID,
      facilityID: searchDataCriteria.facilityID,
      providerID: searchDataCriteria.providerID,
      patientID: searchDataCriteria.patientID,
      insuranceID: searchDataCriteria.insuranceID,
      firstName: searchDataCriteria.firstName,
      lastName: searchDataCriteria.lastName,
      dob: searchDataCriteria.dob,
      active: searchDataCriteria.active,
      pageNumber: 0,
      pageSize: 10,
      sortColumn: '',
      sortOrder: '',
      getAllData: true,
      exportData: true,
    };
    const res = await fetchAllPatientsSearchData(obj);
    if (res) {
      if (type === 'pdf') {
        downloadPdf(res);
      } else {
        const exportDataArray = res.map((n) => {
          return {
            'Patient ID': n.id.toString(),
            'Last Name': n.lastName,
            'First Name': n.firstName,
            Gender: n.gender,
            DOB: DateToStringPipe(n.dob, 2),
            Group: n.groupName,
            'Group EIN': n.groupEIN,
            Practice: n.practiceName,
            'Practice Address': n.practiceAddress,
            'Primary Insurance': n.primaryInsurance,
            Address: n.address,
            'Created On': DateToStringPipe(n.createdOn, 2),
            'Created By': n.createdBy,
            // 'Created By Role': n.createdByRole,
            Active: n.active,
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
          if (searchDataCriteria?.firstName) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Patient First Name',
              'Last Name': searchDataCriteria?.firstName?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchDataCriteria?.lastName) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Patient Last Name',
              'Last Name': searchDataCriteria?.lastName?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchDataCriteria.dob) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Date of Birth',
              'Last Name': DateToStringPipe(searchDataCriteria.dob, 2),
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchDataCriteria?.patientID) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Patient ID',
              'Last Name': searchDataCriteria?.patientID?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchDataCriteria.groupID) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Group',
              'Last Name':
                groupDropdown.filter(
                  (m) => m.id === Number(searchDataCriteria.groupID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }

          if (searchDataCriteria.practiceID && practiceDropdown) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Practice',
              'Last Name':
                practiceDropdown.filter(
                  (m) => m.id === Number(searchDataCriteria.practiceID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }

          if (searchDataCriteria.providerID && providerDropdown) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Provider',
              'Last Name':
                providerDropdown.filter(
                  (m) => m.id === Number(searchDataCriteria.providerID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }

          if (searchDataCriteria?.active !== undefined) {
            let activeStatus = '';
            if (searchDataCriteria.active === true) {
              activeStatus = 'Yes';
            } else if (searchDataCriteria.active === false) {
              activeStatus = 'No';
            } else {
              activeStatus = 'Both';
            }

            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Active',
              'Last Name': activeStatus,
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }

          if (searchDataCriteria.insuranceID) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Insurance',
              'Last Name':
                insuranceAllData?.filter(
                  (m) => m.id === Number(searchDataCriteria.insuranceID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));

          criteriaObj = {
            ...criteriaObj,
            'Patient ID': 'Patient Details',
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
            ExportDataToCSV(exportArray, 'Patient Search');
            dispatch(
              addToastNotification({
                text: 'Export Successful',
                toastType: ToastType.SUCCESS,
                id: '',
              })
            );
          } else {
            ExportDataToDrive(exportArray, 'Patient Search', dispatch);
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
    <AppLayout title="Nucleus - Patient Search">
      <div className="relative m-0 h-full bg-gray-100 p-0">
        <div className="m-0 h-full w-full overflow-y-scroll bg-gray-100 p-0">
          <div className="flex w-full flex-col">
            <div className="m-0 h-full w-full overflow-y-auto overflow-x-hidden bg-gray-100 p-0">
              <div className="h-[123px] w-full">
                <div className="absolute top-0 z-[11] w-full">
                  <Breadcrumbs />
                  <PageHeader>
                    <div className="flex items-start justify-between gap-4  px-7 pt-[33px] pb-[21px]">
                      <div className="flex h-[38px] gap-6">
                        <p className="self-center text-3xl font-bold text-cyan-700">
                          Patient Search & Registration
                        </p>
                        <div>
                          <Button
                            cls={'h-[38px] truncate '}
                            buttonType={ButtonType.primary}
                            onClick={() => {
                              // setRoutePath('/app/register-patient');
                              setPatientDetailsModal({
                                open: true,
                                id: null,
                              });
                            }}
                          >
                            Register New Patient
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
                              id={''}
                              className={classNames(
                                `bg-white inline-flex items-center justify-center gap-2 border border-solid border-gray-300 pt-[9px] pb-[9px] pl-[13px] pr-[17px] text-left font-medium leading-5 text-gray-700 transition-all rounded-md`
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
              <div className="h-[100px] pt-[24px] pl-[25px] pr-[29px]">
                <div className="relative cursor-pointer  text-left font-bold text-gray-700">
                  <div
                    className={`absolute top-[6px] left-0 top-0 gap-1 inline-flex items-center `}
                  >
                    <p className={`text-xl m-0 sm:text-xl`}>
                      Search Parameters
                    </p>
                  </div>
                  <div
                    className={`h-5 absolute left-0 top-8 top-[43px] w-full`}
                  >
                    <div
                      className={`inset-x-0 h-px absolute bg-gray-300 top-[calc(50%_-_0.5px_+_0.5px)]`}
                    ></div>
                  </div>
                </div>
                <div
                  className={`relative inline-flex items-start left-[200px]`}
                >
                  <div className="inline-flex items-start justify-start gap-5 space-x-3">
                    <SavedSearchCriteria
                      data-testid="test"
                      jsonValue={{
                        insuranceID: selectedInsurance?.id,
                        groupID: selectedRenderingGroup?.id,
                        providerID: selectedRenderingProvider?.id,
                        practiceID: selectedRenderingPractice?.id,
                        firstName: patientFirstName,
                        lastName: patientLastName,
                        patientID: patientSearchID,
                        dob: dateOfBirth,
                        active: activeCheck === 'Y',
                      }}
                      onApply={(selectedItem) => {
                        if (selectedItem) {
                          setSelectedItemJson(JSON.stringify(selectedItem));
                          const selectedObj: GetAllPatientsSearchDataCriteria =
                            selectedItem;
                          const insuranceID = selectedObj?.insuranceID;
                          const groupID = selectedObj?.groupID;
                          const providerID = selectedObj?.providerID;
                          const practiceID = selectedObj?.practiceID;
                          const patientID = selectedObj?.patientID;
                          const firstName = selectedObj?.firstName;
                          const lastName = selectedObj?.lastName;
                          const dob: Date | undefined = selectedObj?.dob;
                          const active = selectedObj?.active;
                          const insurance: SingleSelectDropDownDataType[] =
                            insuranceData?.filter((m) => m.id === insuranceID)
                              ? insuranceData?.filter(
                                  (m) => m.id === insuranceID
                                )
                              : [];
                          if (insurance) {
                            setSelectedInsurance(insurance[0]);
                          }
                          const group: SingleSelectDropDownDataType[] =
                            groupData?.filter((m) => m.id === groupID)
                              ? groupData?.filter((m) => m.id === groupID)
                              : [];
                          if (group) {
                            const res = dispatch(fetchGroupDataRequest());
                            if (res) setSelectedRenderingGroup(group[0]);
                          }
                          setSavedSearchProvider(providerID);
                          setSavedSearchPractice(practiceID);

                          setPatientFirstName(selectedObj.firstName);
                          setPatientLastName(selectedObj.lastName);
                          setPatientSearchID(selectedObj?.patientID);

                          if (selectedObj.dob) {
                            const datee = new Date(selectedObj?.dob);
                            setDateOfBirth(datee);
                          }

                          if (selectedObj.active === true) {
                            setActive('Y');
                          }
                          if (selectedObj.active === false) {
                            setActive('N');
                          }
                          if (selectedObj.active === null) {
                            setActive('B');
                          }
                          const obj1 = {
                            ...searchDataCriteria,
                            insuranceID,
                            groupID,
                            providerID,
                            practiceID,
                            firstName,
                            lastName,
                            patientID,
                            dob,
                            active,
                          };
                          getAllPatientsSearchData(obj1);
                        }
                      }}
                      addNewButtonActive={addNewSearch}
                    />
                  </div>
                </div>
              </div>
              <div
                className={
                  hideSearchParameters === true
                    ? ' pl-[25px] pr-[29px] h-[467px]'
                    : ''
                }
              >
                {hideSearchParameters && (
                  <div>
                    <div className="relative inline-flex h-[94px] w-[1230px] flex-col items-start justify-start space-y-2">
                      <div
                        className={`top-[6px] left-0 top-0 gap-1 inline-flex items-center `}
                      >
                        <p className="text-base font-bold leading-normal text-gray-700">
                          Patient Details
                        </p>
                      </div>
                      <div className="flex gap-4 ">
                        <div className={`relative w-[280px] h-[62px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <label className="text-sm font-medium leading-tight text-gray-700">
                              Patient First Name
                            </label>
                            <div data-testid="patientFn" className="w-[280px]">
                              <InputField
                                data-testid="pfn"
                                value={patientFirstName || ''}
                                onChange={(evt) => {
                                  setPatientFirstName(evt.target.value);
                                }}
                                placeholder="Patient First Name"
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`relative w-[280px] h-[62px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <label className="text-sm font-medium leading-tight text-gray-700">
                              Patient Last Name
                            </label>
                            <div className="w-[280px]">
                              <InputField
                                data-testid="pln"
                                value={patientLastName || ''}
                                onChange={(evt) => {
                                  setPatientLastName(evt.target.value);
                                }}
                                placeholder="Patient Last Name"
                              />
                            </div>
                          </div>
                        </div>
                        <div
                          className={`relative w-[280px] h-[62px] top-[4px]`}
                        >
                          <label className="text-sm font-medium leading-tight text-gray-700">
                            Patient Date of Birth
                          </label>
                          <div>
                            <AppDatePicker
                              placeholderText="mm/dd/yyyy"
                              cls=""
                              onChange={(date) => setDateOfBirth(date)}
                              selected={dateOfBirth}
                            />
                          </div>
                        </div>
                        <div
                          className={`relative w-[280px] h-[62px] top-[4px]`}
                        >
                          <label className="text-sm font-medium leading-tight text-gray-700">
                            Active
                          </label>
                          <div className="mt-2">
                            <RadioButton
                              data={[
                                { value: 'Y', label: 'Yes' },
                                { value: 'N', label: 'No' },
                                { value: 'B', label: 'Both' },
                              ]}
                              checkedValue={activeCheck}
                              onChange={(e) => {
                                setActive(e.target.value);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`relative w-[280px] h-[62px] pt-3`}>
                      <div className={`w-full items-start self-stretch`}>
                        <label className="text-sm font-medium leading-tight text-gray-700">
                          Patient ID
                        </label>
                        <div data-testid="patientFn" className="w-[280px]">
                          <InputField
                            placeholder="Patient ID"
                            value={patientSearchID}
                            onChange={(evt) => {
                              setPatientSearchID(
                                evt.target.value
                                  ? Number(evt.target.value)
                                  : undefined
                              );
                            }}
                            type={'number'}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={`h-5 absolute left-0 relative top-[38px] w-full inset-x-0 h-px absolute bg-gray-200 `}
                    ></div>
                    <div className="relative top-[52px] inline-flex h-[94px] w-[1230px] flex-col items-start justify-start space-y-2">
                      <div
                        className={`top-[6px] left-0 top-0 gap-1 inline-flex items-center`}
                      >
                        <p className="text-base font-bold leading-normal text-gray-700">
                          Location
                        </p>
                      </div>
                      <div className="flex gap-4 ">
                        <div className={`relative w-[280px] h-[66px]`}>
                          <div
                            className={`w-[372.77px] items-start self-stretch`}
                          >
                            <label className="text-sm font-medium leading-5 text-gray-900">
                              Group
                            </label>
                            <div className="w-[280px]">
                              <SingleSelectDropDown
                                placeholder="Search group"
                                showSearchBar={true}
                                disabled={false}
                                data={
                                  groupDropdown as SingleSelectDropDownDataType[]
                                }
                                selectedValue={selectedRenderingGroup}
                                onSelect={(value) => {
                                  // setSelectedGroupId(value.id)
                                  setSelectedRenderingGroup(value);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`relative w-[280px] h-[66px]`}>
                          <div
                            className={`w-[372.77px] items-start self-stretch`}
                          >
                            <label className="text-sm font-medium leading-5 text-gray-900">
                              Practice
                            </label>
                            <div className="w-[280px]">
                              <SingleSelectDropDown
                                data-testid="prc1"
                                placeholder="Search practice"
                                showSearchBar={true}
                                disabled={false}
                                data={
                                  practiceDropdown
                                    ? (practiceDropdown as SingleSelectDropDownDataType[])
                                    : []
                                }
                                selectedValue={selectedRenderingPractice}
                                onSelect={(value) => {
                                  setSelectedRenderingPractice(value);
                                }}
                                isOptional={true}
                                onDeselectValue={() => {
                                  setSelectedRenderingPractice(undefined);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`relative w-[280px] h-[66px]`}>
                          <div
                            className={`w-[372.77px] items-start self-stretch`}
                          >
                            <label className="text-sm font-medium leading-5 text-gray-900">
                              Provider
                            </label>
                            <div className="w-[280px]">
                              <SingleSelectDropDown
                                placeholder="Search provider"
                                showSearchBar={true}
                                disabled={false}
                                data={
                                  providerDropdown
                                    ? (providerDropdown as SingleSelectDropDownDataType[])
                                    : []
                                }
                                selectedValue={selectedRenderingProvider}
                                onSelect={(value) => {
                                  setSelectedRenderingProvider(value);
                                }}
                                isOptional={true}
                                onDeselectValue={() => {
                                  setSelectedRenderingProvider(undefined);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`h-5 absolute left-0 relative top-[78px] w-full inset-x-0 h-px absolute bg-gray-200 top-[calc(50%_-_0.5px_+_0.5px)]`}
                    ></div>
                    <div className="relative top-[95px] inline-flex h-[94px] w-[1230px] flex-col items-start justify-start space-y-2">
                      <div
                        className={`top-[6px] left-0 top-0 gap-1 inline-flex items-center`}
                      >
                        <p className="text-base font-bold leading-normal text-gray-700">
                          Others
                        </p>
                      </div>
                      <div className="flex gap-4 ">
                        <div className={`relative w-[280px] h-[66px]`}>
                          <div
                            className={`w-[372.77px] items-start self-stretch`}
                          >
                            <label className="text-sm font-medium leading-5 text-gray-900">
                              Insurance
                            </label>
                            <div className="w-[280px]">
                              <SingleSelectDropDown
                                placeholder="-"
                                showSearchBar={true}
                                disabled={false}
                                data={
                                  insuranceAllData
                                    ? (insuranceAllData as SingleSelectDropDownDataType[])
                                    : []
                                }
                                selectedValue={selectedInsurance}
                                onSelect={(value) => {
                                  setSelectedInsurance(value);
                                }}
                                isOptional={true}
                                onDeselectValue={() => {
                                  setSelectedInsurance(undefined);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex h-20 items-start justify-between gap-4 bg-gray-200 px-7 pt-[25px] pb-[15px]">
                <div className="flex w-full items-center justify-between  space-x-96">
                  <div className="inline-flex items-center justify-end space-x-2">
                    <Button
                      cls={
                        'h-[33px] inline-flex items-center justify-center w-56 py-2 bg-cyan-500 shadow rounded-md'
                      }
                      buttonType={ButtonType.primary}
                      onClick={onClickSearch}
                    >
                      <p
                        data-testid="patsearch"
                        className="text-sm font-medium leading-tight text-white"
                      >
                        Search
                      </p>
                    </Button>
                  </div>
                  <div
                    onClick={() => {
                      setHideSearchParameters(!hideSearchParameters);
                    }}
                    className="flex h-5/6 w-72 cursor-pointer items-center justify-start space-x-2 bg-gray-200 px-6"
                  >
                    <Icon
                      className={
                        hideSearchParameters === false
                          ? 'w-5 h-4 rounded-lg'
                          : 'w-5 h-4 rounded-lg -rotate-180'
                      }
                      name={
                        hideSearchParameters === false
                          ? 'chevronDown'
                          : 'chevronDown'
                      }
                      size={16}
                      color={IconColors.GRAY_500}
                    />
                    <p className="text-sm font-medium uppercase leading-tight tracking-wide text-gray-500">
                      {hideSearchParameters === false
                        ? 'Show Search Parameters'
                        : 'Hide Search Parameters'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full gap-4 bg-white px-7 pt-[25px] pb-[15px]">
                <div className="flex w-full flex-col">
                  <div ref={gridRef} className="h-full">
                    <SearchDetailGrid
                      pageNumber={searchDataCriteria.pageNumber}
                      pageSize={searchDataCriteria.pageSize}
                      totalCount={totalCount}
                      rows={searchResult}
                      columns={columns}
                      checkboxSelection={false}
                      onDetailPanelExpandedRowIdsChange={
                        handleDetailPanelExpandedRowIdsChange
                      }
                      persistLayoutId={4}
                      detailPanelExpandedRowIds={detailPanelExpandedRowIds}
                      // expandedRowContent={expandedRowContent}
                      // selectRows={selectRows}
                      // onSelectRow={(ids: number[]) => {
                      //   setSelectRows(ids);
                      // }}
                      onPageChange={(page: number) => {
                        const obj = { ...searchDataCriteria, pageNumber: page };
                        setSearchDataCriteria(obj);
                        getAllPatientsSearchData(obj);
                      }}
                      onSortChange={(
                        field: string | undefined,
                        sort: 'asc' | 'desc' | null | undefined
                      ) => {
                        const obj = {
                          ...searchDataCriteria,
                          sortColumn: field || '',
                          sortOrder: sort || '',
                        };
                        setSearchDataCriteria(obj);
                        getAllPatientsSearchData(obj);
                      }}
                      onPageSizeChange={(pageSize: number, page: number) => {
                        const obj = {
                          ...searchDataCriteria,
                          pageSize,
                          pageNumber: page,
                        };
                        setSearchDataCriteria(obj);
                        getAllPatientsSearchData(obj);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <>
        <StatusModal
          open={isSavedReportErrorModalOpen}
          statusModalType={StatusModalType.ERROR}
          showCloseButton={false}
          heading="Error"
          closeOnClickOutside={false}
          description="A system error prevented the Saved Search to be created. Please try again."
          onChange={() => setIsSavedReportErrorModalOpen(false)}
        />
      </>
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
            onClickSearch();
          }}
        />
      </Modal>
    </AppLayout>
  );
};

export default PatientSearch;
