import type { ComponentStory } from '@storybook/react';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import ToastContainer from '@/components/ToastContainer';
import Button from '@/components/UI/Button';
import { addToastNotification } from '@/store/shared/actions';
import { ToastType } from '@/store/shared/types';

export default {
  component: ToastContainer,
  title: 'PAPM/Shared/ToastContainer',
};

const Template: ComponentStory<typeof ToastContainer> = (args: any) => {
  const dispatch = useDispatch();

  const addToasts = () => {
    dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Toast type is an: ERROR',
        toastType: ToastType.ERROR,
      })
    );
    dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Toast type is an: SUCCESS',
        toastType: ToastType.SUCCESS,
      })
    );
    dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Toast type is an: INFO',
        toastType: ToastType.INFO,
      })
    );
    dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Toast type is an: WARNING',
        toastType: ToastType.WARNING,
      })
    );
    dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Toast type is an: DETAIL',
        detail: 'Detailed text to describe something.',
        toastType: ToastType.INFO,
      })
    );
  };

  useEffect(() => {
    addToasts();
  }, []);
  return (
    <>
      <Button onClick={addToasts}>Add Toasts</Button>
      <ToastContainer {...args} />
    </>
  );
};

export const Default = Template.bind({});

Default.args = {};
