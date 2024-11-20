import type { ComponentStory } from '@storybook/react';
import React from 'react';

import { ButtonType } from '@/components/UI/Button';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';

export default {
  component: StatusModal,
  title: 'Design System/Atoms/StatusModal',
  argTypes: {
    onClose: { action: 'clicked' },
    onchange: { action: 'clicked' },
    statusModalType: {
      control: {
        type: 'select',
        options: ['error', 'success', 'warning', 'info'],
      },
    },
  },
};

const Template: ComponentStory<typeof StatusModal> = (args) => (
  <StatusModal {...args} />
);

export const Default = Template.bind({});

Default.args = {
  open: true,
  statusModalType: StatusModalType.ERROR,
  heading: 'Error',
  description: 'Something went wrong',
  bottomDescription: 'further description',
  showCloseButton: true,
  closeOnClickOutside: true,
  okButtonText: 'Ok',
  closeButtonText: 'Close',
  closeButtonColor: ButtonType.primary,
  okButtonColor: ButtonType.secondary,
  statusData: [
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
      title: '#132124 - Invalid - Rejected by PAPM',
      type: 'warning',
      issues: [
        { issue: ' Claim scrubbing is not passed' },
        { issue: 'Claim status is not ready to Bill' },
        { issue: 'Admission Date is required for POS 21' },
      ],
    },
  ],
};
