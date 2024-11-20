import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Icon from '@/components/Icon';
import Tabs from '@/components/OrganizationSelector/Tabs';
import Badge from '@/components/UI/Badge';
import Button, { ButtonType } from '@/components/UI/Button';
import ButtonsGroup from '@/components/UI/ButtonsGroup';
import CloseButton from '@/components/UI/CloseButton';
import Modal from '@/components/UI/Modal';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppTable, { AppTableCell, AppTableRow } from '@/components/UI/Table';
import { UploadFileModal } from '@/components/UI/UploadFileModal';
import ViewNotes from '@/components/ViewNotes';
import { addToastNotification } from '@/store/shared/actions';
import {
  deleteDocument,
  downloadDocumentBase64,
  fetchDocumentBatchByID,
  fetchDocumentDataByID,
  uploadBatchDocument,
} from '@/store/shared/sagas';
import type {
  TBatchUploadedDocument,
  TDocumentBatchType,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

interface TProps {
  open: boolean;
  batchId: number | undefined;
  refreshDetailView?: string;
  onClose: (isAddedUpdated: boolean) => void;
  onEdit: () => void;
}

export default function DetailDocumentBatch({
  open,
  batchId,
  refreshDetailView,
  onClose,
  onEdit,
}: TProps) {
  const dispatch = useDispatch();

  const defaultStatusModalInfo = {
    show: false,
    heading: '',
    text: '',
    okButtonText: 'OK',
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

  interface TabProps {
    id: number | undefined;
    name: string;
    count?: number;
  }
  const [tabs, setTabs] = useState<TabProps[]>([
    {
      id: 1,
      name: 'Documents',
      count: selectedFilesList ? selectedFilesList.length : 0,
    },
  ]);
  const [currentTab, setCurrentTab] = useState(tabs[0]);

  const batchcategoryID = useRef('7');
  const [showUploadFileModal, setShowUploadFileModal] = useState(false);
  const [detailRes, setDetailRes] = useState<TDocumentBatchType>();

  const getDocumentBatchDetailByID = async (id: number) => {
    const res = await fetchDocumentBatchByID(id);
    if (res) {
      setDetailRes(res);
    }
  };

  const initScreen = async (id: number) => {
    getDocumentBatchDetailByID(id);
  };

  useEffect(() => {
    if (batchId) initScreen(batchId);
  }, []);

  useEffect(() => {
    if (batchId && refreshDetailView) getDocumentBatchDetailByID(batchId);
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

  const getDocumentDataByID = async (id: number) => {
    const res = await fetchDocumentDataByID(id, batchcategoryID.current);
    if (res) {
      setSelectedFileslist(res);
      setTabs(
        tabs.map((d) => {
          return { ...d, count: d.id === 1 ? res.length : d.count };
        })
      );
    }
  };

  useEffect(() => {
    if (batchId) {
      getDocumentDataByID(batchId);
    }
  }, []);

  const onViewDacument = async (res: TBatchUploadedDocument) => {
    let base64String = '';
    // in update mode
    if (res.documentID) {
      const resDownloadDocument = await downloadDocumentBase64(res.documentID);
      if (resDownloadDocument && resDownloadDocument.data) {
        // check the file extension
        const extension = res.systemDocumentType.substring(1).toLowerCase();
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
        base64String = `data:${contentType};base64,${resDownloadDocument.data}`;
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
    if (res.documentID) {
      const resDownloadDocument = await downloadDocumentBase64(res.documentID);
      if (resDownloadDocument && resDownloadDocument.data) {
        base64String = `data:application/octet-stream;base64,${resDownloadDocument.data}`;
      }
    }

    // on download in new window
    if (base64String) {
      const pdfWindow = window.open('');
      if (pdfWindow) {
        const a = document.createElement('a');
        a.href = base64String;
        a.download = res.title + res.systemDocumentType;
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
    if (res.documentID) {
      const docDelete = await deleteDocument(res.documentID);
      if (docDelete && batchId) {
        await getDocumentDataByID(batchId);
      }
    }
  };

  const onUpload = async (file: File) => {
    if (batchId) {
      const formData = new FormData();
      formData.append('batchID', String(batchId));
      formData.append(
        'groupID',
        detailRes?.groupID ? String(detailRes.groupID) : ''
      );
      formData.append('file', file);
      formData.append('categoryID', batchcategoryID.current);

      const res = await uploadBatchDocument(formData);
      if (res) {
        getDocumentDataByID(batchId);
        return true;
      }
    }
    return false;
  };

  return (
    <>
      <Modal
        open={open}
        onClose={() => {}}
        modalContentClassName="relative w-[1232px] rounded-lg bg-white shadow-xl transition-all sm:my-8"
        modalBackgroundClassName={'!overflow-hidden'}
      >
        <div className="flex h-[613px] w-full flex-col items-center justify-start rounded-lg bg-white shadow">
          <div className="flex w-full flex-col items-start justify-start px-6 py-4">
            <div className="inline-flex w-full items-center justify-between">
              <div className="flex items-center justify-start space-x-2">
                <p className="text-xl font-bold leading-7 text-cyan-600">
                  Document Batch {batchId ? `#${batchId}` : ''}
                </p>
                <div className="relative mx-[16px] w-[10px] pb-[25px]">
                  <div
                    className={`[rotate:90deg] origin-top-left bg-gray-200 w-[28px] outline outline-1 outline-[rgba(209,213,219,1)]`}
                  ></div>
                </div>
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
                <ButtonsGroup
                  data={[
                    { id: 1, name: 'Print', icon: 'print' },
                    { id: 2, name: 'Export', icon: 'export' },
                  ]}
                  onClick={() => {}}
                />
                <CloseButton onClick={onPressClose} />
              </div>
            </div>
          </div>
          <div className={'w-full px-6'}>
            <div className={`h-[1px] w-full bg-gray-300`} />
          </div>
          <div className="w-full flex-1 overflow-y-auto bg-gray-50 pb-[55px]">
            <div className="bg-white drop-shadow-md">
              <div className="inline-flex h-[100px] w-full items-center justify-start py-3 px-6">
                <div className="flex h-full w-[20%] items-center justify-start space-x-2 py-2">
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
                    'flex h-full items-center justify-start space-x-2 px-6 py-1'
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
                    'flex h-full items-center justify-start space-x-2 px-4 py-1'
                  }
                >
                  <div className={`h-full w-[1px] bg-gray-300`} />
                </div>
                <div className="flex h-full w-[10%] space-x-2">
                  <div className="flex h-full w-[10%] items-center justify-start space-x-2 py-2">
                    <Icon name={'calendar'} />
                    <div className="flex flex-col text-left">
                      <p className="text-sm font-bold leading-tight text-gray-600">
                        Post Date:
                      </p>
                      <p className="text-sm font-semibold leading-tight text-gray-600">
                        {detailRes?.postDate}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className={
                    'flex h-full items-center justify-start space-x-2 px-2 py-1'
                  }
                >
                  <div className={`h-full w-[1px] bg-gray-300`} />
                </div>
                <div className="flex h-full w-[55%] items-center justify-start space-x-2 py-2">
                  <Icon name={'fileTick'} />
                  <div className="flex flex-col text-left">
                    <p className="text-sm font-bold leading-tight text-gray-600">
                      Batch Assigned to:
                    </p>
                    <div className="inline-flex items-start justify-start space-x-2">
                      {!!detailRes?.followupAssignee &&
                      !!detailRes?.followupAssigneeRole ? (
                        <div className="flex flex-col text-left">
                          {!!detailRes?.followupAssignee && (
                            <p className="cursor-pointer text-sm leading-tight text-cyan-500 underline">
                              {detailRes?.followupAssignee}
                            </p>
                          )}
                          {!!detailRes?.followupAssigneeRole && (
                            <p className="text-xs leading-none text-gray-400">
                              {detailRes?.followupAssigneeRole}
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
                      <div className="flex h-8 w-1/4 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white p-2 shadow">
                        <Icon name={'pencil'} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`pb-[12px]`}>
                <div className={`h-[1px] w-full bg-gray-200`} />
              </div>
              <div className="inline-flex h-[115px] w-full items-start justify-start space-x-4 px-6">
                <div className="inline-flex h-full w-[322.67px] items-start justify-start rounded-lg border border-gray-300 bg-gray-50 p-6 shadow">
                  <div className="inline-flex h-full flex-col items-start justify-start space-y-4">
                    <div className="flex flex-col items-start justify-start space-y-1">
                      <p className="text-sm font-bold leading-tight text-gray-600">
                        Document Batch Status:
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
                <div className="inline-flex h-full w-[322.67px] flex-col items-start justify-start rounded-lg border border-gray-300 bg-gray-50 py-4 px-6 shadow">
                  <div className="flex flex-1 flex-col items-start justify-center rounded-lg py-2">
                    <div className="flex flex-col items-start justify-start space-y-2">
                      <div className="flex items-center justify-start space-x-4">
                        <div className="flex items-center justify-start space-x-4">
                          <p className="text-sm font-bold leading-tight text-gray-600">
                            Batch Type
                          </p>
                        </div>
                      </div>
                      <Badge
                        text={detailRes?.batchType}
                        cls={classNames(
                          `!ml-[-1px] !rounded-[4px] bg-gray-100 text-gray-800`
                        )}
                      />
                    </div>
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
                  <div className="drop-shadow-lg">
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
                              Uploaded By
                            </AppTableCell>
                            <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                              Uploaded On
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
                                {uploadDocRow.documentID
                                  ? `#${uploadDocRow.documentID}`
                                  : ''}
                              </AppTableCell>
                              <AppTableCell>{uploadDocRow.title}</AppTableCell>
                              <AppTableCell>
                                {uploadDocRow.systemDocumentType
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
                  </div>
                </div>
              )}
            </div>
            {detailRes?.documentBatchID && (
              <ViewNotes
                id={detailRes.documentBatchID}
                noteType="document batch"
                groupID={detailRes?.groupID}
                btnCls="absolute right-[15px] bottom-[15px]"
                disableBackdropClick={true}
              />
            )}
          </div>
        </div>
      </Modal>
      <StatusModal
        open={statusModalInfo.show}
        heading={statusModalInfo.heading}
        description={statusModalInfo.text}
        okButtonText={statusModalInfo.okButtonText}
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
          setStatusModalInfo(defaultStatusModalInfo);
        }}
        onClose={() => {
          setStatusModalInfo(defaultStatusModalInfo);
        }}
      />
    </>
  );
}
