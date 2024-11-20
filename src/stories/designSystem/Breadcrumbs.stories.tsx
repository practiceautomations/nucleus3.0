import type { ComponentStory } from '@storybook/react';
import React from 'react';

import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';

export default {
  component: Breadcrumbs,
  title: 'Design System/Atoms/Breadcrumbs',
};

const Template: ComponentStory<typeof Breadcrumbs> = () => <Breadcrumbs />;

export const Default = Template.bind({});

Default.args = {
  onPreviousLink: () => {},
  // data: [
  //   { text: 'Group 1', url: '' },
  //   { text: 'Practice 1', url: '' },
  //   { text: 'Facility1', url: '' },
  //   { text: '11  Office', url: '' },
  //   { text: 'Provider 1', url: '' },
  //   { text: 'Group 1', url: '' },
  //   { text: 'All Claims', url: '' },
  //   { text: 'Create New Claim', url: '' },
  // ],
};
