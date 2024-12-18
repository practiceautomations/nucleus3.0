import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import UploadFile from '@/components/UI/UploadFile';
import { addToastNotification } from '@/store/shared/actions';
import {
  deleteDocument,
  downloadDocumentBase64,
  fetchAttachmentTypeDropdown,
  getPatientDocumentData,
  uploadPatientDocs,
} from '@/store/shared/sagas';
// import { getLookupDropdownsDataSelector } from '@/store/shared/selectors';
import type { IdValuePair, PatientDocumnetData } from '@/store/shared/types';
import { type GetPatientRequestData, ToastType } from '@/store/shared/types';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

import Icon from '../Icon';
import Button, { ButtonType } from '../UI/Button';
import CloseButton from '../UI/CloseButton';
import Modal from '../UI/Modal';
import type { SingleSelectDropDownDataType } from '../UI/SingleSelectDropDown';
import SingleSelectDropDown from '../UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '../UI/StatusModal';
import AppTable, { AppTableCell, AppTableRow } from '../UI/Table';

export interface DocumentsTabProps {
  patientID: number | null;
  selectedPatientData: GetPatientRequestData;
}

export default function DocumentsTab({
  patientID,
  selectedPatientData,
}: DocumentsTabProps) {
  const dispatch = useDispatch();

  const [selectedFile, setSelectedFile] = useState<File>();
  const [documentData, setDocumentData] = useState<PatientDocumnetData[]>([]);
  const [selectedAttachmentType, setSelectedAttachmentType] =
    useState<SingleSelectDropDownDataType>();
  const getDocumentDataByID = async () => {
    if (selectedPatientData.groupID) {
      const res = await getPatientDocumentData(patientID);
      if (res) {
        setDocumentData(res);
        // setTabs(
        //   tabs.map((d) => {
        //     return { ...d, count: d.id === 8 ? res.length : d.count };
        //   })
        // );
      }
    }
  };
  // const allLookupsData = useSelector(getLookupDropdownsDataSelector);
  // const [lookupsData, setLookupsData] = useState<LookupDropdownsData | null>(
  //   null
  // );
  const [attachmentTypeDropdown, setAttachmentTypeDropdown] = useState<
    IdValuePair[]
  >([]);
  const [changeModalState, setChangeModalState] = useState<{
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
  // useEffect(() => {
  //   if (allLookupsData) {
  //     setLookupsData(allLookupsData);
  //   }
  // }, [allLookupsData]);
  useEffect(() => {
    if (patientID && selectedPatientData.groupID) {
      getDocumentDataByID();
    }
  }, [selectedPatientData.groupID]);
  const myRef = useRef<HTMLTableRowElement>(null);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState<boolean>(false);
  const onUpload = async () => {
    if (selectedFile) {
      // in update mode
      if (patientID) {
        const formData = new FormData();
        formData.append('patientID', String(patientID));
        formData.append('attachedID', String(patientID));
        formData.append(
          'groupID',
          selectedPatientData.groupID ? String(selectedPatientData.groupID) : ''
        );
        formData.append(
          'practiceID',
          selectedPatientData.practiceID
            ? String(selectedPatientData.practiceID)
            : ''
        );
        formData.append('file', selectedFile);
        formData.append('categoryID', String(selectedAttachmentType?.id));
        formData.append('documentTypeID', String(3));

        const res = await uploadPatientDocs(formData);
        if (res) {
          getDocumentDataByID();
        } else {
          return;
        }
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

  const getAttachmentTypeDropdown = async () => {
    const res = await fetchAttachmentTypeDropdown();
    if (res) {
      setAttachmentTypeDropdown(res);
    }
  };

  useEffect(() => {
    getAttachmentTypeDropdown();
  }, []);

  return (
    <>
      <StatusModal
        open={changeModalState.open}
        heading={changeModalState.heading}
        description={changeModalState.description}
        closeButtonText={'Ok'}
        statusModalType={changeModalState.statusModalType}
        showCloseButton={false}
        closeOnClickOutside={false}
        onChange={() => {
          setChangeModalState({
            ...changeModalState,
            open: false,
          });
        }}
      />
      <div
        className=" inline-flex flex-col items-start justify-end space-y-6"
        style={{ width: 401, height: 102 }}
      >
        <div
          className="mb-[24px] inline-flex  items-center justify-start"
          style={{ width: 401, height: 38 }}
        >
          <div className="inline-flex text-xl font-bold leading-5 text-gray-700">
            <div className="mt-[10px] w-[390px]"> Patient Documents List</div>
            <div className={`w-full items-start self-stretch `}>
              <Button
                buttonType={ButtonType.primary}
                cls={`ml-[16px] !justify-center h-[38px]`}
                onClick={() => {
                  setIsDocumentsOpen(true);
                  setSelectedAttachmentType(undefined);
                  setSelectedFile(undefined);
                }}
              >
                <p className="text-justify text-sm "> Add New Document</p>
              </Button>
            </div>
            <Modal
              open={isDocumentsOpen}
              onClose={() => {
                setIsDocumentsOpen(false);
              }}
              modalContentClassName="rounded-lg bg-gray-100 h-[325px] text-left shadow-xl "
            >
              <div className="w-[913px] ">
                <div className="flex items-start justify-between gap-4 p-[14px]  ">
                  <div className="flex h-[24px] gap-4 p-[24px] ">
                    <p className="self-center text-xl font-bold leading-7 text-gray-700">
                      Add New Document
                    </p>
                  </div>
                  <div className=" flex items-center justify-end gap-5">
                    <div className={``}></div>
                    <div className="">
                      <CloseButton
                        onClick={() => {
                          setIsDocumentsOpen(false);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mx-8 ">
                  <div className="h-px w-full bg-gray-300" />
                </div>
                <div className="ml-[27px] mt-[15px]">
                  <p className="flex h-[20px] w-[300px] text-sm font-normal leading-5">
                    PNG, JPG, PDF, CSV up to 50MB
                  </p>
                  <div className={`gap-4 flex items-start mt-[16px] `}>
                    <div className={`relative w-[280px]`}>
                      <div
                        className={`gap-2 flex items-end w-[280px] h-[62px]`}
                      >
                        <div className={`relative w-[280px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <label className="text-sm font-medium leading-5 text-gray-900">
                              Attachment Type*
                            </label>
                            <div className="w-[280px]">
                              <SingleSelectDropDown
                                placeholder="Attachment Type"
                                showSearchBar={true}
                                disabled={false}
                                data={attachmentTypeDropdown}
                                selectedValue={selectedAttachmentType}
                                onSelect={(value) => {
                                  setSelectedAttachmentType(value);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`relative gap-4 flex items-end`}>
                      <div className={`relative w-[280px]`}>
                        <div
                          className={`w-full items-start gap-1 flex flex-col self-stretch`}
                        >
                          <label className="text-sm font-medium leading-5 text-gray-900">
                            Select File*
                          </label>
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-[49px] rounded-lg bg-gray-200 py-[24px] pr-[27px]">
                  <div className={`gap-4 flex justify-end `}>
                    <div>
                      <Button
                        buttonType={ButtonType.secondary}
                        cls={` `}
                        onClick={() => {
                          setIsDocumentsOpen(false);
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
                          if (!selectedFile) {
                            setChangeModalState({
                              ...changeModalState,
                              open: true,
                              heading: 'Alert',
                              statusModalType: StatusModalType.WARNING,
                              description:
                                'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
                            });
                          } else {
                            onUpload();
                            setIsDocumentsOpen(false);
                          }
                        }}
                      >
                        {' '}
                        Upload Document
                      </Button>
                      <StatusModal
                        open={changeModalState.open}
                        heading={changeModalState.heading}
                        description={changeModalState.description}
                        closeButtonText={'Ok'}
                        statusModalType={changeModalState.statusModalType}
                        showCloseButton={false}
                        closeOnClickOutside={false}
                        onChange={() => {
                          setChangeModalState({
                            ...changeModalState,
                            open: false,
                          });
                        }}
                      />
                    </div>
                    <div></div>
                  </div>
                </div>
              </div>
            </Modal>
          </div>
        </div>
      </div>
      {!documentData.length ? (
        <div className="relative h-40 w-96 text-sm leading-tight text-gray-500">
          {`There are currently no document for this patient. To add a document, click the "Add New Document" button.`}
        </div>
      ) : (
        <>
          <AppTable
            cls="max-h-[400px]  "
            renderHead={
              <>
                <AppTableRow cls="bg-gray-200">
                  <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                    Document ID{' '}
                  </AppTableCell>
                  <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                    Document Title{' '}
                  </AppTableCell>
                  <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                    File Type{' '}
                  </AppTableCell>
                  <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                    Attachment Type{' '}
                  </AppTableCell>
                  <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                    Created By{' '}
                  </AppTableCell>
                  <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                    Created On{' '}
                  </AppTableCell>
                  <AppTableCell cls="bg-cyan-50 !border !border-bottom !border-gray-200 !font-bold !py-2 !whitespace-nowrap !px-4">
                    Action{' '}
                  </AppTableCell>
                </AppTableRow>
              </>
            }
            renderBody={
              <>
                {documentData?.map((uploadDocRow) => (
                  <AppTableRow key={uploadDocRow?.id}>
                    <AppTableCell>{`#${uploadDocRow?.id}`}</AppTableCell>
                    <AppTableCell>{uploadDocRow.title}</AppTableCell>
                    <AppTableCell>
                      {uploadDocRow.documentType.substring(1).toUpperCase()}
                    </AppTableCell>
                    <AppTableCell>{uploadDocRow.category}</AppTableCell>
                    <AppTableCell>{uploadDocRow.createdBy}</AppTableCell>
                    <AppTableCell>
                      {DateToStringPipe(uploadDocRow.createdOn, 6)}
                    </AppTableCell>
                    <AppTableCell cls="bg-cyan-50">
                      <div className="flex gap-x-2">
                        <>
                          <Button
                            buttonType={ButtonType.secondary}
                            onClick={async () => {
                              const downloadDocData =
                                await downloadDocumentBase64(uploadDocRow.id);
                              if (
                                downloadDocData &&
                                downloadDocData.documentBase64
                              ) {
                                const pdfResult =
                                  downloadDocData.documentBase64;
                                const pdfWindow = window.open('');
                                if (
                                  downloadDocData.documentExtension !== '.pdf'
                                ) {
                                  if (pdfWindow) {
                                    pdfWindow.document.write(
                                      `<iframe  width='100%' height='100%'  style='position:fixed; top:0; left:0; bottom:0; right:0; transform: translate(5%, 5%); width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;' src='data:image/png;base64, ${encodeURI(
                                        pdfResult
                                      )}'></iframe>`
                                    );
                                  }
                                } else if (pdfWindow) {
                                  pdfWindow.document.write(
                                    `<iframe width='100%' height='100%' src='data:application/pdf;base64, ${encodeURI(
                                      pdfResult
                                    )}'></iframe>`
                                  );
                                }
                              }
                            }}
                            cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                          >
                            <Icon name={'eye'} size={18} />
                          </Button>
                          <Button
                            buttonType={ButtonType.secondary}
                            cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                            onClick={async () => {
                              const downloadDocData =
                                await downloadDocumentBase64(uploadDocRow.id);
                              if (
                                downloadDocData &&
                                downloadDocData.documentBase64
                              ) {
                                const a = document.createElement('a');
                                a.href = `data:application/octet-stream;base64,${downloadDocData.documentBase64}`;
                                a.download =
                                  downloadDocData.documentName +
                                  downloadDocData.documentExtension;
                                a.click();
                              }
                            }}
                          >
                            <Icon name={'documentDownload'} size={18} />
                          </Button>
                          <Button
                            buttonType={ButtonType.secondary}
                            cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                            onClick={async () => {
                              const docDelete = await deleteDocument(
                                uploadDocRow.id
                              );
                              if (docDelete) {
                                getDocumentDataByID();
                              }
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
      )}
    </>
  );
}
