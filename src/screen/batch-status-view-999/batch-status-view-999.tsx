import type { GridColDef } from '@mui/x-data-grid-pro';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Icon from '@/components/Icon';
import Button, { ButtonType } from '@/components/UI/Button';
import CloseButton from '@/components/UI/CloseButton';
import Modal from '@/components/UI/Modal';
import SearchDetailGrid from '@/components/UI/SearchDetailGrid';
import { addToastNotification } from '@/store/shared/actions';
import {
  getSubmissionBatchReportStatus,
  getSubmissionBatchStatusDetailByID,
} from '@/store/shared/sagas';
import type { GetPaymentBatchStatusResult } from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';

interface TProps {
  open: boolean;
  id: number | undefined;
  type: string;
  onClose: () => void;
}

export default function BatchStatusView999({
  open,
  id,
  type,
  onClose,
}: TProps) {
  const dispatch = useDispatch();
  const [getPaymentBatchStatusResult, setGetPaymentBatchStatusResult] =
    useState<GetPaymentBatchStatusResult[]>([]);
  const [batchStatusDetailData, setBatchStatusDetailData] = useState<{
    id: any;
    html: '';
  }>();

  const viewBatchStatus = async (_id: number) => {
    const res = await getSubmissionBatchReportStatus(_id, type);
    if (res) {
      setGetPaymentBatchStatusResult(res);
    } else {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Data not found.',
          toastType: ToastType.ERROR,
        })
      );
    }
  };

  useEffect(() => {
    if (id) viewBatchStatus(id);
  }, [id]);

  const viewBatchStatusDetailByID = async (params: any) => {
    const res = await getSubmissionBatchStatusDetailByID(params.row.statusID);
    if (res?.batchStatusHTML) {
      setBatchStatusDetailData({
        id: params.row.statusID,
        html: res?.batchStatusHTML,
      });
    } else {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Data not found.',
          toastType: ToastType.ERROR,
        })
      );
    }
  };

  const columns2: GridColDef[] = [
    {
      field: 'statusID',
      headerName: 'Status ID',
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
      field: 'submissionBatchID',
      headerName: 'Submission Batch ID',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="flex flex-col">
              <div className="text-sm font-normal leading-5">
                {params.value}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      field: 'functionalIdentifier',
      headerName: 'Functional Identifier',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="text-sm font-normal leading-5">{params.value}</div>
          </div>
        );
      },
    },
    {
      field: 'resultStatus',
      headerName: 'Result Status',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="text-sm font-normal leading-5">{params.value}</div>
          </div>
        );
      },
    },
    {
      field: 'noOfTransactionSets',
      headerName: 'No Of Transaction Sets',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="text-sm font-normal leading-5">{params.value}</div>
          </div>
        );
      },
    },
    {
      field: 'noOfReceivedTransactionSets',
      headerName: 'No Of Received Transaction Sets',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="text-sm font-normal leading-5">{params.value}</div>
          </div>
        );
      },
    },
    {
      field: 'noOfAcceptedTransactionSets',
      headerName: 'No Of Accepted Transaction Sets',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="text-sm font-normal leading-5">{params.value}</div>
          </div>
        );
      },
    },
    {
      field: 'action',
      headerName: 'Actions',
      flex: 1,
      minWidth: 125,
      hideSortIcons: true,
      disableReorder: true,
      cellClassName: '!bg-cyan-50 PinnedColumLeftBorder',
      headerClassName: '!bg-cyan-100 !text-center PinnedColumLeftBorder',
      renderCell: (params) => {
        return (
          <div className="flex flex-row gap-2">
            <Button
              buttonType={ButtonType.primary}
              cls={`!w-[80px] !h-[30px] pl-[9px] pr-[11px] py-[7px] inline-flex px-4 py-2 gap-2 leading-5 bg-cyan-500 !rounded`}
              onClick={() => {
                viewBatchStatusDetailByID(params);
              }}
            >
              <div className="flex h-4 w-4 items-center justify-center px-[0.37px] py-[2.40px]">
                <Icon name={'eyeWhite'} size={18} />
              </div>
              <div className="min-w-[30px] text-xs font-medium leading-none text-white">
                View
              </div>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Modal
        open={open}
        onClose={() => {}}
        modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
        modalBackgroundClassName={'!overflow-hidden'}
        modalClassName={'!z-[13]'}
      >
        <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-white shadow">
          <div className="flex w-full flex-col items-start justify-start px-6 py-4">
            <div className="inline-flex w-full items-center justify-between">
              <div className="flex items-center justify-start space-x-2">
                <p className="text-xl font-bold leading-7 text-cyan-600">
                  Status (999)
                </p>
              </div>
              <div className="inline-flex items-center gap-4">
                <CloseButton
                  onClick={() => {
                    onClose();
                  }}
                />
              </div>
            </div>
          </div>
          <div className={'w-full px-6'}>
            <div className={`h-[1px] w-full bg-gray-300`} />
          </div>
          <div className="w-full flex-1 overflow-y-auto bg-white">
            <div className="w-full gap-4 bg-white px-7 pt-[25px] pb-[15px]">
              <div className="flex w-full flex-col">
                <div className="h-full">
                  <SearchDetailGrid
                    showTableHeading={false}
                    totalCount={getPaymentBatchStatusResult.length}
                    rows={getPaymentBatchStatusResult}
                    columns={columns2}
                    checkboxSelection={false}
                    paginationMode={'client'}
                    setHeaderRadiusCSS={true}
                    pinnedColumns={{
                      right: ['action'],
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-full items-center justify-center rounded-b-lg bg-gray-200 py-6">
            <div className="flex w-full items-center justify-end space-x-4 px-7">
              <Button
                buttonType={ButtonType.secondary}
                cls={`w-[102px]`}
                onClick={() => {
                  onClose();
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!batchStatusDetailData?.html}
        onClose={() => {}}
        modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
        modalBackgroundClassName={'!overflow-hidden'}
        modalClassName={'!z-[14]'}
        hideBackdrop
      >
        <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-white shadow">
          <div className="flex w-full flex-col items-start justify-start px-6 py-4">
            <div className="inline-flex w-full items-center justify-between">
              <div className="flex items-center justify-start space-x-2">
                <p className="text-xl font-bold leading-7 text-cyan-600">
                  Status (999) Detail - ID#{batchStatusDetailData?.id}
                </p>
              </div>
              <div className="inline-flex items-center gap-4">
                <CloseButton
                  onClick={() => {
                    setBatchStatusDetailData(undefined);
                  }}
                />
              </div>
            </div>
          </div>
          <div className={'w-full px-6'}>
            <div className={`h-[1px] w-full bg-gray-300`} />
          </div>
          <div className="w-full flex-1 overflow-y-auto bg-white">
            <div className="flex">
              <div className="h-full w-full self-center break-words p-7 text-justify text-sm text-gray-500">
                <div
                  dangerouslySetInnerHTML={{
                    __html: batchStatusDetailData?.html || '',
                  }}
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
                  setBatchStatusDetailData(undefined);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
