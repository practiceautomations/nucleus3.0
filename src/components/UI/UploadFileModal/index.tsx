import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Modal from '@/components/UI/Modal';
import {
  addToastNotification,
  getLookupDropdownsRequest,
} from '@/store/shared/actions';
import { getLookupDropdownsDataSelector } from '@/store/shared/selectors';
import { ToastType } from '@/store/shared/types';

import Button, { ButtonType } from '../Button';
import CloseButton from '../CloseButton';
import type { SingleSelectDropDownDataType } from '../SingleSelectDropDown';
import SingleSelectDropDown from '../SingleSelectDropDown';
import StatusModal, { StatusModalType } from '../StatusModal';
import UploadFile from '../UploadFile';

interface TProps {
  open: boolean;
  title?: string;
  showAttachmentTypeDropdown?: boolean;
  onUploadDocument: (
    file: File,
    attachmentType?: SingleSelectDropDownDataType
  ) => void;
  onClose: () => void;
}
export function UploadFileModal({
  open,
  title = 'Add New Document',
  showAttachmentTypeDropdown = false,
  onClose,
  onUploadDocument,
}: TProps) {
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
  const lookupsData = useSelector(getLookupDropdownsDataSelector);
  const [selectedFileName, setSelectedFileName] = useState<string>();
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState<File>();

  const uploadClaimDocument = async () => {
    if (
      !selectedFile ||
      (showAttachmentTypeDropdown && !selectedattachmentType)
    ) {
      setChangeModalState({
        ...changeModalState,
        open: true,
        heading: 'Alert',
        statusModalType: StatusModalType.WARNING,
        description:
          'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
      });
      return;
    }
    onUploadDocument(selectedFile, selectedattachmentType);
  };

  useEffect(() => {
    if (open) {
      setSelectedFile(undefined);
      setSelectedFileName(undefined);
      setSelectedAttachmentType(undefined);
    }
  }, [open]);

  useEffect(() => {
    if (showAttachmentTypeDropdown) dispatch(getLookupDropdownsRequest());
  }, []);

  return (
    <Modal
      open={open}
      onClose={() => {}}
      modalContentClassName="rounded-lg bg-gray-100 h-[300px] text-left shadow-xl "
    >
      <div className="w-[913px] ">
        <div className="mx-[27px] flex h-[60px] items-center justify-between gap-4">
          <div className="flex h-[24px]">
            <p className="self-center text-xl font-bold leading-7 text-gray-700">
              {title}
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
        <div className="px-[27px]">
          <div className="h-px w-full bg-gray-300" />
        </div>
        <div className="ml-[27px] mt-[15px]">
          <p className="flex h-[20px] w-[300px] text-sm font-normal leading-5">
            PNG, JPG, PDF, CSV up to 50MB
          </p>
          <div className={`gap-4 flex items-start mt-[16px] `}>
            {showAttachmentTypeDropdown && (
              <div className={`relative w-[280px]`}>
                <div className={`gap-2 flex items-end w-[280px] h-[62px]`}>
                  <div className={`relative w-[280px]`}>
                    <div className={`w-full items-start self-stretch`}>
                      <label className="text-sm font-medium leading-5 text-gray-900">
                        Attachment Type <span className="text-cyan-500">*</span>
                      </label>
                      <div className="w-[280px]">
                        <SingleSelectDropDown
                          placeholder="Attachment Type"
                          showSearchBar={true}
                          disabled={false}
                          data={
                            lookupsData?.documentAttachmentType
                              ? (lookupsData?.documentAttachmentType as SingleSelectDropDownDataType[])
                              : []
                          }
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
            )}
            <div className={`relative gap-4 flex items-end`}>
              <div className={`relative w-[280px]`}>
                <div
                  className={`w-full items-start gap-1 flex flex-col self-stretch`}
                >
                  <label className="text-sm font-medium leading-5 text-gray-900">
                    Select File <span className="text-cyan-500">*</span>
                  </label>
                  <UploadFile
                    disabled={
                      !showAttachmentTypeDropdown
                        ? false
                        : !selectedattachmentType
                    }
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
                  uploadClaimDocument();
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
  );
}
