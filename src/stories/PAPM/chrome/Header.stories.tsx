import type { ComponentStory } from '@storybook/react';
import React from 'react';

import Header from '@/components/Header';

export default {
  component: Header,
  title: 'PAPM/Chrome/Header',
};

const Template: ComponentStory<typeof Header> = (args: any) => (
  <Header {...args} />
);

export const Default = Template.bind({});

Default.args = {};
