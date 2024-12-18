import { Button as MuiButton } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Icon from '@/components/Icon';
import {
  createClaimNote,
  createClaimsNote,
  DeleteNotes,
  fetchClaimNotesData,
  getClaimNoteType,
} from '@/store/shared/sagas';
import { getAssignClaimToDataSelector } from '@/store/shared/selectors';
import type { ClaimNotesData, CreateNotesCriteria } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

import Tabs2 from '../OrganizationSelector/Tabs';
import Button, { ButtonType } from '../UI/Button';
import type { FilterModalTabProps } from '../UI/FilterModal';
import FilterModal from '../UI/FilterModal';
import InputField from '../UI/InputField';
import RadioButton from '../UI/RadioButton';
import type { SingleSelectDropDownDataType } from '../UI/SingleSelectDropDown';
import SingleSelectDropDown from '../UI/SingleSelectDropDown';
import type { StatusModalProps } from '../UI/StatusModal';
import StatusModal, { StatusModalType } from '../UI/StatusModal';
import TextArea from '../UI/TextArea';

interface ActivefiltersProps {
  id: number | string | undefined;
  value: string;
  type: string | undefined;
}

interface TTabOptions {
  filterValue: string;
  name: string;
}

interface TAddEditViewNotesProps {
  id?: number;
  ids?: number[];
  action?: string;
  open: boolean;
  noteType?: string;
  noteTypesData?: SingleSelectDropDownDataType[];
  groupID?: number;
  noteDetailsData?: ClaimNotesData;
  onClose?: (isAddEdit?: boolean) => void;
  disableBackdropClick?: boolean;
  hideBackdropColor?: boolean;
  noteTypeID?: number;
  subject?: string;
}

