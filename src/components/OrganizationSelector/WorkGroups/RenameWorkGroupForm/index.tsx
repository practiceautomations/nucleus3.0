import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';

import Button, { ButtonType } from '@/components/UI/Button';
import {
  getWorkGroupsDataRequest,
  setWorkGroupSelected,
} from '@/store/chrome/actions';
import { renameWorkgroupSaga } from '@/store/chrome/sagas';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import type { WorkGroupsData } from '@/store/chrome/types';
import classNames from '@/utils/classNames';

type RenameWorkgroupFormProps = {
  onClose: (isRenamed?: boolean | undefined) => void;
  workGroup: WorkGroupsData;
};

const RenameWorkgroupForm = ({
  onClose,
  workGroup,
}: RenameWorkgroupFormProps) => {
  const dispatch = useDispatch();
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
  });

  const formOptions = {
    resolver: yupResolver(validationSchema),
    initialValues: { name: '' },
  };

  const { register, handleSubmit, formState } = useForm(formOptions);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const { errors } = formState;

  const onSubmit = async ({ name }: any) => {
    if (workGroup.id) {
      const workgroup = {
        id: workGroup.id,
        name,
      };
      const res = await renameWorkgroupSaga(workgroup);
      if (res) {
        if (selectedWorkedGroup) {
          dispatch(
            setWorkGroupSelected({
              ...selectedWorkedGroup,
              workGroupName: name,
            })
          );
        }
        onClose(true);
        dispatch(getWorkGroupsDataRequest());
      }
    }
  };

  return (
    <form className={'!z-[13]'} onSubmit={handleSubmit(onSubmit)}>
      {/* !z-[2] */}
      <h1 className="mt-2 mb-7 max-w-full text-center text-lg font-medium leading-6 text-gray-500">
        Rename Group
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
          onClick={() => {
            onClose();
          }}
          buttonType={ButtonType.secondary}
          fullWidth
        >
          Cancel
        </Button>
        <Button type="submit" cls="ml-3" fullWidth>
          Rename
        </Button>
      </div>
    </form>
  );
};

export default RenameWorkgroupForm;
