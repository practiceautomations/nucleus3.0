import type { ComponentStory } from '@storybook/react';
import React from 'react';

import CheckBox from '@/components/UI/CheckBox';

export default {
  component: CheckBox,
  title: 'Design System/Atoms/CheckBox',
  argTypes: {
    onChange: { action: 'clicked' },
  },
};

const Template: ComponentStory<typeof CheckBox> = (args) => (
  <CheckBox {...args} />
);

export const Default = Template.bind({});

Default.args = {
  id: 'checkbox',
  checked: false,
};
