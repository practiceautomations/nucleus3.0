import type { ComponentStory } from '@storybook/react';
import React from 'react';

import TextArea from '@/components/UI/TextArea';

export default {
  component: TextArea,
  title: 'Design System/Atoms/TextArea',
  argTypes: {
    onChange: { action: 'clicked' },
  },
};

const Template: ComponentStory<typeof TextArea> = (args) => (
  <TextArea {...args} />
);

export const Default = Template.bind({});

Default.args = {
  value: 'xyz',
  placeholder: 'Note (optional)',
};
