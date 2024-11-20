import React from 'react';
import { useSelector } from 'react-redux';

import AppLayout from '@/layouts/AppLayout';
import { Meta } from '@/layouts/Meta';
import { getUserSelector } from '@/store/login/selectors';
import { Main } from '@/templates/Main';

const Index = () => {
  const user = useSelector(getUserSelector);
  return (
    <>
      {user ? (
        <div className="h-[100%] w-[100%]">
          <AppLayout title="Nucleus">
            <div />
          </AppLayout>
        </div>
      ) : (
        <Main meta={<Meta title="Nucleus" description="" />}>
          <div />
        </Main>
      )}
    </>
  );
};

export default Index;
