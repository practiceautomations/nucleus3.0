import type { ComponentStory } from '@storybook/react';
import React from 'react';

import Toast from '@/components/UI/Toast';
import { ToastType } from '@/store/shared/types';

export default {
  component: Toast,
  title: 'Design System/Atoms/Toast',
};

const Template: ComponentStory<typeof Toast> = (args: any) => {
  return <Toast {...args} show />;
};

export const Success = Template.bind({});

Success.args = {
  text: 'Success toast',
  toastType: ToastType.SUCCESS,
};

export const Error = Template.bind({});

Error.args = {
  text: 'Error toast',
  toastType: ToastType.ERROR,
};
export const Info = Template.bind({});
Info.args = {
  text: 'Info toast',
  toastType: ToastType.INFO,
};
export const Warning = Template.bind({});
Warning.args = {
  text: 'Warning toast',
  toastType: ToastType.WARNING,
};
