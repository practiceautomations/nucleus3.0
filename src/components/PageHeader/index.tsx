import React, { useEffect, useRef } from 'react';

import classNames from '@/utils/classNames';

interface PageHeaderInterface {
  children: React.ReactNode;
  cls?: string;
}

export default function PageHeader({ cls, children }: PageHeaderInterface) {
  const pageHeaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pageHeader = pageHeaderRef.current;
    if (pageHeader) {
      const buttons = pageHeader.querySelectorAll('button');
      buttons.forEach((button) => {
        // eslint-disable-next-line no-param-reassign
        button.className = `focus:outline-cyan-500 ${button.className}`;
      });
    }
  }, []);

  return (
    <div
      ref={pageHeaderRef}
      className={classNames(
        'relative w-full bg-[rgba(236,254,255,1)] text-left drop-shadow-lg',
        cls || ''
      )}
    >
      {children}
    </div>
  );
}
