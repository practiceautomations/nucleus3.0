import { useDispatch } from 'react-redux';

import Button, { ButtonType } from '@/components/UI/Button';
import { getWorkGroupsSelectedDataRequest } from '@/store/chrome/actions';
import { removeWorkGroupItemSaga } from '@/store/chrome/sagas';
import type { RemoveFromWorkGroupType } from '@/store/chrome/types';

type RemoveItemsWorkGroupModelProps = {
  removeItemFromWorkGroup: RemoveFromWorkGroupType;
  onClose: (isRemoved?: boolean | undefined) => void;
};

const RemoveItemsWorkGroupModel = ({
  removeItemFromWorkGroup,
  onClose,
}: RemoveItemsWorkGroupModelProps) => {
  const dispatch = useDispatch();
  const onRemove = async () => {
    if (removeItemFromWorkGroup) {
      const res = await removeWorkGroupItemSaga(removeItemFromWorkGroup);
      if (res) {
        dispatch(
          getWorkGroupsSelectedDataRequest({
            workGroupId: removeItemFromWorkGroup.workGroupID,
          })
        );
        onClose(true);
      }
    }
  };

  return (
    <div>
      <h1 className="mt-2 max-w-full text-center text-lg font-medium leading-6 text-black">
        Confirmation
      </h1>
      <div>
        <div className="mt-1">
          <p
            className="mb-1 text-center text-sm text-sm leading-tight text-gray-500"
            id="name-error"
          >
            Are you sure you want to remove ’
            {removeItemFromWorkGroup.removeEntityName}’ from ’
            {removeItemFromWorkGroup.removeFromEntitiName}’?
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
          onClick={() => {
            onRemove();
          }}
          fullWidth
        >
          Yes, Remove
        </Button>
      </div>
    </div>
  );
};

export default RemoveItemsWorkGroupModel;