export function AddEditViewNotes({
  id,
  ids,
  action,
  open,
  noteType,
  noteTypesData,
  groupID,
  noteDetailsData,
  onClose,
  disableBackdropClick,
  hideBackdropColor = false,
  noteTypeID,
  subject,
}: TAddEditViewNotesProps) {
  const [noteTypeData, setNoteTypeData] = React.useState<
    SingleSelectDropDownDataType[]
  >([]);
  const [isAddEditMode, setIsAddEditMode] = React.useState(true);
  const [isDisableButton, setIsDisableButton] = React.useState(true);
  const [noteID, setNoteID] = useState<number>();
  const [isChangedJson, setIsChangedJson] = useState(false);
  const [statusModalConfirmActionType, setStatusModalConfirmActionType] =
    useState('');
  const [statusModalState, setStatusModalState] = useState<StatusModalProps>({
    open: false,
    heading: '',
    description: '',
    okButtonText: 'Ok',
    okButtonColor: ButtonType.secondary,
    statusModalType: StatusModalType.ERROR,
    showCloseButton: false,
    closeOnClickOutside: false,
  });
  const defaultAddEditNoteCriteria: CreateNotesCriteria = {
    noteID: null,
    lineItemID: id,
    noteTypeID: noteTypeID || 0,
    subject: subject || '',
    comment: '',
    alert: 'false',
  };
  const [addEditNoteCriteria, setAddEditNoteCriteria] =
    React.useState<CreateNotesCriteria>(defaultAddEditNoteCriteria);

  useEffect(() => {
    if (noteTypesData) {
      setNoteTypeData(noteTypesData);
    }
  }, [noteTypesData]);

  useEffect(() => {
    if (noteDetailsData) {
      setAddEditNoteCriteria({
        ...addEditNoteCriteria,
        noteTypeID: noteDetailsData.noteTypeID,
        subject: noteDetailsData.subject,
        comment: noteDetailsData.comment,
        alert: noteDetailsData.alert === 'Yes' ? 'true' : 'false',
      });
      setIsAddEditMode(false);
    } else {
      setAddEditNoteCriteria(defaultAddEditNoteCriteria);
      setIsAddEditMode(true);
    }
    if (open) {
      setIsChangedJson(false);
    }
  }, [noteDetailsData, open]);

  const getNoteTypeData = async (type: string) => {
    const res = await getClaimNoteType(groupID || null, type);
    if (res) {
      setNoteTypeData(res);
    }
  };
  useEffect(() => {
    const checkDate = () => {
      const inputDateObj = new Date(
        noteDetailsData?.createdOn ? noteDetailsData?.createdOn : ''
      );
      const currentDate = new Date();
      const timeDifference = currentDate.getTime() - inputDateObj.getTime();
      // Check if the time difference is greater than or equal to 24 hours
      if (timeDifference >= 24 * 60 * 60 * 1000) {
        setIsDisableButton(true);
      } else {
        setIsDisableButton(false);
      }
    };

    checkDate();
  }, [noteDetailsData]);
  useEffect(() => {
    if (!noteTypesData && !!noteType && noteTypeData.length === 0) {
      getNoteTypeData(noteType);
    }
  }, []);

  const handleSetAddEditNoteCriteria = (c: CreateNotesCriteria) => {
    setAddEditNoteCriteria(c);
    setIsChangedJson(true);
  };
  const handleCloseAddEditNoteModal = () => {
    if (isChangedJson) {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Cancel Confirmation',
        description:
          'Are you sure you want to cancel creating this note? Clicking "Confirm" will result in the loss of all changes.',
        okButtonText: 'Confirm',
        closeButtonText: 'Cancel',
        statusModalType: StatusModalType.WARNING,
        showCloseButton: true,
        closeOnClickOutside: false,
      });
      setStatusModalConfirmActionType('cancelConfirmation');
      return;
    }
    if (onClose) onClose();
  };
  const deleteNote = async (NoteId: number) => {
    const res = await DeleteNotes(NoteId);
    if (res) {
      handleCloseAddEditNoteModal();
      if (onClose) onClose(true);
      setStatusModalConfirmActionType('');
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Success',
        description: 'Note Deleted Successfully',
        okButtonText: 'Ok',
        statusModalType: StatusModalType.SUCCESS,
        okButtonColor: ButtonType.primary,
        showCloseButton: false,
        closeOnClickOutside: false,
      });
    } else {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Error',
        description:
          'A system error prevented the claim to be reassigned. Please try again.',
        okButtonText: 'Ok',
        statusModalType: StatusModalType.ERROR,
        showCloseButton: false,
        closeOnClickOutside: false,
      });
    }
  };
  const onAddEditNote = async () => {
    if (
      !addEditNoteCriteria.subject ||
      !addEditNoteCriteria.noteTypeID ||
      !addEditNoteCriteria.comment
    ) {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Alert',
        description:
          'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
        okButtonText: 'Ok',
        statusModalType: StatusModalType.WARNING,
        showCloseButton: false,
        closeOnClickOutside: false,
      });
      return;
    }
    if (action === 'bulk') {
      const res = await createClaimsNote({
        noteID: noteDetailsData?.id || null,
        lineItemIDS: ids?.join(','),
        noteTypeID: addEditNoteCriteria.noteTypeID,
        subject: addEditNoteCriteria.subject,
        comment: addEditNoteCriteria.comment,
      });
      if (res) {
        if (onClose) onClose(true);
      } else {
        setStatusModalState({
          ...statusModalState,
          open: true,
          heading: 'Error',
          description:
            'A system error prevented the claim to be reassigned. Please try again.',
          okButtonText: 'Ok',
          statusModalType: StatusModalType.ERROR,
          showCloseButton: false,
          closeOnClickOutside: false,
        });
      }
    } else {
      const res = await createClaimNote({
        ...addEditNoteCriteria,
        noteID: noteDetailsData?.id || null,
      });
      if (res) {
        if (onClose) onClose(true);
      } else {
        setStatusModalState({
          ...statusModalState,
          open: true,
          heading: 'Error',
          description:
            'A system error prevented the claim to be reassigned. Please try again.',
          okButtonText: 'Ok',
          statusModalType: StatusModalType.ERROR,
          showCloseButton: false,
          closeOnClickOutside: false,
        });
      }
    }
  };

  return (
    <>
      <Drawer
        sx={{
          flexShrink: 0,
          '& .MuiPaper-root': {
            boxShadow: 'none',
          },
          '& .MuiDrawer-paper': {
            width: '32%',
            boxSizing: 'border-box',
            zIndex: 1,
          },
          '& .MuiBackdrop-root': {
            backgroundColor:
              disableBackdropClick && !hideBackdropColor
                ? 'rgba(0, 0, 0, 0.5)'
                : 'transparent',
          },
        }}
        anchor="right"
        variant={disableBackdropClick ? undefined : 'persistent'}
        open={open}
      >
        <div className="flex h-full w-full flex-row">
          <div className="h-full w-[14px] flex-none border-x border-solid border-gray-400 bg-gray-300"></div>
          <div className="flex w-full flex-col justify-between">
            <div className="inline-flex h-full w-full flex-col items-center justify-start bg-white shadow">
              <div className="inline-flex h-[76px] w-full items-center justify-between p-6">
                <div className="flex items-center justify-start ">
                  <div
                    onClick={handleCloseAddEditNoteModal}
                    className="mt-1.5 cursor-pointer"
                  >
                    {' '}
                    <Icon name={'chevronLeft'} size={18} />
                  </div>
                  <p className="text-lg font-medium leading-7 text-gray-900">
                    {noteDetailsData ? 'Note Details' : 'New Note'}
                  </p>
                </div>
                <div className="flex flex-row gap-2">
                  {!!noteDetailsData && (
                    <>
                      <div>
                        <Button
                          data-testid="editNoteBtn"
                          buttonType={ButtonType.secondary}
                          cls={`h-[38px] p-2 justify-center !px-2 !py-1 text-gray-700 inline-flex gap-2 leading-5`}
                          onClick={() => {
                            setNoteID(noteDetailsData.id);
                            setStatusModalState({
                              ...statusModalState,
                              open: true,
                              heading: 'Delete Note Confirmation',
                              description:
                                'Are you sure you want to proceed with this action?',
                              okButtonText: 'Yes, Delete Note',
                              statusModalType: StatusModalType.WARNING,
                              okButtonColor: ButtonType.tertiary,
                              showCloseButton: true,
                              closeOnClickOutside: false,
                            });
                            setStatusModalConfirmActionType('DeleteNote');
                          }}
                        >
                          <Icon
                            name={'trash'}
                            size={18}
                            // color={IconColors.RED}
                          />
                        </Button>
                      </div>
                      <div>
                        <Button
                          data-testid="editNote"
                          buttonType={ButtonType.secondary}
                          cls={`h-[38px]  justify-center !px-2 !py-1 text-gray-700 inline-flex gap-2 leading-5 focus:!ring-0`}
                          onClick={() => {
                            setIsAddEditMode(true);
                          }}
                          disabled={isAddEditMode || isDisableButton}
                        >
                          Edit
                          <Icon name={'pencil'} size={18} />
                        </Button>
                      </div>
                    </>
                  )}
                  <div
                    className="h-[20px] cursor-pointer self-center rounded-md border border-gray-300 bg-white"
                    onClick={handleCloseAddEditNoteModal}
                  >
                    <Icon name={'close'} size={18} />
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-col gap-4 bg-gray-100 p-[24px]">
                <div className="flex h-[38px] w-[400px] flex-row items-center justify-between">
                  <div className="flex items-center ">
                    <p className="text-sm font-normal leading-5 text-gray-900">
                      Note Type: <span className="text-cyan-500">*</span>
                    </p>
                  </div>
                  <div data-testid="noteType" className="w-[318px]">
                    <SingleSelectDropDown
                      testId="noteTypeOptionID"
                      placeholder="Select note type from the dropdown list"
                      showSearchBar={true}
                      data={noteTypeData}
                      disabled={!isAddEditMode}
                      selectedValue={
                        noteTypeData.filter(
                          (f) => f.id === addEditNoteCriteria.noteTypeID
                        )[0]
                      }
                      onSelect={(e: SingleSelectDropDownDataType) => {
                        handleSetAddEditNoteCriteria({
                          ...addEditNoteCriteria,
                          noteTypeID: e.id,
                        });
                      }}
                    />
                  </div>
                </div>
                <div
                  className={`w-[400px]  flex flex-row gap-2 justify-between`}
                >
                  <label className="flex items-center text-sm font-medium leading-5 text-gray-900">
                    Subject: <span className="text-cyan-500">*</span>
                  </label>
                  <div data-testid="sbjinput" className="h-[38px] w-[318px]">
                    <InputField
                      value={addEditNoteCriteria.subject}
                      onChange={(evt) => {
                        handleSetAddEditNoteCriteria({
                          ...addEditNoteCriteria,
                          subject: evt.target.value,
                        });
                      }}
                      disabled={!isAddEditMode}
                    />
                  </div>
                </div>
                <div className={`w-[400px]  flex flex-row gap-2 py-2`}>
                  <label className="flex items-center text-sm font-medium leading-5 text-gray-900">
                    Show Alert: <span className="text-cyan-500">*</span>
                  </label>
                  <RadioButton
                    disabled={!isAddEditMode}
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
                    checkedValue={addEditNoteCriteria.alert}
                    onChange={(e) => {
                      handleSetAddEditNoteCriteria({
                        ...addEditNoteCriteria,
                        alert: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
              <div className="flex h-full w-full flex-col justify-end overflow-auto">
                {noteDetailsData && (
                  <>
                    <div className="h-[52px] w-full bg-white">
                      <div className="inline-flex h-[52px] w-full items-start justify-start px-6 py-4">
                        <div className="flex h-[20px] w-full items-center justify-center space-x-4">
                          <div className="h-0.5 flex-1 bg-gray-300" />
                          <p className="text-center text-sm font-semibold leading-tight text-gray-500">
                            {noteDetailsData.createdOn
                              ? `${DateToStringPipe(
                                  noteDetailsData.createdOn,
                                  3
                                )}`
                              : ''}
                          </p>
                          <div className="h-0.5 flex-1 bg-gray-300" />
                        </div>
                      </div>
                    </div>
                    <div className="w-full flex-1 flex-col items-start justify-start overflow-auto bg-white">
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
                              {addEditNoteCriteria.comment
                                .split('\n')
                                .map((v, i) => {
                                  return (
                                    <p
                                      key={i}
                                      className={classNames(
                                        v ? '' : 'mt-4',
                                        'w-full pr-12 text-sm leading-tight text-gray-700'
                                      )}
                                    >
                                      {v}
                                    </p>
                                  );
                                })}
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
                  </>
                )}
                {isAddEditMode && (
                  <div className="inline-flex h-[200px] w-full items-end justify-end space-x-4 bg-gray-100 px-6 pb-4 pt-2">
                    <div className="flex h-full !w-[75%] flex-col">
                      <label className="flex items-center text-sm font-medium leading-5 text-gray-900">
                        Note: <span className="text-cyan-500">*</span>
                      </label>
                      <TextArea
                        id="textarea"
                        cls="!w-full text-sm leading-tight text-gray-500 flex-1 h-full px-3 py-2 bg-white shadow border rounded-md border-gray-300"
                        placeholder={'Click here to write note'}
                        value={addEditNoteCriteria.comment}
                        onChange={(e) => {
                          handleSetAddEditNoteCriteria({
                            ...addEditNoteCriteria,
                            comment: e.target.value,
                          });
                        }}
                      />
                    </div>
                    <div
                      className="flex !w-[25%] cursor-pointer items-center justify-center rounded-md bg-cyan-500 px-4 py-2 shadow"
                      onClick={onAddEditNote}
                    >
                      <p
                        data-testid="addNote"
                        className="text-sm font-medium leading-tight text-white"
                      >
                        {noteDetailsData ? 'Save' : 'Add Note'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Drawer>
      <StatusModal
        open={statusModalState.open}
        heading={statusModalState.heading}
        description={statusModalState.description}
        okButtonText={statusModalState.okButtonText}
        closeButtonText={statusModalState.closeButtonText}
        statusModalType={statusModalState.statusModalType}
        showCloseButton={statusModalState.showCloseButton}
        closeOnClickOutside={statusModalState.closeOnClickOutside}
        okButtonColor={statusModalState.okButtonColor}
        onClose={() => {
          setStatusModalState({
            ...statusModalState,
            open: false,
          });
          if (statusModalConfirmActionType === 'cancelConfirmation') {
            setStatusModalConfirmActionType('');
          }
        }}
        onChange={() => {
          setStatusModalState({
            ...statusModalState,
            open: false,
          });
          if (statusModalConfirmActionType === 'cancelConfirmation') {
            if (onClose) onClose();
            setStatusModalConfirmActionType('');
          }
          if (statusModalConfirmActionType === 'DeleteNote') {
            if (noteID) {
              deleteNote(noteID);
            }
          }
        }}
      />
    </>
  );
}

interface TViewNotesProps {
  id: number | undefined;
  noteType: string;
  groupID?: number;
  btnCls?: string;
  tabOptions?: TTabOptions[];
  onOpen?: () => void;
  onClose?: () => void;
  buttonContent?: JSX.Element;
  disableBackdropClick?: boolean;
}

export default function ViewNotes({
  id,
  noteType,
  groupID,
  btnCls,
  tabOptions,
  onOpen,
  onClose,
  buttonContent,
  disableBackdropClick = false,
}: TViewNotesProps) {
  const assignClaimToData = useSelector(getAssignClaimToDataSelector);
  const [filterModalTabs, setFilterModalTabs] = React.useState<
    FilterModalTabProps[]
  >([
    {
      id: 1,
      name: 'Note Type',
      active: true,
      count: 0,
      showSearchBar: true,
      selectedValue: [],
      data: [],
    },
    {
      id: 2,
      name: 'People',
      active: false,
      count: 0,
      selectedValue: [],
      data: [],
    },
  ]);
  const [searchValue, setSearchValue] = useState('');
  const [activefilters, setActivefilters] = useState<ActivefiltersProps[]>([]);
  const [loadFilterModal, setLoadFilterModal] = useState(true);
  const [openNoteModal, setOpenNoteModal] = React.useState(false);
  const [openAddEditNoteModal, setOpenAddEditNoteModal] = React.useState(false);
  const [noteTypeData, setNoteTypeData] = useState<
    SingleSelectDropDownDataType[]
  >([]);
  const [notesData, setNotesData] = useState<ClaimNotesData[]>([]);
  const [noteDetailsData, setNoteDetailsData] = useState<ClaimNotesData>();
  const [showWarnningMsg, setShowWarnningMsg] = React.useState(false);
  const [claimFilteredData, setClaimFilteredData] = useState<ClaimNotesData[]>(
    []
  );
  interface TPropTab {
    id: number;
    filterValue: string;
    name: string;
    count: number;
  }
  const defaultTab = { id: 1, filterValue: 'all', name: 'All', count: 0 };
  const [tabs, setTabs] = useState<TPropTab[]>([defaultTab]);
  const [currentTab, setCurrentTab] = useState<TPropTab>(defaultTab);

  const handleFilteredData = (array: ClaimNotesData[]) => {
    if (currentTab?.id === 1) {
      setClaimFilteredData(notesData);
    } else {
      setClaimFilteredData(
        array.filter((m) => m.category === currentTab?.filterValue)
      );
    }
  };

  const addTabs = (array: ClaimNotesData[]) => {
    const lastTabId = tabs[tabs.length - 1]?.id || 0;
    const newTabs =
      tabOptions?.map((tab, index) => {
        return {
          id: lastTabId + index + 1,
          name: tab.name,
          count: array.filter((m) => m.category === tab.filterValue).length,
          filterValue: tab.filterValue,
        };
      }) || [];
    setTabs([{ ...defaultTab, count: array.length }, ...newTabs]);
  };

  const getNoteTypeData = async (type: string) => {
    const res = await getClaimNoteType(groupID || null, type);
    if (res) {
      setNoteTypeData(res);
    }
  };

  const getClaimNotesData = async () => {
    const res = await fetchClaimNotesData(
      id,
      tabOptions ? '' : noteType,
      null,
      null
    );
    if (res) {
      setNotesData(res);
      handleFilteredData(res);
      addTabs(res);
      setShowWarnningMsg(!res.length);
      // Replace the inner text with Claim Notes Count
      const element = document.getElementById('viewNotesCount3@3&34');
      if (element) element.textContent = String(res.length);
    }
  };

  const onCloseModal = () => {
    setOpenNoteModal(false);
    if (onClose) onClose();
    setActivefilters([]);
    setSearchValue('');
    setFilterModalTabs(
      filterModalTabs.map((d) => {
        return { ...d, selectedValue: [] };
      })
    );
    setLoadFilterModal(!loadFilterModal);
  };

  const openNoteModel = async () => {
    if (id)
      if (!openNoteModal) {
        setOpenNoteModal(true);
        if (onOpen) onOpen();
        if (!noteTypeData || noteTypeData.length === 0) {
          getNoteTypeData(noteType);
        }
      } else {
        onCloseModal();
        setOpenAddEditNoteModal(false);
      }
  };

  useEffect(() => {
    if (notesData) {
      setClaimFilteredData(notesData);
    }
  }, [notesData]);

  useEffect(() => {
    handleFilteredData(notesData);
  }, [currentTab]);

  useEffect(() => {
    const assignRes =
      assignClaimToData?.filter((f) =>
        claimFilteredData.map((d) => d.createdByIDS).includes(f.id.toString())
      ) || [];
    const noteTypeRes =
      noteTypeData?.filter((f) =>
        claimFilteredData.map((d) => d.noteTypeID).includes(f.id)
      ) || [];
    setFilterModalTabs(
      filterModalTabs.map((d) => {
        return { ...d, data: d.id === 1 ? noteTypeRes : assignRes };
      })
    );
    setLoadFilterModal(!loadFilterModal);
  }, [assignClaimToData, claimFilteredData, noteTypeData]);

  useEffect(() => {
    if (id) getClaimNotesData();
  }, []);

  const onApplyFilter = (value: FilterModalTabProps[]) => {
    setFilterModalTabs(value);
    const data = value.flatMap((filter) =>
      filter.selectedValue.map((d) => ({
        id: d.id,
        value: d.value,
        type: filter.name,
      }))
    );
    const newFilters = data.filter(
      (filter) =>
        !activefilters.some((f) => f.id === filter.id && f.type === filter.type)
    );
    const previousFilter = data.filter(
      (filter) =>
        !newFilters.some((f) => f.id === filter.id && f.type === filter.type)
    );
    setActivefilters([...previousFilter, ...newFilters]);
  };

  const onDeselecActiveFilter = (d: ActivefiltersProps) => {
    setActivefilters((prevFilters) => {
      return prevFilters.filter(
        (filter) => filter.id !== d.id || filter.type !== d.type
      );
    });
    setFilterModalTabs(
      filterModalTabs.map((tab) => {
        if (d.type === tab.name) {
          const newData = tab.selectedValue.filter((a) => a.id !== d.id);
          return {
            ...tab,
            selectedValue: newData,
            count: newData.length,
          };
        }
        return {
          ...tab,
        };
      })
    );
    setLoadFilterModal(!loadFilterModal);
  };

  useEffect(() => {
    if (activefilters.length > 0) {
      const filterClaimDetailData = notesData.filter(
        (elem) =>
          activefilters.find((a) => elem.noteTypeID === a.id) ||
          activefilters.find((a) => elem.createdByIDS === a.id)
      );
      setClaimFilteredData(filterClaimDetailData);
    } else {
      setClaimFilteredData(notesData);
    }
  }, [activefilters]);

  const onViewNote = (note: ClaimNotesData) => {
    setNoteDetailsData(note);
    setOpenAddEditNoteModal(true);
  };

  const onAddNote = () => {
    setNoteDetailsData(undefined);
    setOpenAddEditNoteModal(true);
  };

  const closeAddEditNoteModal = () => {
    setOpenAddEditNoteModal(false);
    setNoteDetailsData(undefined);
    if (!!noteDetailsData && !!tabOptions?.length) {
      setNoteTypeData([]);
      getNoteTypeData(noteType);
    }
  };

  const handleCloseAddEditNoteModal = (isAddEdit?: boolean) => {
    if (isAddEdit) {
      getClaimNotesData();
    }
    closeAddEditNoteModal();
  };

  const viewNote = (note: ClaimNotesData) => {
    return (
      <>
        <div
          key={note.id}
          className="inline-flex h-[96px] w-full items-start  justify-between border-b border-gray-200 py-4 pl-6 pr-4"
        >
          <div className="flex items-center justify-start">
            <div className="inline-flex h-[34px] w-[34px] flex-col items-center justify-center ">
              <div className="flex w-full flex-1 flex-col items-center justify-center rounded-full bg-gray-100 shadow">
                <Icon name={'userNote'} size={20} />
              </div>
            </div>
            <div className="ml-4 inline-flex flex-col items-start justify-start">
              <p className="text-base font-semibold leading-normal">
                {note.createdBy}
              </p>
              <p className="text-sm font-bold leading-tight text-gray-800">
                {note.noteType}
              </p>
              <p className="w-[261px] truncate text-sm leading-tight text-gray-500">
                {note.comment}
              </p>
            </div>
          </div>
          <div className="inline-flex h-full flex-col items-end justify-between">
            <p className="mt-1 text-xs leading-3 text-gray-500">
              {DateToStringPipe(note.createdOn, 2)}
            </p>
            <p
              data-testid="viewNote"
              className="cursor-pointer text-sm leading-tight text-cyan-500"
              onClick={() => {
                onViewNote(note);
                if (tabOptions?.length) {
                  getNoteTypeData(note.category);
                }
              }}
            >
              View Notes
            </p>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <Drawer
        sx={{
          flexShrink: 0,
          '& .MuiPaper-root': {
            boxShadow: 'none',
          },
          '& .MuiDrawer-paper': {
            width: '32%',
            boxSizing: 'border-box',
            zIndex: 1,
          },
          '& .MuiBackdrop-root': {
            backgroundColor: disableBackdropClick
              ? 'rgba(0, 0, 0, 0.5)'
              : 'transparent',
          },
        }}
        anchor="right"
        variant={disableBackdropClick ? undefined : 'persistent'}
        open={openNoteModal}
      >
        <div className="flex h-full w-full flex-row self-end">
          <div className="h-full w-[14px] flex-none border-x border-solid  border-gray-400 bg-gray-300"></div>
          <div className="inline-flex h-full w-full flex-col  bg-white shadow">
            <div className="inline-flex h-[76px] w-full  justify-between space-x-20 border-b border-gray-300 bg-gray-50 p-6">
              <div className="flex space-x-4">
                <p className="text-lg font-medium leading-7 text-gray-900">
                  Notes
                </p>
                <div
                  className="flex cursor-pointer items-center justify-center rounded-md bg-cyan-500 px-4 py-2 shadow"
                  onClick={onAddNote}
                >
                  <p
                    data-testid="addNewNote"
                    className="text-sm font-medium leading-tight text-white"
                  >
                    Add Note
                  </p>
                </div>
              </div>
              <div
                data-testid="closeNoteViewBtn"
                className="h-[20px] cursor-pointer rounded-md border border-gray-300 bg-white"
                onClick={onCloseModal}
              >
                <Icon name={'close'} size={18} />
              </div>
            </div>
            <div className="">
              <div className="no-scrollbar h-[56px] w-full overflow-x-auto bg-white  px-6 ">
                <Tabs2
                  tabs={tabs}
                  currentTab={currentTab}
                  onChangeTab={(newTab: any) => setCurrentTab(newTab)}
                />
              </div>
            </div>
            <div className=" inline-flex h-[54px] w-full items-start justify-start bg-cyan-50 p-2">
              <div className="hidden w-[80%] flex-initial justify-center px-2 md:flex">
                <div className="flex w-full max-w-lg flex-col justify-center">
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Icon name={'search'} size={16} />
                    </div>
                    <input
                      ref={(input) => {
                        setTimeout(() => {
                          if (input) input.focus();
                        }, 500);
                      }}
                      autoComplete="off"
                      id="search"
                      name="search"
                      className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 leading-5 text-gray-500 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-white sm:text-sm"
                      placeholder="Search"
                      value={searchValue}
                      onChange={(e) => {
                        setSearchValue(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center rounded-md shadow">
                <div>
                  <FilterModal
                    key={JSON.stringify(filterModalTabs)}
                    cls={'inline-flex'}
                    popperCls={'w-[420px] px-2 !z-[9992]'}
                    filtersData={filterModalTabs}
                    loadFilterModal={loadFilterModal}
                    onApplyFilter={onApplyFilter}
                    buttonContent={
                      <MuiButton
                        style={{
                          border: '1px solid #D1D5DB',
                          boxShadow: 'none',
                          padding: '6px 11px',
                          textTransform: 'none',
                        }}
                        disableRipple
                        className={`!h-[38px]  !justify-start rounded-md  !text-gray-800 !shadow-none !bg-white  !border !rounded-md !border-gray-300`}
                      >
                        <Icon name={'filter'} size={16} />
                        <p
                          data-testid="noteFilters"
                          className="ml-2.5 mt-1 text-sm font-medium leading-tight text-gray-500"
                        >
                          Filters
                        </p>
                      </MuiButton>
                    }
                  />
                </div>
              </div>
            </div>
            <div className="w-full border border-gray-300 bg-gray-50">
              <div className="w-full py-4 px-6">
                <div className="flex w-full flex-wrap gap-2">
                  <div className="self-center text-sm font-bold leading-5 text-gray-600">
                    Active filters:
                  </div>
                  {activefilters.map((d, index) => {
                    return (
                      <div
                        key={index}
                        className="flex gap-1 rounded bg-cyan-100 px-[8px]"
                      >
                        <div className="py-[2px] text-sm text-cyan-700">
                          {d.value}
                        </div>
                        <div>
                          <button
                            onClick={() => {
                              onDeselecActiveFilter(d);
                            }}
                            className="py-[2px] text-sm font-bold text-cyan-400"
                          >
                            x
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="inline-flex h-full flex-col items-start justify-start overflow-y-auto overflow-x-hidden">
              <div className="flex h-full w-full flex-col text-left">
                <>
                  {tabOptions?.length ? (
                    <>
                      {tabOptions.map((d) => {
                        return (
                          <>
                            {claimFilteredData
                              .filter(
                                (elem) =>
                                  elem.category === d.filterValue &&
                                  JSON.stringify(elem)
                                    .toLowerCase()
                                    .indexOf(searchValue.toLowerCase()) !== -1
                              )
                              .map((note, i) => {
                                return (
                                  <>
                                    {i === 0 && (
                                      <div className="w-full bg-gray-100 py-[4px] px-[16px] text-xs font-normal leading-4 text-gray-500">
                                        {d.name}
                                      </div>
                                    )}
                                    {viewNote(note)}
                                  </>
                                );
                              })}
                          </>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      {currentTab.id !== 1 && (
                        <div className="w-full bg-gray-100 py-[4px] px-[16px] text-xs font-normal leading-4 text-gray-500">
                          {currentTab.name}
                        </div>
                      )}
                      {claimFilteredData
                        .filter(
                          (elem) =>
                            JSON.stringify(elem)
                              .toLowerCase()
                              .indexOf(searchValue.toLowerCase()) !== -1
                        )
                        .map((note) => {
                          return viewNote(note);
                        })}
                    </>
                  )}
                </>
                {showWarnningMsg && (
                  <div className="py-[16px] px-[38px] text-sm font-normal leading-5 text-gray-500">
                    {
                      'Currently, no notes have been added to this. Click the "Add Note" button to add one.'
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Drawer>
      {id && (
        <AddEditViewNotes
          id={id}
          open={openAddEditNoteModal}
          noteTypesData={noteTypeData}
          noteDetailsData={noteDetailsData}
          onClose={handleCloseAddEditNoteModal}
          disableBackdropClick={true}
          hideBackdropColor={true}
        />
      )}
      <div
        onClick={() => {
          openNoteModel();
        }}
        className={classNames(btnCls, 'cursor-pointer')}
      >
        {buttonContent ? (
          <>{buttonContent}</>
        ) : (
          <>
            <button
              className={classNames(
                'flex w-40 items-center justify-center space-x-2 rounded-full bg-cyan-500 px-6  py-3 !border-cyan-400 border drop-shadow-lg hover:bg-cyan-700 focus:border-2 focus:border-cyan-400 focus:bg-cyan-500 active:border-cyan-200 active:bg-cyan-700'
              )}
            >
              <Icon name={'notes'} size={18} />
              <p
                data-testid="paymentNotes"
                className="text-base font-medium leading-normal text-white"
              >
                Notes
              </p>
              <div className="flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5">
                <p className="text-center text-xs font-medium leading-none text-cyan-600">
                  {notesData.length}
                </p>
              </div>
            </button>
          </>
        )}
      </div>
    </>
  );
}
