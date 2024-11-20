import { useRouter } from 'next/router';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

// import NotificationContainer from '@/components/NotificationContainer';
import { logoutRequest } from '@/store/login/actions';
import { getEmailSelector, getUserSelector } from '@/store/login/selectors';

// import {
//   setSidebarContent,
//   toggleContentSidebar,
// } from '@/store/shared/actions';
import UserProfileDropdown from '../UI/UserProfileDropdown';

const HeaderIconButtons = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  // const handleNotificationClick = () => {
  //   dispatch(toggleContentSidebar());
  //   dispatch(setSidebarContent({ content: NotificationContainer }));
  // };
  const userEmail = useSelector(getEmailSelector);
  const user = useSelector(getUserSelector);
  const onLogOut = () => {
    if (user && user.loginAuditID) {
      dispatch(
        logoutRequest({
          loginAuditID: user.loginAuditID,
        })
      );
    }
  };

  return (
    <div className="flex flex-1 items-center px-4 xs:mx-auto md:mx-0">
      <div className="flex w-full items-center justify-between md:shrink-0">
        {/* <button
          type="button"
          className="mx-2 flex rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 sm:hidden"
        >
          <span className="sr-only">Organization Selector</span>
          <Icon name="briefcase" size={24} color={IconColors.GRAY} />
        </button> */}
        {/* <button
          type="button"
          className="mx-2 flex rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 md:hidden"
        >
          <span className="sr-only">Search</span>
          <Icon name="search" size={24} color={IconColors.GRAY} />
        </button> */}
        {/* <button
          type="button"
          className="mx-2 flex rounded-full bg-white p-1 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          onClick={handleNotificationClick}
        >
          <span className="sr-only">Notifications</span>
          <Icon name="bell" size={24} color={IconColors.GRAY} />
        </button> */}
        {/* <button
          type="button"
          className="mx-2 flex rounded-full bg-white p-1 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
        >
          <span className="sr-only">Help</span>
          <Icon name="support" size={24} color={IconColors.GRAY} />
        </button> */}
        <UserProfileDropdown
          buttonLabel="User Profile"
          dataList={[
            {
              id: 1,
              title: `Signed in as ${userEmail} `,
              showBottomDivider: true,
            },
            {
              id: 2,
              title: 'Account setting ',
              showBottomDivider: false,
            },
            // {
            //   id: 3,
            //   title: 'Support',
            //   showBottomDivider: true,
            // },
            {
              id: 4,
              title: 'Logout',
              showBottomDivider: false,
            },
          ]}
          onSelect={(id) => {
            if (id === 2) {
              router.push('/setting/users-settings');
            }
            if (id === 4) {
              onLogOut();
            }
          }}
        />
      </div>
    </div>
  );
};

export default HeaderIconButtons;
