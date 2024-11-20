import { useRouter } from 'next/router';
import React from 'react';
import { useDispatch } from 'react-redux';

import store from '@/store';
import { setGlobalModal } from '@/store/shared/actions';
import type { RouteHistoryData } from '@/store/shared/types';

interface BreadcrumbLinkInterface {
  type?: string;
  text: string;
  link?: string;
  modal?: boolean;
  onPreviousClick: () => void;
}

export default function BreadcrumbLink({
  type,
  text,
  link,
  onPreviousClick,
}: BreadcrumbLinkInterface) {
  const router = useRouter();
  const dispatch = useDispatch();

  return (
    <div
      className={`text-left leading-5 transition-all ${
        type === 'isBold'
          ? 'font-bold text-gray-600'
          : 'font-medium text-gray-400'
      } ${link ? 'cursor-pointer' : ''}`}
      onClick={() => {
        const routeHistory: RouteHistoryData[] = JSON.parse(
          JSON.stringify(store.getState().shared.routeHistory)
        );

        if (
          (link && routeHistory[routeHistory.length - 1]?.url === link) ||
          !link
        ) {
          return;
        }
        if (routeHistory[routeHistory.length - 1]?.isModal) {
          onPreviousClick();
        } else if (routeHistory[routeHistory.length - 2]?.isModal) {
          const secLastVal = routeHistory[routeHistory.length - 2];
          const ID = secLastVal?.url.split('/').pop();
          dispatch(setGlobalModal({ type: 'Claim Detail', id: Number(ID) }));
        } else if (link) {
          router.push(link);
        }
      }}
    >
      <p className="text-sm">{text}</p>
    </div>
  );
}
