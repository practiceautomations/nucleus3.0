import type { ComponentStory } from '@storybook/react';
import React from 'react';

import InputFieldAmount from '@/components/UI/InputFieldAmount';

export default {
  component: InputFieldAmount,
  title: 'Design System/Atoms/InputFieldAmount',
  argTypes: {
    onSelect: { action: 'clicked' },
  },
};

const Template: ComponentStory<typeof InputFieldAmount> = (args) => (
  <InputFieldAmount {...args} />
);

export const Default = Template.bind({});

Default.args = {
  placeholder: '0.00',
  disabled: false,
};
