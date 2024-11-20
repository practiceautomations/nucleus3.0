import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Icon from '@/components/Icon';
import { ButtonType } from '@/components/UI/Button';
import CreateTaskModal from '@/components/UI/ClaimDetailsModals/CreateTask';
import Modal from '@/components/UI/Modal';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import { AddEditViewNotes } from '@/components/ViewNotes';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import { deleteClaimTask, markAsResolvedTask } from '@/store/shared/sagas';
import { getGroupDataSelector } from '@/store/shared/selectors';
import type { TaskGridData } from '@/store/shared/types';
import { IconColors } from '@/utils/ColorFilters';

interface Tprops {
  confirmIsTrigger?: number | null;
  assignClaimToData: SingleSelectDropDownDataType[];
  taskGridData: TaskGridData[];
  taskGridDataUpdate: () => void;
  toggleDrawer: (value: boolean) => void;
}
const TaskWindowPane = ({
  confirmIsTrigger,
  taskGridData,
  taskGridDataUpdate,
  assignClaimToData,
}: // toggleDrawer,
Tprops) => {
  const confirmIsTriggerEvent = () => {};
  const groupsData = useSelector(getGroupDataSelector);
  const selectedWorkGroupData = useSelector(getselectdWorkGroupsIDsSelector);
  const [noteSliderOpen, setNoteSliderOpen] = useState(false);
  const [noteTaskID, setNoteTaskID] = useState<number>();
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [taskModalInEditMode, setTaskModalInEditMode] = useState(false);
  const [selectedRow, setSelectedrow] = useState<TaskGridData>();
  useEffect(() => {
    if (confirmIsTrigger) {
      confirmIsTriggerEvent();
    }
  }, [confirmIsTrigger]);
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
  const markAsResolved = async (taskID: number) => {
    const res = await markAsResolvedTask(taskID);
    if (res) {
      taskGridDataUpdate();
    }
  };
  const deleteTask = async (taskID: number) => {
    const res = await deleteClaimTask(taskID);
    if (res) {
      taskGridDataUpdate();
    }
  };
  return (
    <div className="w-full  rounded border-2 shadow-md">
      {taskGridData?.map((row) => (
        <>
          <div
            key={row.taskID}
            className="flex h-[54px] w-full justify-between  gap-4"
          >
            <div className="ml-[15px] mt-[11px] flex h-8 items-center justify-start space-x-4">
              <p className="text-xs leading-none text-gray-500">
                Task ID#{row.taskID}
              </p>
              <div className="ml-0 h-px w-6 rotate-90 bg-gray-200" />
              <div className="flex items-center justify-start space-x-4">
                <p className="text-sm leading-tight text-gray-700">
                  {row.title}
                </p>
                <p
                  className="cursor-pointer text-xs leading-none text-cyan-400 underline"
                  onClick={() => {
                    setCreateTaskModalOpen(true);
                    // toggleDrawer(true);
                    setTaskModalInEditMode(false);
                    setSelectedrow(row);
                  }}
                >
                  View Task Details
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-5">
              <div className="flex h-[30px] w-[811px] items-center justify-end">
                <div className="flex h-[24px] items-center justify-start space-x-2">
                  {row.alert ? <Icon name="exclamation"></Icon> : <></>}
                  <div className="flex h-[16px] items-center justify-center rounded bg-blue-100 px-2.5 py-0.5">
                    <p className="whitespace-nowrap text-center text-xs font-medium leading-none text-cyan-600">
                      Assigned to:{row.assignToName}
                    </p>
                  </div>
                  <div className="flex h-[16px] w-[119px] items-center justify-center rounded bg-red-100 px-2.5 py-0.5">
                    <p className="whitespace-nowrap text-center text-xs font-medium leading-none text-red-800">
                      Due: {row.dueDate}
                    </p>
                  </div>
                  <div
                    className={`flex h-[16px] items-center justify-center rounded ${
                      !row.resolve ? 'bg-red-100' : 'bg-green-100'
                    } px-2.5 py-0.5`}
                  >
                    <p
                      className={`text-center text-xs font-medium leading-none ${
                        !row.resolve ? 'text-red-800' : 'text-green-800'
                      }`}
                    >
                      {row.resolve ? 'Resolved' : 'Unresolved'}
                    </p>
                  </div>
                </div>
                <div className="ml-0 h-px w-6 rotate-90 bg-gray-200" />
                <div
                  className={`flex h-[30px] ${
                    !row.resolve ? 'w-[385px]' : 'w-[285px]'
                  } items-start justify-start space-x-2`}
                >
                  {!row.resolve && (
                    <div
                      className="flex h-[30px] w-[155px] cursor-pointer items-center justify-center space-x-2 rounded bg-cyan-400 py-1.5 pl-2 pr-2.5 shadow"
                      onClick={() => {
                        if (!row.resolve) {
                          markAsResolved(row.taskID);
                        }
                      }}
                    >
                      <Icon name="checkCircle" color={IconColors.WHITE}></Icon>
                      <p className="text-xs font-medium leading-none text-white">
                        Mark as Resolved
                      </p>
                    </div>
                  )}
                  <div
                    className="flex h-[30px] w-[180px] cursor-pointer items-center justify-center space-x-2 rounded border border-gray-300 bg-white py-1.5 pl-2 pr-2.5 shadow"
                    onClick={() => {
                      setNoteTaskID(row.taskID);
                      setNoteSliderOpen(true);
                    }}
                  >
                    <Icon name={'notes'} color={IconColors.GRAY} />
                    <p className="whitespace-nowrap text-xs font-medium leading-4 text-gray-700">
                      Add Note About Task
                    </p>
                  </div>
                  <div
                    className="flex h-full w-8 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white p-2 shadow"
                    onClick={() => {
                      setCreateTaskModalOpen(true);
                      setTaskModalInEditMode(true);
                      // toggleDrawer(true);
                      setSelectedrow(row);
                    }}
                  >
                    <Icon name={'pencil'} color={IconColors.GRAY} />
                  </div>
                  <div
                    className="flex h-full w-8 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white p-2 shadow"
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
                    <Icon name={'trash'} size={18} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Modal
            open={createTaskModalOpen}
            onClose={() => {}}
            modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-420px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
          >
            <CreateTaskModal
              assignClaimToData={assignClaimToData || []}
              onCloseModal={() => {
                setCreateTaskModalOpen(false);
                taskGridDataUpdate();
              }}
              selectedTaskData={selectedRow}
              taskModalInEditMode={taskModalInEditMode}
            />
          </Modal>
          {row.claimID && noteSliderOpen && (
            <AddEditViewNotes
              id={row.claimID}
              open={noteSliderOpen}
              noteType={'claim'}
              groupID={selectedGroup?.id}
              onClose={() => {
                taskGridDataUpdate();
                setNoteSliderOpen(false);
              }}
              disableBackdropClick={true}
              noteTypeID={86}
              subject={`Task ID#${noteTaskID}`}
            />
          )}
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
              deleteTask(row.taskID);
              setStatusModalInfo(undefined);
            }}
            onClose={() => {
              setStatusModalInfo(undefined);
            }}
          />
          <div className="h-px w-full bg-gray-200" />
        </>
      ))}
    </div>
  );
};

export default TaskWindowPane;
