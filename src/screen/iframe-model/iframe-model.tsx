import React from 'react';

import CloseButton from '@/components/UI/CloseButton';
import Modal from '@/components/UI/Modal';

interface TProps {
  open: boolean;
  url: string;
  onClose: () => void;
}

export default function IframeModel({ open, url, onClose }: TProps) {
  return (
    <>
      <Modal
        open={open}
        onClose={() => {
          onClose();
        }}
        modalContentClassName="relative w-[95vw] h-[95vh] rounded-lg bg-white shadow-xl transition-all sm:my-8"
        modalBackgroundClassName={'!overflow-hidden'}
        modalClassName={'!z-[13]'}
      >
        <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-white shadow">
          <div className="flex w-full flex-col items-start justify-start p-6">
            <div className="inline-flex w-full items-center justify-between">
              <div className="flex items-center justify-start space-x-2">
                <p className="text-xl font-bold leading-7 text-gray-700">
                  {'PDF Viewer'}
                </p>
              </div>
              <CloseButton
                onClick={() => {
                  onClose();
                }}
              />
            </div>
          </div>
          <iframe src={url} width="100%" height="100%" allowFullScreen></iframe>
          {/* <iframe src="https://adnarepdf.practiceautomations.com/?id=468&isViewer=true&page=2&baseurl=https://devapi.practiceautomations.com" width="100%" height="100%" allowFullScreen></iframe> */}
        </div>
      </Modal>
    </>
  );
}
