import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Icon from '@/components/Icon';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import { getRouteHistorySelector } from '@/store/shared/selectors';
import type { BreadcrumData } from '@/store/shared/types';
import { IconColors } from '@/utils/ColorFilters';

import BreadcrumbLink from './breadcrumb-link';

function BreadcrumbSeparator() {
  return <Icon name="Separator" size={24} color={IconColors.GRAY} />;
}

export interface BreadcrumbInterface {
  onPreviousLink?: () => void;
}

export default function Breadcrumbs({ onPreviousLink }: BreadcrumbInterface) {
  const [dataBreadcrum, setDataBreadcrum] = useState<BreadcrumData[]>([]);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const router = useRouter();

  const routeHistory = useSelector(getRouteHistorySelector);

  useEffect(() => {
    // const routeHistory: RouteHistoryData[] = JSON.parse(
    //   JSON.stringify(store.getState().shared.routeHistory)
    // );

    let previousName: string | undefined =
      routeHistory.length - 2 < 0
        ? ''
        : routeHistory[routeHistory.length - 2]?.displayName;
    const previousUrl =
      routeHistory.length - 2 < 0
        ? ''
        : routeHistory[routeHistory.length - 2]?.url;
    if (!previousName) {
      const preUrlArray = previousUrl?.split('/');
      let previous;
      if (preUrlArray && preUrlArray.length > 0) {
        if (preUrlArray.length === 3) {
          previous = preUrlArray[preUrlArray.length - 1];
        } else if (preUrlArray.length > 3) {
          previous = preUrlArray[preUrlArray.length - 2];
        }
      }
      const previousWords = previous && previous.split('-');
      if (previousWords && previousWords.length > 0) {
        for (let i = 0; i < previousWords.length; i += 1) {
          if (previousWords[i]) {
            const first = previousWords[i]?.charAt(0).toUpperCase() || '';
            const second = previousWords[i]?.slice(1) || '';
            previousWords[i] = first + second;
          }
        }
      }
      previousName = previousWords && previousWords.join(' ');

      let previousTab: string | undefined;

      if (previousName) {
        if (previousName === 'Monthly Summary?tab=2') {
          previousTab = 'AR Manager Dashboard';
        } else if (previousName === 'All Claims?tab=2') {
          previousTab = 'AR Claims';
        }
      }
      previousName = previousTab || previousName;
    }

    let presentUrlArray;
    if (routeHistory[routeHistory.length - 1]?.isModal) {
      presentUrlArray =
        routeHistory[routeHistory.length - 1]?.url.split('/') || [];
    } else {
      presentUrlArray = router.asPath.split('/');
    }
    let present;
    if (presentUrlArray && presentUrlArray.length > 0) {
      if (presentUrlArray.length === 3) {
        present = presentUrlArray[presentUrlArray.length - 1];
      } else if (presentUrlArray.length > 3) {
        present = presentUrlArray[presentUrlArray.length - 2];
      }
    }
    const presentWords = present && present.split('-');
    if (presentWords && presentWords.length > 0) {
      for (let i = 0; i < presentWords.length; i += 1) {
        if (presentWords[i]) {
          const first = presentWords[i]?.charAt(0).toUpperCase() || '';
          const second = presentWords[i]?.slice(1) || '';
          presentWords[i] = first + second;
        }
      }
    }
    let presentName = presentWords && presentWords.join(' ');
    if (presentName === 'Claim Detail' && presentUrlArray.length > 3) {
      presentName = `Claim #${presentUrlArray[presentUrlArray.length - 1]}`;
    }
    if (presentName === 'Register Patient' && presentUrlArray.length > 3) {
      presentName = `Patient Details - #${
        presentUrlArray[presentUrlArray.length - 1]
      }`;
    }
    let presentTab: string | undefined;

    if (presentName) {
      if (presentName === 'Monthly Summary?tab=2') {
        presentTab = 'AR Manager Dashboard';
      } else if (presentName === 'All Claims?tab=2') {
        presentTab = 'AR Claims';
      }
    }
    presentName = presentTab || presentName;
    if (selectedWorkedGroup) {
      if (selectedWorkedGroup.workGroupName) {
        const obj: BreadcrumData[] = [
          { text: selectedWorkedGroup.workGroupName, url: '' },
          {
            text: previousName,
            url: previousUrl,
            isModal: routeHistory[routeHistory.length - 2]?.isModal,
          },
          {
            text: presentName,
            url: routeHistory[routeHistory.length - 1]?.url,
            isModal: routeHistory[routeHistory.length - 1]?.isModal,
          },
        ];
        setDataBreadcrum(obj);
      } else {
        const obj: BreadcrumData[] = [
          {
            text:
              selectedWorkedGroup.groupsData &&
              selectedWorkedGroup.groupsData[0]?.value,
            url: '',
          },
          {
            text:
              selectedWorkedGroup.practicesData &&
              selectedWorkedGroup.practicesData[0]?.value,
            url: '',
          },
          {
            text:
              selectedWorkedGroup.facilitiesData &&
              selectedWorkedGroup.facilitiesData[0]?.value,
            url: '',
          },
          {
            text:
              selectedWorkedGroup.providersData &&
              selectedWorkedGroup.providersData[0]?.value,
            url: '',
          },
          {
            text: previousName,
            url: previousUrl,
            isModal: routeHistory[routeHistory.length - 2]?.isModal,
          },
          {
            text: presentName,
            url: routeHistory[routeHistory.length - 1]?.url,
            isModal: routeHistory[routeHistory.length - 1]?.isModal,
          },
        ];
        setDataBreadcrum(obj);
      }
    } else {
      const obj: BreadcrumData[] = [
        {
          text: previousName,
          url: previousUrl,
          isModal: routeHistory[routeHistory.length - 2]?.isModal,
        },
        {
          text: presentName,
          url: routeHistory[routeHistory.length - 1]?.url,
          isModal: routeHistory[routeHistory.length - 1]?.isModal,
        },
      ];
      setDataBreadcrum(obj);
    }
  }, [selectedWorkedGroup, routeHistory]);

  return (
    <div className="w-full">
      <div className="flex w-full flex-col items-center justify-center bg-gray-50">
        <div className="flex w-full items-center gap-4 self-stretch px-6">
          {dataBreadcrum &&
            dataBreadcrum.map((v, i) => {
              return (
                <>
                  {v.text && (
                    <>
                      <BreadcrumbLink
                        text={v.text}
                        link={dataBreadcrum.length - 1 === i ? '' : v.url}
                        type={dataBreadcrum.length - 1 === i ? 'isBold' : ''}
                        modal={v.isModal}
                        onPreviousClick={() => {
                          if (onPreviousLink) {
                            onPreviousLink();
                          }
                        }}
                      />
                      {dataBreadcrum.length - 1 !== i && (
                        <BreadcrumbSeparator />
                      )}
                    </>
                  )}
                </>
              );
            })}
        </div>
        <div className="h-px w-full bg-gray-200" />
      </div>
    </div>
  );
}
