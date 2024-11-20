import type { ComponentStory } from '@storybook/react';
import React from 'react';

import SectionHeading from '@/components/UI/SectionHeading';

export default {
  component: SectionHeading,
  title: 'Design System/Atoms/SectionHeading',
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

const Template: ComponentStory<typeof SectionHeading> = (args) => (
  <SectionHeading {...args} />
);

export const Default = Template.bind({});

Default.args = {
  label: 'Section Heading',
  isCollapsable: true,
  isCollapsed: false,
};
