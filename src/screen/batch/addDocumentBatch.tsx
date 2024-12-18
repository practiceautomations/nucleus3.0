import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Icon from '@/components/Icon';
import Button, { ButtonType } from '@/components/UI/Button';
import CloseButton from '@/components/UI/CloseButton';
import InputField from '@/components/UI/InputField';
import Modal from '@/components/UI/Modal';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppTable, { AppTableCell, AppTableRow } from '@/components/UI/Table';
import UploadFile from '@/components/UI/UploadFile';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import { getUserSelector } from '@/store/login/selectors';
import {
  addToastNotification,
  fetchAssignClaimToDataRequest,
  fetchPracticeDataRequest,
} from '@/store/shared/actions';
import {
  createDocumentBatch,
  deleteDocument,
  downloadDocumentBase64,
  fetchBatchTypeData,
  fetchDocumentBatchByID,
  fetchDocumentBatchStatus,
  // fetchDocumentDataByID,
  fetchLockboxTypeData,
  updateDocumentBatch,
  uploadBatchDocument,
} from '@/store/shared/sagas';
import {
  getAssignClaimToDataSelector,
  getPracticeDataSelector,
} from '@/store/shared/selectors';
import type {
  IdValuePair,
  PracticeData,
  TBatchUploadedDocument,
  TDocumentBatchType,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import {
  DateToStringPipe,
  getServerDateTimeString,
} from '@/utils/dateConversionPipes';

interface TProps {
  open: boolean;
  batchId: number | undefined;
  onClose: (isAddedUpdated: boolean) => void;
  hideBackdrop?: boolean;
}

export default function AddDocumentBatch({
  open,
  batchId,
  onClose,
  hideBackdrop = true,
}: TProps) {
  const dispatch = useDispatch();
  const [batchTypeDropdown, setBatchTypeDropdown] = useState<IdValuePair[]>([]);
  const [lockboxTypeDropdown, setLockboxTypeDropdown] = useState<IdValuePair[]>(
    []
  );
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const assignClaimToData = useSelector(getAssignClaimToDataSelector);
  const practicesData = useSelector(getPracticeDataSelector);
  const [claimdata, setClaimData] = useState<SingleSelectDropDownDataType[]>(
    []
  );
  const [practiceDropdown, setPracticeDropdown] = useState<PracticeData[]>([]);
  const user = useSelector(getUserSelector);
  const batchcategoryID = useRef('7');
  const [isChangedJson, setIsChangedJson] = useState(false);
  const [disableBatchType, setDisableBatchType] = useState(false);
  const [batchStatusDropdown, setBatchStatusDropdown] = useState<
    SingleSelectDropDownDataType[]
  >([]);
  const myRef = useRef<HTMLTableRowElement>(null);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [selectedFilesList, setSelectedFileslist] = useState<
    TBatchUploadedDocument[]
  >([]);

  const [documentToDelete, setDocumentToDelete] =
    useState<TBatchUploadedDocument>();

  const [isZip, setIsZip] = useState(false);
  const [disableUpload, setDisableUpload] = useState(false);

  const getBatchStatus = async () => {
    const res = await fetchDocumentBatchStatus();
    if (res) {
      setBatchStatusDropdown(res);
    }
  };
  useEffect(() => {
    if (practicesData?.length) {
      setPracticeDropdown(practicesData);
    }
  }, [practicesData]);
  useEffect(() => {
    getBatchStatus();
  }, []);

  const [addUpdateJson, setAddUpdateJson] = useState<TDocumentBatchType>({
    id: undefined,
    description: '',
    groupID: undefined,
    practiceID: undefined,
    group: '',
    groupEIN: '',
    postDate: '',
    followupAssigneeID: '',
    followupAssignee: '',
    followupAssigneeRole: '',
    batchStatusID: undefined,
    batchStatus: '',
    batchStatusColor: '',
    batchTypeID: undefined,
    lockboxTypeID: undefined,
    batchType: '',
    batchStatusTime: '',
  });

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

  useEffect(() => {
    setAddUpdateJson({
      ...addUpdateJson,
      groupID: selectedWorkedGroup?.groupsData[0]?.id,
    });
  }, [selectedWorkedGroup]);

  useEffect(() => {
    const groupId = addUpdateJson.groupID;
    if (groupId) {
      dispatch(fetchAssignClaimToDataRequest({ clientID: groupId }));
    }
  }, [addUpdateJson.groupID]);

  useEffect(() => {
    if (selectedWorkedGroup?.workGroupId) {
      setPracticeDropdown(selectedWorkedGroup.practicesData);
    }
    if (
      selectedWorkedGroup &&
      selectedWorkedGroup?.groupsData?.length > 0 &&
      selectedWorkedGroup?.groupsData[0]?.id
    ) {
      dispatch(
        fetchPracticeDataRequest({
          groupID: selectedWorkedGroup?.groupsData[0]?.id,
        })
      );
    }
  }, [selectedWorkedGroup]);

  useEffect(() => {
    if (assignClaimToData) {
      setClaimData(assignClaimToData);
    }
  }, [assignClaimToData]);

  const handleAddUpdateJson = (value: TDocumentBatchType) => {
    setAddUpdateJson(value);
    setIsChangedJson(true);
  };

  useEffect(() => {
    if (addUpdateJson.batchTypeID === 21) {
      setIsZip(true);
    } else {
      setIsZip(false);
    }
  }, [addUpdateJson.batchTypeID]);

  const onCreate = async () => {
    if (
      !addUpdateJson.groupID ||
      !addUpdateJson.practiceID ||
      !addUpdateJson.description ||
      !addUpdateJson.batchStatusID ||
      !addUpdateJson.batchTypeID ||
      (addUpdateJson.batchTypeID === 21 && !addUpdateJson.lockboxTypeID)
    ) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Alert',
        text: 'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
        type: StatusModalType.WARNING,
      });
      return;
    }

    if (addUpdateJson.batchTypeID === 21 && selectedFilesList?.length > 1) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Alert',
        text: 'You can upload only one Zip file when the Batch Type is Lockbox. Please remove extra files and try again.',
        type: StatusModalType.WARNING,
      });
      return;
    }

    const obj: TDocumentBatchType = {
      ...addUpdateJson,
      groupID: addUpdateJson.groupID,
      practiceID: addUpdateJson.practiceID,
      followupAssignee: addUpdateJson.followupAssignee,
      description: addUpdateJson.description,
      batchStatusID: addUpdateJson.batchStatusID,
      batchTypeID: addUpdateJson.batchTypeID,
      lockboxTypeID: addUpdateJson.lockboxTypeID,
    };

    let res: any = '';
    // in add mode
    if (!batchId) {
      const formData = new FormData();
      formData.append('documentBatchJson', JSON.stringify(obj));
      selectedFilesList.forEach((d) => {
        if (d.file) formData.append('files', d.file);
      });
      res = await createDocumentBatch(formData);
    }
    // in update mode
    else {
      res = await updateDocumentBatch(obj);
    }
    if (res) {
      onClose(true);
    } else {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Error',
        text: 'A system error prevented the batch to be created.\nPlease try again.',
        type: StatusModalType.ERROR,
      });
    }
    // if (
    //   addUpdateJson.batchTypeID === 21 &&
    //   (selectedFilesList?.length || 0) > 1
    // ) {
    //   setStatusModalInfo({
    //     ...statusModalInfo,
    //     show: true,
    //     heading: 'Error',
    //     text: 'You can upload only one Zip file when the Batch Type is Lockbox. Please remove extra files and try again.',
    //     type: StatusModalType.ERROR,
    //   });
    // } else {
    //   setStatusModalInfo({
    //     ...statusModalInfo,
    //     show: true,
    //     heading: 'Error',
    //     text: 'You can upload only one Zip file when the Batch Type is Lockbox. Please remove extra files and try again.',
    //     type: StatusModalType.ERROR,
    //   });
    // }
  };

  const onPressClose = () => {
    if (isChangedJson) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Cancel Confirmation',
        text: 'Are you sure you want to cancel creating this batch? Clicking "Confirm" will result in the loss of all changes.',
        type: StatusModalType.WARNING,
        showCloseButton: true,
        okButtonText: 'Confirm',
        confirmActionType: 'cancelConfirmation',
      });
      return;
    }
    onClose(false);
  };

  const getBatchByID = async (id: number) => {
    const res = await fetchDocumentBatchByID(id);
    if (res) {
      if (res.batchTypeID === 21) {
        setDisableBatchType(true);
      }
      setAddUpdateJson(res);
    }
  };
  // const getDocumentDataByID = async (id: number) => {
  //   const res = await fetchDocumentDataByID(id, batchcategoryID.current);
  //   if (res) {
  //     setSelectedFileslist(res);
  //   }
  // };

  const getDocumentBatchTypeData = async () => {
    const res = await fetchBatchTypeData();
    if (res) {
      setBatchTypeDropdown(res);
    }
  };

  const getDocumentLockboxTypeData = async () => {
    const res = await fetchLockboxTypeData();
    if (res) {
      setLockboxTypeDropdown(res);
    }
  };

  useEffect(() => {
    if (batchId) {
      getBatchByID(batchId);
      // getDocumentDataByID(batchId);
    }
    getDocumentBatchTypeData();
    getDocumentLockboxTypeData();
  }, []);

  const onUpload = async () => {
    if (selectedFile) {
      // in update mode
      if (batchId) {
        const formData = new FormData();
        formData.append('attachedID', String(batchId));
        formData.append(
          'groupID',
          addUpdateJson.groupID ? String(addUpdateJson.groupID) : ''
        );
        formData.append('file', selectedFile);
        formData.append('documentTypeID', batchcategoryID.current);

        const res = await uploadBatchDocument(formData);
        if (res) {
          // await getDocumentDataByID(batchId);
        } else {
          return;
        }
      }
      // in add mode
      else {
        const fileName = selectedFile.name;
        const nameAndType = fileName.split('.');
        const name = nameAndType[0];
        const type = nameAndType[1];
        setSelectedFileslist([
          ...selectedFilesList,
          {
            id: undefined,
            title: name || '',
            documentType: `.${type || ''}`,
            createdBy: user?.name || '',
            createdOn: getServerDateTimeString(),
            file: selectedFile,
            documentPath: '',
            active: null,
            documentStatus: '',
            category: '',
            additionalComment1: '',
            additionalComment2: '',
            total: 0,
          },
        ]);
        setIsChangedJson(true);
      }
      setSelectedFile(undefined);
      setTimeout(() => {
        myRef?.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  };

  useEffect(() => {
    if (selectedFilesList.length && addUpdateJson.batchTypeID === 21) {
      setDisableUpload(true);
    } else {
      setDisableUpload(false);
    }
  }, [selectedFilesList, addUpdateJson.batchTypeID]);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const onViewDacument = async (res: TBatchUploadedDocument) => {
    let base64String = '';
    // in add mode
    if (!batchId) {
      if (res.file) {
        await convertFileToBase64(res.file)
          .then((str) => {
            base64String = str;
          })
          .catch((error) => console.error(error));
      }
    }
    // in update mode
    else if (res.id) {
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
    // in add mode
    if (!batchId) {
      if (res.file) {
        await convertFileToBase64(res.file)
          .then((str) => {
            base64String = str;
          })
          .catch((error) => console.error(error));
      }
    }
    // in update mode
    else if (res.id) {
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
    // in add mode
    if (!batchId) {
      setSelectedFileslist(selectedFilesList.filter((d) => d !== res));
    }
    // in update mode
    else if (res.id) {
      const docDelete = await deleteDocument(res.id);
      if (docDelete) {
        // await getDocumentDataByID(batchId);
      }
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={() => {}}
        modalContentClassName="relative w-[1232px] rounded-lg bg-white shadow-xl transition-all sm:my-8"
        modalBackgroundClassName={'!overflow-hidden'}
        modalClassName={'!z-[13]'}
        //! z-[2]
        hideBackdrop={hideBackdrop}
      >
        <div
          className="flex w-full flex-col items-center justify-start rounded-lg bg-gray-100 shadow"
          style={{ height: batchId ? '443px' : '613px' }}
        >
          <div className="flex w-full flex-col items-start justify-start p-6">
            <div className="inline-flex w-full items-center justify-between">
              <div className="flex items-center justify-start space-x-2">
                <p className="text-xl font-bold leading-7 text-gray-700">
                  {!batchId ? 'New Document Batch' : ''}{' '}
                  {batchId ? `Document Batch (ID#${batchId}) -Edit` : ''}
                </p>
              </div>
              <CloseButton onClick={onPressClose} />
            </div>
          </div>
          <div className={'w-full px-6'}>
            <div className={`h-[1px] w-full bg-gray-300`} />
          </div>
          <div className="w-full flex-1 overflow-y-auto p-6">
            <div className="flex w-full">
              <div className="w-[255px] px-[5px] ">
                <div
                  className={`flex flex-col w-full items-start justify-start self-stretch`}
                >
                  <label className="text-sm font-medium leading-tight text-gray-700">
                    Group<span className="text-cyan-500">*</span>
                  </label>
                  <div className="w-full">
                    <SingleSelectDropDown
                      placeholder="-"
                      showSearchBar={true}
                      disabled={false}
                      data={
                        selectedWorkedGroup?.groupsData ||
                        ([] as SingleSelectDropDownDataType[])
                      }
                      selectedValue={
                        selectedWorkedGroup?.groupsData.filter(
                          (f) => f.id === addUpdateJson.groupID
                        )[0]
                      }
                      onSelect={(value) => {
                        handleAddUpdateJson({
                          ...addUpdateJson,
                          groupID: value.id,
                          followupAssignee: undefined,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="w-[255px] px-[5px] ">
                <div
                  className={`flex flex-col w-full items-start justify-start self-stretch`}
                >
                  <label className="text-sm font-medium leading-tight text-gray-700">
                    Practice<span className="text-cyan-500">*</span>
                  </label>
                  <div className="w-full">
                    <SingleSelectDropDown
                      placeholder="Select practice"
                      showSearchBar={false}
                      data={
                        practiceDropdown.length > 0
                          ? (practiceDropdown as SingleSelectDropDownDataType[])
                          : [
                              {
                                id: 1,
                                value: 'No Record Found',
                                active: false,
                              },
                            ]
                      }
                      selectedValue={
                        practiceDropdown?.filter(
                          (m) => m.id === addUpdateJson.practiceID
                        )[0]
                      }
                      onSelect={(value) => {
                        handleAddUpdateJson({
                          ...addUpdateJson,
                          practiceID: value.id,
                          followupAssignee: undefined,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="w-[240px] px-[5px]">
                <div
                  className={`flex flex-col w-full items-start justify-start self-stretch`}
                >
                  <label className="text-sm font-medium leading-tight text-gray-700">
                    Assignee
                  </label>
                  <div className="w-full">
                    <SingleSelectDropDown
                      placeholder="-"
                      showSearchBar={true}
                      disabled={false}
                      data={
                        claimdata
                          ? (claimdata as SingleSelectDropDownDataType[])
                          : []
                      }
                      selectedValue={
                        claimdata?.filter(
                          (m) =>
                            m.id.toString() === addUpdateJson.followupAssignee
                        )[0]
                      }
                      onSelect={(value) => {
                        handleAddUpdateJson({
                          ...addUpdateJson,
                          followupAssignee: String(value.id),
                        });
                      }}
                      isOptional={true}
                      onDeselectValue={() => {
                        handleAddUpdateJson({
                          ...addUpdateJson,
                          followupAssignee: undefined,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className={'py-[15px] px-[5px]'}>
              <div className={`h-[1px] w-full bg-gray-200`} />
            </div>
            <div className="flex w-full flex-col items-start">
              <div className="px-[5px] pb-[15px]">
                <p className="text-base font-bold leading-normal text-gray-700">
                  Batch Details
                </p>
              </div>
              <div className="flex w-full">
                <div className="w-[240px] px-[5px]">
                  <div
                    className={`flex flex-col w-full items-start self-stretch`}
                  >
                    <label className="text-sm font-medium leading-tight text-gray-700">
                      Description<span className="text-cyan-500">*</span>
                    </label>
                    <div className="w-full">
                      <InputField
                        placeholder="-"
                        value={addUpdateJson?.description}
                        onChange={(evt) => {
                          handleAddUpdateJson({
                            ...addUpdateJson,
                            description: evt.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="w-[240px] px-[5px]">
                  <div
                    className={`flex flex-col w-full items-start self-stretch`}
                  >
                    <label className="text-sm font-medium leading-tight text-gray-700">
                      Batch Status<span className="text-cyan-500">*</span>
                    </label>
                    <div className="w-full">
                      <SingleSelectDropDown
                        placeholder="-"
                        disabled={false}
                        data={batchStatusDropdown}
                        selectedValue={
                          batchStatusDropdown.filter(
                            (f) => f.id === addUpdateJson.batchStatusID
                          )[0]
                        }
                        onSelect={(value) => {
                          handleAddUpdateJson({
                            ...addUpdateJson,
                            batchStatusID: value.id,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="w-[240px] px-[5px]">
                  <div
                    className={`flex flex-col w-full items-start self-stretch`}
                  >
                    <label className="text-sm font-medium leading-tight text-gray-700">
                      Batch Type<span className="text-cyan-500">*</span>
                    </label>
                    <div className="w-full">
                      <SingleSelectDropDown
                        placeholder="-"
                        disabled={!!disableBatchType}
                        data={batchTypeDropdown}
                        selectedValue={
                          batchTypeDropdown.filter(
                            (a) => a.id === addUpdateJson.batchTypeID
                          )[0]
                        }
                        onSelect={(value) => {
                          handleAddUpdateJson({
                            ...addUpdateJson,
                            batchTypeID: value.id,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>

                {addUpdateJson.batchTypeID === 21 && (
                  <div className="w-[240px] px-[5px]">
                    <div
                      className={`flex flex-col w-full items-start self-stretch`}
                    >
                      <label className="text-sm font-medium leading-tight text-gray-700">
                        Lockbox Type<span className="text-cyan-500">*</span>
                      </label>
                      <div className="w-full">
                        <SingleSelectDropDown
                          placeholder="-"
                          disabled={!!disableBatchType}
                          data={lockboxTypeDropdown}
                          selectedValue={
                            lockboxTypeDropdown.find(
                              (a) => a.id === addUpdateJson.lockboxTypeID
                            ) || null
                          }
                          onSelect={(value) => {
                            handleAddUpdateJson({
                              ...addUpdateJson,
                              lockboxTypeID: value.id,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {!batchId && (
              <>
                <div className={'py-[15px] px-[5px]'}>
                  <div className={`h-[1px] w-full bg-gray-200`} />
                </div>
                <div className="flex w-full flex-col items-start">
                  <div className="flex flex-col items-start px-[5px] pb-[15px]">
                    <p className="text-base font-bold leading-normal text-gray-700">
                      Document Upload
                    </p>
                    <p className={`text-sm leading-tight text-gray-500`}>
                      {'PNG, JPG, PDF, TIF, ZIP up to 2GB'}
                    </p>
                  </div>
                  <div className="flex w-full">
                    <div className="px-[5px] md:w-[50%] lg:w-[25%]">
                      <div
                        className={`flex flex-col w-full items-start self-stretch`}
                      >
                        <label className="text-sm font-medium leading-5 text-gray-900">
                          Select File
                        </label>
                        <div className="flex">
                          <UploadFile
                            onFileSelect={(e) => {
                              const maxSize = e.size / 1024 / 1024;
                              if (maxSize > 2048) {
                                dispatch(
                                  addToastNotification({
                                    id: uuidv4(),
                                    text: 'File size limit exceeded.',
                                    toastType: ToastType.ERROR,
                                  })
                                );
                                return;
                              }
                              setSelectedFile(e);
                            }}
                            disabled={!!disableUpload}
                            selectedFileName={selectedFile?.name}
                            cls={'w-[280px] h-[38px] relative'}
                            isZip={isZip}
                          ></UploadFile>
                          <Button
                            buttonType={
                              !selectedFile?.name
                                ? ButtonType.secondary
                                : ButtonType.primary
                            }
                            cls={`ml-[15px] inline-flex h-[38px] justify-center items-center rounded-md leading-5 text-left font-medium pl-[17px] pr-[17px] w-[155px] `}
                            onClick={onUpload}
                            disabled={!selectedFile?.name}
                          >
                            Upload Document
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {!!selectedFilesList.length && (
                  <div ref={myRef} className="mt-6 px-[5px]">
                    <>
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
                            {selectedFilesList?.map((uploadDocRow, i) => (
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
                          </>
                        }
                      />
                    </>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex w-full items-center justify-center rounded-b-lg bg-gray-200 py-6">
            <div className="flex w-full items-center justify-end space-x-4 px-7">
              <Button
                buttonType={ButtonType.secondary}
                cls={`inline-flex px-4 py-2 gap-2 leading-5`}
                onClick={onPressClose}
              >
                <p className="text-sm font-medium leading-tight text-gray-700">
                  Cancel
                </p>
              </Button>
              <Button
                buttonType={ButtonType.primary}
                cls={`inline-flex px-4 py-2 gap-2 leading-5`}
                onClick={onCreate}
              >
                <p className="text-sm font-medium leading-tight">
                  {!batchId ? 'Create Document Batch' : 'SaveChanges'}
                </p>
              </Button>
            </div>
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
