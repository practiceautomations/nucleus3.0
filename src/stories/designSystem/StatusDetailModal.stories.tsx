import type { ComponentStory } from '@storybook/react';
import React from 'react';

import StatusDetailModal from '@/components/UI/StatusDetailModal';

export default {
  component: StatusDetailModal,
  title: 'Design System/Atoms/StatusDetailModal',
  argTypes: {
    onClose: { action: 'clicked' },
    onDownload: { action: 'clicked' },
  },
};

const Template: ComponentStory<typeof StatusDetailModal> = (args) => (
  <StatusDetailModal {...args} />
);

export const Default = Template.bind({});

Default.args = {
  open: true,
  headingText: 'Multiple Claims Submissions Validations',
  data: [
    {
      id: 12323,
      title: '#132124 - Invalid - Rejected by PAPM',
      type: 'error',
      issues: [
        { issue: 'Claim scrubbing is not passed' },
        { issue: 'Claim status is not ready to Bill' },
        { issue: 'Admission Date is required for POS 21' },
      ],
    },
    {
      id: 22323,
      title: '#719924 - Successfully Submited',
      type: 'success',
    },
    {
      id: 32323,
      title: '#132124 - Invalid - Rejected by PAPM',
      type: 'error',
      issues: [
        { issue: 'Claim scrubbing is not passed' },
        { issue: 'Claim status is not ready to Bill' },
        { issue: 'Admission Date is required for POS 21' },
      ],
    },
    {
      id: 42323,
      title: '#719924 - Successfully Submited',
      type: 'success',
    },
    {
      id: 5232,
      title: '#132124 - Invalid - Rejected by PAPM',
      type: 'error',
      issues: [
        { issue: 'Claim scrubbing is not passed' },
        { issue: 'Claim status is not ready to Bill' },
        { issue: 'Admission Date is required for POS 21' },
      ],
    },
  ],
};
