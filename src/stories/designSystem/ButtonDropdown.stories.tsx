import type { ComponentStory } from '@storybook/react';
import React from 'react';

import ButtonDropdown from '@/components/UI/ButtonDropdown';

export default {
  component: ButtonDropdown,
  title: 'Design System/Atoms/ButtonDropdown',
  argTypes: {
    onSelect: { action: 'clicked' },
  },
};

const Template: ComponentStory<typeof ButtonDropdown> = (args) => (
  <ButtonDropdown {...args} />
);

export const Default = Template.bind({});

Default.args = {
  buttonLabel: 'Save and Continue',
  dataList: [
    { id: 1, title: 'Create a New Claim', showBottomDivider: false },
    { id: 2, title: 'Submit Claim', showBottomDivider: false },
    { id: 3, title: 'Submit + Create New Claim', showBottomDivider: false },
  ],
};
