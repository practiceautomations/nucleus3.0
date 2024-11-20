import type { ComponentStory } from '@storybook/react';
import React from 'react';

import PageHeader from '@/components/PageHeader';

export default {
  component: PageHeader,
  title: 'Design System/Atoms/PageHeader',
};

const Template: ComponentStory<typeof PageHeader> = (args) => (
  <PageHeader {...args} />
);

export const Default = Template.bind({});

Default.args = {};
