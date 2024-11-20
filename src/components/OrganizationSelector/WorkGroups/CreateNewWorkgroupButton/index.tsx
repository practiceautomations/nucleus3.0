import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Icon from '@/components/Icon';
import Modal from '@/components/UI/Modal';
import {
  getWorkGroupsDataRequest,
  setCreateEditWorkGroupIsSuccessed,
} from '@/store/chrome/actions';
import { getCreateEditWorkGroupIsSuccessedselector } from '@/store/chrome/selectors';
import { IconColors } from '@/utils/ColorFilters';

import NewWorkgroupForm from '../NewWorkgroupForm';

const CreateNewWorkgroupButton = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const createEditWorkGroupSuccessed = useSelector(
    getCreateEditWorkGroupIsSuccessedselector
  );

  useEffect(() => {
    if (createEditWorkGroupSuccessed) {
      setIsModalOpen(false);
      dispatch(getWorkGroupsDataRequest());
    }
    dispatch(setCreateEditWorkGroupIsSuccessed(null));
  }, [createEditWorkGroupSuccessed]);

  return (
    <>
      <button
        className="flex w-full items-center text-sm font-normal leading-5 text-gray-700"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="mr-2 flex h-10 w-10 items-center justify-center rounded-lg border-[1px] border-gray-300">
          <Icon name="plus" color={IconColors.GRAY} />
        </div>
        Create New Workgroup
      </button>

      <Modal
        open={isModalOpen}
        onClose={() => {}}
        modalContentClassName="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 w-full sm:max-w-lg sm:p-6 "
        modalClassName={'!z-[4]'}
      >
        <NewWorkgroupForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
};

export default CreateNewWorkgroupButton;
