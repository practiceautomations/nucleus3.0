import type { GridColDef, GridColTypeDef } from '@mui/x-data-grid-pro';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import SavedSearchCriteria from '@/components/PatientSearch/SavedSearchCriteria';
import AppDatePicker from '@/components/UI/AppDatePicker';
import Badge from '@/components/UI/Badge';
import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';
import Button, { ButtonType } from '@/components/UI/Button';
import type { ButtonSelectDropdownDataType } from '@/components/UI/ButtonSelectDropdown';
import ButtonSelectDropdownForExport from '@/components/UI/ButtonSelectDropdownForExport';
import { ViewChargeDetails } from '@/components/UI/ChargeDetail/view-charge-detail';
import InputField from '@/components/UI/InputField';
import Modal from '@/components/UI/Modal';
import type { MultiSelectGridDropdownDataType } from '@/components/UI/MultiSelectGridDropdown';
import RadioButton from '@/components/UI/RadioButton';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import SectionHeading from '@/components/UI/SectionHeading';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppTable, { AppTableCell, AppTableRow } from '@/components/UI/Table';
import AppLayout from '@/layouts/AppLayout';
import type { IcdData } from '@/screen/createClaim';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  addToastNotification,
  fetchAssignClaimToDataRequest,
  fetchFacilityDataRequest,
  fetchPracticeDataRequest,
  fetchProviderDataRequest,
  fetchReferringProviderDataRequest,
  getLookupDropdownsRequest,
  setGlobalModal,
} from '@/store/shared/actions';
import {
  fetchChargeDetailReportSearchData,
  fetchInsuranceData,
  getClaimDetailSummaryById,
} from '@/store/shared/sagas';
import {
  getAllInsuranceDataSelector,
  getFacilityDataSelector,
  getPracticeDataSelector,
  getProviderDataSelector,
  getReferringProviderDataSelector,
} from '@/store/shared/selectors';
import type {
  AllInsuranceData,
  ChargeDetailReportsSummary,
  FacilityData,
  GetChargeDetailReportCriteria,
  GetChargeDetailReportResult,
  GroupData,
  PracticeData,
  ProviderData,
  ReferringProviderData,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import type {
  DownloadDataPDFDataType,
  PDFColumnInput,
  PDFRowInput,
} from '@/utils';
import { ExportDataToCSV, ExportDataToDrive, ExportDataToPDF } from '@/utils';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

const ChargeDetailReport = () => {
  const dispatch = useDispatch();
  const insuranceData = useSelector(getAllInsuranceDataSelector);
  const practiceData = useSelector(getPracticeDataSelector);
  const providersData = useSelector(getProviderDataSelector);
  const facilityData = useSelector(getFacilityDataSelector);
  const referringProviderDataSet = useSelector(
    getReferringProviderDataSelector
  );
  const [practiceDropdown, setPracticeDropdown] = useState<PracticeData[]>([]);
  const [providerDropdown, setProviderDropdown] = useState<ProviderData[]>([]);
  const [facilityDropdown, setFacilityDropdown] = useState<FacilityData[]>([]);
  const [insuranceAllData, setInsuanceAllData] = useState<AllInsuranceData[]>(
    []
  );
  const [referringProviderData, setReferringProviderData] = useState<
    ReferringProviderData[] | null
  >();

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  const usdPrice: GridColTypeDef = {
    type: 'number',
    width: 130,
    align: 'left',
    valueFormatter: ({ value }) => currencyFormatter.format(value),
    cellClassName: 'font-tabular-nums',
  };

  const [hideSearchParameters, setHideSearchParameters] =
    useState<boolean>(true);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const [groupDropdown, setGroupDropdown] = useState<GroupData[]>([]);
  const [isChangedJson, setIsChangedJson] = useState(false);
  const [statusModalInfo, setStatusModalInfo] = useState({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
  });
  const defaultSearchCriteria: GetChargeDetailReportCriteria = {
    groupID: undefined,
    practiceID: undefined,
    providerID: undefined,
    facilityID: undefined,
    claimID: '',
    cpt: '',
    chargeID: '',
    referringProvider: '',
    fromDOS: '',
    toDOS: '',
    patientFirstName: '',
    patientLastName: '',
    patientID: undefined,
    insuranceID: undefined,
    responsibility: undefined,
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    sortByColumn: '',
    sortOrder: '',
    getAllData: undefined,
    getOnlyIDS: undefined,
  };
  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const [renderSearchCriteriaView, setRenderSearchCriteriaView] = useState(
    uuidv4()
  );
  const [searchResult, setSearchResult] = useState<
    GetChargeDetailReportResult[]
  >([]);

  const setSearchCriteriaFields = (value: GetChargeDetailReportCriteria) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };
  const [summaryResult, setSummaryResult] = useState<
    ChargeDetailReportsSummary[]
  >([]);
  const getSearchData = async (obj: GetChargeDetailReportCriteria) => {
    const res = await fetchChargeDetailReportSearchData(obj);
    if (res) {
      setSearchResult(res.chargeDetailReportsData);
      setSummaryResult(res.summary);
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

  // Search bar
  const onClickSearch = async () => {
    if (!isChangedJson) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Alert',
        text: 'Please fill in at least one search parameter to perform a query.\nReview your input and try again.',
      });
      return;
    }
    const obj = {
      ...searchCriteria,
      sortColumn: '',
      sortOrder: '',
      pageNumber: 1,
    };
    setSearchCriteria(obj);
    getSearchData(obj);
  };

  const initProfile = () => {
    dispatch(getLookupDropdownsRequest());
    fetchInsuranceData();
  };
  useEffect(() => {
    initProfile();
  }, []);

  const priorityOrderRender = (n: number | undefined) => {
    return (
      <div
        className={`relative mr-3 h-5 w-5 text-clip rounded bg-[rgba(6,182,212,1)] text-left font-['Nunito'] font-semibold text-white [box-shadow-width:1px] [box-shadow:0px_0px_0px_1px_rgba(6,_182,_212,_1)_inset]`}
      >
        <p className="absolute left-1.5 top-0.5 m-0 text-xs leading-4">{n}</p>
      </div>
    );
  };
  const [icdRows, setIcdRows] = useState<IcdData[]>([]);
  const [openChargeStatusModal, setOpenChargeStatusModal] = useState(false);
  const [chargeModalInfo, setChargeModalInfo] = useState({
    chargeID: 0,
    patientID: 0,
  });

  const getClaimSummaryData = async (id: number) => {
    const res = await getClaimDetailSummaryById(id);
    if (res) {
      const icdsRows = res.icds?.map((m) => {
        return {
          icd10Code: m.code,
          order: m.order,
          description: m.description,
          selectedICDObj: { id: m.id, value: m.code },
        };
      });
      setIcdRows(icdsRows);
      setOpenChargeStatusModal(true);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'chargeID',
      headerName: 'Charge ID',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={() => {
                setChargeModalInfo({
                  chargeID: params.value,
                  patientID: params.row.patientID,
                });
                getClaimSummaryData(params.row.claimID);
              }}
            >
              #{params.value}
            </div>
          </div>
        );
      },
    },
    {
      field: 'claimID',
      headerName: 'Claim ID',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={() => {
                window.open(`/app/claim-detail/${params.value}`);
              }}
            >
              #{params.value}
            </div>
          </div>
        );
      },
    },
    {
      field: 'cpt',
      headerName: 'CPT Code',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
      renderCell: (params) => {
        return <div className="flex flex-col">{params.value}</div>;
      },
    },
    {
      field: 'patientID',
      headerName: 'Patient ID',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={() => {
                // window.open(`/app/register-patient/${params.value}`);
                dispatch(
                  setGlobalModal({
                    type: 'Patient Detail',
                    id: params.value,
                    isPopup: true,
                  })
                );
              }}
            >
              #{params.value}
            </div>
          </div>
        );
      },
    },
    {
      field: 'patient',
      headerName: 'Patient Name',
      flex: 1,
      minWidth: 220,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500"
              onClick={() => {
                // window.open(`/app/register-patient/${params.row.patientID}`);
                dispatch(
                  setGlobalModal({
                    type: 'Patient Detail',
                    id: params.value,
                    isPopup: true,
                  })
                );
              }}
            >
              {params.value}
            </div>
          </div>
        );
      },
    },
    {
      field: 'insurance',
      headerName: 'Insurance',
      flex: 1,
      minWidth: 350,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline">
              {params.value}
            </div>
          </div>
        );
      },
    },
    {
      field: 'fromDOS',
      headerName: 'DoS',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            {params.value} {params.row.toDOS ? `- ${params.row.toDOS}` : ''}
          </div>
        );
      },
    },
    {
      field: 'practice',
      headerName: 'Practice',
      flex: 1,
      minWidth: 200,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={() => {}}
            >
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.practiceAddress
                ? `${params.row.practiceAddress}`
                : ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'provider',
      headerName: 'Provider',
      flex: 1,
      minWidth: 230,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={() => {}}
            >
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.providerNPI ? `NPI: ${params.row.providerNPI}` : ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'units',
      headerName: 'Units',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
    },
    {
      field: 'fee',
      headerName: 'Fee',
      flex: 1,
      ...usdPrice,
      minWidth: 100,
      disableReorder: true,
    },
    {
      field: 'icd1',
      headerName: 'ICD1',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
    },
    {
      field: 'icd2',
      headerName: 'ICD2',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
    },
    {
      field: 'icd3',
      headerName: 'ICD3',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
    },
    {
      field: 'icd4',
      headerName: 'ICD4',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
    },
    {
      field: 'modifier1',
      headerName: 'Modifier 1',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return <div className="flex flex-col">{params.value}</div>;
      },
    },
    {
      field: 'modifier2',
      headerName: 'Modifier 2',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return <div className="flex flex-col">{params.value}</div>;
      },
    },
    {
      field: 'claimStatus',
      headerName: 'Claim Status',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
      renderCell: (params) => {
        if (params.row.claimStatusColor === 'green') {
          return (
            <Badge
              text={params.value}
              cls={'bg-green-50 text-green-800 rounded-[4px] whitespace-normal'}
              icon={
                <Icon
                  name={
                    params.row.claimStatus.includes('Paid E') ||
                    params.row.claimStatus.includes('Appeal') ||
                    params.row.claimStatus.includes('Draft') ||
                    params.row.claimStatus.includes('Review') ||
                    params.row.claimStatus.includes('Hold') ||
                    params.row.claimStatus.includes('Ready to Bill Patient') ||
                    params.row.claimStatus.includes('Billed to Patient')
                      ? 'user'
                      : 'desktop'
                  }
                  color={IconColors.GREEN}
                />
              }
            />
          );
        }
        if (params.row.claimStatusColor === 'yellow') {
          return (
            <Badge
              text={params.value}
              cls={
                'bg-yellow-50 text-yellow-800 rounded-[4px] whitespace-normal'
              }
              icon={
                <Icon
                  name={
                    params.row.claimStatus.includes('Paid E') ||
                    params.row.claimStatus.includes('Appeal') ||
                    params.row.claimStatus.includes('Draft') ||
                    params.row.claimStatus.includes('Review') ||
                    params.row.claimStatus.includes('Hold') ||
                    params.row.claimStatus.includes('Ready to Bill Patient') ||
                    params.row.claimStatus.includes('Billed to Patient')
                      ? 'user'
                      : 'desktop'
                  }
                  color={IconColors.Yellow}
                />
              }
            />
          );
        }
        if (params.row.claimStatusColor === 'red') {
          return (
            <Badge
              text={params.value}
              cls={'bg-red-50 text-red-800 rounded-[4px] whitespace-normal'}
              icon={
                <Icon
                  name={
                    params.row.claimStatus.includes('Paid E') ||
                    params.row.claimStatus.includes('Appeal') ||
                    params.row.claimStatus.includes('Draft') ||
                    params.row.claimStatus.includes('Review') ||
                    params.row.claimStatus.includes('Hold') ||
                    params.row.claimStatus.includes('Ready to Bill Patient') ||
                    params.row.claimStatus.includes('Billed to Patient')
                      ? 'user'
                      : 'desktop'
                  }
                  color={IconColors.RED}
                />
              }
            />
          );
        }

        return (
          <Badge
            text={params.value}
            cls={'bg-gray-50 text-gray-800 rounded-[4px] whitespace-normal'}
            icon={<Icon name={'desktop'} color={IconColors.GRAY} />}
          />
        );
      },
    },
    {
      field: 'authorizationNumber',
      headerName: 'Auth. Number',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'wcNumber',
      headerName: 'WC Number',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'referringProvider',
      headerName: 'Ref. Provider',
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
              {params.row.referringProviderNPI
                ? `NPI: ${params.row.referringProviderNPI}`
                : ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'insuranceAmount',
      headerName: 'Insurance Resp.',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div>{currencyFormatter.format(params.value)}</div>
            {params.row.insuranceBalance < 0 && (
              <div className="whitespace-nowrap text-xs text-yellow-500">
                {`Bal.: ${currencyFormatter.format(
                  params.row.insuranceBalance
                )}`}
              </div>
            )}
            {params.row.insuranceBalance > 0 && (
              <div className="whitespace-nowrap text-xs text-red-500">
                {`Bal.: ${currencyFormatter.format(
                  params.row.insuranceBalance
                )}`}
              </div>
            )}
            {(params.row.insuranceBalance === 0 ||
              !params.row.insuranceBalance) && (
              <div className="whitespace-nowrap text-xs text-green-500">
                {`Bal.: ${currencyFormatter.format(0)}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: 'insurancePaid',
      headerName: 'Ins. Paid',
      flex: 1,
      minWidth: 125,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div>{currencyFormatter.format(params.value)}</div>
            {params.row.insuranceAdjustment > 0 && (
              <div className="whitespace-nowrap text-xs text-red-500">
                {`Adj.: ${currencyFormatter.format(
                  params.row.insuranceAdjustment
                )}`}
              </div>
            )}
            {params.row.insuranceAdjustment < 0 && (
              <div className="whitespace-nowrap text-xs text-yellow-500">
                {`Adj.: ${currencyFormatter.format(
                  params.row.insuranceAdjustment
                )}`}
              </div>
            )}
            {(params.row.insuranceAdjustment === 0 ||
              !params.row.insuranceAdjustment) && (
              <div className="whitespace-nowrap text-xs text-green-500">
                {`Adj.: ${currencyFormatter.format(0)}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: 'patientAmount',
      headerName: 'Patient Resp.',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div>{currencyFormatter.format(params.value)}</div>
            {params.row.patientBalance > 0 && (
              <div className="whitespace-nowrap text-xs text-red-500">
                {`Bal.: ${currencyFormatter.format(params.row.patientBalance)}`}
              </div>
            )}
            {params.row.patientBalance < 0 && (
              <div className="whitespace-nowrap text-xs text-yellow-500">
                {`Bal.: ${currencyFormatter.format(params.row.patientBalance)}`}
              </div>
            )}
            {(params.row.patientBalance === 0 ||
              !params.row.patientBalance) && (
              <div className="whitespace-nowrap text-xs text-green-500">
                {`Bal.: ${currencyFormatter.format(0)}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: 'patientPaid',
      headerName: 'Pat. Paid',
      flex: 1,
      minWidth: 125,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div>{currencyFormatter.format(params.value)}</div>
            {params.row.patientAdjustment > 0 && (
              <div className="whitespace-nowrap text-xs text-red-500">
                {`Adj.: ${currencyFormatter.format(
                  params.row.patientAdjustment
                )}`}
              </div>
            )}
            {params.row.patientAdjustment < 0 && (
              <div className="whitespace-nowrap text-xs text-yellow-500">
                {`Adj.: ${currencyFormatter.format(
                  params.row.patientAdjustment
                )}`}
              </div>
            )}
            {(params.row.patientAdjustment === 0 ||
              !params.row.patientAdjustment) && (
              <div className="whitespace-nowrap text-xs text-green-500">
                {`Adj.: ${currencyFormatter.format(0)}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: 'totalBalance',
      headerName: 'T. Balance',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        if (params.value > 0) {
          return (
            <div className="text-red-500">
              {currencyFormatter.format(params.value)}
            </div>
          );
        }
        if (params.value === 0) {
          return (
            <div className="text-green-500">
              {currencyFormatter.format(params.value)}
            </div>
          );
        }

        return (
          <div className="text-yellow-500">
            {currencyFormatter.format(params.value)}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    setGroupDropdown(selectedWorkedGroup?.groupsData || []);
    if (selectedWorkedGroup?.groupsData[0]?.id)
      setSearchCriteriaFields({
        ...searchCriteria,
        groupID: selectedWorkedGroup?.groupsData[0]?.id,
      });
  }, [selectedWorkedGroup]);

  const handleInsuanceAllData = (groupID: number) => {
    setInsuanceAllData([...insuranceData.filter((m) => m.groupID === groupID)]);
  };

  useEffect(() => {
    if (searchCriteria?.groupID) handleInsuanceAllData(searchCriteria?.groupID);
  }, [searchCriteria?.groupID, insuranceData]);

  useEffect(() => {
    const groupId = searchCriteria?.groupID;
    if (groupId) {
      setPracticeDropdown([]);
      setProviderDropdown([]);
      dispatch(fetchPracticeDataRequest({ groupID: groupId }));
      dispatch(fetchProviderDataRequest({ groupID: groupId }));
      dispatch(fetchFacilityDataRequest({ groupID: groupId }));
      dispatch(fetchAssignClaimToDataRequest({ clientID: groupId }));
      dispatch(
        fetchReferringProviderDataRequest({
          groupID: groupId,
        })
      );
    }
  }, [searchCriteria?.groupID]);

  useEffect(() => {
    setPracticeDropdown(practiceData || []);
    setProviderDropdown(providersData || []);
    setFacilityDropdown(facilityData || []);
  }, [practiceData, providersData, facilityData]);
  useEffect(() => {
    if (referringProviderDataSet) {
      setReferringProviderData(referringProviderDataSet);
    }
  }, [referringProviderDataSet]);

  const downloadPdf = (pdfExportData: GetChargeDetailReportResult[]) => {
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
    if (searchCriteria.facilityID) {
      const fName = facilityData?.filter(
        (m) => m.id === searchCriteria.facilityID
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Facility', Value: fName || '' });
    }
    if (searchCriteria.providerID) {
      const Provider = providerDropdown.filter(
        (m) => m.id === Number(searchCriteria.providerID)
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Provider', Value: Provider || '' });
    }
    if (searchCriteria.claimID) {
      criteriaArray.push({
        Criteria: 'Claim ID',
        Value: searchCriteria?.claimID?.toString() || '',
      });
    }
    if (searchCriteria.cpt) {
      criteriaArray.push({
        Criteria: 'CPT Code',
        Value: searchCriteria?.cpt || '',
      });
    }
    if (searchCriteria.chargeID) {
      criteriaArray.push({
        Criteria: 'Charge ID',
        Value: searchCriteria?.chargeID?.toString() || '',
      });
    }
    if (searchCriteria.referringProvider) {
      criteriaArray.push({
        Criteria: 'Referring Provider',
        Value:
          referringProviderData?.filter(
            (f) => f.value === searchCriteria.referringProvider
          )[0]?.value || '',
      });
    }
    if (searchCriteria.fromDOS) {
      criteriaArray.push({
        Criteria: 'Date of Service - From',
        Value: DateToStringPipe(searchCriteria.fromDOS, 1),
      });
    }
    if (searchCriteria.toDOS) {
      criteriaArray.push({
        Criteria: 'Date of Service - To',
        Value: DateToStringPipe(searchCriteria.toDOS, 1),
      });
    }
    if (searchCriteria.patientFirstName) {
      criteriaArray.push({
        Criteria: 'Patient First Name',
        Value: searchCriteria?.patientFirstName || '',
      });
    }
    if (searchCriteria.patientLastName) {
      criteriaArray.push({
        Criteria: 'Patient Last Name',
        Value: searchCriteria?.patientLastName || '',
      });
    }
    if (searchCriteria.insuranceID) {
      criteriaArray.push({
        Criteria: 'Insurance',
        Value:
          insuranceAllData?.filter(
            (m) => m.id === Number(searchCriteria.insuranceID)
          )[0]?.value || '',
      });
    }
    let responsibility = '';
    if (
      searchCriteria?.responsibility ||
      searchCriteria.responsibility === undefined
    ) {
      if (searchCriteria?.responsibility === 1) {
        responsibility = 'Primary';
      } else if (searchCriteria?.responsibility === 2) {
        responsibility = 'Secondary+';
      } else {
        responsibility = 'Both';
      }
    }
    if (responsibility) {
      criteriaArray.push({ Criteria: 'Claim Type', Value: responsibility });
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
    const procedureDetails: PDFRowInput[] = pdfExportData.map((n) => {
      return {
        'Charge ID': n.chargeID,
        'Claim ID': n.claimID,
        'CPT Code': n.cpt,
        'Patient ID': n.patientID,
        'Patient Name': n.patient,
        Insurance: n.insurance,
        DoS: `${n.fromDOS}-\n${n.toDOS}`,
        Practice: n.practice,
        Provider: n.provider,
        Units: n.units,
        Fee: currencyFormatter.format(n.fee),
        ICD1: n.icd1,
        ICD2: n.icd2,
        ICD3: n.icd3,
        ICD4: n.icd4,
        Modifier1: n.modifier1,
        Modifier2: n.modifier2,
        'Claim Status': n.claimStatus,
        'Auth. Number': n.authorizationNumber,
        'WC Number': n.wcNumber,
        'Ref. Provider': n.referringProvider,
        'Ins. Amount': currencyFormatter.format(n.insuranceAmount),
        'Ins. Paid': currencyFormatter.format(n.insurancePaid),
        'Ins. Adjustment': currencyFormatter.format(n.insuranceAdjustment),
        'Ins. Balance': currencyFormatter.format(n.insuranceBalance),
        'Pat. Amount': currencyFormatter.format(n.patientAmount),
        'Pat. Paid': currencyFormatter.format(n.patientPaid),
        'Pat. Adjustment': currencyFormatter.format(n.patientAdjustment),
        'Pat. Balance': currencyFormatter.format(n.patientBalance),
        'T. Balance': currencyFormatter.format(n.totalBalance),
      };
    });
    const dataColumns: PDFColumnInput[] = [];
    const keyNames = procedureDetails[0] && Object.keys(procedureDetails[0]);
    if (keyNames) {
      for (let i = 0; i < keyNames.length; i += 1) {
        dataColumns.push({ title: keyNames[i], dataKey: keyNames[i] });
      }
    }
    data.push({ columns: dataColumns, body: procedureDetails });
    // implement summary
    const summaryExportData: PDFRowInput[] = summaryResult.map((n) => {
      return {
        Type: n.label,
        Amount: currencyFormatter.format(n.value || 0),
      };
    });
    const summaryColumns: PDFColumnInput[] = [];
    const keyNames2 = summaryExportData[0] && Object.keys(summaryExportData[0]);
    if (keyNames2) {
      for (let i = 0; i < keyNames2.length; i += 1) {
        summaryColumns.push({ title: keyNames2[i], dataKey: keyNames2[i] });
      }
    }
    data.push({ columns: summaryColumns, body: summaryExportData });
    ExportDataToPDF(data, 'Charge Detail Report');
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
    const obj: GetChargeDetailReportCriteria = {
      groupID: searchCriteria.groupID,
      practiceID: searchCriteria.practiceID,
      facilityID: searchCriteria.facilityID,
      providerID: searchCriteria.providerID,
      claimID: searchCriteria.claimID,
      cpt: searchCriteria.cpt,
      chargeID: searchCriteria.chargeID,
      referringProvider: searchCriteria.referringProvider,
      fromDOS: searchCriteria.fromDOS,
      toDOS: searchCriteria.toDOS,
      patientFirstName: searchCriteria.patientFirstName,
      patientLastName: searchCriteria.patientLastName,
      patientID: searchCriteria.patientID,
      insuranceID: searchCriteria.insuranceID,
      responsibility: searchCriteria.responsibility,
      sortByColumn: '',
      pageNumber: undefined,
      pageSize: undefined,
      sortOrder: '',
      getAllData: true,
      getOnlyIDS: searchCriteria.getOnlyIDS,
    };
    const res = await fetchChargeDetailReportSearchData(obj);
    if (res) {
      if (type === 'pdf') {
        downloadPdf(res.chargeDetailReportsData);
      } else {
        const exportDataArray = res.chargeDetailReportsData.map((n) => {
          return {
            'Charge ID': n.chargeID.toString(),
            'Claim ID': n.claimID.toString(),
            'CPT Code': n.cpt,
            'Patient ID': n.patientID.toString(),
            'Patient Name': n.patient,
            Insurance: n.insurance,
            DoS: `${n.fromDOS}-\n${n.toDOS}`,
            Practice: n.practice,
            Provider: n.provider,
            Units: n.units.toString(),
            Fee: currencyFormatter.format(n.fee),
            ICD1: n.icd1,
            ICD2: n.icd2,
            ICD3: n.icd3,
            ICD4: n.icd4,
            Modifier1: n.modifier1,
            Modifier2: n.modifier2,
            'Claim Status': n.claimStatus,
            'Auth. Number': n.authorizationNumber,
            'WC Number': n.wcNumber,
            'Ref. Provider': n.referringProvider,
            'Ins. Amount': currencyFormatter.format(n.insuranceAmount),
            'Ins. Paid': currencyFormatter.format(n.insurancePaid),
            'Ins. Adjustment': currencyFormatter.format(n.insuranceAdjustment),
            'Ins. Balance': currencyFormatter.format(n.insuranceBalance),
            'Pat. Amount': currencyFormatter.format(n.patientAmount),
            'Pat. Paid': currencyFormatter.format(n.patientPaid),
            'Pat. Adjustment': currencyFormatter.format(n.patientAdjustment),
            'Pat. Balance': currencyFormatter.format(n.patientBalance),
            'T. Balance': currencyFormatter.format(n.totalBalance),
          };
        });
        if (exportDataArray.length !== 0) {
          const headerArray = Object.keys(exportDataArray[0] || {});
          let criteriaObj: { [key: string]: string } = {
            ...exportDataArray[0],
          };
          const criteriaArray = [];
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Charge ID': 'Criteria',
            'Claim ID': 'Value',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          if (searchCriteria.groupID) {
            criteriaObj = {
              ...criteriaObj,
              'Charge ID': 'Group',
              'Claim ID':
                groupDropdown.filter(
                  (m) => m.id === Number(searchCriteria.groupID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.practiceID) {
            criteriaObj = {
              ...criteriaObj,
              'Charge ID': 'Practice',
              'Claim ID':
                practiceDropdown.filter(
                  (m) => m.id === Number(searchCriteria.practiceID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.facilityID) {
            criteriaObj = {
              ...criteriaObj,
              'Charge ID': 'Facility',
              'Claim ID':
                facilityDropdown.filter(
                  (m) => m.id === Number(searchCriteria.facilityID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.providerID) {
            criteriaObj = {
              ...criteriaObj,
              'Charge ID': 'Provider',
              'Claim ID':
                providerDropdown.filter(
                  (m) => m.id === Number(searchCriteria.providerID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.claimID) {
            criteriaObj = {
              ...criteriaObj,
              'Charge ID': 'Claim ID',
              'Claim ID': searchCriteria?.claimID?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.cpt) {
            criteriaObj = {
              ...criteriaObj,
              'Charge ID': 'CPT Code',
              'Claim ID': searchCriteria?.cpt || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.chargeID) {
            criteriaObj = {
              ...criteriaObj,
              'Charge ID': 'Charge ID',
              'Claim ID': searchCriteria?.chargeID?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.referringProvider) {
            criteriaObj = {
              ...criteriaObj,
              'Charge ID': 'Referring Provider',
              'Claim ID':
                referringProviderData?.filter(
                  (m) => m.value === searchCriteria.referringProvider
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.fromDOS) {
            criteriaObj = {
              ...criteriaObj,
              'Charge ID': 'Date of Service - From',
              'Claim ID': DateToStringPipe(searchCriteria?.fromDOS, 1),
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.toDOS) {
            criteriaObj = {
              ...criteriaObj,
              'Charge ID': 'Date of Service - To',
              'Claim ID': DateToStringPipe(searchCriteria?.toDOS, 1),
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.patientFirstName) {
            criteriaObj = {
              ...criteriaObj,
              'Charge ID': 'Patient First Name',
              'Claim ID': searchCriteria.patientFirstName || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.patientLastName) {
            criteriaObj = {
              ...criteriaObj,
              'Charge ID': 'Patient Last Name',
              'Claim ID': searchCriteria.patientLastName || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.patientID) {
            criteriaObj = {
              ...criteriaObj,
              'Charge ID': 'Patient ID',
              'Claim ID': searchCriteria.patientID.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.insuranceID) {
            criteriaObj = {
              ...criteriaObj,
              'Charge ID': 'Insurance',
              'Claim ID':
                insuranceAllData?.filter(
                  (m) => m.id === Number(searchCriteria.insuranceID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          let responsibility = '';
          if (searchCriteria?.responsibility === 1) {
            responsibility = 'Primary';
          } else if (searchCriteria?.responsibility === 2) {
            responsibility = 'Secondary+';
          } else {
            responsibility = 'Both';
          }
          if (
            searchCriteria?.responsibility ||
            searchCriteria.responsibility === undefined
          ) {
            criteriaObj = {
              ...criteriaObj,
              'Charge ID': 'Responsibility',
              'Claim ID': responsibility,
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));

          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Charge ID': 'Charge Detail Report',
            'Claim ID': '',
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
            ExportDataToCSV(exportArray, 'ChargeDetailReport');
            dispatch(
              addToastNotification({
                text: 'Export Successful',
                toastType: ToastType.SUCCESS,
                id: '',
              })
            );
          } else {
            ExportDataToDrive(exportArray, 'ChargeDetailReport', dispatch);
          }
        }
      }
    } else {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Error',
        type: StatusModalType.ERROR,
        text: 'A system error prevented the report to be exported. Please try again.',
      });
    }
  };
  const exportDropdownData: ButtonSelectDropdownDataType[] = [
    {
      id: 1,
      value: 'Export Report to PDF',
      icon: 'pdf',
    },
    {
      id: 2,
      value: 'Export Report to CSV',
      icon: 'csv',
    },
    {
      id: 3,
      value: 'Export to Google Drive',
      icon: 'drive',
    },
  ];
  const onSelectExportOption = (res: SingleSelectDropDownDataType[]) => {
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
  const [reportCollapseInfo, setReportCollapseInfo] = useState({
    summary: false,
    detail: false,
  });
  return (
    <AppLayout title="Nucleus - Charge Detail Report">
      <div className="relative m-0 h-full bg-gray-100 p-0">
        <div className="m-0 h-full w-full overflow-y-scroll bg-gray-100 p-0">
          <div className="flex w-full flex-col">
            <div className="m-0 h-full w-full overflow-y-auto overflow-x-hidden bg-gray-100 p-0">
              <div className="h-[125px] w-full">
                <div className="absolute top-0 z-[11] w-full">
                  <Breadcrumbs />
                  <PageHeader>
                    <div className="flex items-start justify-between gap-4  px-7 pb-[21px] pt-[33px]">
                      <div className="flex h-[38px] gap-6">
                        <p className="self-center text-3xl font-bold text-cyan-700">
                          Charge Detail Report
                        </p>
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
                <div className="flex items-center px-[5px] py-[20px]">
                  <div
                    className={`inline-flex items-center pr-[29px] text-left font-bold text-gray-700`}
                  >
                    <p className={`m-0 text-xl sm:text-xl`}>
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
                      addNewButtonActive={isChangedJson}
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
                          Location
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div className={`w-[50%] px-[5px] lg:w-[20%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Group
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="-"
                                disabled={false}
                                data={groupDropdown}
                                selectedValue={
                                  groupDropdown.filter(
                                    (f) => f.id === searchCriteria?.groupID
                                  )[0]
                                }
                                onSelect={(value) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    groupID: value.id,
                                    practiceID: undefined,
                                    facilityID: undefined,
                                    providerID: undefined,
                                    insuranceID: undefined,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[50%] px-[5px] lg:w-[20%]`}>
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
                                    practiceID: undefined,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[50%] px-[5px] lg:w-[20%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Facility
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="-"
                                disabled={false}
                                data={facilityDropdown}
                                selectedValue={
                                  facilityDropdown.filter(
                                    (f) => f.id === searchCriteria?.facilityID
                                  )[0]
                                }
                                onSelect={(value) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    facilityID: value.id,
                                  });
                                }}
                                isOptional={true}
                                onDeselectValue={() => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    facilityID: undefined,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[50%] px-[5px] lg:w-[20%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Provider
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="-"
                                disabled={false}
                                data={providerDropdown}
                                selectedValue={
                                  providerDropdown.filter(
                                    (f) => f.id === searchCriteria?.providerID
                                  )[0]
                                }
                                onSelect={(value) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    providerID: value.id,
                                  });
                                }}
                                isOptional={true}
                                onDeselectValue={() => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    providerID: undefined,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={'px-[5px] py-[15px]'}>
                      <div className={`h-[1px] w-full bg-gray-200`} />
                    </div>
                    <div className="w-full">
                      <div className="px-[5px] pb-[5px]">
                        <p className="text-base font-bold leading-normal text-gray-700">
                          Claim Details
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div className={`w-[50%] px-[5px] lg:w-[25%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Claim ID
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="Claim ID"
                                value={searchCriteria.claimID}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    claimID: evt.target.value,
                                  });
                                }}
                                type={'number'}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[50%] px-[5px] lg:w-[23%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              CPT Code
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="CPT Code"
                                value={searchCriteria.cpt}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    cpt: evt.target.value,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[50%] px-[5px] lg:w-[23%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Charge ID
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="Charge ID"
                                value={searchCriteria.chargeID}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    chargeID: evt.target.value,
                                  });
                                }}
                                type={'number'}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex w-full flex-wrap">
                        <div className={`w-[50%] px-[5px] lg:w-[23%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Referring Provider
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="-"
                                disabled={false}
                                data={
                                  referringProviderData
                                    ? (referringProviderData as SingleSelectDropDownDataType[])
                                    : []
                                }
                                selectedValue={
                                  referringProviderData?.filter(
                                    (m) =>
                                      m.value ===
                                      searchCriteria.referringProvider
                                  )[0]
                                }
                                onSelect={(e) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    referringProvider: e.value,
                                  });
                                }}
                                isOptional={true}
                                onDeselectValue={() => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    referringProvider: undefined,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`flex w-[50%] px-[5px] lg:w-[33%]`}>
                          <div className={`w-[50%] pr-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
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
                            <div className={`w-full items-start self-stretch`}>
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
                    <div className={'px-[5px] py-[15px]'}>
                      <div className={`h-[1px] w-full bg-gray-200`} />
                    </div>
                    <div className="w-full">
                      <div className="px-[5px] pb-[5px]">
                        <p className="text-base font-bold leading-normal text-gray-700">
                          Payor Details
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div className={`w-[50%] px-[5px] lg:w-[23%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Patient First Name
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="Patient First Name"
                                value={searchCriteria.patientFirstName}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    patientFirstName: evt.target.value,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[50%] px-[5px] lg:w-[23%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Patient Last Name
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="Patient Last Name"
                                value={searchCriteria.patientLastName}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    patientLastName: evt.target.value,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[50%] px-[5px] lg:w-[23%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Patient ID
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="Patient ID"
                                value={searchCriteria.patientID}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    patientID: evt.target.value
                                      ? Number(evt.target.value)
                                      : undefined,
                                  });
                                }}
                                type={'number'}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex w-full flex-wrap">
                        <div className={`w-[50%] px-[5px] lg:w-[23%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Insurance
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="-"
                                disabled={false}
                                data={insuranceAllData}
                                selectedValue={
                                  insuranceAllData.filter(
                                    (f) => f.id === searchCriteria?.insuranceID
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
                                    insuranceID: undefined,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[50%] px-[5px] lg:w-[23%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Responsibility
                            </div>
                            <div className="mt-[4px]  flex h-[38px] w-full items-center">
                              <RadioButton
                                data={[
                                  { value: '1', label: 'Primary' },
                                  { value: '2', label: 'Secondary+' },
                                  { value: '', label: 'Both' },
                                ]}
                                checkedValue={
                                  searchCriteria.responsibility
                                    ? searchCriteria.responsibility.toString()
                                    : ''
                                }
                                onChange={(e) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    responsibility: e.target.value
                                      ? Number(e.target.value)
                                      : undefined,
                                  });
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
              <div className="flex h-20 items-start justify-between gap-4 bg-gray-200 px-7 pb-[15px] pt-[25px]">
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
                    <div className={'hidden justify-center lg:flex lg:w-[1%]'}>
                      <div className={`h-full w-[1px] bg-gray-900`} />
                    </div>
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
              <div className="w-full gap-4 bg-white px-7 pb-[15px] pt-[25px]">
                <SectionHeading
                  label="Report Summary"
                  isCollapsable={true}
                  hideBottomDivider
                  onClick={() => {
                    setReportCollapseInfo({
                      ...reportCollapseInfo,
                      summary: !reportCollapseInfo.summary,
                    });
                  }}
                  isCollapsed={reportCollapseInfo.summary}
                />
                <div className="mb-[20px] mt-[40px] w-full">
                  <div
                    hidden={reportCollapseInfo.summary}
                    className="w-full drop-shadow-lg"
                  >
                    <AppTable
                      cls="max-h-[400px] !w-[700px] "
                      renderHead={
                        <>
                          <AppTableRow>
                            <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                              Label
                            </AppTableCell>
                            <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                              Value
                            </AppTableCell>
                          </AppTableRow>
                        </>
                      }
                      renderBody={
                        <>
                          {summaryResult.map((d) => {
                            return (
                              <AppTableRow key={d.label}>
                                <AppTableCell>{d.label}</AppTableCell>
                                <AppTableCell>
                                  {currencyFormatter.format(
                                    d.value ? d.value : 0
                                  )}
                                </AppTableCell>
                              </AppTableRow>
                            );
                          })}
                          {!summaryResult.length && (
                            <AppTableRow>
                              <AppTableCell cls={'!text-center'} colSpan={2}>
                                No rows
                              </AppTableCell>
                            </AppTableRow>
                          )}
                        </>
                      }
                    />
                  </div>
                </div>
                <SearchDetailGrid
                  pageNumber={lastSearchCriteria.pageNumber}
                  pageSize={lastSearchCriteria.pageSize}
                  totalCount={searchResult[0]?.totalCount}
                  rows={searchResult.map((row) => {
                    return { ...row, id: row.rid };
                  })}
                  columns={columns}
                  persistLayoutId={14}
                  checkboxSelection={false}
                  onPageChange={(page: number) => {
                    const obj: GetChargeDetailReportCriteria = {
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
                      const obj: GetChargeDetailReportCriteria = {
                        ...lastSearchCriteria,
                        sortByColumn: field || '',
                        sortOrder: sort || '',
                      };
                      setLastSearchCriteria(obj);
                      getSearchData(obj);
                    }
                  }}
                  onPageSizeChange={(pageSize: number, page: number) => {
                    if (searchResult.length) {
                      const obj: GetChargeDetailReportCriteria = {
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
      <Modal
        open={openChargeStatusModal}
        onClose={() => {
          setOpenChargeStatusModal(false);
        }}
        modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
      >
        <ViewChargeDetails
          icdRows={icdRows}
          chargeID={chargeModalInfo.chargeID}
          patientID={chargeModalInfo.patientID}
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
    </AppLayout>
  );
};

export default ChargeDetailReport;
