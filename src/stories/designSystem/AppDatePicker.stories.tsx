import type { ComponentStory } from '@storybook/react';
import React from 'react';

import AppDatePicker from '@/components/UI/AppDatePicker';

export default {
  component: AppDatePicker,
  title: 'Design System/Atoms/AppDatePicker',
  argTypes: {
    onSelect: { action: 'clicked' },
  },
};

const Template: ComponentStory<typeof AppDatePicker> = (args) => (
  <AppDatePicker {...args} />
);

export const Default = Template.bind({});

Default.args = {
  selected: new Date(),
  placeholderText: 'mm/dd/yyyy',
  disabled: false,
};
