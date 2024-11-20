import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';

import Button, { ButtonType } from '@/components/UI/Button';
import {
  getWorkGroupsDataRequest,
  setCreateEditWorkGroupIsSuccessed,
} from '@/store/chrome/actions';
import { createWorkgroupRequestSaga } from '@/store/chrome/sagas';
import { getCreateEditWorkGroupIsSuccessedselector } from '@/store/chrome/selectors';
import type {
  EditWorkgroupData,
  WorkGroupsSelected,
} from '@/store/chrome/types';
import classNames from '@/utils/classNames';

type NewWorkgroupFormProps = {
  onClose: () => void;
  workGroupsSelected?: WorkGroupsSelected | undefined;
};

const NewWorkgroupForm = ({
  onClose,
  workGroupsSelected,
}: NewWorkgroupFormProps) => {
  const dispatch = useDispatch();
  const createEditWorkGroupSuccessed = useSelector(
    getCreateEditWorkGroupIsSuccessedselector
  );
  // form validation rules
  useEffect(() => {
    if (createEditWorkGroupSuccessed) {
      dispatch(getWorkGroupsDataRequest());
      dispatch(setCreateEditWorkGroupIsSuccessed(null));
    }
  }, [createEditWorkGroupSuccessed]);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
  });

  const formOptions = {
    resolver: yupResolver(validationSchema),
    initialValues: { name: '' },
  };

  // get functions to build form with useForm() hook
  const { register, handleSubmit, formState } = useForm(formOptions);
  const { errors } = formState;

  function onSubmit({ name }: any) {
    const workGroup: EditWorkgroupData = {
      name,
      providers: workGroupsSelected?.providersData.map((m) => m.id) || [],
      practices: workGroupsSelected?.practicesData.map((m) => m.id) || [],
      groups: workGroupsSelected?.groupsData.map((m) => m.id) || [],
      facilities: workGroupsSelected?.facilitiesData.map((m) => m.id) || [],
    };
    createWorkgroupRequestSaga(workGroup);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1 className="mt-2 mb-7 max-w-full text-center text-lg font-medium leading-6 text-gray-500">
        New Workgroup Name
      </h1>
      <div>
        <div className="mt-1">
          <input
            type="text"
            placeholder="Type new workgroup name here"
            {...register('name')}
            className={classNames(
              'block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm max-w-full',
              errors.name ? 'border-red-500' : 'border-gray-300 mb-6'
            )}
            aria-describedby="name-error"
          />
        </div>
        <p className="mb-1 text-sm text-red-700" id="name-error">
          {errors.name?.message as string}
        </p>
      </div>
      <div className="mt-6 flex flex-row justify-between">
        <Button
          type="button"
          onClick={onClose}
          buttonType={ButtonType.secondary}
          fullWidth
        >
          Cancel
        </Button>
        <Button type="submit" cls="ml-3" fullWidth>
          Create
        </Button>
      </div>
    </form>
  );
};

export default NewWorkgroupForm;
