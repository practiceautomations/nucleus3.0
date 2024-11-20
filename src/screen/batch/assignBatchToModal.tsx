import { useState } from 'react';

import Button, { ButtonType } from '@/components/UI/Button';
import CloseButton from '@/components/UI/CloseButton';
import InputField from '@/components/UI/InputField';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import type { StatusModalProps } from '@/components/UI/StatusModal';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import { reassignBatch } from '@/store/shared/sagas';
import type { ReassignBatchData } from '@/store/shared/types';

type AssignBatchToProps = {
  onClose: () => void;
  assignBatchToData: SingleSelectDropDownDataType[];
  currentlyAssignee?: string;
  selectedBatchID?: number;
  selectedBatchIDS?: number[];
  action?: string;
  label: string;
  DropdownLable: string;
};
const AssignBatchToModal = ({
  onClose,
  assignBatchToData,
  currentlyAssignee,
  selectedBatchID,
  action = 'quick',
  label,
  DropdownLable,
}: AssignBatchToProps) => {
  // api call
  const [selectedUser, setSelectedUser] =
    useState<SingleSelectDropDownDataType>();
  const [statusModalState, setStatusModalState] = useState<StatusModalProps>({
    open: false,
    heading: '',
    description: '',
    okButtonText: 'Ok',
    statusModalType: StatusModalType.ERROR,
    showCloseButton: false,
    closeOnClickOutside: false,
  });
  const reassignBatchRequest = async (reassignBatchData: ReassignBatchData) => {
    const res = await reassignBatch(reassignBatchData);
    if (!res) {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Error',
        description:
          'A system error prevented the batch to be reassigned. Please try again.',
        okButtonText: 'Ok',
        statusModalType: StatusModalType.ERROR,
        showCloseButton: false,
        closeOnClickOutside: false,
      });
    } else {
      onClose();
    }
  };

  const onConfirmReassign = () => {
    if (selectedUser && action === 'quick') {
      reassignBatchRequest({
        paymentBatchID: Number(selectedBatchID),
        assignPaymentBatchTo: selectedUser.id.toString(),
      });
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
  return (
    <div className="flex flex-col  bg-gray-100">
      <div className="flex max-w-full flex-col gap-4 p-[24px]">
        <div className="flex flex-row justify-between">
          <div>
            <h1 className=" text-left  text-xl font-bold leading-7 text-gray-700">
              {label}
            </h1>
          </div>
          <div className="">
            <CloseButton onClick={onClose} />
          </div>
        </div>
        <div className={`w-full`}>
          <div className={`h-px bg-gray-300 `}></div>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex flex-row gap-4 px-6 pb-[140px]">
          {action === 'quick' && (
            <div
              className={`text-gray-700 leading-5 text-left w-[33.33%] font-medium`}
            >
              <label className="text-sm font-medium leading-5 text-gray-900">
                Batch Currently Assigned to:
              </label>
              <div className="h-[38px] ">
                <InputField
                  placeholder="Batch Currently Assigned to"
                  value={currentlyAssignee}
                  disabled={true}
                />
              </div>
            </div>
          )}
          <div
            className={` text-gray-700 leading-5 text-left w-[33.33%] font-medium`}
          >
            <label className="text-sm font-medium leading-5 text-gray-900">
              {DropdownLable}
            </label>
            <div className="h-[38px]">
              <SingleSelectDropDown
                placeholder="Reassign Batch to"
                showSearchBar={false}
                disabled={false}
                appendTextClass={'italic'}
                data={
                  assignBatchToData
                    ? (assignBatchToData as SingleSelectDropDownDataType[])
                    : []
                }
                selectedValue={selectedUser}
                onSelect={(value) => {
                  setSelectedUser(value);
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={`h-[120px] bg-gray-200 w-full`}>
        <div className="flex flex-row-reverse gap-4 p-6 ">
          <div>
            <Button
              buttonType={ButtonType.primary}
              onClick={() => {
                onConfirmReassign();
              }}
            >
              Confirm
            </Button>
          </div>
          <div>
            <Button
              buttonType={ButtonType.secondary}
              cls={`w-[102px]`}
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
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
          setStatusModalState({
            ...statusModalState,
            open: false,
          });
        }}
      />
    </div>
  );
};
export default AssignBatchToModal;
