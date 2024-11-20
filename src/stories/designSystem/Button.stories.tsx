import type { ComponentStory } from '@storybook/react';
import React from 'react';

import Button, { ButtonType } from '@/components/UI/Button';

export default {
  component: Button,
  title: 'Design System/Atoms/Button',
};

const Template: ComponentStory<typeof Button> = (args: any) => (
  <Button {...args}>{args.children}</Button>
);

export const Primary = Template.bind({});

Primary.args = {
  children: 'Primary',
};

export const Secondary = Template.bind({});

Secondary.args = {
  buttonType: ButtonType.secondary,
  children: 'Secondary',
};
