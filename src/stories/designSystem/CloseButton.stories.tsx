import type { ComponentStory } from '@storybook/react';
import React from 'react';

import CloseButton from '@/components/UI/CloseButton';

export default {
  component: CloseButton,
  title: 'Design System/Atoms/CloseButton',
};

const Template: ComponentStory<typeof CloseButton> = (args) => (
  <CloseButton {...args} />
);

export const Default = Template.bind({});

Default.args = {};
