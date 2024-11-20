import type { ComponentStory } from '@storybook/react';
import React from 'react';

import MultiSelectGridDropdown from '@/components/UI/MultiSelectGridDropdown';

export default {
  component: MultiSelectGridDropdown,
  title: 'Design System/Atoms/MultiSelectGridDropdown',
  argTypes: {
    onSelect: { action: 'clicked' },
  },
};
const Template: ComponentStory<typeof MultiSelectGridDropdown> = (args) => (
  <MultiSelectGridDropdown {...args} />
);
export const Default = Template.bind({});
Default.args = {
  placeholder: 'Select Value',
  showSearchBar: true,
  disabled: false,
  selectedValue: [{ id: 2, value: 'Toom Cook' }],
  data: [
    {
      id: 1,
      value: 'Leslie Alexander',
    },
    { id: 2, value: 'Toom Cook' },
    { id: 3, value: 'Jack John' },
    { id: 4, value: 'Emily Selman' },
    { id: 5, value: 'John Down' },
  ],
};
