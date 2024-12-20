import Link from 'next/link';
import { useRouter } from 'next/router';
import { type ReactElement, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button, { ButtonType } from '@/components/UI/Button';
import InputField from '@/components/UI/InputField';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import LoginLayout from '@/layouts/LoginLayout';
import {
  getEmailSelector,
  getPasswordSelector,
  getUserErrorSelector,
} from '@/store/login/selectors';

import { loginRequest } from '../store/login/actions';

const TfaVerification = () => {
  const dispatch = useDispatch();

  const userEmail = useSelector(getEmailSelector);
  const userPassword = useSelector(getPasswordSelector);
  const userError = useSelector(getUserErrorSelector);
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [statusModalInfo, setStatusModalInfo] = useState<{
    show: boolean;
    showCloseButton?: boolean;
    heading: string;
    text: string;
    type: StatusModalType;
    data?: any;
    confirmType?: string;
    okButtonText?: string;
    okButtonColor?: ButtonType;
  }>();
  const router = useRouter();
  const [passcode, setPasscode] = useState<string>();

  useEffect(() => {
    setEmail(userEmail);
    setPassword(userPassword);
  }, [userEmail, userPassword]);

  useEffect(() => {
    if (userError === 'TimeExpire') {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Error',
        type: StatusModalType.ERROR,
        text: 'Passcode expired, please try again.',
        confirmType: 'code_expired',
      });
    } else if (userError === 'NotMatch') {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Invalid Passcode',
        type: StatusModalType.ERROR,
        text: 'Passcode does not match.',
        confirmType: 'invalid_passcode',
      });
    }
  }, [userError]);

  const checkValidation = () => {
    if (email && password && passcode) {
      dispatch(loginRequest({ email, password, passcode }));
    }
  };

  return (
    <>
      <div>
        <div className="mt-24 flex w-full flex-col gap-8">
          <div>
            <div className="items-start text-xl font-bold text-cyan-500">
              Two Faction Authentication
            </div>
            <div className="items-start text-sm font-bold text-cyan-500">
              We have sent you Passcode on your registered email address. Please
              enter it below.
            </div>
          </div>

          <div className="w-full">
            <InputField
              placeholder="Enter Verification Code"
              value={passcode || ''}
              onChange={(evt) => setPasscode(evt.target.value)}
            />
          </div>
          <div className="w-full">
            <Button
              buttonType={ButtonType.primary}
              cls={`w-full items-center rounded-md border border-transparent bg-gradient-to-tl from-indigo-500 to-cyan-500 px-4 py-2 text-center font-['Nunito'] text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-full`}
              onClick={() => {
                checkValidation();
              }}
            >
              Enter
            </Button>
          </div>
          <div className="mt-6">
            <Link href="/login">
              <a className="text-sm text-cyan-500 hover:border-none">
                Back to Login
              </a>
            </Link>
          </div>
        </div>
      </div>
      <StatusModal
        open={!!statusModalInfo?.show}
        heading={statusModalInfo?.heading}
        description={statusModalInfo?.text}
        statusModalType={statusModalInfo?.type}
        showCloseButton={statusModalInfo?.showCloseButton}
        okButtonText={statusModalInfo?.okButtonText}
        okButtonColor={statusModalInfo?.okButtonColor}
        closeOnClickOutside={true}
        onChange={() => {
          if (statusModalInfo?.confirmType === 'code_expired') {
            router.push('/login');
          }
          setStatusModalInfo(undefined);
        }}
        onClose={() => {
          setStatusModalInfo(undefined);
        }}
      />
    </>
  );
};

TfaVerification.getLayout = function getLayout(page: ReactElement) {
  return (
    <LoginLayout title="Nucleus - 2 Factor Authentication">{page}</LoginLayout>
  );
};

export default TfaVerification;
