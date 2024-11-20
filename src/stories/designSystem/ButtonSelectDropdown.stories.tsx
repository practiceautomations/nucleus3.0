import type { ComponentStory } from '@storybook/react';
import React from 'react';

import ButtonSelectDropdown from '@/components/UI/ButtonSelectDropdown';

export default {
  component: ButtonSelectDropdown,
  title: 'Design System/Atoms/ButtonSelectDropdown',
};

const Template: ComponentStory<typeof ButtonSelectDropdown> = (args) => (
  <ButtonSelectDropdown {...args} />
);

export const Default = Template.bind({});

Default.args = {
  data: [
    {
      id: 1,
      value: 'Aging Claims First',
    },
    {
      id: 2,
      value: 'Aging Claims Last',
    },
    {
      id: 3,
      value: 'Higher Value First',
    },
    {
      id: 4,
      value: 'Higher Value Last',
    },
    {
      id: 5,
      value: 'Follow-Up Days Increasing',
    },
    {
      id: 6,
      value: 'Follow-Up Days Decreasing',
    },
  ],
  showSelection: true,
  isSingleSelect: true,
  cls: 'w-[110px]',
  placeholder: 'Press me',
};
