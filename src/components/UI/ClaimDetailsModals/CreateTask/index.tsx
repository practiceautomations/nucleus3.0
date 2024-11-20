import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import Icon from '@/components/Icon';
import Button, { ButtonType } from '@/components/UI/Button';
import InputField from '@/components/UI/InputField';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import { AddEditViewNotes } from '@/components/ViewNotes';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  createEditTask,
  createMultipleTasks,
  deleteClaimTask,
  getTaskTypesData,
  markAsResolvedTask,
} from '@/store/shared/sagas';
import { getGroupDataSelector } from '@/store/shared/selectors';
import type {
  CreateAndEditTaskRequestData,
  CreateTasksRequestData,
  TaskGridData,
  TaskTypesData,
} from '@/store/shared/types';
import {
  DateToStringPipe,
  StringToDatePipe,
} from '@/utils/dateConversionPipes';

import AppDatePicker from '../../AppDatePicker';
import CloseButton from '../../CloseButton';
import RadioButton from '../../RadioButton';
import type { StatusModalProps } from '../../StatusModal';
import StatusModal, { StatusModalType } from '../../StatusModal';
import TextArea from '../../TextArea';

type CreateTaskModalProps = {
  onCloseModal: () => void;
  selectedTaskData?: TaskGridData;
  assignClaimToData: SingleSelectDropDownDataType[];
  taskModalInEditMode?: boolean;
  hideEditButton?: boolean;
  newTaskClaimID?: number;
  newTaskPatientID?: number;
  claimIDS?: string;
  action?: string;
};
const CreateTaskModal = ({
  onCloseModal,
  selectedTaskData,
  assignClaimToData,
  taskModalInEditMode = false,
  hideEditButton = false,
  newTaskClaimID,
  newTaskPatientID,
  claimIDS,
  action,
}: CreateTaskModalProps) => {
  // api call
  const [selectedUser, setSelectedUser] =
    useState<SingleSelectDropDownDataType>();
  const [selectedTaskType, setSelectedTaskType] =
    useState<SingleSelectDropDownDataType>();
  const [taskTypeData, setTaskTypeData] = useState<TaskTypesData[]>([]);
  const [taskDescription, setTaskDescription] = useState('');
  const [taskTitle, setTaskTitle] = useState('');

  const groupsData = useSelector(getGroupDataSelector);
  const selectedWorkGroupData = useSelector(getselectdWorkGroupsIDsSelector);
  const [noteSliderOpen, setNoteSliderOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  useEffect(() => {
    if (groupsData) {
      setSelectedGroup(
        groupsData?.filter(
          (m) => m.id === selectedWorkGroupData?.groupsData[0]?.id
        )[0]
      );
    }
  }, [groupsData]);

  const [taskStartDate, setTaskStartDate] = useState<Date | string | null>();
  const [taskEndDate, setTaskEndDate] = useState<Date | string | null>();
  const [alertEndDate, setAlertEndDate] = useState<Date | string | null>();

  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isAlertEndDateActive, setIsAlertEndDateActive] = useState(true);
  const [isEditModeActive, setIsEditModeActive] = useState(false);
  // const [isTaskUpdated, setIsTaskUpdated] = useState(false);
  const [alertOnCheck, setAlertOnCheck] = useState('Y');
  const [endDateOption, setEndDateOption] = useState('DateOfResolving');

  const getTaskTypes = async (gruopID: number) => {
    const res = await getTaskTypesData(gruopID);
    if (res) {
      setTaskTypeData(res);
      setSelectedTaskType(
        res.filter((m) => m.id === selectedTaskData?.taskTypeID)[0]
      );
    }
  };

  const startTimer = () => {
    if (!timerActive) {
      setTimerActive(true);
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
  };

  const pauseTimer = () => {
    setTimerActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetTimer = () => {
    setTime(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimerActive(false);
  };

  useEffect(() => {
    if (!selectedTaskData?.taskID) startTimer();
    if (selectedWorkGroupData?.groupsData[0]?.id)
      getTaskTypes(selectedWorkGroupData.groupsData[0].id);
  }, []);

  useEffect(() => {
    if (selectedTaskData?.taskID && !taskModalInEditMode) {
      setIsEditMode(true);
    } else if (selectedTaskData?.resolve === true) {
      setIsEditMode(true);
    } else {
      setIsEditModeActive(true);
      setIsEditMode(false);
    }
  }, [selectedTaskData?.taskID]);
  useEffect(() => {
    if (selectedTaskData) {
      setSelectedUser(
        assignClaimToData.filter(
          (m) => m.id.toString() === selectedTaskData.assignTo
        )[0]
      );
      setTaskStartDate(StringToDatePipe(selectedTaskData.startDate));
      setTaskEndDate(StringToDatePipe(selectedTaskData.dueDate));
      setTaskTitle(selectedTaskData.title);
      setTaskDescription(selectedTaskData.description);
      setTime(selectedTaskData.autoTime || 0);
      setAlertOnCheck(selectedTaskData.alert ? 'Y' : 'N');
      setEndDateOption(
        selectedTaskData.endAlertResolve ? 'DateOfResolving' : 'SpecificDate'
      );
      setIsAlertEndDateActive(selectedTaskData.endAlertResolve);
      setAlertEndDate(DateToStringPipe(selectedTaskData.endAlertDate, 2));
    }
  }, [selectedTaskData]);
  const [statusModalState, setStatusModalState] = useState<StatusModalProps>({
    open: false,
    heading: '',
    description: '',
    okButtonText: 'Ok',
    statusModalType: StatusModalType.ERROR,
    showCloseButton: false,
    closeOnClickOutside: false,
  });
  const [statusModalInfo, setStatusModalInfo] = useState<{
    show: boolean;
    showCloseButton?: boolean;
    closeButtonText?: string;
    heading: string;
    text: string;
    type: StatusModalType;
    okButtonText?: string;
    okButtonColor?: ButtonType;
  }>();
  const creatTaskRequest = async (data: CreateAndEditTaskRequestData) => {
    const res = await createEditTask(data);
    if (!res && !selectedTaskData?.taskID) {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Error',
        description:
          'A system error prevented the task to be created. Please try again.',
        okButtonText: 'Ok',
        statusModalType: StatusModalType.ERROR,
        showCloseButton: false,
        closeOnClickOutside: false,
      });
    } else if (!res && selectedTaskData?.taskID) {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Error',
        description:
          'A system error prevented the task to be created. Please try again.',
        okButtonText: 'Ok',
        statusModalType: StatusModalType.ERROR,
        showCloseButton: false,
        closeOnClickOutside: false,
      });
    } else {
      onCloseModal();
    }
  };
  const creatMultipleTaskRequest = async (data: CreateTasksRequestData) => {
    const res = await createMultipleTasks(data);
    if (res && !!res.errors.length) {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Error',
        description:
          'A system error prevented the task to be created. Please try again.',
        okButtonText: 'Ok',
        statusModalType: StatusModalType.ERROR,
        showCloseButton: false,
        closeOnClickOutside: false,
      });
    } else {
      onCloseModal();
    }
  };
  const [taskData, setTaskData] = useState<CreateAndEditTaskRequestData>({
    taskID: null,
    claimID: null,
    patientID: null,
    taskTypeID: undefined,
    assignTo: '',
    startDate: '',
    dueDate: '',
    title: '',
    description: '',
    alert: null,
    endAlertResolve: null,
    endAlertDate: null,
    actualRVT: undefined,
    autoTime: undefined,
  });
  const taskDataValidation = (task: CreateAndEditTaskRequestData) => {
    if (!task.claimID) {
      return false;
    }
    if (!task.assignTo) {
      return false;
    }
    if (!task.patientID) {
      return false;
    }
    if (!task.taskTypeID) {
      return false;
    }
    if (!task.title) {
      return false;
    }
    if (!task.description) {
      return false;
    }
    if (!task.startDate) {
      return false;
    }
    if (!task.dueDate) {
      return false;
    }
    return true;
  };
  const multipleTaskDataValidation = (task: CreateTasksRequestData) => {
    if (!task.claimIDS) {
      return false;
    }
    if (!task.assignTo) {
      return false;
    }
    if (!task.taskTypeID) {
      return false;
    }
    if (!task.title) {
      return false;
    }
    if (!task.description) {
      return false;
    }
    if (!task.startDate) {
      return false;
    }
    if (!task.dueDate) {
      return false;
    }
    return true;
  };
  const onCreateTask = () => {
    let taskDataa: CreateAndEditTaskRequestData = {
      taskID: null,
      claimID: null,
      patientID: null,
      taskTypeID: undefined,
      assignTo: '',
      startDate: '',
      dueDate: '',
      title: '',
      description: '',
      alert: null,
      endAlertResolve: null,
      endAlertDate: null,
      actualRVT: undefined,
      autoTime: undefined,
    };
    if (selectedTaskData) {
      taskDataa = {
        ...taskDataa,
        taskID: selectedTaskData?.taskID ? selectedTaskData.taskID : null,
        claimID: selectedTaskData?.claimID,
        patientID: selectedTaskData?.patientID,
      };
    } else if (newTaskClaimID && newTaskPatientID) {
      taskDataa = {
        ...taskDataa,
        claimID: newTaskClaimID,
        patientID: newTaskPatientID,
      };
    }

    taskDataa = {
      ...taskDataa,
      title: taskTitle,
      description: taskDescription,
      alert: alertOnCheck === 'Y',
      endAlertResolve:
        alertOnCheck === 'Y' ? endDateOption === 'DateOfResolving' : false,
      endAlertDate:
        endDateOption === 'SpecificDate'
          ? DateToStringPipe(alertEndDate, 1)
          : null,
      assignTo: selectedUser?.id.toString(),
      taskTypeID: selectedTaskType?.id,
      startDate: DateToStringPipe(taskStartDate, 1),
      dueDate: DateToStringPipe(taskEndDate, 1),
      autoTime: time,
      actualRVT: time,
    };
    const isValid = taskDataValidation(taskDataa);
    if (isValid) {
      creatTaskRequest(taskDataa);
    } else {
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
    }
  };
  const onCreateTasks = async () => {
    let tasksData: CreateTasksRequestData = {
      claimIDS: undefined,
      taskTypeID: undefined,
      assignTo: '',
      startDate: '',
      dueDate: '',
      title: '',
      description: '',
      alert: null,
      endAlertResolve: null,
      endAlertDate: null,
      actualRVT: undefined,
      autoTime: undefined,
    };
    tasksData = {
      claimIDS,
      title: taskTitle,
      description: taskDescription,
      alert: alertOnCheck === 'Y',
      endAlertResolve:
        alertOnCheck === 'Y' ? endDateOption === 'DateOfResolving' : false,
      endAlertDate:
        endDateOption === 'SpecificDate'
          ? DateToStringPipe(alertEndDate, 1)
          : null,
      assignTo: selectedUser?.id.toString(),
      taskTypeID: selectedTaskType?.id,
      startDate: DateToStringPipe(taskStartDate, 1),
      dueDate: DateToStringPipe(taskEndDate, 1),
      autoTime: time,
      actualRVT: time,
    };
    const isValid = multipleTaskDataValidation(tasksData);
    if (isValid) {
      creatMultipleTaskRequest(tasksData);
    } else {
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
    }
  };
  const [onCancelCreate, setOnCancelCreate] = useState(false);
  const oncancel = () => {
    if (!selectedTaskData?.taskID) {
      setOnCancelCreate(true);

      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Alert',
        description:
          'Are you certain you want to cancel? Clicking "Confirm" will result in the loss of all changes.',
        okButtonText: 'Confirm',
        statusModalType: StatusModalType.WARNING,
        showCloseButton: true,
        closeButtonText: 'Cancel',
        closeOnClickOutside: false,
      });
    } else {
      onCloseModal();
    }
  };
  const markAsResolved = async (taskID: number) => {
    const res = await markAsResolvedTask(taskID);
    if (res) {
      onCloseModal();
    }
  };
  const deleteTask = async (taskID: number) => {
    const res = await deleteClaimTask(taskID);
    if (res) {
      onCloseModal();
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedHours} : ${formattedMinutes} : ${formattedSeconds}`;
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-gray-100 shadow">
      <div className="flex w-full flex-col items-start justify-start px-6 py-4">
        <div className="inline-flex w-full items-start justify-between">
          {selectedTaskData?.taskID ? (
            <div className="flex w-full flex-col text-left">
              <div className="flex flex-row justify-between">
                <div className="flex flex-col gap-1">
                  <div className="text-base font-bold leading-6 text-gray-700">
                    {`Task ID#${selectedTaskData?.taskID}`}
                  </div>
                  <div className="flex flex-row gap-2 text-sm font-medium leading-5">
                    <div className="flex items-center rounded bg-cyan-100">
                      <p className="py-[2px] px-[12px] text-cyan-700">
                        {`Created On: ${
                          selectedTaskData?.createdOn.split('T')[0]
                        }`}
                      </p>
                    </div>
                    <div className="flex items-center rounded bg-cyan-100">
                      <p className="py-[2px] px-[12px] text-cyan-700">
                        {`Created By: ${selectedTaskData?.createdByName}`}
                      </p>
                    </div>
                    {selectedTaskData?.resolve === false ? (
                      <div className="flex items-center rounded bg-red-100">
                        <p className="py-[2px] px-[12px] text-red-700">
                          {'Unresolved'}
                        </p>
                      </div>
                    ) : (
                      <>
                        {' '}
                        <div className="flex items-center rounded bg-green-100">
                          {selectedTaskData?.resolvedOn && (
                            <p className="py-[2px] px-[12px] text-green-700">
                              {`Resolved On: ${
                                selectedTaskData?.resolvedOn.split('T')[0]
                              }`}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center rounded bg-green-100">
                          <p className="py-[2px] px-[12px] text-green-700">
                            {`Resolved By: ${selectedTaskData?.resolvedByName}`}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-row items-center gap-4">
                  {selectedTaskData?.resolve === false ? (
                    <div>
                      {!hideEditButton && (
                        <Button
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
                      )}
                    </div>
                  ) : (
                    <></>
                  )}
                  <div className="">
                    <CloseButton onClick={onCloseModal} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-col items-start justify-start px-0 py-1">
              <div className="inline-flex w-full items-center justify-between">
                <div className="flex items-center justify-start space-x-2">
                  <p className="text-xl font-bold leading-7 text-gray-700">
                    Create Task
                  </p>
                </div>
                <CloseButton onClick={onCloseModal} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={'z-[1] w-full px-6'}>
        <div className={`h-[1px] w-full bg-gray-300`} />
      </div>

      <div className="m-0 h-full w-full overflow-y-auto bg-gray-100 p-0 !px-6 text-left">
        <div className=" pt-4 text-base font-bold leading-6">Details</div>

        <div className="inline-flex items-center justify-start gap-6 self-stretch">
          <div className="inline-flex flex-col items-start justify-start gap-6">
            <div
              className={`pt-[16px] text-gray-700 leading-5 w-full font-medium`}
            >
              <label className="text-sm font-medium leading-5 text-gray-700">
                Assign Task To<span className="text-cyan-500">*</span>
              </label>
              <div className="h-[38px]">
                <SingleSelectDropDown
                  placeholder="Assign Task To"
                  showSearchBar={false}
                  disabled={isEditMode}
                  data={assignClaimToData || []}
                  selectedValue={selectedUser}
                  onSelect={(value) => {
                    setSelectedUser(value);
                    setTaskData({
                      ...taskData,
                      assignTo: value.id.toString(),
                    });
                  }}
                />
              </div>
            </div>
            <div className={`text-gray-700 leading-5 w-full font-medium`}>
              <label className="text-sm font-medium leading-5 text-gray-700">
                Task Type<span className="text-cyan-500">*</span>
              </label>
              <div className="h-[38px]">
                <SingleSelectDropDown
                  placeholder="Task Type"
                  showSearchBar={false}
                  disabled={isEditMode}
                  data={taskTypeData || []}
                  selectedValue={selectedTaskType}
                  onSelect={(value) => {
                    setSelectedTaskType(value);
                    setTaskData({
                      ...taskData,
                      taskTypeID: value.id,
                    });
                  }}
                />
              </div>
            </div>
            <div className="flex flex-row gap-4 pt-[4px] ">
              <div className="flex w-[48%] flex-col">
                <label className="text-sm font-medium leading-5 text-gray-700">
                  Task Start Date<span className="text-cyan-500">*</span>
                </label>
                <div className="w-full">
                  <AppDatePicker
                    placeholderText="mm/dd/yyyy"
                    cls=""
                    disabled={isEditMode}
                    onChange={(date) => {
                      setTaskStartDate(date);
                      if (date) {
                        setTaskData({
                          ...taskData,
                          startDate: date.toISOString().slice(0, 10),
                        });
                      }
                    }}
                    selected={taskStartDate}
                  />
                </div>
              </div>
              <div className="flex w-[48%] flex-col">
                <label className="text-sm font-medium leading-5 text-gray-700">
                  Task Due Date<span className="text-cyan-500">*</span>
                </label>
                <div className="w-full">
                  <AppDatePicker
                    placeholderText="mm/dd/yyyy"
                    cls=""
                    disabled={isEditMode}
                    onChange={(date) => {
                      setTaskEndDate(date);
                      if (date) {
                        setTaskData({
                          ...taskData,
                          dueDate: date.toISOString().slice(0, 10),
                        });
                      }
                    }}
                    selected={taskEndDate}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="inline-flex shrink grow basis-0 flex-col items-center justify-center gap-2 self-stretch rounded-lg p-2 pl-[140px]">
            <div className="font-['Nunito'] text-sm font-normal leading-tight text-gray-700">
              Task creation elapsed time
            </div>
            <div className="font-['Nunito'] text-3xl font-bold leading-9 text-gray-700">
              {formatTime(time)}
            </div>
            <div className="inline-flex items-start justify-start gap-2">
              <button
                className="flex h-9 w-12 items-center justify-center gap-2 rounded border border-gray-300 bg-white py-1.5 pl-2 pr-2.5 shadow"
                onClick={startTimer}
                disabled={!!selectedTaskData?.taskID}
              >
                <Icon name={'play'} size={19} />
              </button>
              <button
                className="flex h-9 w-12 items-center justify-center gap-2 rounded border border-gray-300 bg-white py-1.5 pl-2 pr-2.5 shadow"
                onClick={pauseTimer}
                disabled={!!selectedTaskData?.taskID}
              >
                <Icon name={'pause'} size={19} />
              </button>
              <button
                className="flex h-9 w-12 items-center justify-center gap-2 rounded border border-gray-300 bg-white py-1.5 pl-2 pr-2.5 shadow"
                onClick={resetTimer}
                disabled={!!selectedTaskData?.taskID}
              >
                <Icon name="rewind" size={19} />
              </button>
            </div>
          </div>
        </div>
        <div className="w-full pt-[24px]">
          <label className="text-sm font-medium leading-5 text-gray-700">
            Task Title<span className="text-cyan-500">*</span>
          </label>
          <div className="h-[38px] ">
            <InputField
              value={taskTitle || ''}
              onChange={(evt) => setTaskTitle(evt.target.value)}
              disabled={isEditMode}
            />
          </div>
        </div>
        <div
          className={`pt-[24px] flex flex-col gap-4 text-gray-700 leading-5 w-[100%] font-medium`}
        >
          <label className="text-sm font-medium leading-5 text-gray-700">
            Task Description<span className="text-cyan-500">*</span>
          </label>

          <TextArea
            id="textarea"
            placeholder=""
            disabled={isEditMode}
            value={taskDescription}
            cls={'h-[160px] resize-none'}
            onChange={(evt) => setTaskDescription(evt.target.value)}
          />
        </div>
        <div className={`w-full py-[24px]`}>
          <div className={`h-px bg-gray-300 `}></div>
        </div>
        <div className="flex flex-col pb-[42px]">
          <div className="font-bold leading-6 text-gray-700">
            Alert (optional)
          </div>
          <div className="text-xs font-normal leading-4 text-gray-500">
            A notification will be displayed to all users who access this claim.
          </div>
          <div className="flex flex-row gap-6 pt-[16px]">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium leading-5 text-gray-700">
                Set an alert for this task?
              </label>
              <div className="">
                <RadioButton
                  data={[
                    { value: 'Y', label: 'Yes' },
                    { value: 'N', label: 'No' },
                  ]}
                  disabled={isEditMode}
                  checkedValue={alertOnCheck}
                  onChange={(e) => {
                    setAlertOnCheck(e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium leading-5 text-gray-700">
                End Alert:
              </label>
              <div className="">
                <RadioButton
                  data={[
                    {
                      value: 'DateOfResolving',
                      label: 'When task is marked as resolved',
                    },
                    { value: 'SpecificDate', label: 'On Specific Date' },
                  ]}
                  disabled={isEditMode}
                  checkedValue={endDateOption}
                  onChange={(e) => {
                    setEndDateOption(e.target.value);
                    if (e.target.value === 'SpecificDate') {
                      // alert();
                      setIsAlertEndDateActive(false);
                    } else {
                      setIsAlertEndDateActive(true);
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex w-[24%] flex-col">
              <label className="text-sm font-medium leading-5 text-gray-700">
                Choose Alert End Date:
              </label>
              <div className="w-full">
                <AppDatePicker
                  placeholderText=""
                  cls=""
                  disabled={isEditMode ? true : isAlertEndDateActive}
                  onChange={(date) => setAlertEndDate(date)}
                  selected={alertEndDate}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`h-[86px] bg-gray-200 w-full`}>
        <div className="flex flex-row-reverse gap-4 p-6 ">
          {!selectedTaskData?.taskID && (
            <div>
              <Button
                buttonType={ButtonType.primary}
                onClick={() => {
                  if (action === 'bulk') {
                    onCreateTasks();
                  } else {
                    onCreateTask();
                  }
                }}
              >
                Create Task
              </Button>
            </div>
          )}
          {!isEditModeActive && selectedTaskData?.resolve === false && (
            <div>
              <Button
                buttonType={ButtonType.primary}
                cls={`inline-flex px-4 py-2 gap-2 leading-5 cursor-pointer`}
                onClick={() => {
                  markAsResolved(selectedTaskData.taskID);
                }}
              >
                <Icon name={'checkmark2'} />
                <p className="text-sm">Mark as Resolved</p>
              </Button>
            </div>
          )}
          {isEditModeActive && selectedTaskData?.resolve === false && (
            <div>
              <Button
                buttonType={ButtonType.primary}
                onClick={() => {
                  // setIsTaskUpdated(true);
                  onCreateTask();
                }}
                cls={'w-[102px]'}
              >
                Save
              </Button>
            </div>
          )}
          {selectedTaskData?.resolve === true && (
            <div>
              <Button
                buttonType={ButtonType.primary}
                cls={`inline-flex px-4 py-2 gap-2 leading-5 cursor-pointer`}
                onClick={() => {
                  setNoteSliderOpen(true);
                }}
              >
                <Icon name={'addnote'} />
                <p className="text-sm">Add Note About Task</p>
              </Button>
            </div>
          )}
          <div>
            <Button
              buttonType={ButtonType.secondary}
              cls={`w-[102px]`}
              onClick={() => {
                oncancel();
              }}
            >
              Cancel
            </Button>
          </div>
          {isEditModeActive && selectedTaskData?.resolve === false && (
            <div>
              <Button
                buttonType={ButtonType.tertiary}
                onClick={() => {
                  setStatusModalInfo({
                    show: true,
                    showCloseButton: true,
                    closeButtonText: 'Cancel',
                    heading: 'Delete Task Confirmation',
                    text: `Deleting a task  will permanently remove it from the system. Are you sure you want to proceed with this action?`,
                    type: StatusModalType.WARNING,
                    okButtonText: 'Yes, Delete Task',
                    okButtonColor: ButtonType.tertiary,
                  });
                }}
              >
                Delete Task
              </Button>
            </div>
          )}
        </div>
      </div>
      {selectedTaskData?.claimID && noteSliderOpen && (
        <AddEditViewNotes
          id={selectedTaskData.claimID}
          open={noteSliderOpen}
          noteType={'claim'}
          groupID={selectedGroup?.id}
          onClose={() => {
            onCloseModal();
            setNoteSliderOpen(false);
          }}
          disableBackdropClick={true}
          noteTypeID={86}
          subject={`Task ID#${selectedTaskData.taskID}`}
        />
      )}
      <StatusModal
        open={statusModalState.open}
        heading={statusModalState.heading}
        description={statusModalState.description}
        okButtonText={statusModalState.okButtonText}
        closeButtonText={statusModalState.closeButtonText}
        statusModalType={statusModalState.statusModalType}
        showCloseButton={statusModalState.showCloseButton}
        closeOnClickOutside={statusModalState.closeOnClickOutside}
        onChange={() => {
          if (onCancelCreate) {
            onCloseModal();
          }
          setStatusModalState({
            ...statusModalState,
            open: false,
          });
        }}
        onClose={() => {
          if (onCancelCreate) {
            setStatusModalState({
              ...statusModalState,
              open: false,
            });
          }
        }}
      />
      <StatusModal
        open={!!statusModalInfo?.show}
        heading={statusModalInfo?.heading}
        description={statusModalInfo?.text}
        statusModalType={statusModalInfo?.type}
        showCloseButton={statusModalInfo?.showCloseButton}
        okButtonText={statusModalInfo?.okButtonText}
        okButtonColor={statusModalInfo?.okButtonColor}
        closeButtonText={statusModalInfo?.closeButtonText}
        closeOnClickOutside={true}
        onChange={() => {
          if (selectedTaskData) deleteTask(selectedTaskData.taskID);
          setStatusModalInfo(undefined);
        }}
        onClose={() => {
          setStatusModalInfo(undefined);
        }}
      />
    </div>
  );
};
export default CreateTaskModal;
