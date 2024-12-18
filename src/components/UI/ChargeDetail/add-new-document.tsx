import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import {
  addToastNotification,
  fetchUploadedClaimDocumentDataRequest,
} from '@/store/shared/actions';
import { fetchAttachmentTypeDropdown, uploadFile } from '@/store/shared/sagas';
import type {
  IdValuePair,
  UploadedDocumentCriteria,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';

import Button, { ButtonType } from '../Button';
import CloseButton from '../CloseButton';
import type { SingleSelectDropDownDataType } from '../SingleSelectDropDown';
import SingleSelectDropDown from '../SingleSelectDropDown';
import StatusModal, { StatusModalType } from '../StatusModal';
import UploadFile from '../UploadFile';

interface AddNewDocumentModalProps {
  claimID: number | null;
  groupID: number | undefined;
  practiceID: number | undefined;
  patientID: number | null | undefined;
  onClose: () => void;
}
export function AddNewDocument({
  claimID,
  groupID,
  practiceID,
  patientID,
  onClose,
}: AddNewDocumentModalProps) {
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
  const [selectedattachmentType, setSelectedAttachmentType] =
    useState<SingleSelectDropDownDataType>();
  // const lookupsData = useSelector(getLookupDropdownsDataSelector);
  const [attachmentTypeDropdown, setAttachmentTypeDropdown] = useState<
    IdValuePair[]
  >([]);
  const [selectedFileName, setSelectedFileName] = useState<string>();
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState<File>();
  const getClaimDocumentData = () => {
    const getDocCriteria: UploadedDocumentCriteria = {
      claimID,
      groupID,
      categoryID: undefined,
    };
    dispatch(fetchUploadedClaimDocumentDataRequest(getDocCriteria));
  };

  const uploadClaimDocument = async () => {
    if (!selectedattachmentType) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please select an attachment type in order to upload a file.',
          toastType: ToastType.ERROR,
        })
      );
      return;
    }

    if (selectedFile && claimID && selectedattachmentType && groupID) {
      const file: File = selectedFile;
      const documentTypeID = 1;
      const formData: FormData = new FormData();
      formData.append('file', file);
      formData.append('attachedID', claimID.toString());
      formData.append('patientID', patientID ? patientID.toString() : '');
      formData.append('groupID', groupID.toString());
      formData.append('practiceID', practiceID ? practiceID.toString() : '');
      formData.append('categoryID', selectedattachmentType.id.toString());
      formData.append('documentTypeID', documentTypeID.toString());
      formData.append('eAttachment', '');
      const res = await uploadFile(formData);
      if (res) {
        setSelectedFile(undefined);
        setSelectedFileName(undefined);
        setSelectedAttachmentType(undefined);
        getClaimDocumentData();
      }
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
                onClose();
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
            <div className={`gap-2 flex items-end w-[280px] h-[62px]`}>
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
                      selectedValue={selectedattachmentType}
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
                  disabled={!!(!selectedattachmentType || !claimID)}
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
                    setSelectedFileName(e ? e.name : '');
                  }}
                  selectedFileName={selectedFileName}
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
                onClose();
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
                  uploadClaimDocument();
                  onClose();
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
  );
}
