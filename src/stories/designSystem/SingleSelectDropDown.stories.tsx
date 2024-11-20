import type { ComponentStory } from '@storybook/react';
import React from 'react';

import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';

export default {
  component: SingleSelectDropDown,
  title: 'Design System/Atoms/SingleSelectDropDown',
  argTypes: {
    onSelect: { action: 'clicked' },
  },
};

const Template: ComponentStory<typeof SingleSelectDropDown> = (args) => (
  <SingleSelectDropDown {...args} />
);

export const Default = Template.bind({});

Default.args = {
  placeholder: 'Select Value',
  showSearchBar: true,
  disabled: false,
  selectedValue: { id: 1, value: 'Leslie Alexander' },
  data: [
    { id: 1, value: 'Leslie Alexander' },
    { id: 2, value: 'Toom Cook' },
    { id: 3, value: 'Jack John' },
    { id: 4, value: 'Emily Selman' },
    { id: 5, value: 'John Down' },
  ],
};
