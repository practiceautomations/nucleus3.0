import { useRouter } from 'next/router';
import React from 'react';

import Icon from '@/components/Icon';
import Button, { ButtonType } from '@/components/UI/Button';

const NotFound = () => {
  const router = useRouter();
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="inline-flex h-[326px] w-[842px] items-center justify-center">
        <div className="inline-flex h-[260px] flex-col items-start justify-center gap-[25px]">
          <div className="w-[432px] text-[120px] font-bold leading-[64px] text-cyan-500">
            404
          </div>
          <div className="flex flex-col items-start justify-center gap-4">
            <div className="flex flex-col items-start justify-center gap-2">
              <div className="text-center text-3xl font-bold text-cyan-500">
                Page not found
              </div>
              <div className="w-[516px] text-sm font-normal text-gray-500">
                {
                  "Sorry, the page you are looking for doesn't seem to exist or an error occurred. Please try searching for the page again, or return to the Homepage."
                }
              </div>
            </div>
            <Button
              buttonType={ButtonType.primary}
              cls={`w-60`}
              onClick={() => {
                router.push('/');
              }}
            >
              <p className="text-sm">Back to Home</p>
            </Button>
          </div>
        </div>
        <div className="flex h-[260px] w-[260px] items-center justify-center">
          <Icon name={'sadEmoji'} size={260} />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
