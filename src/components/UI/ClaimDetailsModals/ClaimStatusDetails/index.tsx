import type { GridColDef } from '@mui/x-data-grid-pro';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import Icon from '@/components/Icon';
import Button, { ButtonType } from '@/components/UI/Button';
import Modal from '@/components/UI/Modal';
import store from '@/store';
import { addToastNotification } from '@/store/shared/actions';
import {
  fetchClaimStatusHistoryDetails,
  fetchRealTimeClaimStatusDetails,
  getClaimStatusHistoryViewDetails,
  getRealTimeClaimStatusViewDetails,
  requestUpdateRealTimeClaim,
} from '@/store/shared/sagas';
import type {
  GetClaimStatusHistoryDetailResult,
  GetClaimStatusHistoryViewDetailResult,
  GetRealTimeClaimStatusResult,
  GetRealTimeClaimStatusViewDetailResult,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import type {
  DownloadDataPDFDataType,
  PDFColumnInput,
  PDFRowInput,
} from '@/utils';
import { ExportDataToPDF } from '@/utils';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

import CloseButton from '../../CloseButton';
import SearchDetailGrid from '../../SearchDetailGrid';
import SectionHeading from '../../SectionHeading';

export interface IClaimStatusDetailsProps {
  claimID: number;
}

export default function ClaimDNA({ claimID }: IClaimStatusDetailsProps) {
  const [claimStatusDetailCollapseInfo, setClaimStatusDetailCollapseInfo] =
    useState({
      realTimeClaim: false,
      claimStatus: false,
    });
  const [claimStatusHistory, setClaimStatusHistory] =
    useState<GetClaimStatusHistoryDetailResult[]>();
  const [realTimeClaimStatusData, setRealTimeClaimStatusData] =
    useState<GetRealTimeClaimStatusResult[]>();
  const [viewClaimStatusHistoryData, setViewClaimStatusHistoryData] =
    useState<GetClaimStatusHistoryViewDetailResult[]>();
  const [
    viewRealTimeClaimStatusHistoryData,
    setViewRealTimeClaimStatusHistoryData,
  ] = useState<GetRealTimeClaimStatusViewDetailResult[]>();

  const [viewClaimHistoryModal, setViewClaimHistoryModal] = useState(false);
  const [viewRealTimeClaimStatusModal, setViewRealTimeClaimStatusModal] =
    useState(false);

  const getClaimStatusHistory = async (id: number) => {
    const res = await fetchClaimStatusHistoryDetails(id);
    if (res) {
      setClaimStatusHistory(res);
    }
  };
  const getRealTimeClaimStatusData = async (id: number) => {
    const res = await fetchRealTimeClaimStatusDetails(id);
    if (res) {
      setRealTimeClaimStatusData(res);
    }
  };

  const initScreen = async (id: number) => {
    getClaimStatusHistory(id);
    getRealTimeClaimStatusData(id);
  };

  useEffect(() => {
    if (claimID) initScreen(claimID);
  }, []);

  const viewRealTimeClaimStatusDetails = async (id: number) => {
    const res = await getRealTimeClaimStatusViewDetails(id);
    if (res) {
      setViewRealTimeClaimStatusHistoryData(res);
      setViewRealTimeClaimStatusModal(true);
    }
  };

  const viewClaimStatusHistoryDetails = async (id: number) => {
    const res = await getClaimStatusHistoryViewDetails(id);
    if (res) {
      setViewClaimStatusHistoryData(res);
      setViewClaimHistoryModal(true);
    }
  };

  const requestUpdate = async () => {
    const res = await requestUpdateRealTimeClaim(claimID);
    if (res && res.length > 0) {
      store.dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Request updated successfully.',
          toastType: ToastType.SUCCESS,
        })
      );
      getRealTimeClaimStatusData(claimID);
    }
  };

  const columnsRealTimeClaimStatus: GridColDef[] = [
    {
      field: 'statusID',
      headerName: 'Status ID',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="cursor-pointer text-gray-500" onClick={() => {}}>
            {`#${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Current Status',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
    },
    {
      field: 'statusTime',
      headerName: 'Status Time Stamp',
      flex: 1,
      minWidth: 225,
      disableReorder: true,
    },
    {
      field: 'lastValidation',
      headerName: 'Last Validation',
      flex: 1,
      minWidth: 225,
      disableReorder: true,
    },
    {
      field: 'createdOn',
      headerName: 'Created On',
      flex: 1,
      minWidth: 200,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="text-gray-500" onClick={() => {}}>
            {`${DateToStringPipe(params.value, 6)}`}
          </div>
        );
      },
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500 underline"
            onClick={() => {}}
          >
            {`${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'action',
      headerName: 'Actions',
      flex: 1,
      minWidth: 190,
      hideSortIcons: true,
      disableReorder: true,
      cellClassName: '!bg-cyan-50 PinnedColumLeftBorder',
      headerClassName: '!bg-cyan-100 !text-center PinnedColumLeftBorder',
      renderCell: (params) => {
        return (
          <div className="flex flex-row gap-2">
            <Button
              buttonType={ButtonType.primary}
              cls={`!w-[139px] !h-[30px] pl-[9px] pr-[11px] py-[7px] inline-flex px-4 py-2 gap-2 leading-5 !rounded`}
              onClick={() => {
                viewRealTimeClaimStatusDetails(params.row.statusID);
              }}
            >
              <div className="flex h-4 w-4 items-center justify-center px-[0.37px] py-[2.40px]">
                <Icon name={'eyeWhite'} size={18} />
              </div>
              <div className="text-s min-w-[85px] font-medium leading-none">
                View Details
              </div>
            </Button>
          </div>
        );
      },
    },
  ];

  const columnsClaimStatusHistory: GridColDef[] = [
    {
      field: 'statusID',
      headerName: 'Status ID',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="cursor-pointer text-gray-500" onClick={() => {}}>
            {`#${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'logID',
      headerName: 'Log ID',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="cursor-pointer text-gray-500" onClick={() => {}}>
            {`#${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'source',
      headerName: 'Source',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
    },
    {
      field: 'receiveDate',
      headerName: 'Receive Date',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
    },
    {
      field: 'reportDate',
      headerName: 'Report Date',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'createdOn',
      headerName: 'Created On',
      flex: 1,
      minWidth: 200,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="text-gray-500" onClick={() => {}}>
            {`${DateToStringPipe(params.value, 6)}`}
          </div>
        );
      },
    },
    {
      field: 'action',
      headerName: 'Actions',
      flex: 1,
      minWidth: 190,
      hideSortIcons: true,
      disableReorder: true,
      cellClassName: '!bg-cyan-50 PinnedColumLeftBorder',
      headerClassName: '!bg-cyan-100 !text-center PinnedColumLeftBorder',
      renderCell: (params) => {
        return (
          <div className="flex flex-row gap-2">
            <Button
              buttonType={ButtonType.primary}
              cls={`!w-[139px] !h-[30px] pl-[9px] pr-[11px] py-[7px] inline-flex px-4 py-2 gap-2 leading-5 !rounded`}
              onClick={() => {
                viewClaimStatusHistoryDetails(params.row.statusID);
              }}
            >
              <div className="flex h-4 w-4 items-center justify-center px-[0.37px] py-[2.40px]">
                <Icon name={'eyeWhite'} size={18} />
              </div>
              <div className="text-s min-w-[85px] font-medium leading-none">
                View Details
              </div>
            </Button>
          </div>
        );
      },
    },
  ];

  const columnsViewDetailsClaimStatusHistory: GridColDef[] = [
    {
      field: 'statusID',
      headerName: 'Status ID',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="cursor-pointer text-gray-500" onClick={() => {}}>
            {`#${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'categoryCode',
      headerName: 'Category Code',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
    },
    {
      field: 'statusCode',
      headerName: 'Status Code',
      flex: 1,
      minWidth: 225,
      disableReorder: true,
    },
    {
      field: 'entityIdentifierCode',
      headerName: 'Entity Identifier Code',
      flex: 1,
      minWidth: 225,
      disableReorder: true,
    },
    {
      field: 'freeFormText',
      headerName: 'Claim Free Form Text',
      flex: 1,
      minWidth: 200,
      disableReorder: true,
    },
  ];

  const downloadRealTimeCliamStatusViewPDF = () => {
    if (
      viewRealTimeClaimStatusHistoryData &&
      viewRealTimeClaimStatusHistoryData?.length < 0
    ) {
      store.dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'No record to export.',
          toastType: ToastType.ERROR,
        })
      );
    } else if (viewRealTimeClaimStatusHistoryData) {
      const data: DownloadDataPDFDataType[] = [];
      // implement data
      const claimHistoryViewData: PDFRowInput[] =
        viewRealTimeClaimStatusHistoryData.map((m) => {
          return {
            'Event Type': m.eventType,
            Color: m.color,
            Description: m.description,
            'Time Stamp': m.timeStamp,
            User: m.user,
          };
        });
      const dataColumns: PDFColumnInput[] = [];
      const keyNames =
        claimHistoryViewData[0] && Object.keys(claimHistoryViewData[0]);
      if (keyNames) {
        for (let i = 0; i < keyNames.length; i += 1) {
          dataColumns.push({ title: keyNames[i], dataKey: keyNames[i] });
        }
      }
      data.push({ columns: dataColumns, body: claimHistoryViewData });
      ExportDataToPDF(
        data,
        `Ability's Real-Time Claim Status History - Claim #${claimID}`
      );
      store.dispatch(
        addToastNotification({
          text: 'Download successful',
          toastType: ToastType.SUCCESS,
          id: '',
        })
      );
    }
  };
  const dowloadClaimHistoryViewDetailsPDF = () => {
    if (viewClaimStatusHistoryData && viewClaimStatusHistoryData?.length < 0) {
      store.dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'No record to export.',
          toastType: ToastType.ERROR,
        })
      );
    } else if (viewClaimStatusHistoryData) {
      const data: DownloadDataPDFDataType[] = [];
      // implement data
      const claimHistoryViewData: PDFRowInput[] =
        viewClaimStatusHistoryData.map((m) => {
          return {
            'Status ID': m.statusID,
            'Category Code': m.categoryCode,
            'Status Code': m.statusCode,
            'Entity Identifier Code': m.entityIdentifierCode,
            'Claim Free Form Text': m.freeFormText,
          };
        });
      const dataColumns: PDFColumnInput[] = [];
      const keyNames =
        claimHistoryViewData[0] && Object.keys(claimHistoryViewData[0]);
      if (keyNames) {
        for (let i = 0; i < keyNames.length; i += 1) {
          dataColumns.push({ title: keyNames[i], dataKey: keyNames[i] });
        }
      }
      data.push({ columns: dataColumns, body: claimHistoryViewData });
      ExportDataToPDF(
        data,
        `Claim Status Details - Status ID #${viewClaimStatusHistoryData?.[0]?.statusID}`
      );
      store.dispatch(
        addToastNotification({
          text: 'Download successful',
          toastType: ToastType.SUCCESS,
          id: '',
        })
      );
    }
  };

  return (
    <div className="flex w-full flex-col">
      <div className="mb-5 flex w-full gap-4">
        <div className="inline-flex items-center justify-start space-x-2 pt-6 pl-5">
          <p className="text-xl font-bold leading-7 text-gray-700">
            Claim Status Details
          </p>
        </div>
      </div>
      <div className="pl-6 pt-3">
        <SectionHeading
          label="Real-Time Claim Status"
          isCollapsable={true}
          hideBottomDivider
          onClick={() => {
            setClaimStatusDetailCollapseInfo({
              ...claimStatusDetailCollapseInfo,
              realTimeClaim: !claimStatusDetailCollapseInfo.realTimeClaim,
            });
          }}
          isCollapsed={claimStatusDetailCollapseInfo.realTimeClaim}
          rightContent={
            <Button
              buttonType={ButtonType.primary}
              cls={`inline-flex px-4 py-2 gap-2 leading-5 bg-cyan-500`}
              onClick={() => {
                requestUpdate();
              }}
            >
              <div className="flex h-4 w-4 items-center justify-center px-[0.37px] py-[2.40px]">
                <Icon name={'request'} size={18} />
              </div>
              <p className="text-s mt-[2px] self-center font-medium leading-4">
                Request Update
              </p>
            </Button>
          }
        />
        <div className="mt-[65px] mb-[60px] w-full">
          <div
            hidden={claimStatusDetailCollapseInfo.realTimeClaim}
            className="w-full drop-shadow-lg"
          >
            <SearchDetailGrid
              hideHeader={true}
              hideFooter={true}
              totalCount={realTimeClaimStatusData?.length}
              rows={
                realTimeClaimStatusData?.map((row) => {
                  return { ...row, id: row.statusID };
                }) || []
              }
              columns={columnsRealTimeClaimStatus}
              checkboxSelection={false}
              // paginationMode={'client'}
              pinnedColumns={{
                right: ['action'],
              }}
              setHeaderRadiusCSS={true}
            />
          </div>
        </div>
        <SectionHeading
          label="Claim Status History"
          isCollapsable={true}
          hideBottomDivider
          onClick={() => {
            setClaimStatusDetailCollapseInfo({
              ...claimStatusDetailCollapseInfo,
              claimStatus: !claimStatusDetailCollapseInfo.claimStatus,
            });
          }}
          isCollapsed={claimStatusDetailCollapseInfo.claimStatus}
        />
        <div className="flex w-full flex-col pt-[30px]">
          <div
            hidden={claimStatusDetailCollapseInfo.claimStatus}
            className="h-full"
          >
            <SearchDetailGrid
              totalCount={claimStatusHistory?.length}
              rows={
                claimStatusHistory?.map((row) => {
                  return { ...row, id: row.statusID };
                }) || []
              }
              columns={columnsClaimStatusHistory}
              checkboxSelection={false}
              paginationMode={'client'}
              pinnedColumns={{
                right: ['action'],
              }}
            />
          </div>
        </div>
      </div>
      <Modal
        open={viewRealTimeClaimStatusModal}
        onClose={() => {}}
        modalContentClassName="h-[calc(100%-60px)] w-[calc(100%-350px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
        modalBackgroundClassName={'!overflow-hidden'}
      >
        <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-gray-100 shadow">
          <div className="flex w-full flex-col items-start justify-start p-6">
            <div className="inline-flex w-full items-center justify-between">
              <div className="flex items-center justify-start space-x-2">
                <p className="text-xl font-bold leading-7 text-gray-700">
                  {`Ability's Real-Time Claim Status History - Claim #${claimID}`}
                </p>
              </div>
              <CloseButton
                onClick={() => {
                  setViewRealTimeClaimStatusModal(false);
                }}
              />
            </div>
          </div>
          <div className={'w-full px-6'}>
            <div className={`h-[1px] w-full bg-gray-300`} />
          </div>
          <div className="w-full flex-1 overflow-y-auto bg-white">
            <div className="flex">
              <div className="w-full self-center break-words px-[25px] py-6 text-justify text-sm text-gray-500">
                <div className="pb-3 text-sm font-bold leading-tight text-gray-600">
                  Events List
                </div>
                {viewRealTimeClaimStatusHistoryData?.map((d) => {
                  return (
                    <>
                      <div className="mb-4 inline-flex h-full w-full flex-col items-start justify-start gap-4 rounded-md border border-gray-300 bg-gray-50 p-4">
                        <div className="inline-flex items-center justify-start gap-1">
                          <div className="text-xs font-medium uppercase leading-none tracking-wide text-gray-500">
                            Event Type:
                          </div>
                          <div className="flex items-center justify-center rounded bg-cyan-100 px-3 py-0.5">
                            <div className="text-center text-sm font-medium leading-tight text-cyan-700">
                              {d.eventType}
                            </div>
                          </div>
                        </div>
                        <div className="h-[0px] self-stretch border border-gray-200"></div>
                        <div className="inline-flex items-start justify-start gap-4 self-stretch">
                          <div className="flex items-center justify-start gap-1">
                            <div className="text-xs font-medium uppercase leading-none tracking-wide text-gray-500">
                              Description:
                            </div>
                            <div className="flex items-center justify-center rounded border border-gray-300 bg-gray-100 px-2.5 py-0.5">
                              <div className="text-center text-xs font-medium leading-none text-gray-800">
                                {d.description}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-start gap-1">
                            <div className="text-xs font-medium uppercase leading-none tracking-wide text-gray-500">
                              Time Stamp:
                            </div>
                            <div className="flex items-center justify-center rounded border border-gray-300 bg-gray-100 px-2.5 py-0.5">
                              <div className="text-center text-xs font-medium leading-none text-gray-800">
                                {d.timeStamp}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-start gap-1">
                            <div className="text-xs font-medium uppercase leading-none tracking-wide text-gray-500">
                              User:
                            </div>
                            <div className="flex items-center justify-center rounded border border-gray-300 bg-gray-100 px-2.5 py-0.5">
                              <div className="text-center text-xs font-medium leading-none text-gray-800">
                                {d.user}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex w-full items-center justify-center rounded-b-lg bg-gray-200 py-6">
            <div className="flex w-full items-center justify-end space-x-4 px-7">
              <Button
                buttonType={ButtonType.secondary}
                cls={`w-[102px]`}
                onClick={() => {
                  setViewRealTimeClaimStatusModal(false);
                }}
              >
                Close
              </Button>
              <Button
                buttonType={ButtonType.primary}
                onClick={async () => {
                  downloadRealTimeCliamStatusViewPDF();
                }}
              >
                Download
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        open={viewClaimHistoryModal}
        onClose={() => {}}
        modalContentClassName="h-[calc(100%-120px)] w-[calc(100%-350px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
        modalBackgroundClassName={'!overflow-hidden'}
      >
        <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-gray-100 shadow">
          <div className="flex w-full flex-col items-start justify-start p-6">
            <div className="inline-flex w-full items-center justify-between">
              <div className="flex items-center justify-start space-x-2">
                <p className="text-xl font-bold leading-7 text-gray-700">
                  Claim Status Detail - Status ID #
                  {viewClaimStatusHistoryData?.[0]?.statusID}
                </p>
              </div>
              <CloseButton
                onClick={() => {
                  setViewClaimHistoryModal(false);
                }}
              />
            </div>
          </div>
          <div className={'w-full px-6'}>
            <div className={`h-[1px] w-full bg-gray-300`} />
          </div>
          <div className="w-full flex-1 overflow-y-auto bg-white">
            <div className="flex">
              <div className="w-full self-center break-words px-[25px] py-8 text-justify text-sm text-gray-500">
                <SearchDetailGrid
                  hideHeader={true}
                  hideFooter={true}
                  totalCount={viewClaimStatusHistoryData?.length}
                  rows={viewClaimStatusHistoryData || []}
                  columns={columnsViewDetailsClaimStatusHistory}
                  checkboxSelection={false}
                  // paginationMode={'client'}
                  // pinnedColumns={{
                  //   right: ['action'],
                  // }}
                  setHeaderRadiusCSS={true}
                />
              </div>
            </div>
          </div>
          <div className="flex w-full items-center justify-center rounded-b-lg bg-gray-200 py-6">
            <div className="flex w-full items-center justify-end space-x-4 px-7">
              <Button
                buttonType={ButtonType.secondary}
                cls={`w-[102px]`}
                onClick={() => {
                  setViewClaimHistoryModal(false);
                }}
              >
                Close
              </Button>
              <Button
                buttonType={ButtonType.primary}
                onClick={async () => {
                  dowloadClaimHistoryViewDetailsPDF();
                }}
              >
                Download
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
