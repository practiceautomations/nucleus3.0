import Drawer from '@mui/material/Drawer';
import React, { useEffect, useState } from 'react';

import Icon from '@/components/Icon';
import type { ClaimNotesData, CreateNotesCriteria } from '@/store/shared/types';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

import Button, { ButtonType } from '../Button';
import InputField from '../InputField';
import RadioButton from '../RadioButton';
import type { SingleSelectDropDownDataType } from '../SingleSelectDropDown';
import SingleSelectDropDown from '../SingleSelectDropDown';
import TextArea from '../TextArea';

export interface EditCreateNoteProps {
  data: SingleSelectDropDownDataType[];
  open: boolean;
  onClose: () => void;
  onAddNoteClick: (value: CreateNotesCriteria) => void;
  noteDetailsData: ClaimNotesData | undefined;
  selectedLineItemID: number | null;
  isCreateNote: boolean;
  isPatientNote: boolean;
  notesProfileType?: string;
}
export default function EditCreateClaimNote({
  onAddNoteClick,
  open,
  onClose,
  data,
  isCreateNote,
  noteDetailsData,
  selectedLineItemID,
  isPatientNote,
  notesProfileType = 'claim',
}: EditCreateNoteProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [note, onNoteChange] = useState<string>();
  const [isEditModeActive, setIsEditModeActive] = useState(false);
  const [noteSubject, onNoteSubjectChange] = useState<string>();
  const [selectedNoteType, onSelectNoteType] =
    useState<SingleSelectDropDownDataType>();
  const [showAlert, setShowAlert] = useState('false');
  useEffect(() => {
    if (noteDetailsData && !isCreateNote) {
      setIsEditMode(true);
      const noteType = data.filter(
        (m) => m.id === noteDetailsData?.noteTypeID
      )[0];
      if (noteType) {
        onSelectNoteType(noteType);
      }
      onNoteSubjectChange(noteDetailsData.subject);
      onNoteChange(noteDetailsData.comment);
    }
  }, [noteDetailsData]);
  useEffect(() => {
    if (isCreateNote) {
      setIsEditMode(false);
      onSelectNoteType(undefined);
      onNoteSubjectChange('');
      onNoteChange('');
    }
  }, [isCreateNote]);
  return (
    <Drawer
      sx={{
        width: '32%',
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: '32%',
          boxSizing: 'border-box',
        },
      }}
      variant="persistent"
      anchor="right"
      open={open}
      onClose={() => {
        onClose();
        setIsEditModeActive(false);
        setIsEditMode(false);
        onSelectNoteType(undefined);
        onNoteSubjectChange('');
        onNoteChange('');
      }}
    >
      <div className="flex h-full w-full flex-row">
        <div className="h-full w-[14px] flex-none border-x border-solid  border-gray-400 bg-gray-300"></div>

        <div className="flex w-full flex-col justify-between">
          <div className="inline-flex h-full w-full flex-col items-center justify-start bg-white shadow">
            <div className="inline-flex h-[76px] w-full items-center justify-between p-6">
              <div className="flex items-center justify-start ">
                <div
                  onClick={() => {
                    onClose();
                    setIsEditModeActive(false);
                    setIsEditMode(false);
                    onSelectNoteType(undefined);
                    onNoteSubjectChange('');
                    onNoteChange('');
                  }}
                  className="mt-1.5"
                >
                  {' '}
                  <Icon name={'chevronLeft'} size={18} />
                </div>
                <p className="text-lg font-medium leading-7 text-gray-900">
                  {noteDetailsData ? 'Note Details' : 'New Note'}
                </p>
              </div>
              <div className="flex flex-row gap-2">
                {((noteDetailsData &&
                  !isPatientNote &&
                  notesProfileType === 'claim') ||
                  (noteDetailsData &&
                    isPatientNote &&
                    notesProfileType === 'patient')) && (
                  <div>
                    <Button
                      data-testid="editNoteBtn"
                      buttonType={ButtonType.secondary}
                      cls={`h-[38px]  justify-center !px-2 !py-1 text-gray-700 inline-flex gap-2 leading-5`}
                      onClick={() => {
                        setIsEditMode(false);
                        setIsEditModeActive(true);
                      }}
                      disabled={isEditModeActive}
                    >
                      Edit
                      <Icon name={'pencil'} size={18} />
                    </Button>
                  </div>
                )}
                <div
                  className="h-[20px] self-center rounded-md border border-gray-300 bg-white"
                  onClick={() => {
                    onClose();
                    setIsEditModeActive(false);
                    setIsEditMode(false);
                    onSelectNoteType(undefined);
                    onNoteSubjectChange('');
                    onNoteChange('');
                  }}
                >
                  <Icon name={'close'} size={18} />
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col gap-4 bg-gray-100 p-[24px]">
              <div className="flex h-[38px] w-[400px] flex-row items-center justify-between">
                <div className="flex items-center ">
                  <p className="text-sm font-normal leading-5 text-gray-900">
                    Note Type:*
                  </p>
                </div>
                <div className="w-[318px]">
                  <SingleSelectDropDown
                    placeholder="Select note type from the dropdown list"
                    showSearchBar={true}
                    data={data}
                    disabled={isEditMode}
                    selectedValue={selectedNoteType}
                    onSelect={(e: SingleSelectDropDownDataType) => {
                      onSelectNoteType(e);
                    }}
                  />
                </div>
              </div>
              <div className={`w-[400px]  flex flex-row gap-2 justify-between`}>
                <label className="flex items-center text-sm font-medium leading-5 text-gray-900">
                  Subject:*
                </label>
                <div className="h-[38px] w-[318px]">
                  <InputField
                    value={noteSubject || ''}
                    onChange={(evt) => onNoteSubjectChange(evt.target.value)}
                    disabled={isEditMode}
                  />
                </div>
              </div>
              <div className={`w-[400px]  flex flex-row gap-2 justify-between`}>
                <label className="flex items-center text-sm font-medium leading-5 text-gray-900">
                  Show Alert: <span className="text-cyan-500">*</span>
                </label>
                <div className="h-[38px] w-[318px]">
                  <RadioButton
                    data={[
                      {
                        value: 'true',
                        label: 'Yes',
                      },
                      {
                        value: 'false',
                        label: 'No',
                      },
                    ]}
                    checkedValue={showAlert}
                    onChange={(e) => {
                      setShowAlert(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
            {noteDetailsData && (
              <div className="flex w-full flex-col">
                <div className="h-[52px] w-full bg-white">
                  <div className="inline-flex h-[52px] w-full items-start justify-start px-6 py-4">
                    <div className="flex h-[20px] w-full items-center justify-center space-x-4">
                      <div className="h-0.5 flex-1 bg-gray-300" />
                      <p className="text-center text-sm font-semibold leading-tight text-gray-500">
                        {noteDetailsData.createdOn
                          ? `${DateToStringPipe(noteDetailsData.createdOn, 3)}`
                          : ''}
                      </p>
                      <div className="h-0.5 flex-1 bg-gray-300" />
                    </div>
                  </div>
                </div>
                <div className="flex h-full w-full flex-col items-start justify-start bg-white">
                  <div className="inline-flex h-full w-full items-start justify-start px-6 py-4">
                    <div className="inline-flex w-full flex-col items-end justify-start space-y-2">
                      <div className="inline-flex w-full  items-start  justify-start space-x-4">
                        <div className="inline-flex h-[34px] w-[34px] flex-col items-center justify-center ">
                          <div className="flex h-[34px] w-[34px]  flex-1 flex-col items-center justify-center rounded-full bg-gray-100 shadow">
                            <Icon name={'userNote'} size={20} />
                          </div>
                        </div>
                        <div className="inline-flex flex-col items-start justify-start">
                          <p className="text-sm font-semibold leading-tight">
                            {noteDetailsData && noteDetailsData.createdBy}
                          </p>
                          <p className="w-full pr-12 text-sm leading-tight text-gray-700">
                            {noteDetailsData && noteDetailsData.comment}
                          </p>
                        </div>
                      </div>
                      <div className=" flex flex-col items-end justify-start space-y-2">
                        <p className="text-xs leading-3 text-gray-500">
                          {noteDetailsData.createdOn
                            ? `${DateToStringPipe(
                                noteDetailsData.createdOn,
                                7
                              )}`
                            : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {!isEditMode && (
            <div className="inline-flex h-[240px] w-full items-end justify-end space-x-4 bg-gray-100 p-6 ">
              <TextArea
                id="textarea"
                value={note}
                cls="!w-72 text-sm leading-tight text-gray-500 flex-1 h-full px-3 py-2 bg-white shadow border rounded-md border-gray-300"
                placeholder={'Click here to write note'}
                onChange={(e) => {
                  onNoteChange(e.target.value);
                }}
              />
              <div
                className="flex w-1/4 items-center justify-center rounded-md bg-cyan-500 px-4 py-2 shadow"
                onClick={() => {
                  setIsEditModeActive(false);
                  setIsEditMode(false);
                  onSelectNoteType(undefined);
                  onNoteSubjectChange('');
                  onNoteChange('');
                  if (selectedNoteType && selectedLineItemID) {
                    if (!isEditMode && noteDetailsData) {
                      onAddNoteClick({
                        noteID: noteDetailsData.id,
                        lineItemID: selectedLineItemID,
                        comment: note || '',
                        noteTypeID: selectedNoteType.id,
                        subject: noteSubject || '',
                        alert: showAlert,
                      });
                    } else {
                      onAddNoteClick({
                        lineItemID: selectedLineItemID,
                        noteID: null,
                        comment: note || '',
                        noteTypeID: selectedNoteType.id,
                        subject: noteSubject || '',
                        alert: showAlert,
                      });
                    }
                  }
                }}
              >
                <p className="text-sm font-medium leading-tight text-white">
                  {isEditModeActive ? 'Save' : 'Add Note'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
