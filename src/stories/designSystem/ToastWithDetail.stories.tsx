import type { ComponentStory } from '@storybook/react';
import React from 'react';

import ToastWithDetail from '@/components/UI/ToastWithDetail';
import { ToastType } from '@/store/shared/types';

export default {
  component: ToastWithDetail,
  title: 'Design System/Atoms/ToastWithDetail',
};

const Template: ComponentStory<typeof ToastWithDetail> = (args: any) => {
  return <ToastWithDetail {...args} show />;
};

export const Success = Template.bind({});

Success.args = {
  text: 'There were 2 success detail with your submissiont',
  toastType: ToastType.SUCCESS,
  detail:
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid pariatur, ipsum similique veniam.',
};

export const Error = Template.bind({});

Error.args = {
  text: 'There were 2 error with your submission',
  toastType: ToastType.ERROR,
  detail:
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid pariatur, ipsum similique veniam.',
};
export const Info = Template.bind({});

Info.args = {
  text: 'There were 2 info with your submission',
  toastType: ToastType.INFO,
  detail:
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid pariatur, ipsum similique veniam.',
};
export const Warning = Template.bind({});

Warning.args = {
  text: 'There were 2 warnings with your submission',
  toastType: ToastType.WARNING,
  detail:
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid pariatur, ipsum similique veniam.',
};
