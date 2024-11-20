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
import CloseButton from '@/components/UI/CloseButton';
import InputField from '@/components/UI/InputField';
import Modal from '@/components/UI/Modal';
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
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  addToastNotification,
  // fetchAssignClaimToDataRequest,
  // fetchProviderDataRequest,
} from '@/store/shared/actions';
import {
  getAgingInsuranceReportData,
  getAgingInsuranceReportDetailsData,
} from '@/store/shared/sagas';
import type {
  AgingByInsuranceReportCriteria,
  AgingByInsuranceReportDetailsCriteria,
  AgingByInsuranceReportDetailsResult,
  AgingInsuranceReportData,
  AgingInsuranceReportDetails,
  AgingInsuranceReportSummary,
  GroupData,
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

const AgingInsuranceReport = () => {
  const dispatch = useDispatch();
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
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const defaultSearchCriteria: AgingByInsuranceReportCriteria = {
    userID: '',
    groupID: selectedWorkedGroup?.groupsData[0]?.id || null,
    insuranceName: '',
    fromBalance: undefined,
    toBalance: undefined,
    getAllData: false,
    getOnlyIDS: false,
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    sortByColumn: '',
    sortOrder: '',
    fromDate: '',
    toDate: '',
    agingType: 'created_on',
  };
  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [isChangedJson, setIsChangedJson] = useState(false);

  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const setSearchCriteriaFields = (value: AgingByInsuranceReportCriteria) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };
  const [renderSearchCriteriaView, setRenderSearchCriteriaView] = useState(
    uuidv4()
  );
  const [hideSearchParameters, setHideSearchParameters] =
    useState<boolean>(true);
  const [groupDropdown, setGroupDropdown] = useState<GroupData[]>([]);

  useEffect(() => {
    setGroupDropdown(selectedWorkedGroup?.groupsData || []);
    setSearchCriteriaFields({
      ...searchCriteria,
      groupID: selectedWorkedGroup?.groupsData[0]?.id || null,
    });
    // if (selectedWorkedGroup?.groupsData[0]?.id) {
    //   dispatch(
    //     fetchAssignClaimToDataRequest({
    //       clientID: selectedWorkedGroup?.groupsData[0]?.id,
    //     })
    //   );
    //   dispatch(
    //     fetchProviderDataRequest({
    //       groupID: selectedWorkedGroup?.groupsData[0]?.id,
    //     })
    //   );
    // }
  }, [selectedWorkedGroup]);

  const [totalCount, setTotalCount] = useState<number>(0);
  const [statusModalInfo, setStatusModalInfo] = useState({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
  });

  const [isAgingInsuranceDetailModalOpen, setIsAgingInsuranceDetailModalOpen] =
    useState(false);

  const [agingInsuranceDetailsTotalCount, setAgingInsuranceDetailsTotalCount] =
    useState<number>(0);
  const [agingInsuranceDetailsCriteria, setAgingInsuranceDetailsCriteria] =
    useState<AgingByInsuranceReportDetailsCriteria>({
      groupID: null,
      agingType: '',
      insuranceID: null,
      currentIndex: '',
      getAllData: true,
      insuranceName: '',
    });
  const [agingInsuranceDetailsData, setAgingInsuranceDetailsData] = useState<
    AgingByInsuranceReportDetailsResult[]
  >([]);
  const getAgingInsuranceDetailsData = async (
    obj: AgingByInsuranceReportDetailsCriteria
  ) => {
    const res = await getAgingInsuranceReportDetailsData(obj);
    if (res) {
      setAgingInsuranceDetailsData(res);
      setAgingInsuranceDetailsCriteria(obj);
      setAgingInsuranceDetailsTotalCount(res[0]?.total || 0);
    } else {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Error',
        type: StatusModalType.ERROR,
        text: 'There was an error generating the report.\nPlease try again.',
      });
    }
  };
  const [searchResult, setSearchResult] = useState<
    AgingInsuranceReportDetails[]
  >([]);
  const [summaryData, setSummaryData] = useState<AgingInsuranceReportSummary[]>(
    []
  );
  const getSearchData = async (obj: AgingByInsuranceReportCriteria) => {
    const res = await getAgingInsuranceReportData(obj);
    if (res) {
      setSearchResult(res.agingByInsuranceReportData);
      setSummaryData(res.summary);
      setTotalCount(res.agingByInsuranceReportData[0]?.total || 0);
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
        text: 'To generate a report, please fill in at least one search parameter. Review your input and try again.',
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
  const columns: GridColDef[] = [
    {
      field: 'insurance',
      headerName: 'Insurance Name',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
              onClick={async () => {}}
            >
              {params.value}
            </div>
          </div>
        );
      },
    },
    {
      field: 'current',
      headerName: 'Current',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
            onClick={() => {
              setIsAgingInsuranceDetailModalOpen(true);
              const obj = {
                ...agingInsuranceDetailsCriteria,
                groupID: searchCriteria.groupID,
                agingType: searchCriteria.agingType,
                insuranceID: params.row.id,
                currentIndex: 'Current',
              };
              getAgingInsuranceDetailsData(obj);
              setAgingInsuranceDetailsCriteria(obj);
            }}
          >
            {currencyFormatter.format(params.value)}
          </div>
        );
      },
    },
    {
      field: 'thirtyPlus',
      headerName: '30+',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
            onClick={() => {
              setIsAgingInsuranceDetailModalOpen(true);
              const obj = {
                ...agingInsuranceDetailsCriteria,
                groupID: searchCriteria.groupID,
                agingType: searchCriteria.agingType,
                insuranceID: params.row.id,
                currentIndex: '30 Plus',
              };
              getAgingInsuranceDetailsData(obj);
              setAgingInsuranceDetailsCriteria(obj);
            }}
          >
            {currencyFormatter.format(params.value)}
          </div>
        );
      },
    },
    {
      field: 'sixtyPlus',
      headerName: '60+',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
            onClick={() => {
              setIsAgingInsuranceDetailModalOpen(true);
              const obj = {
                ...agingInsuranceDetailsCriteria,
                groupID: searchCriteria.groupID,
                agingType: searchCriteria.agingType,
                insuranceID: params.row.id,
                currentIndex: '60 Plus',
              };
              getAgingInsuranceDetailsData(obj);
              setAgingInsuranceDetailsCriteria(obj);
            }}
          >
            {currencyFormatter.format(params.value)}
          </div>
        );
      },
    },
    {
      field: 'nintyPlus',
      headerName: '90+',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
            onClick={() => {
              setIsAgingInsuranceDetailModalOpen(true);
              const obj = {
                ...agingInsuranceDetailsCriteria,
                groupID: searchCriteria.groupID,
                agingType: searchCriteria.agingType,
                insuranceID: params.row.id,
                currentIndex: '90 Plus',
              };
              getAgingInsuranceDetailsData(obj);
              setAgingInsuranceDetailsCriteria(obj);
            }}
          >
            {currencyFormatter.format(params.value)}
          </div>
        );
      },
    },
    {
      field: 'oneTwentyPlus',
      headerName: '120+',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
            onClick={() => {
              setIsAgingInsuranceDetailModalOpen(true);
              const obj = {
                ...agingInsuranceDetailsCriteria,
                groupID: searchCriteria.groupID,
                agingType: searchCriteria.agingType,
                insuranceID: params.row.id,
                currentIndex: '120 Plus',
              };
              getAgingInsuranceDetailsData(obj);
              setAgingInsuranceDetailsCriteria(obj);
            }}
          >
            {currencyFormatter.format(params.value)}
          </div>
        );
      },
    },
    {
      field: 'oneEightyPlus',
      headerName: '180+',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
            onClick={() => {
              setIsAgingInsuranceDetailModalOpen(true);
              const obj = {
                ...agingInsuranceDetailsCriteria,
                groupID: searchCriteria.groupID,
                agingType: searchCriteria.agingType,
                insuranceID: params.row.id,
                currentIndex: '180 Plus',
              };
              getAgingInsuranceDetailsData(obj);
              setAgingInsuranceDetailsCriteria(obj);
            }}
          >
            {currencyFormatter.format(params.value)}
          </div>
        );
      },
    },
    {
      field: 'balance',
      headerName: 'Balance',
      ...usdPrice,
      flex: 1,
      minWidth: 120,
      disableReorder: true,
    },
  ];

  const agingInsuranceTimeframeColumns: GridColDef[] = [
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
              className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
              onClick={async () => {}}
            >
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
      minWidth: 140,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div>
            {params.row.toDOS !== null ? (
              <> {`${params.row.fromDOS} - ${params.row.toDOS}`} </>
            ) : (
              <>{params.row.fromDOS}</>
            )}
          </div>
        );
      },
    },
    {
      field: 'patient',
      headerName: 'Patient Name',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
            onClick={() => {}}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: 'aging',
      headerName: 'Aging',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
    },
    {
      field: 'insurance',
      headerName: 'Primary Insurance',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
            onClick={() => {}}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: 'group',
      headerName: 'Group',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline">
              {params.value}
            </div>
            <div
              className="text-xs font-normal leading-4 text-gray-500"
              onClick={() => {}}
            >
              EIN: {params.row.groupEIN}
            </div>
          </div>
        );
      },
    },
    {
      field: 'practice',
      headerName: 'Practice',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline">
              {params.value}
            </div>
            <div
              className="text-xs font-normal leading-4 text-gray-500"
              onClick={() => {}}
            >
              {params.row.practiceAddress}
            </div>
          </div>
        );
      },
    },
    {
      field: 'provider',
      headerName: 'Provider',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline">
              {params.value}
            </div>
            <div
              className="text-xs font-normal leading-4 text-gray-500"
              onClick={() => {}}
            >
              NPI: {params.row.providerNPI}
            </div>
          </div>
        );
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
      field: 'insurancePaid',
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
      field: 'patientPaid',
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

  const [reportCollapseInfo, setReportCollapseInfo] = useState({
    summary: false,
    detail: false,
  });

  const downloadPdf = (pdfExportData: AgingInsuranceReportData) => {
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
    if (searchCriteria.insuranceName) {
      criteriaArray.push({
        Criteria: 'Insurance Name',
        Value: searchCriteria.insuranceName,
      });
    }
    if (searchCriteria.groupID) {
      const groupName = groupDropdown.filter(
        (m) => m.id === searchCriteria.groupID
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Group', Value: groupName || '' });
    }
    if (searchCriteria.fromBalance) {
      criteriaArray.push({
        Criteria: 'Balance >',
        Value: searchCriteria.fromBalance,
      });
    }
    if (searchCriteria.toBalance) {
      criteriaArray.push({
        Criteria: 'Balance <',
        Value: searchCriteria.toBalance,
      });
    }
    if (searchCriteria.fromDate) {
      criteriaArray.push({
        Criteria: 'From Date',
        Value: searchCriteria.fromDate,
      });
    }
    if (searchCriteria.toDate) {
      criteriaArray.push({ Criteria: 'To Date', Value: searchCriteria.toDate });
    }
    if (searchCriteria.agingType) {
      criteriaArray.push({
        Criteria: 'Aging Based On',
        Value:
          searchCriteria.agingType === 'dos'
            ? 'Date of Service'
            : 'Creation Date',
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
    const insuranceProfileDetails: PDFRowInput[] =
      pdfExportData.agingByInsuranceReportData.map((m) => {
        return {
          'Insurance Name': m.insurance,
          Current: currencyFormatter.format(m.current),
          '30+': currencyFormatter.format(m.thirtyPlus),
          '60+': currencyFormatter.format(m.sixtyPlus),
          '90+': currencyFormatter.format(m.nintyPlus),
          '120+': currencyFormatter.format(m.oneTwentyPlus),
          '180+': currencyFormatter.format(m.oneEightyPlus),
          Balance: currencyFormatter.format(m.balance),
        };
      });
    const dataColumns: PDFColumnInput[] = [];
    const keyNames =
      insuranceProfileDetails[0] && Object.keys(insuranceProfileDetails[0]);
    if (keyNames) {
      for (let i = 0; i < keyNames.length; i += 1) {
        dataColumns.push({ title: keyNames[i], dataKey: keyNames[i] });
      }
    }
    data.push({ columns: dataColumns, body: insuranceProfileDetails });
    // implement summary
    const summaryExportData: PDFRowInput[] = summaryData.map((n) => {
      return {
        'Total Current': currencyFormatter.format(n.totalCurrent),
        'Total 30+': currencyFormatter.format(n.totalThirtyPlus),
        'Total 60+': currencyFormatter.format(n.totalSixtyPlus),
        'Total 90+': currencyFormatter.format(n.totalNintyPlus),
        'Total 120+': currencyFormatter.format(n.totalOneTwentyPlus),
        'Total 180+': currencyFormatter.format(n.totalOneEightyPlus),
        'Total Balance': currencyFormatter.format(n.totalBalance),
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
    ExportDataToPDF(data, 'Aging by Insurance Report');
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
    const obj: AgingByInsuranceReportCriteria = {
      userID: searchCriteria.userID,
      groupID: searchCriteria.groupID,
      insuranceName: searchCriteria.insuranceName,
      fromBalance: searchCriteria.fromBalance,
      toBalance: searchCriteria.toBalance,
      fromDate: searchCriteria.fromDate,
      toDate: searchCriteria.toDate,
      agingType: searchCriteria.agingType,
      sortByColumn: '',
      sortOrder: '',
      pageNumber: undefined,
      pageSize: undefined,
      getAllData: true,
      getOnlyIDS: false,
    };
    const res = await getAgingInsuranceReportData(obj);
    if (res) {
      if (type === 'pdf') {
        downloadPdf(res);
      } else {
        const exportDataArray = res.agingByInsuranceReportData.map((n) => {
          return {
            'Insurance Name': n.insurance,
            Current: currencyFormatter.format(n.current),
            '30+': currencyFormatter.format(n.thirtyPlus),
            '60+': currencyFormatter.format(n.sixtyPlus),
            '90+': currencyFormatter.format(n.nintyPlus),
            '120+': currencyFormatter.format(n.oneTwentyPlus),
            '180+': currencyFormatter.format(n.oneEightyPlus),
            Balance: currencyFormatter.format(n.balance),
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
            'Insurance Name': 'Criteria',
            Current: 'Value',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Insurance Name': 'Insurance Name',
            Current: searchCriteria.insuranceName || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Insurance Name': 'Group',
            Current:
              groupDropdown.filter(
                (m) => m.id === Number(searchCriteria.groupID)
              )[0]?.value || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Insurance Name': 'Balance >',
            Current: searchCriteria.fromBalance?.toString() || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Insurance Name': 'Balance <',
            Current: searchCriteria.toBalance?.toString() || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Insurance Name': 'Date - From',
            Current: searchCriteria.fromDate || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Insurance Name': 'Date - To',
            Current: searchCriteria.toDate || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Insurance Name': 'Aging Based On',
            Current:
              searchCriteria.agingType === 'dos'
                ? 'Date of Service'
                : 'Creation Date',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Insurance Name': 'Summary',
            Current: '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Insurance Name': 'Type',
            Current: 'Amount',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Insurance Name': 'Total Current',
            Current:
              (res.summary[0] &&
                currencyFormatter.format(res.summary[0].totalCurrent)) ||
              '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Insurance Name': 'Total 30+',
            Current:
              (res.summary[0] &&
                currencyFormatter
                  .format(res.summary[0].totalThirtyPlus)
                  .toString()) ||
              '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Insurance Name': 'Total 60+',
            Current:
              (res.summary[0] &&
                currencyFormatter
                  .format(res.summary[0].totalSixtyPlus)
                  .toString()) ||
              '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Insurance Name': 'Total 90+',
            Current:
              (res.summary[0] &&
                currencyFormatter
                  .format(res.summary[0].totalNintyPlus)
                  .toString()) ||
              '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Insurance Name': 'Total 120+',
            Current:
              (res.summary[0] &&
                currencyFormatter
                  .format(res.summary[0].totalOneTwentyPlus)
                  .toString()) ||
              '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Insurance Name': 'Total 180+',
            Current:
              (res.summary[0] &&
                currencyFormatter
                  .format(res.summary[0].totalOneEightyPlus)
                  .toString()) ||
              '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Insurance Name': 'Total Balance',
            Current:
              (res.summary[0] &&
                currencyFormatter
                  .format(res.summary[0].totalBalance)
                  .toString()) ||
              '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Insurance Name': 'Aging by Insurance Report',
            Current: '',
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
            ExportDataToCSV(exportArray, 'AgingByInsuranceReport');
            dispatch(
              addToastNotification({
                text: 'Export Successful',
                toastType: ToastType.SUCCESS,
                id: '',
              })
            );
          } else {
            ExportDataToDrive(exportArray, 'AgingByInsuranceReport', dispatch);
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
    <AppLayout title="Nucleus - Aging Insurance Report">
      <div className="relative m-0 h-full bg-gray-100 p-0">
        <div className="m-0 h-full w-full overflow-y-scroll bg-gray-100 p-0">
          <div className="flex w-full flex-col">
            <div className="m-0 h-full w-full overflow-y-auto overflow-x-hidden bg-gray-100 p-0">
              <div className="h-[125px] w-full">
                <div className="absolute top-0 z-[11] w-full">
                  <Breadcrumbs />
                  <PageHeader>
                    <div className="flex items-start justify-between gap-4 bg-white px-7 pt-[33px] pb-[21px]">
                      <div className="flex h-[38px] gap-6">
                        <p className="self-center text-3xl font-bold text-cyan-700">
                          Aging by Insurance Report
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
                      <div className="flex w-full flex-wrap">
                        <div className="flex w-full gap-8">
                          <div className="w-[50%] lg:w-[20%]">
                            <div className="px-[5px] pb-[5px]">
                              <p className="text-base font-bold leading-normal text-gray-700">
                                Insurance Details
                              </p>
                            </div>
                            <div className="flex w-full flex-wrap">
                              <div className={`w-[100%] px-[5px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                    Insurance Name
                                  </div>
                                  <div className="w-full">
                                    <InputField
                                      value={searchCriteria.insuranceName}
                                      onChange={(evt) => {
                                        setSearchCriteriaFields({
                                          ...searchCriteria,
                                          insuranceName: evt.target.value,
                                        });
                                      }}
                                      placeholder="Insurance Name"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            className={
                              'hidden justify-center lg:flex lg:w-[1%]'
                            }
                          >
                            <div className={`w-[1px] h-full bg-gray-200`} />
                          </div>
                          <div className="w-[50%] lg:w-[20%]">
                            <div className="px-[5px] pb-[5px]">
                              <p className="text-base font-bold leading-normal text-gray-700">
                                Location
                              </p>
                            </div>
                            <div className="flex w-full flex-wrap">
                              <div className={`w-[100%] px-[5px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                    Group
                                  </div>
                                  <div className="w-full">
                                    <SingleSelectDropDown
                                      placeholder="Search group"
                                      showSearchBar={true}
                                      disabled={false}
                                      data={
                                        groupDropdown as SingleSelectDropDownDataType[]
                                      }
                                      selectedValue={
                                        groupDropdown.filter(
                                          (f) =>
                                            f.id === searchCriteria?.groupID
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
                            </div>
                          </div>
                          <div className={'px-[15px]'}>
                            <div className={`w-[1px] h-full bg-gray-200`} />
                          </div>
                          <div className="w-[50%] lg:w-[50%] ">
                            <div className="px-[5px] pb-[5px]">
                              <p className="text-base font-bold leading-normal text-gray-700">
                                Balance
                              </p>
                            </div>
                            <div className="flex w-full flex-wrap pl-[5px]">
                              <div className={`w-[37%] pr-[5px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                    Balance Amount Greater or Equal to
                                  </div>
                                  <div className="w-full">
                                    <InputField
                                      placeholder="-"
                                      value={searchCriteria?.fromBalance}
                                      onChange={(evt) => {
                                        setSearchCriteriaFields({
                                          ...searchCriteria,
                                          fromBalance: evt.target.value
                                            ? Number(evt.target.value)
                                            : undefined,
                                        });
                                      }}
                                      type={'number'}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className={`w-[37%] pl-[10px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                    Balance Amount Less or Equal to
                                  </div>
                                  <div className="w-full">
                                    <InputField
                                      placeholder="-"
                                      value={searchCriteria?.toBalance}
                                      onChange={(evt) => {
                                        setSearchCriteriaFields({
                                          ...searchCriteria,
                                          toBalance: evt.target.value
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
                          </div>
                        </div>
                        <div className="w-full">
                          <div className={'py-[15px] '}>
                            <div className={`h-[1px] w-full bg-gray-200`} />
                          </div>
                          <div className="w-[50%] lg:w-[70%]">
                            <div className="px-[5px] pb-[5px]">
                              <p className="text-base font-bold leading-normal text-gray-700">
                                Date
                              </p>
                            </div>
                            <div className="flex w-full flex-wrap pl-[5px]">
                              <div className={`w-[20%] pr-[5px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                    Date - From
                                  </div>
                                  <div className="w-full">
                                    <AppDatePicker
                                      cls="!mt-1"
                                      selected={searchCriteria?.fromDate}
                                      onChange={(value) => {
                                        setSearchCriteriaFields({
                                          ...searchCriteria,
                                          fromDate: value
                                            ? DateToStringPipe(value, 1)
                                            : '',
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className={`w-[20%] pl-[10px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                    Date - To
                                  </div>
                                  <div className="w-full">
                                    <AppDatePicker
                                      cls="!mt-1"
                                      selected={searchCriteria?.toDate}
                                      onChange={(value) => {
                                        setSearchCriteriaFields({
                                          ...searchCriteria,
                                          toDate: DateToStringPipe(value, 1)
                                            ? DateToStringPipe(value, 1)
                                            : '',
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className={`w-[50%] px-[20px] lg:w-[40%]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                    Aging Based On:
                                  </div>
                                  <div className="mt-[4px]  flex h-[38px] w-full items-center">
                                    <RadioButton
                                      data={[
                                        {
                                          value: 'dos',
                                          label: 'Date of Service',
                                        },
                                        {
                                          value: 'created_on',
                                          label: 'Creation Date',
                                        },
                                      ]}
                                      checkedValue={
                                        searchCriteria.agingType
                                          ? searchCriteria.agingType
                                          : 'dos'
                                      }
                                      onChange={(e) => {
                                        setSearchCriteriaFields({
                                          ...searchCriteria,
                                          agingType: e.target.value,
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
                    <div className={'px-[15px]'}>
                      <div className={`w-[1px] h-[35px] bg-gray-300`} />
                    </div>

                    <div className={'hidden justify-center lg:flex lg:w-[1%]'}>
                      <div className={`w-[1px] h-full bg-gray-900`} />
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
              <div className="w-full gap-4 bg-white px-7 pt-[25px] pb-[15px]">
                <div className="w-full gap-4 bg-white  pt-[25px] pb-[15px]">
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
                  <div className="mt-[40px] mb-[20px] w-full">
                    <div
                      hidden={reportCollapseInfo.summary}
                      className="w-full drop-shadow-lg"
                    >
                      <AppTable
                        cls="max-h-[400px] !w-[700px]"
                        renderHead={
                          <>
                            <AppTableRow>
                              <AppTableCell cls="!font-bold !text-gray-600 !py-2 !whitespace-nowrap !px-4">
                                Aging Type
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !text-gray-600 !py-2 !whitespace-nowrap !px-4">
                                Amount
                              </AppTableCell>
                            </AppTableRow>
                          </>
                        }
                        renderBody={
                          <>
                            <AppTableRow>
                              <AppTableCell cls="!font-bold">
                                Total Current
                              </AppTableCell>
                              <AppTableCell>
                                {(summaryData[0]?.totalCurrent ||
                                  summaryData[0]?.totalCurrent === 0) &&
                                  currencyFormatter.format(
                                    summaryData[0]?.totalCurrent
                                  )}
                              </AppTableCell>
                            </AppTableRow>
                            <AppTableRow>
                              <AppTableCell cls="!font-bold">
                                Total 30+
                              </AppTableCell>
                              <AppTableCell>
                                {(summaryData[0]?.totalThirtyPlus ||
                                  summaryData[0]?.totalThirtyPlus === 0) &&
                                  currencyFormatter.format(
                                    summaryData[0]?.totalThirtyPlus
                                  )}
                              </AppTableCell>
                            </AppTableRow>
                            <AppTableRow>
                              <AppTableCell cls="!font-bold">
                                Total 60+
                              </AppTableCell>
                              <AppTableCell>
                                {(summaryData[0]?.totalSixtyPlus ||
                                  summaryData[0]?.totalSixtyPlus === 0) &&
                                  currencyFormatter.format(
                                    summaryData[0]?.totalSixtyPlus
                                  )}
                              </AppTableCell>
                            </AppTableRow>
                            <AppTableRow>
                              <AppTableCell cls="!font-bold">
                                Total 90+
                              </AppTableCell>
                              <AppTableCell>
                                {(summaryData[0]?.totalNintyPlus ||
                                  summaryData[0]?.totalNintyPlus === 0) &&
                                  currencyFormatter.format(
                                    summaryData[0]?.totalNintyPlus
                                  )}
                              </AppTableCell>
                            </AppTableRow>
                            <AppTableRow>
                              <AppTableCell cls="!font-bold">
                                Total 120+
                              </AppTableCell>
                              <AppTableCell>
                                {(summaryData[0]?.totalOneTwentyPlus ||
                                  summaryData[0]?.totalOneTwentyPlus === 0) &&
                                  currencyFormatter.format(
                                    summaryData[0]?.totalOneTwentyPlus
                                  )}
                              </AppTableCell>
                            </AppTableRow>
                            <AppTableRow>
                              <AppTableCell cls="!font-bold">
                                Total 180+
                              </AppTableCell>
                              <AppTableCell>
                                {(summaryData[0]?.totalOneEightyPlus ||
                                  summaryData[0]?.totalOneEightyPlus === 0) &&
                                  currencyFormatter.format(
                                    summaryData[0]?.totalOneEightyPlus
                                  )}
                              </AppTableCell>
                            </AppTableRow>
                          </>
                        }
                      />
                      <AppTable
                        cls="max-h-[400px] !w-[700px] mt-3.5"
                        renderHead={undefined}
                        renderBody={
                          <>
                            <AppTableRow cls="bg-cyan-50">
                              <AppTableCell cls="!font-bold !text-cyan-500">
                                Total Balance
                              </AppTableCell>
                              <AppTableCell>
                                {(summaryData[0]?.totalBalance ||
                                  summaryData[0]?.totalBalance === 0) &&
                                  currencyFormatter.format(
                                    summaryData[0]?.totalBalance
                                  )}
                              </AppTableCell>
                            </AppTableRow>
                          </>
                        }
                      />
                    </div>
                  </div>
                </div>
                <SectionHeading
                  label="Report Details"
                  isCollapsable={true}
                  hideBottomDivider
                  onClick={() => {
                    setReportCollapseInfo({
                      ...reportCollapseInfo,
                      detail: !reportCollapseInfo.detail,
                    });
                  }}
                  isCollapsed={reportCollapseInfo.detail}
                />
                <div className="flex w-full flex-col rounded-lg pt-[20px]">
                  <div hidden={reportCollapseInfo.detail} className="h-full">
                    <SearchDetailGrid
                      pageNumber={lastSearchCriteria.pageNumber}
                      pageSize={lastSearchCriteria.pageSize}
                      totalCount={totalCount}
                      rows={searchResult}
                      showTableHeading={false}
                      columns={columns}
                      persistLayoutId={31}
                      checkboxSelection={false}
                      onPageChange={(page: number) => {
                        const obj: AgingByInsuranceReportCriteria = {
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
                          const obj: AgingByInsuranceReportCriteria = {
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
                          const obj: AgingByInsuranceReportCriteria = {
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
              <Modal
                open={isAgingInsuranceDetailModalOpen}
                onClose={() => {
                  setAgingInsuranceDetailsData([]);
                  setAgingInsuranceDetailsTotalCount(0);
                  setIsAgingInsuranceDetailModalOpen(false);
                }}
                modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
                modalBackgroundClassName={'!overflow-hidden'}
              >
                <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-gray-100 shadow">
                  <div className="flex w-full flex-col items-start justify-start p-6">
                    <div className="inline-flex w-full items-center justify-between">
                      <div className="flex items-center justify-start space-x-2">
                        <p className="text-xl font-bold leading-7 text-gray-700">
                          Timeframe Details
                        </p>
                      </div>
                      <CloseButton
                        onClick={() => {
                          setAgingInsuranceDetailsData([]);
                          setAgingInsuranceDetailsTotalCount(0);
                          setIsAgingInsuranceDetailModalOpen(false);
                        }}
                      />
                    </div>
                  </div>
                  <div className={'w-full px-6'}>
                    <div className={`h-[1px] w-full bg-gray-300`} />
                  </div>
                  <div className="w-full flex-1 overflow-y-auto bg-gray-100">
                    <div className="flex">
                      <div className="w-full self-center break-words p-6 text-justify text-sm text-gray-500">
                        <SearchDetailGrid
                          showTableHeading={false}
                          totalCount={agingInsuranceDetailsTotalCount}
                          rows={
                            agingInsuranceDetailsData?.map((row) => {
                              return { ...row, id: row.claimID };
                            }) || []
                          }
                          columns={agingInsuranceTimeframeColumns}
                          checkboxSelection={false}
                          paginationMode={'client'}
                          setHeaderRadiusCSS={true}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-center rounded-b-lg bg-gray-100 py-6"></div>
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
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
export default AgingInsuranceReport;
