import { useDispatch } from 'react-redux';

import Button, { ButtonType } from '@/components/UI/Button';
import {
  getWorkGroupsDataRequest,
  setWorkGroupSelected,
  setWorkgroupSelectResponceData,
} from '@/store/chrome/actions';
import { deleteWorkgroupSaga } from '@/store/chrome/sagas';
import type { WorkGroupsData } from '@/store/chrome/types';

type DeleteWorkgroupFormProps = {
  onClose: (isDeleted?: boolean | undefined) => void;
  workGroup: WorkGroupsData;
};

const DeleteWorkgroupForm = ({
  onClose,
  workGroup,
}: DeleteWorkgroupFormProps) => {
  const dispatch = useDispatch();

  const onDelete = async () => {
    if (workGroup.id) {
      const res = await deleteWorkgroupSaga(workGroup.id);
      if (res) {
        onClose(true);
        dispatch(getWorkGroupsDataRequest());
        dispatch(setWorkgroupSelectResponceData(null));
        dispatch(setWorkGroupSelected(null));
      }
    }
  };

  return (
    <div>
      <h1 className="text-black-500 mt-2 max-w-full text-center text-lg font-medium leading-6">
        Confirmation
      </h1>
      <div>
        <div className="mt-1">
          <p
            className="mb-1 text-center text-sm text-sm leading-tight text-gray-500"
            id="name-error"
          >
            Are you sure you want to delete {workGroup.value}?
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-row justify-between">
        <Button
          type="button"
          onClick={() => {
            onClose();
          }}
          buttonType={ButtonType.secondary}
          fullWidth
        >
          Cancel
        </Button>
        <Button
          cls="ml-3 border-transparent bg-red-500 focus:ring-cyan-500 hover:bg-red-500 text-white"
          onClick={onDelete}
          fullWidth
        >
          Yes, Delete Group
        </Button>
      </div>
    </div>
  );
};

export default DeleteWorkgroupForm;
