import type { ComponentStory } from '@storybook/react';
import React from 'react';

import UploadFile from '@/components/UI/UploadFile';

export default {
  component: UploadFile,
  title: 'Design System/Atoms/UploadFile',
};

const Template: ComponentStory<typeof UploadFile> = (args) => (
  <UploadFile {...args} />
);

export const Default = Template.bind({});

Default.args = {
  placeholder: 'Click to select file',
  disabled: false,
};
