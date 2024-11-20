import type { ComponentStory } from '@storybook/react';
import React from 'react';

import InputField from '@/components/UI/InputField';

export default {
  component: InputField,
  title: 'Design System/Atoms/InputField',
  argTypes: {
    onSelect: { action: 'clicked' },
  },
};

const Template: ComponentStory<typeof InputField> = (args) => (
  <InputField {...args} />
);

export const Default = Template.bind({});

Default.args = {
  disabled: false,
};
