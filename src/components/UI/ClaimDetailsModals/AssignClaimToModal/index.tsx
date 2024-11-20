import { useState } from 'react';

import Button, { ButtonType } from '@/components/UI/Button';
import CloseButton from '@/components/UI/CloseButton';
import InputField from '@/components/UI/InputField';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import { reassignClaim, reassignMultipleClaim } from '@/store/shared/sagas';
import type {
  ReassignClaimData,
  ReassignMultipleClaimData,
} from '@/store/shared/types';

import type { StatusModalProps } from '../../StatusModal';
import StatusModal, { StatusModalType } from '../../StatusModal';
import TextArea from '../../TextArea';

type AssignClaimToProps = {
  onClose: () => void;
  assignClaimToData: SingleSelectDropDownDataType[];
  currentlyAssignee?: string;
  selectedClaimID?: number;
  selectedClaimIDS?: number[];
  action?: string;
  label: string;
  DropdownLable: string;
};
const AssignClaimToModal = ({
  onClose,
  assignClaimToData,
  currentlyAssignee,
  selectedClaimID,
  selectedClaimIDS,
  action = 'quick',
  label,
  DropdownLable,
}: AssignClaimToProps) => {
  // api call
  const [selectedUser, setSelectedUser] =
    useState<SingleSelectDropDownDataType>();
  const [assignUserNote, setAssignUserNote] = useState('');
  const [statusModalState, setStatusModalState] = useState<StatusModalProps>({
    open: false,
    heading: '',
    description: '',
    okButtonText: 'Ok',
    statusModalType: StatusModalType.ERROR,
    showCloseButton: false,
    closeOnClickOutside: false,
  });
  const reassignClaimRequest = async (reassignClaimData: ReassignClaimData) => {
    const res = await reassignClaim(reassignClaimData);
    if (!res) {
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
    } else {
      onClose();
    }
  };
  const multipleReassignClaimRequest = async (
    reassignClaimData: ReassignMultipleClaimData
  ) => {
    const res = await reassignMultipleClaim(reassignClaimData);
    if (!res) {
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
    } else {
      onClose();
    }
  };
  const onConfirmReassign = () => {
    if (selectedUser && action === 'quick') {
      reassignClaimRequest({
        claimID: Number(selectedClaimID),
        assignClaimTo: selectedUser.id.toString(),
        note: assignUserNote,
      });
    } else if (selectedUser && action === 'bulk') {
      multipleReassignClaimRequest({
        claimIDs: selectedClaimIDS?.join(','),
        assignToUserID: selectedUser.id.toString(),
        note: assignUserNote,
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
        <div className="flex flex-row gap-4 px-6">
          {action === 'quick' && (
            <div
              className={`text-gray-700 leading-5 text-left w-[33.33%] font-medium`}
            >
              <label className="text-sm font-medium leading-5 text-gray-900">
                Claim Currently Assigned to:
              </label>
              <div className="h-[38px] ">
                <InputField
                  placeholder="Claim Currently Assigned to"
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
                placeholder="Reassign Claim to"
                showSearchBar={false}
                disabled={false}
                appendTextClass={'italic'}
                data={
                  assignClaimToData
                    ? (assignClaimToData as SingleSelectDropDownDataType[])
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
        <div className={`w-full px-[24px] pt-[24px]`}>
          <div className={`h-px bg-gray-300 `}></div>
        </div>
        <div
          className={`p-[24px] flex flex-col gap-4 text-gray-700 leading-5 text-left w-[100%] font-medium`}
        >
          <label className="text-sm font-medium leading-5 text-gray-900">
            Why are you reassigning this claim?
          </label>
          <TextArea
            id="textarea"
            placeholder="Click here to write note"
            value={assignUserNote}
            cls={'h-[160px] resize-none'}
            onChange={(evt) => setAssignUserNote(evt.target.value)}
          />
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
export default AssignClaimToModal;
