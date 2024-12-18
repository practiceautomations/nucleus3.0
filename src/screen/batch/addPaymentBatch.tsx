import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Icon from '@/components/Icon';
import AppDatePicker from '@/components/UI/AppDatePicker';
import Button, { ButtonType } from '@/components/UI/Button';
import CloseButton from '@/components/UI/CloseButton';
import InputField from '@/components/UI/InputField';
import InputFieldAmount from '@/components/UI/InputFieldAmount';
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
  getLookupDropdownsRequest,
} from '@/store/shared/actions';
import {
  createPaymentBatch,
  deleteDocument,
  downloadDocumentBase64,
  fetchBatchStatus,
  fetchDocumentDataByID,
  fetchInsuranceData,
  fetchPaymentBatchByID,
  fetchPostingDate,
  updatePaymentBatch,
  uploadBatchDocument,
} from '@/store/shared/sagas';
import {
  getAllInsuranceDataSelector,
  getAssignClaimToDataSelector,
  getLookupDropdownsDataSelector,
} from '@/store/shared/selectors';
import type {
  AllInsuranceData,
  BatchDetailCriteria,
  PostingDateCriteria,
  TBatchUploadedDocument,
  TPaymentBatchType,
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
  onCreateBatch?: (id?: number) => void;
}

export default function AddPaymentBatch({
  open,
  batchId,
  onClose,
  hideBackdrop = true,
  onCreateBatch,
}: TProps) {
  const dispatch = useDispatch();
  const lookupsData = useSelector(getLookupDropdownsDataSelector);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const insuranceData = useSelector(getAllInsuranceDataSelector);
  const assignClaimToData = useSelector(getAssignClaimToDataSelector);
  const user = useSelector(getUserSelector);
  const batchcategoryID = useRef('4');
  const [isChangedJson, setIsChangedJson] = useState(false);
  const [batchStatusDropdown, setBatchStatusDropdown] = useState<
    SingleSelectDropDownDataType[]
  >([]);
  const [insuranceAllData, setInsuanceAllData] = useState<AllInsuranceData[]>(
    []
  );
  const myRef = useRef<HTMLTableRowElement>(null);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [selectedFilesList, setSelectedFileslist] = useState<
    TBatchUploadedDocument[]
  >([]);
  const [documentToDelete, setDocumentToDelete] =
    useState<TBatchUploadedDocument>();

  const getBatchStatus = async () => {
    const res = await fetchBatchStatus();
    if (res) {
      setBatchStatusDropdown(res);
    }
  };
  useEffect(() => {
    getBatchStatus();
    fetchInsuranceData();
    dispatch(getLookupDropdownsRequest());
  }, []);

  const [addUpdateJson, setAddUpdateJson] = useState<TPaymentBatchType>({
    groupID: undefined,
    description: '',
    paymentNumber: '',
    paymentDate: '',
    postingDate: '',
    depositDate: '',
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

  // const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);

  const [statusModalInfo, setStatusModalInfo] = useState(
    defaultStatusModalInfo
  );

  const handleInsuanceAllData = (groupID: number) => {
    setInsuanceAllData([...insuranceData.filter((m) => m.groupID === groupID)]);
  };
  const handleAddUpdateJson = (value: TPaymentBatchType, isGroup?: boolean) => {
    setAddUpdateJson(value);
    if (!isGroup) {
      setIsChangedJson(true);
    }
  };
  useEffect(() => {
    handleAddUpdateJson(
      {
        ...addUpdateJson,
        groupID: selectedWorkedGroup?.groupsData[0]?.id,
      },
      true
    );
  }, [selectedWorkedGroup]);

  useEffect(() => {
    const groupId = addUpdateJson.groupID;
    if (groupId) {
      dispatch(fetchAssignClaimToDataRequest({ clientID: groupId }));
    }
  }, [addUpdateJson.groupID]);

  useEffect(() => {
    if (addUpdateJson?.groupID) handleInsuanceAllData(addUpdateJson.groupID);
  }, [addUpdateJson?.groupID, insuranceData]);

  const postingDateCriteria: PostingDateCriteria = {
    id: addUpdateJson.groupID,
    type: 'charge',
    postingDate: DateToStringPipe(addUpdateJson.postingDate, 1),
  };
  const onCreate = async () => {
    if (
      !addUpdateJson.groupID ||
      !addUpdateJson.description ||
      !addUpdateJson.batchStatusID ||
      !addUpdateJson.paymentTypeID ||
      !addUpdateJson.paymentNumber ||
      !addUpdateJson.paymentDate ||
      !addUpdateJson.postingDate ||
      !addUpdateJson.depositDate
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
    const postingDateRes = await fetchPostingDate(postingDateCriteria);
    if (postingDateRes && postingDateRes.postingCheck === false) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Error',
        text: `${postingDateRes.message}`,
        type: StatusModalType.ERROR,
      });
      return;
    }

    const insuranceAmount = addUpdateJson.insuranceAmount || 0;
    const patientAmount = addUpdateJson.patientAmount || 0;
    const obj: TPaymentBatchType = {
      ...addUpdateJson,
      insuranceAmount,
      patientAmount,
      insuranceBalance: insuranceAmount,
      patientBalance: patientAmount,
      batchBalance: insuranceAmount + patientAmount,
    };

    let res: any = '';
    // in add mode
    if (!batchId) {
      const formData = new FormData();
      formData.append('paymentBatchJson', JSON.stringify(obj));
      selectedFilesList.forEach((d) => {
        if (d.file) formData.append('files', d.file);
      });
      res = await createPaymentBatch(formData);
      if (res && res.paymentBatchID) {
        if (onCreateBatch) {
          onCreateBatch(res.paymentBatchID);
        }
      }
    }
    // in update mode
    else {
      res = await updatePaymentBatch(obj);
    }

    if (res) {
      onClose(true);
      setAddUpdateJson({
        groupID: selectedWorkedGroup?.groupsData[0]?.id,
        description: '',
        paymentNumber: '',
        paymentDate: '',
        postingDate: '',
        depositDate: '',
      });
    } else {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Error',
        text: 'A system error prevented the batch to be created.\nPlease try again.',
        type: StatusModalType.ERROR,
      });
    }
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
    const res = await fetchPaymentBatchByID(id);
    if (res) {
      setAddUpdateJson(res);
    }
  };
  const getDocumentDataByID = async (obj: BatchDetailCriteria) => {
    const res = await fetchDocumentDataByID(obj);
    if (res) {
      setSelectedFileslist(res);
    }
  };

  useEffect(() => {
    if (batchId) {
      getBatchByID(batchId);
      const obj: BatchDetailCriteria = {
        ...defaultSearchCriteria,
        attachedID: batchId,
        typeID: batchcategoryID.current,
      };
      getDocumentDataByID(obj);
    }
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
          const obj: BatchDetailCriteria = {
            ...defaultSearchCriteria,
            attachedID: batchId,
            typeID: batchcategoryID.current,
          };
          await getDocumentDataByID(obj);
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
        const obj: BatchDetailCriteria = {
          ...defaultSearchCriteria,
          attachedID: batchId,
          typeID: batchcategoryID.current,
        };
        await getDocumentDataByID(obj);
      }
    }
  };

  // const columns: GridColDef[] = [
  //   {
  //     field: 'id',
  //     headerName: 'Document ID',
  //     flex: 1,
  //     minWidth: 150,
  //     disableReorder: true,
  //   },
  //   {
  //     field: 'title',
  //     headerName: 'Document Name',
  //     flex: 1,
  //     minWidth: 320,
  //     disableReorder: true,
  //   },
  //   {
  //     field: 'documentType',
  //     headerName: 'File Type',
  //     flex: 1,
  //     minWidth: 100,
  //     disableReorder: true,
  //   },
  //   {
  //     field: 'createdBy',
  //     headerName: 'Uploaded By',
  //     flex: 1,
  //     minWidth: 200,
  //     disableReorder: true,
  //   },
  //   {
  //     field: 'createdOn',
  //     headerName: 'Uploaded On',
  //     flex: 1,
  //     minWidth: 250,
  //     disableReorder: true,
  //   },
  //   {
  //     field: 'action',
  //     headerName: 'Actions',
  //     flex: 1,
  //     minWidth: 180,
  //     hideSortIcons: true,
  //     disableReorder: true,
  //     cellClassName: '!bg-cyan-50 PinnedColumLeftBorder',
  //     headerClassName: '!bg-cyan-100 !text-center PinnedColumLeftBorder',
  //     renderCell: (params) => {
  //       return (
  //         <div className="flex flex-row gap-2">
  //           <Button
  //             buttonType={ButtonType.secondary}
  //             onClick={() => {
  //               onViewDacument(params.row);
  //             }}
  //             cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
  //           >
  //             <Icon name={'eye'} size={18} />
  //           </Button>
  //           <Button
  //             buttonType={ButtonType.secondary}
  //             disabled={false}
  //             cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
  //             onClick={() => {
  //               onDownloadDacument(params.row);
  //             }}
  //           >
  //             <Icon name={'documentDownload'} size={18} />
  //           </Button>
  //           <Button
  //             buttonType={ButtonType.secondary}
  //             disabled={true}
  //             cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
  //             onClick={() => {
  //               setDocumentToDelete(params.row);
  //               setStatusModalInfo({
  //                 ...statusModalInfo,
  //                 show: true,
  //                 heading: 'Delete Confirmation',
  //                 text: `Are you sure you want to delete ${params.row.title}?`,
  //                 type: StatusModalType.WARNING,
  //                 showCloseButton: true,
  //                 okButtonText: 'Confirm',
  //                 confirmActionType: 'deleteConfirmation',
  //               });
  //             }}
  //           >
  //             <Icon name={'trash'} size={18} />
  //           </Button>
  //         </div>
  //       );
  //     },
  //   },
  // ];

  return (
    <>
      <Modal
        open={open}
        onClose={() => {}}
        modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
        modalBackgroundClassName={'!overflow-hidden'}
        modalClassName={'!z-[13]'}
        // !z-[4]
        hideBackdrop={hideBackdrop}
      >
        <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-gray-100 shadow">
          <div className="flex w-full flex-col items-start justify-start p-6">
            <div className="inline-flex w-full items-center justify-between">
              <div className="flex items-center justify-start space-x-2">
                <p className="text-xl font-bold leading-7 text-gray-700">
                  {batchId
                    ? `Payment Batch - ID #(${batchId}) - Edit`
                    : 'New Payment Batch'}
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
              <div className="px-[5px] md:w-[50%] lg:w-[25%]">
                <div
                  className={`flex flex-col w-full items-start justify-start self-stretch`}
                >
                  <label className="text-sm font-medium leading-tight text-gray-700">
                    Group <span className="text-cyan-500">*</span>
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
                        handleAddUpdateJson(
                          {
                            ...addUpdateJson,
                            groupID: value.id,
                            insuranceID: undefined,
                            followupAssignee: undefined,
                          },
                          true
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="px-[5px] md:w-[50%] lg:w-[25%]">
                <div
                  className={`flex flex-col w-full items-start justify-start self-stretch`}
                >
                  <label className="text-sm font-medium leading-tight text-gray-700">
                    Insurance
                  </label>
                  <div className="w-full">
                    <SingleSelectDropDown
                      placeholder="-"
                      showSearchBar={true}
                      disabled={false}
                      data={insuranceAllData}
                      selectedValue={
                        insuranceAllData.filter(
                          (f) => f.id === addUpdateJson.insuranceID
                        )[0]
                      }
                      onSelect={(value) => {
                        handleAddUpdateJson({
                          ...addUpdateJson,
                          insuranceID: value.id,
                        });
                      }}
                      isOptional={true}
                      onDeselectValue={() => {
                        handleAddUpdateJson({
                          ...addUpdateJson,
                          insuranceID: undefined,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="px-[5px] md:w-[50%] lg:w-[25%]">
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
                        assignClaimToData
                          ? (assignClaimToData as SingleSelectDropDownDataType[])
                          : []
                      }
                      selectedValue={
                        assignClaimToData?.filter(
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
                <div className="px-[5px] md:w-[50%] lg:w-[25%]">
                  <div
                    className={`flex flex-col w-full items-start self-stretch`}
                  >
                    <label className="text-sm font-medium leading-tight text-gray-700">
                      Description <span className="text-cyan-500">*</span>
                    </label>
                    <div
                      data-testid="payment_batch_description"
                      className="w-full"
                    >
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
                <div className="px-[5px] md:w-[50%] lg:w-[25%]">
                  <div
                    className={`flex flex-col w-full items-start self-stretch`}
                  >
                    <label className="text-sm font-medium leading-tight text-gray-700">
                      Payment Batch Status{' '}
                      <span className="text-cyan-500">*</span>
                    </label>
                    <div data-testid="payment_batch_status" className="w-full">
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
                <div className="px-[5px] md:w-[50%] lg:w-[25%]">
                  <div
                    className={`flex flex-col w-full items-start self-stretch`}
                  >
                    <label className="text-sm font-medium leading-tight text-gray-700">
                      Payment Type <span className="text-cyan-500">*</span>
                    </label>
                    <div data-testid="payment_batch_type" className="w-full">
                      <SingleSelectDropDown
                        placeholder="-"
                        disabled={false}
                        data={
                          lookupsData?.method
                            ? (lookupsData?.method as SingleSelectDropDownDataType[])
                            : []
                        }
                        selectedValue={
                          lookupsData?.method?.filter(
                            (m) => m.id === addUpdateJson.paymentTypeID
                          )[0]
                        }
                        onSelect={(value) => {
                          handleAddUpdateJson({
                            ...addUpdateJson,
                            paymentTypeID: value.id,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="px-[5px] md:w-[50%] lg:w-[25%]">
                  <div
                    className={`flex flex-col w-full items-start self-stretch`}
                  >
                    <label className="text-sm font-medium leading-tight text-gray-700">
                      Payment Number <span className="text-cyan-500">*</span>
                    </label>
                    <div data-testid="payment_number" className="w-full">
                      <InputField
                        placeholder="-"
                        value={addUpdateJson?.paymentNumber}
                        onChange={(evt) => {
                          handleAddUpdateJson({
                            ...addUpdateJson,
                            paymentNumber: evt.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex w-full">
                <div className="px-[5px] md:w-[50%] lg:w-[25%]">
                  <div
                    className={`flex flex-col w-full items-start self-stretch`}
                  >
                    <label className="truncate-overflow truncate text-sm font-medium leading-tight text-gray-700">
                      Payment Date <span className="text-cyan-500">*</span>
                    </label>
                    <div data-testid="payment_date" className="w-full">
                      <AppDatePicker
                        cls="!mt-1"
                        selected={addUpdateJson.paymentDate}
                        onChange={(value) => {
                          handleAddUpdateJson({
                            ...addUpdateJson,
                            paymentDate: value
                              ? DateToStringPipe(value, 1)
                              : '',
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="px-[5px] md:w-[50%] lg:w-[25%]">
                  <div
                    className={`flex flex-col w-full items-start self-stretch`}
                  >
                    <label className="truncate-overflow truncate text-sm font-medium leading-tight text-gray-700">
                      Posting Date <span className="text-cyan-500">*</span>
                    </label>
                    <div data-testid="posting_date" className="w-full">
                      <AppDatePicker
                        cls="!mt-1"
                        selected={addUpdateJson.postingDate}
                        onChange={(value) => {
                          handleAddUpdateJson({
                            ...addUpdateJson,
                            postingDate: value
                              ? DateToStringPipe(value, 1)
                              : '',
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="px-[5px] md:w-[50%] lg:w-[25%]">
                  <div
                    className={`flex flex-col w-full items-start self-stretch`}
                  >
                    <label className="truncate-overflow truncate text-sm font-medium leading-tight text-gray-700">
                      Deposit Date <span className="text-cyan-500">*</span>
                    </label>
                    <div data-testid="deposit_date" className="w-full">
                      <AppDatePicker
                        cls="!mt-1"
                        selected={addUpdateJson.depositDate}
                        onChange={(value) => {
                          handleAddUpdateJson({
                            ...addUpdateJson,
                            depositDate: value
                              ? DateToStringPipe(value, 1)
                              : '',
                          });
                        }}
                      />
                    </div>
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
                  Batch Content
                </p>
              </div>
              <div className="flex w-full">
                <div className="px-[5px] md:w-[50%] lg:w-[25%]">
                  <div
                    className={`flex flex-col w-full items-start self-stretch`}
                  >
                    <label className="truncate-overflow truncate text-sm font-medium leading-tight text-gray-700">
                      Total Insurance Payments in Batch
                    </label>
                    <div data-testid="total_ins_pay_batch" className="w-full">
                      <InputFieldAmount
                        placeholder="-"
                        value={addUpdateJson?.insuranceAmount}
                        onChange={(evt) => {
                          handleAddUpdateJson({
                            ...addUpdateJson,
                            insuranceAmount: evt.target.value
                              ? Number(evt.target.value)
                              : undefined,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="px-[5px] md:w-[50%] lg:w-[25%]">
                  <div
                    className={`flex flex-col w-full items-start self-stretch`}
                  >
                    <label className="truncate-overflow truncate text-sm font-medium leading-tight text-gray-700">
                      Total Patient Payments in Batch
                    </label>
                    <div className="w-full">
                      <InputFieldAmount
                        placeholder="-"
                        value={addUpdateJson?.patientAmount}
                        onChange={(evt) => {
                          handleAddUpdateJson({
                            ...addUpdateJson,
                            patientAmount: evt.target.value
                              ? Number(evt.target.value)
                              : undefined,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={'py-[15px] px-[5px]'}>
              <div className={`h-[1px] w-full bg-gray-200`} />
            </div>
            <div className="flex w-full flex-col items-start">
              <div className="flex flex-col items-start px-[5px] pb-[15px]">
                <p className="text-base font-bold leading-normal text-gray-700">
                  Document Upload
                </p>
                <p className={`text-sm leading-tight text-gray-500`}>
                  {'PNG, JPG, PDF up to 50MB'}
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
                          if (maxSize > 50) {
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
                        selectedFileName={selectedFile?.name}
                        cls={'w-[280px] h-[38px] relative'}
                      ></UploadFile>
                      <Button
                        buttonType={
                          !selectedFile?.name
                            ? ButtonType.secondary
                            : ButtonType.primary
                        }
                        cls={`ml-[15px] inline-flex h-[38px] justify-center items-center rounded-md leading-5 text-left font-medium pl-[17px] pr-[17px] w-[102.03px] `}
                        onClick={onUpload}
                        disabled={!selectedFile?.name}
                      >
                        Upload
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
                            <AppTableCell>{uploadDocRow.title}</AppTableCell>
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
                                    <Icon name={'documentDownload'} size={18} />
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
                                        confirmActionType: 'deleteConfirmation',
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
                  {/* <div className="flex w-full flex-col">
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
                        onPageSizeChange={(pageSize: number, page: number) => {
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
                  </div> */}
                </>
              </div>
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
                <p
                  data-testid="new_payment_batch"
                  className="text-sm font-medium leading-tight"
                >
                  {!batchId ? 'Create Payment Batch' : 'Save Changes'}
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
            handleAddUpdateJson(
              {
                groupID: selectedWorkedGroup?.groupsData[0]?.id,
                description: '',
                paymentNumber: '',
                paymentDate: '',
                postingDate: '',
                depositDate: '',
              },
              true
            );
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
