import type { ComponentStory } from '@storybook/react';
import React from 'react';

import RadioButton from '@/components/UI/RadioButton';

export default {
  component: RadioButton,
  title: 'Design System/Atoms/RadioButton',
  argTypes: {
    onChange: { action: 'clicked' },
  },
};

const Template: ComponentStory<typeof RadioButton> = (args) => (
  <RadioButton {...args} />
);

export const Default = Template.bind({});

Default.args = {
  checkedValue: 'Y',
  data: [
    { value: 'Y', label: 'Yes' },
    { value: 'N', label: 'No' },
    { value: 'B', label: 'Both' },
  ],
};
