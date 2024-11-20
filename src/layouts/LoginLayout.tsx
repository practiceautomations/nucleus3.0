import Image from 'next/image';

import type { Layout } from './AppLayout';
import { Meta } from './Meta';

const LoginLayout = ({ children, title = 'Nucleus' }: Layout) => {
  return (
    <>
      <Meta title={title} description={title} />

      <div className="inline-flex h-full w-full items-center justify-start">
        <div className="h-full w-[38%] bg-gray-50 px-14">
          <div className=" relative h-48 py-2">
            <Image
              className="h-8 w-8"
              src="/assets/logo3.svg"
              alt="Nucleus"
              width={175}
              height={93}
            />
          </div>
          {children}
        </div>
        <div className="hidden md:absolute md:inset-y-0 md:right-0 md:block md:w-[62%]">
          <Image
            className="absolute inset-0 h-full w-full object-cover"
            src="/assets/Image.svg"
            alt=""
            layout="fill"
          />
        </div>
      </div>

      {/* {Old Login Page} */}
      {/* <div className="flex min-h-full flex-col bg-white lg:relative">
        <div className="flex grow flex-col bg-gray-50">
          <div className="flex grow flex-col bg-white">
            <div className="mx-auto flex w-full max-w-7xl grow flex-col px-4 sm:px-6 lg:px-8">
              <div className="my-auto shrink-0 py-16 sm:py-32">
                <Image
                  className="h-8 w-8"
                  src="/assets/logo2.svg"
                  alt="Practice Automations"
                  width={164}
                  height={93}
                />
                {children}
              </div>
            </div>
          </div>
        </div>
        <div className="hidden lg:absolute lg:inset-y-0 lg:right-0 lg:block lg:w-1/2">
          <Image
            className="absolute inset-0 h-full w-full object-cover"
            src="/assets/Image.png"
            alt=""
            layout="fill"
          />
        </div>
      </div> */}
    </>
  );
};

export default LoginLayout;
