import { Transition } from '@headlessui/react';
import React from 'react';
import type { ConnectedProps } from 'react-redux';
import { connect } from 'react-redux';

import type { AppState } from '@/store/rootReducer';

const mapStateToProps = (state: AppState) => {
  return {
    isOpen: state.shared.isContentSidebarOpen,
    content: state.shared.sidebarContent,
  };
};

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export type ContentSidebarProps = PropsFromRedux;

const ContentSidebar = ({ isOpen, content }: ContentSidebarProps) => {
  return (
    <Transition
      show={isOpen}
      enter="transition-all ease-linear"
      enterFrom="w-0"
      enterTo="w-96"
      leave="transition-all ease-linear"
      leaveFrom="w-96"
      leaveTo="w-0"
      className="absolute top-16 right-0 flex h-screen overflow-hidden bg-white shadow"
    >
      {content}
    </Transition>
  );
};

export default connector(ContentSidebar);
