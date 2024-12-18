import type { GridColDef, GridColTypeDef } from '@mui/x-data-grid-pro';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Icon from '@/components/Icon';
import Tabs from '@/components/OrganizationSelector/Tabs';
import Badge from '@/components/UI/Badge';
import Button, { ButtonType } from '@/components/UI/Button';
import { ViewChargeDetails } from '@/components/UI/ChargeDetail/view-charge-detail';
import CloseButton from '@/components/UI/CloseButton';
import Modal from '@/components/UI/Modal';
import type { MultiSelectGridDropdownDataType } from '@/components/UI/MultiSelectGridDropdown';
import SearchDetailGrid from '@/components/UI/SearchDetailGrid';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import { UploadFileModal } from '@/components/UI/UploadFileModal';
import ViewNotes from '@/components/ViewNotes';
import { addToastNotification } from '@/store/shared/actions';
import {
  deleteDocument,
  downloadDocumentBase64,
  fetchChargeBatchDetailByID,
  fetchChargeBatchDetailCharges,
  fetchDocumentDataByID,
  getClaimDetailSummaryById,
  uploadBatchDocument,
} from '@/store/shared/sagas';
import type {
  BatchDetailCriteria,
  ChargeBatchChargesResult,
  TBatchUploadedDocument,
  TChargeBatchDetailType,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

import type { IcdData } from '../createClaim';

interface TProps {
  open: boolean;
  batchId: number | undefined;
  refreshDetailView?: string;
  onClose: (isAddedUpdated: boolean) => void;
  onEdit: () => void;
}

export default function DetailChargeBatch({
  open,
  batchId,
  refreshDetailView,
  onClose,
  onEdit,
}: TProps) {
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
  const [modalState, setModalState] = useState<{
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

  const defaultStatusModalInfo = {
    show: false,
    heading: '',
    text: '',
    okButtonText: 'OK',
    closeButtontext: 'Close',
    type: StatusModalType.WARNING,
    confirmActionType: '',
    showCloseButton: false,
  };
  const [statusModalInfo, setStatusModalInfo] = useState(
    defaultStatusModalInfo
  );
  const [selectedFilesList, setSelectedFileslist] = useState<
    TBatchUploadedDocument[]
  >([]);
  const [documentToDelete, setDocumentToDelete] =
    useState<TBatchUploadedDocument>();
  const [isOpenNotePane, setIsOpenNotePane] = React.useState(false);
  interface TabProps {
    id: number | undefined;
    name: string;
    count?: number;
  }

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

  const defaultSearchCriteria: BatchDetailCriteria = {
    attachedID: undefined,
    typeID: '',
    pageNumber: 1,
    pageSize: 10,
    sortByColumn: '',
    sortOrder: '',
    getAllData: false,
    getOnlyIDs: false,
  };

  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);

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

  const [tabs, setTabs] = useState<TabProps[]>([
    {
      id: 1,
      name: 'Charges',
    },
    {
      id: 2,
      name: 'Documents',
      count: 0,
    },
  ]);
  const [currentTab, setCurrentTab] = useState(tabs[0]);

  const batchcategoryID = useRef('6');
  const [showUploadFileModal, setShowUploadFileModal] = useState(false);
  const [detailRes, setDetailRes] = useState<TChargeBatchDetailType>();
  const [chargesData, setChargesData] = useState<ChargeBatchChargesResult[]>();

  const getChargeBatchDetailByID = async (id: number) => {
    const res = await fetchChargeBatchDetailByID(id);
    if (res) {
      setDetailRes({ ...res });
    }
  };

  const getChargeBatchDetailCharges = async (id: number) => {
    const res = await fetchChargeBatchDetailCharges(id);
    if (res) {
      setChargesData(res);
    }
  };

  const initScreen = async (id: number) => {
    getChargeBatchDetailByID(id);
    getChargeBatchDetailCharges(id);
  };

  useEffect(() => {
    if (batchId) initScreen(batchId);
  }, []);

  useEffect(() => {
    if (batchId && refreshDetailView) getChargeBatchDetailByID(batchId);
  }, [refreshDetailView]);

  const onPressClose = () => {
    onClose(false);
  };

  const renderSatusView = () => {
    const getIconColor = () => {
      if (detailRes?.batchStatusColor === 'gray') {
        return IconColors.GRAY;
      }
      if (detailRes?.batchStatusColor === 'red') {
        return IconColors.RED;
      }
      return IconColors.Yellow;
    };
    const statusColor = detailRes?.batchStatusColor || 'yellow';
    return (
      <Badge
        text={detailRes?.batchStatus}
        cls={classNames(
          `!ml-[-1px] !rounded-[4px] bg-${statusColor}-100 text-${statusColor}-800`
        )}
        icon={<Icon name={'desktop'} color={getIconColor()} />}
      />
    );
  };

  const BalanceCardTextColor = (n: number | undefined) => {
    if (n === undefined) return 'text-gray-700';
    if (n > 0) {
      return 'text-red-500';
    }
    if (n === 0) {
      return 'text-green-500';
    }
    return 'text-yellow-500';
  };

  const getBatchBalanceStyle = (n: number | undefined) => {
    let color = 'gray';
    if (n !== undefined) {
      if (n > 0) {
        color = 'red';
      } else if (n === 0) {
        color = 'green';
      } else {
        color = 'yellow';
      }
    }
    return `bg-${color}-50 border-${color}-300 text-${color}-500`;
  };

  const columnCharges: GridColDef[] = [
    {
      field: 'claimID',
      headerName: 'Claim ID',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500 underline"
            onClick={() => {
              window.open(`/app/claim-detail/${params.value}`, '_blank');
            }}
          >
            {`#${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'chargeID',
      headerName: 'Charge ID',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
      renderCell: (params) => {
        return (
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
            {`#${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'cptCode',
      headerName: 'CPT Code',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
    },
    {
      field: 'fromDOS',
      headerName: 'DoS',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'fee',
      headerName: 'Fee',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'claimCreatedOn',
      headerName: 'Claim Created On',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'claimCreatedBy',
      headerName: 'Claim Created By',
      flex: 1,
      minWidth: 180,
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
      field: 'chargeBatch',
      headerName: 'Charge Batch',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
    },
    {
      field: 'systemDocument',
      headerName: 'Document',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
    },
    {
      field: 'pageNumber',
      headerName: 'Page Number',
      ...usdPrice,
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
      field: 'batchPostingDate',
      headerName: 'Batch Posting Date',
      flex: 1,
      minWidth: 170,
      disableReorder: true,
    },
  ];

  const getDocumentDataByID = async (obj: BatchDetailCriteria) => {
    const res = await fetchDocumentDataByID(obj);
    if (res) {
      setSelectedFileslist(res);
    }
  };

  useEffect(() => {
    setTabs(
      tabs.map((d) => {
        let { count } = d;
        // if (d.id === 1) {
        //   count = paidChargesData?.paidCharges.length || 0;
        // }
        if (d.id === 2) {
          count = selectedFilesList.length;
        }
        return { ...d, count };
      })
    );
  }, [selectedFilesList, chargesData]);

  useEffect(() => {
    if (batchId) {
      const obj: BatchDetailCriteria = {
        ...searchCriteria,
        attachedID: batchId,
        typeID: batchcategoryID.current,
      };
      getDocumentDataByID(obj);
    }
  }, []);

  const onViewDacument = async (res: TBatchUploadedDocument) => {
    let base64String = '';
    // in update mode
    if (res.id) {
      const resDownloadDocument = await downloadDocumentBase64(res.id);
      if (resDownloadDocument && resDownloadDocument.documentBase64) {
        // check the file extension
        const extension = res.documentType.substring(1).toLowerCase();
        // set the content type based on the file extension
        let contentType = '';
        if (extension === 'png') {
          contentType = 'image/png';
        } else if (extension === 'jpg' || extension === 'jpeg') {
          contentType = 'image/jpeg';
        } else if (extension === 'pdf') {
          contentType = 'application/pdf';
        }
        // concatenate the content type and base64 string
        base64String = `data:${contentType};base64,${resDownloadDocument.documentBase64}`;
      }
    }

    // view in open new window
    if (base64String) {
      const pdfWindow = window.open('');
      if (pdfWindow) {
        pdfWindow.document.write(
          `<iframe width='100%' height='100%' src='${encodeURI(
            base64String
          )}'></iframe>`
        );
      }
    } else {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Something went wrong',
          toastType: ToastType.ERROR,
        })
      );
    }
  };

  const onDownloadDacument = async (res: TBatchUploadedDocument) => {
    let base64String = '';
    // in update mode
    if (res.id) {
      const resDownloadDocument = await downloadDocumentBase64(res.id);
      if (resDownloadDocument && resDownloadDocument.documentBase64) {
        base64String = `data:application/octet-stream;base64,${resDownloadDocument.documentBase64}`;
      }
    }

    // on download in new window
    if (base64String) {
      const pdfWindow = window.open('');
      if (pdfWindow) {
        const a = document.createElement('a');
        a.href = base64String;
        a.download = res.title + res.documentType;
        a.click();
      }
    } else {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Something went wrong',
          toastType: ToastType.ERROR,
        })
      );
    }
  };

  const onDeleteDacument = async (res: TBatchUploadedDocument) => {
    if (res.id) {
      const docDelete = await deleteDocument(res.id);
      if (docDelete && batchId) {
        const obj: BatchDetailCriteria = {
          ...searchCriteria,
          attachedID: batchId,
          typeID: batchcategoryID.current,
        };
        await getDocumentDataByID(obj);
      }
    }
  };

  const onUpload = async (file: File) => {
    if (batchId) {
      const formData = new FormData();
      formData.append('attachedID', String(batchId));
      formData.append(
        'groupID',
        detailRes?.groupID ? String(detailRes.groupID) : ''
      );
      formData.append('file', file);
      formData.append('documentTypeID', batchcategoryID.current);

      const res = await uploadBatchDocument(formData);
      if (res) {
        const obj: BatchDetailCriteria = {
          ...searchCriteria,
          attachedID: batchId,
          typeID: batchcategoryID.current,
        };
        getDocumentDataByID(obj);
        return true;
      }
    }
    return false;
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Document ID',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'title',
      headerName: 'Document Name',
      flex: 1,
      minWidth: 320,
      disableReorder: true,
    },
    {
      field: 'documentType',
      headerName: 'File Type',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
    },

    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
    },
    {
      field: 'documentStatus',
      headerName: 'Status',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'createdBy',
      headerName: 'Uploaded By',
      flex: 1,
      minWidth: 200,
      disableReorder: true,
    },
    {
      field: 'createdOn',
      headerName: 'Uploaded On',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
    },
    {
      field: 'action',
      headerName: 'Actions',
      flex: 1,
      minWidth: 180,
      hideSortIcons: true,
      disableReorder: true,
      cellClassName: '!bg-cyan-50 PinnedColumLeftBorder',
      headerClassName: '!bg-cyan-100 !text-center PinnedColumLeftBorder',
      renderCell: (params) => {
        return (
          <div className="flex flex-row gap-2">
            <Button
              buttonType={ButtonType.secondary}
              onClick={() => {
                onViewDacument(params.row);
              }}
              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
            >
              <Icon name={'eye'} size={18} />
            </Button>
            <Button
              buttonType={ButtonType.secondary}
              disabled={false}
              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
              onClick={() => {
                onDownloadDacument(params.row);
              }}
            >
              <Icon name={'documentDownload'} size={18} />
            </Button>
            <Button
              buttonType={ButtonType.secondary}
              disabled={true}
              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
              onClick={() => {
                setDocumentToDelete(params.row);
                setStatusModalInfo({
                  ...statusModalInfo,
                  show: true,
                  heading: 'Delete Confirmation',
                  text: `Are you sure you want to delete ${params.row.title}?`,
                  type: StatusModalType.WARNING,
                  showCloseButton: true,
                  okButtonText: 'Confirm',
                  confirmActionType: 'deleteConfirmation',
                });
              }}
            >
              <Icon name={'trash'} size={18} />
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
        modalContentClassName={classNames(
          'h-[calc(100%-80px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8',
          isOpenNotePane ? 'w-[calc(100%-60px)]' : 'w-[calc(100%-220px)]'
        )}
        modalBackgroundClassName={classNames(
          '!overflow-hidden',
          isOpenNotePane ? 'w-[68%]' : ''
        )}
      >
        <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-white shadow">
          <div className="flex w-full flex-col items-start justify-start px-6 py-4">
            <div className="inline-flex w-full items-center justify-between">
              <div className="flex items-center justify-start space-x-2">
                <p className="text-xl font-bold leading-7 text-cyan-600">
                  Charge Batch #{batchId}
                </p>
                <Button
                  buttonType={ButtonType.secondary}
                  cls={`inline-flex px-3 py-2 gap-2 leading-5 focus:!ring-0`}
                  onClick={onEdit}
                >
                  <Icon name={'pencil'} size={16} color={IconColors.NONE} />
                  <p className="text-sm font-medium leading-tight text-gray-700">
                    Edit
                  </p>
                </Button>
              </div>
              <div className="inline-flex items-center gap-4">
                <CloseButton onClick={onPressClose} />
              </div>
            </div>
          </div>
          <div className={'w-full px-6'}>
            <div className={`h-[1px] w-full bg-gray-300`} />
          </div>
          <div className="w-full flex-1 overflow-auto bg-gray-50 pb-[55px]">
            <div
              className={classNames(isOpenNotePane ? 'w-[1280px]' : 'w-full')}
            >
              <div className="w-full bg-white drop-shadow-md">
                <div className="inline-flex h-[100px] w-full items-center justify-start py-3 px-6">
                  <div className="flex h-full w-[15%] items-center justify-start space-x-2 py-2">
                    <Icon name={'file'} />
                    <div className="flex flex-col text-left">
                      <p className="text-sm font-bold leading-tight text-gray-600">
                        Description:
                      </p>
                      <p className="text-sm font-semibold leading-tight text-gray-600">
                        {detailRes?.description}
                      </p>
                    </div>
                  </div>
                  <div
                    className={
                      'flex h-full items-center justify-start space-x-2 px-2 py-1'
                    }
                  >
                    <div className={`h-full w-[1px] bg-gray-300`} />
                  </div>
                  <div className="flex h-full w-[22%] items-center justify-start space-x-2 py-2">
                    <Icon name={'building'} />
                    <div className="flex flex-col text-left">
                      <p className="text-sm font-bold leading-tight text-gray-600">
                        Group:
                      </p>
                      <p className="cursor-pointer text-sm leading-tight text-cyan-500 underline">
                        {detailRes?.group}
                      </p>
                      {!!detailRes?.groupEIN && (
                        <p className="text-xs leading-none text-gray-400">
                          EIN: {detailRes?.groupEIN}
                        </p>
                      )}
                    </div>
                  </div>
                  <div
                    className={
                      'flex h-full items-center justify-start space-x-2 px-2 py-1'
                    }
                  >
                    <div className={`h-full w-[1px] bg-gray-300`} />
                  </div>
                  <div className="flex h-full w-[15%] items-center justify-start space-x-2">
                    <Icon name={'calendar'} />
                    <div className="flex flex-col text-left">
                      <p className="text-sm font-bold leading-tight text-gray-600">
                        Post Date:
                      </p>
                      <p className="text-sm font-semibold leading-tight text-gray-600">
                        {detailRes?.postingDate}
                      </p>
                    </div>
                  </div>
                  <div
                    className={
                      'flex h-full items-center justify-start space-x-2 px-2 py-1'
                    }
                  >
                    <div className={`h-full w-[1px] bg-gray-300`} />
                  </div>
                  <div className="flex h-full w-[15%] items-center justify-start space-x-2 py-2">
                    <Icon name={'fileTick'} />
                    <div className="flex flex-1 flex-col text-left">
                      <p className="text-sm font-bold leading-tight text-gray-600">
                        Batch Assigned to:
                      </p>
                      <div className="inline-flex items-start justify-start space-x-2">
                        {!!detailRes?.batchAssignedTo &&
                        !!detailRes.batchAssignedToRole ? (
                          <div className="flex flex-1 flex-col text-left">
                            {!!detailRes.batchAssignedTo && (
                              <p className="cursor-pointer text-sm leading-tight text-cyan-500 underline">
                                {detailRes?.batchAssignedTo}
                              </p>
                            )}
                            {!!detailRes?.batchAssignedToRole && (
                              <p className="text-xs leading-none text-gray-400">
                                {detailRes?.batchAssignedToRole}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col pt-[6px] text-left">
                            <p className="text-xs leading-none text-gray-400">
                              Not assigned yet
                            </p>
                          </div>
                        )}
                        <div className="flex h-8 h-8 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white p-2 shadow">
                          <Icon
                            data-testid="paymentBatchAddAssigne"
                            name={'pencil'}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`pb-[12px]`}>
                  <div className={`h-[1px] w-full bg-gray-200`} />
                </div>
                <div className="inline-flex h-[115px] w-full items-start justify-start space-x-4 px-6">
                  <div className="inline-flex h-full min-w-[216px] items-start justify-start rounded-lg border border-gray-300 bg-gray-50 p-6 shadow">
                    <div className="inline-flex h-full flex-col items-start justify-start space-y-4">
                      <div className="flex flex-col items-start justify-start space-y-1">
                        <p className="text-sm font-bold leading-tight text-gray-600">
                          Charge Batch Status:
                        </p>
                        {renderSatusView()}
                        {detailRes?.batchStatusTime && (
                          <p className="pt-[3px] text-xs leading-3 text-gray-400">
                            {DateToStringPipe(
                              new Date(detailRes.batchStatusTime),
                              5
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex h-full flex-1 flex-col items-start justify-start rounded-lg border border-gray-300 bg-gray-50 py-4 px-6 shadow">
                    <div className="flex flex-1 flex-col items-start justify-center rounded-lg py-2">
                      <div className="flex flex-col items-start justify-start space-y-2">
                        <div className="flex items-center justify-start space-x-4">
                          <div className="flex items-center justify-start space-x-4">
                            <p className="text-sm font-bold leading-tight text-gray-600">
                              Batch Count Details
                            </p>
                          </div>
                        </div>
                        <div className="inline-flex items-start justify-start space-x-2">
                          <div className="flex h-full w-20 items-start justify-start rounded-md">
                            <div className="inline-flex flex-col items-start justify-start space-y-1">
                              <p className="text-xs font-medium leading-none text-gray-500">
                                Charges
                              </p>
                              <div className="inline-flex items-end justify-start">
                                <div className="flex items-end justify-start space-x-2">
                                  <p className="text-sm font-bold leading-tight text-gray-700">
                                    {detailRes?.chargesCount || 0}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex h-full w-[70px] items-start justify-start rounded-md">
                            <div className="inline-flex flex-col items-start justify-start space-y-1">
                              <p className="text-xs font-medium leading-none text-gray-500">
                                Posted
                              </p>
                              <div className="inline-flex items-end justify-start">
                                <div className="flex items-end justify-start space-x-2">
                                  <p
                                    className={classNames(
                                      'text-sm font-bold leading-tight',
                                      BalanceCardTextColor(
                                        detailRes?.postedChargesCount
                                      )
                                    )}
                                  >
                                    {detailRes?.postedChargesCount || 0}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            className={
                              'flex h-full items-center justify-start space-x-2'
                            }
                          >
                            <div className={`h-full w-[1px] bg-gray-300`} />
                          </div>
                          <div className="rounded-mdc flex h-full w-20 items-start justify-start pl-5">
                            <div className="inline-flex flex-col items-start justify-start space-y-1">
                              <p className="text-xs font-medium leading-none text-gray-500">
                                Claims
                              </p>
                              <div className="inline-flex items-end justify-start">
                                <div className="flex items-end justify-start space-x-2">
                                  <p className="text-sm font-bold leading-tight text-gray-700">
                                    {detailRes?.claimsCount || 0}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex h-full w-20 items-start justify-start rounded-md pl-5">
                            <div className="inline-flex flex-col items-start justify-start space-y-1">
                              <p className="text-xs font-medium leading-none text-gray-500">
                                Posted
                              </p>
                              <div className="inline-flex items-end justify-start">
                                <div className="flex items-end justify-start space-x-2">
                                  <p
                                    className={classNames(
                                      'text-sm font-bold leading-tight',
                                      BalanceCardTextColor(
                                        detailRes?.postedClaimsCount
                                      )
                                    )}
                                  >
                                    {detailRes?.postedClaimsCount || 0}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-full flex-1 flex-col items-start justify-start rounded-lg border border-gray-300 bg-gray-50 py-4 px-6 shadow">
                    <div className="flex flex-1 flex-col items-start justify-center rounded-lg py-2">
                      <div className="flex flex-col items-start justify-start space-y-2">
                        <div className="flex items-center justify-start space-x-4">
                          <div className="flex items-center justify-start space-x-4">
                            <p className="text-sm font-bold leading-tight text-gray-600">
                              Batch Financial Details
                            </p>
                          </div>
                        </div>
                        <div className="inline-flex items-start justify-start space-x-2">
                          <div className="flex h-full w-20 items-start justify-start rounded-md">
                            <div className="inline-flex flex-col items-start justify-start space-y-1">
                              <p className="text-xs font-medium leading-none text-gray-500">
                                Total Amount
                              </p>
                              <div className="inline-flex items-end justify-start">
                                <div className="flex items-end justify-start space-x-2">
                                  <p className="text-sm font-bold leading-tight text-gray-700">
                                    {currencyFormatter.format(
                                      detailRes?.totalAmount || 0
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="w-25 flex h-full items-start justify-start rounded-md pl-5">
                            <div className="inline-flex flex-col items-start justify-start space-y-1">
                              <p className="text-xs font-medium leading-none text-gray-500">
                                Total Posted
                              </p>
                              <div className="inline-flex items-end justify-start">
                                <div className="flex items-end justify-start space-x-2">
                                  <p
                                    className={classNames(
                                      'text-sm font-bold leading-tight',
                                      BalanceCardTextColor(
                                        detailRes?.totalPostedAmount
                                      )
                                    )}
                                  >
                                    {currencyFormatter.format(
                                      detailRes?.totalPostedAmount || 0
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={classNames(
                      'min-w-[152px] flex items-center justify-center h-full shadow border rounded-md',
                      getBatchBalanceStyle(detailRes?.batchBalance)
                    )}
                  >
                    <div className="flex flex-col text-left">
                      <p className="w-full text-sm font-bold leading-tight">
                        Batch Balance
                      </p>
                      <p className="text-xl font-bold leading-7">
                        {currencyFormatter.format(
                          detailRes?.batchBalance
                            ? detailRes.batchBalance *
                                (detailRes.batchBalance < 0 ? -1 : 1)
                            : 0
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={`pt-[12px]`}>
                  <div className={`h-[1px] w-full bg-gray-200`} />
                </div>
                <div className="w-full px-6">
                  <Tabs
                    tabs={tabs}
                    onChangeTab={(tab: any) => {
                      setCurrentTab(tab);
                    }}
                    currentTab={currentTab}
                  />
                </div>
              </div>
              <div className="w-full px-6 pt-[15px]">
                {currentTab?.id === 1 && (
                  <div className="flex w-full flex-col">
                    <div className="inline-flex items-center justify-start space-x-2 pt-4">
                      <p className="text-xl font-bold leading-7 text-gray-700">
                        Charges
                      </p>
                    </div>
                    <SearchDetailGrid
                      totalCount={chargesData && chargesData[0]?.total}
                      rows={
                        chargesData?.map((row) => {
                          return { ...row, id: row.rid };
                        }) || []
                      }
                      columns={columnCharges}
                      checkboxSelection={false}
                      paginationMode={'client'}
                      showTableHeading={false}
                      pinnedColumns={{
                        right: ['action'],
                      }}
                    />
                  </div>
                )}
                {currentTab?.id === 2 && (
                  <div className="mt-6 flex flex-col pb-[25px]">
                    <div className="inline-flex items-center justify-start space-x-6 pb-4">
                      <p className="text-xl font-bold leading-7 text-gray-700">
                        Uploaded Documents
                      </p>
                      <Button
                        buttonType={ButtonType.primary}
                        onClick={() => {
                          setShowUploadFileModal(true);
                        }}
                      >
                        <p className="text-sm font-medium leading-tight text-white">
                          Add New Document
                        </p>
                      </Button>
                    </div>
                    <UploadFileModal
                      open={showUploadFileModal}
                      onClose={() => {
                        setShowUploadFileModal(false);
                      }}
                      onUploadDocument={async (file) => {
                        const res = await onUpload(file);
                        if (res) {
                          setShowUploadFileModal(false);
                        }
                      }}
                    />
                    {/* <div className="drop-shadow-lg">
                      <AppTable
                        cls="max-h-[400px]"
                        renderHead={
                          <>
                            <AppTableRow>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                Document ID
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                Document Name
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                File Type
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                Created By
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                Created On
                              </AppTableCell>
                              <AppTableCell cls="w-[100px] !font-bold !py-2 !whitespace-nowrap !px-4 bg-cyan-100">
                                Actions
                              </AppTableCell>
                            </AppTableRow>
                          </>
                        }
                        renderBody={
                          <>
                            {selectedFilesList.map((uploadDocRow, i) => (
                              <AppTableRow key={i}>
                                <AppTableCell>
                                  {uploadDocRow.id ? `#${uploadDocRow.id}` : ''}
                                </AppTableCell>
                                <AppTableCell>
                                  {uploadDocRow.title}
                                </AppTableCell>
                                <AppTableCell>
                                  {uploadDocRow.documentType
                                    .substring(1)
                                    .toUpperCase()}
                                </AppTableCell>
                                <AppTableCell>
                                  {uploadDocRow.createdBy}
                                </AppTableCell>
                                <AppTableCell>
                                  {DateToStringPipe(
                                    new Date(uploadDocRow.createdOn),
                                    6
                                  )}
                                </AppTableCell>
                                <AppTableCell cls="bg-cyan-50">
                                  <div className="flex gap-x-2">
                                    <>
                                      <Button
                                        buttonType={ButtonType.secondary}
                                        onClick={() => {
                                          onViewDacument(uploadDocRow);
                                        }}
                                        cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                                      >
                                        <Icon name={'eye'} size={18} />
                                      </Button>
                                      <Button
                                        buttonType={ButtonType.secondary}
                                        cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                                        onClick={() => {
                                          onDownloadDacument(uploadDocRow);
                                        }}
                                      >
                                        <Icon
                                          name={'documentDownload'}
                                          size={18}
                                        />
                                      </Button>
                                      <Button
                                        buttonType={ButtonType.secondary}
                                        cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                                        onClick={() => {
                                          setDocumentToDelete(uploadDocRow);
                                          setStatusModalInfo({
                                            ...statusModalInfo,
                                            show: true,
                                            heading: 'Delete Confirmation',
                                            text: `Are you sure you want to delete ${uploadDocRow.title}?`,
                                            type: StatusModalType.WARNING,
                                            showCloseButton: true,
                                            okButtonText: 'Confirm',
                                            confirmActionType:
                                              'deleteConfirmation',
                                          });
                                        }}
                                      >
                                        <Icon name={'trash'} size={18} />
                                      </Button>
                                    </>
                                  </div>
                                </AppTableCell>
                              </AppTableRow>
                            ))}
                            {!selectedFilesList.length && (
                              <AppTableRow>
                                <AppTableCell cls={'!text-center'} colSpan={6}>
                                  No rows
                                </AppTableCell>
                              </AppTableRow>
                            )}
                          </>
                        }
                      />
                    </div> */}

                    <div className="flex w-full flex-col">
                      <div className="h-full">
                        <SearchDetailGrid
                          pageNumber={searchCriteria.pageNumber}
                          pageSize={searchCriteria.pageSize}
                          persistLayoutId={42}
                          hideHeader={false}
                          hideFooter={false}
                          totalCount={selectedFilesList[0]?.total}
                          rows={
                            selectedFilesList?.map((row) => {
                              return { ...row, id: row.id };
                            }) || []
                          }
                          columns={columns}
                          checkboxSelection={false}
                          onPageChange={(page: number) => {
                            const obj: BatchDetailCriteria = {
                              ...searchCriteria,
                              pageNumber: page,
                              attachedID: batchId, // Explicitly include batchId
                              typeID: batchcategoryID.current,
                            };
                            setSearchCriteria(obj);
                            getDocumentDataByID(obj);
                          }}
                          onPageSizeChange={(
                            pageSize: number,
                            page: number
                          ) => {
                            if (selectedFilesList.length) {
                              const obj: BatchDetailCriteria = {
                                ...searchCriteria,
                                pageSize,
                                pageNumber: page,
                                attachedID: batchId, // Explicitly include batchId
                                typeID: batchcategoryID.current,
                              };
                              setSearchCriteria(obj);
                              getDocumentDataByID(obj);
                            }
                          }}
                          pinnedColumns={{
                            right: ['action'],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {detailRes?.id && (
              <ViewNotes
                id={detailRes.id}
                noteType="payment batch"
                groupID={detailRes?.groupID}
                btnCls="absolute right-[15px] bottom-[15px]"
                // disableBackdropClick={true}
                onOpen={() => {
                  setIsOpenNotePane(true);
                }}
                onClose={() => {
                  setIsOpenNotePane(false);
                }}
              />
            )}
          </div>
        </div>
      </Modal>
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
        open={modalState.open}
        heading={modalState.heading}
        description={modalState.description}
        closeButtonText={'Ok'}
        statusModalType={modalState.statusModalType}
        showCloseButton={false}
        closeOnClickOutside={false}
        onChange={() => {
          setModalState({
            ...modalState,
            open: false,
          });
        }}
      />
      <StatusModal
        open={statusModalInfo.show}
        heading={statusModalInfo.heading}
        description={statusModalInfo.text}
        okButtonText={statusModalInfo.okButtonText}
        closeButtonText={statusModalInfo.closeButtontext}
        statusModalType={statusModalInfo.type}
        showCloseButton={statusModalInfo.showCloseButton}
        closeOnClickOutside={true}
        onChange={() => {
          if (statusModalInfo.confirmActionType === 'cancelConfirmation') {
            onClose(false);
          }
          if (
            statusModalInfo.confirmActionType === 'deleteConfirmation' &&
            documentToDelete
          ) {
            onDeleteDacument(documentToDelete);
          }
          setStatusModalInfo({
            ...statusModalInfo,
            show: false,
          });
        }}
        onClose={() => {
          setStatusModalInfo({
            ...statusModalInfo,
            show: false,
          });
        }}
      />
    </>
  );
}
