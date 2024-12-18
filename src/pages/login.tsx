import { yupResolver } from '@hookform/resolvers/yup';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';

import type { ButtonType } from '@/components/UI/Button';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import LoginLayout from '@/layouts/LoginLayout';
import { loginRequest } from '@/store/login/actions';
import {
  getUserErrorSelector,
  getUserloginAttemptsSelector,
} from '@/store/login/selectors';
import { getScreenInActivityStatusSelector } from '@/store/shared/selectors';
import classNames from '@/utils/classNames';

const Login = () => {
  const router = useRouter();
  const { deauthorized } = router.query;
  const dispatch = useDispatch();
  const userError = useSelector(getUserErrorSelector);
  const userloginAttempts = useSelector(getUserloginAttemptsSelector);
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
  // TODO: add some indicator for loading state
  // const loading = useSelector(getLoadingSelector);

  // form validation rules
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('You should provide a valid email address')
      .required('Email is required'),
    password: Yup.string().required('Password is required'),
    rememberUser: Yup.boolean(),
  });

  const formOptions = {
    resolver: yupResolver(validationSchema),
    initialValues: { email: '', password: '', rememberUser: false },
  };

  // get functions to build form with useForm() hook
  const { register, handleSubmit, formState } = useForm(formOptions);
  const { errors } = formState;

  // TODO: handle rememberUser properly
  function onSubmit({ email, password }: any) {
    dispatch(loginRequest({ email, password }));
  }

  useEffect(() => {
    if (userError === 'Two Factor Authentication needed') {
      router.push('/tfa-verification');
    }

    if (userError === 'Maximum limits reached.') {
      setStatusModalInfo({
        show: true,
        heading: 'Account Inactive: Contact Administrator',
        showCloseButton: false,
        text: 'You’ve reached the maximum number of login attempts. Your account is currently inactive. Please contact an administrator to reset your account.',
        type: StatusModalType.ERROR,
      });
    }
    if (userError === 'This user is deactivate.') {
      setStatusModalInfo({
        show: true,
        heading: 'Account Inactive: Contact Administrator',
        showCloseButton: false,
        text: 'Your account is currently inactive. Please contact an administrator to reset your account.',
        type: StatusModalType.ERROR,
      });
    }
    if (userError === 'Password has been expired.') {
      setStatusModalInfo({
        show: true,
        heading: 'Alert: Password Expired',
        showCloseButton: true,
        text: 'Your password has expired. Would you like to reset your password?',
        type: StatusModalType.WARNING,
        okButtonText: 'Reset Password',
        confirmType: 'ResetPassword',
      });
    }
  }, [userError]);

  useEffect(() => {
    if (userloginAttempts === 3) {
      setStatusModalInfo({
        show: true,
        heading: 'Warning: Password Reset!',
        showCloseButton: true,
        text: 'It looks like you’re having trouble logging in. Would you like to reset your password?',
        type: StatusModalType.WARNING,
        okButtonText: 'Reset Password',
        confirmType: 'ResetPassword',
      });
    }
  }, [userloginAttempts]);

  useEffect(() => {
    if (deauthorized === '1') {
      setStatusModalInfo({
        show: true,
        heading: 'Your session has timed out.',
        showCloseButton: false,
        text: 'Please login again.',
        type: StatusModalType.WARNING,
      });
    }
  }, [deauthorized]);

  const isScreenInactive = useSelector(getScreenInActivityStatusSelector);
  useEffect(() => {
    if (isScreenInactive) {
      setStatusModalInfo({
        show: true,
        heading: 'Your session has timed out.',
        showCloseButton: false,
        text: 'Please login again.',
        type: StatusModalType.WARNING,
      });
    }
  }, [isScreenInactive]);
  return (
    <>
      {statusModalInfo && (
        <StatusModal
          open={statusModalInfo.show}
          heading={statusModalInfo.heading}
          description={statusModalInfo.text}
          statusModalType={statusModalInfo.type}
          okButtonText={statusModalInfo.okButtonText}
          showCloseButton={statusModalInfo.showCloseButton}
          closeOnClickOutside={true}
          onChange={() => {
            if (statusModalInfo.confirmType === 'ResetPassword') {
              router.push('/forgot-password');
            }
            setStatusModalInfo(undefined);
          }}
          onClose={() => {
            setStatusModalInfo(undefined);
          }}
        />
      )}
      <form data-testid="form" onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-gradient mt-2 mb-8 text-3xl font-extrabold">
          Sign in to your account
        </h1>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <div className="mt-1">
            <input
              data-testid="email-input"
              type="text"
              id="email"
              {...register('email')}
              className={classNames(
                'block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm xs:max-w-full lg:max-w-full',
                errors.email ? 'border-red-500' : 'border-gray-300 mb-6'
              )}
              aria-describedby="email-error"
            />
          </div>
          <p
            data-testid="email-error"
            className="mb-1 text-sm text-red-700"
            id="email-error"
          >
            {errors.email?.message as string}
          </p>
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="mt-1">
            <input
              data-testid="pass-input"
              id="password"
              type="password"
              {...register('password')}
              className={classNames(
                'block w-full rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm xs:max-w-full lg:max-w-full',
                errors.password ? 'border-red-500' : 'border-gray-300'
              )}
              aria-describedby="password-error"
            />
          </div>
          <p className="mb-1 text-sm text-red-700" id="password-error">
            {errors.password?.message as string}
          </p>
        </div>
        <div className="mt-6 flex justify-end xs:max-w-full sm:max-w-full lg:max-w-full">
          <div className="mt-0.5 flex h-5 w-1/2 items-center">
            <input
              data-testid="rem-id"
              type="checkbox"
              id="rememberUser"
              {...register('rememberUser')}
              className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
            />
            <div className="ml-3 text-sm">
              <label
                htmlFor="rememberUser"
                className="font-medium text-gray-700"
              >
                Remember Me
              </label>
            </div>
          </div>
          <div className="flex w-1/2 justify-end">
            <Link href="/forgot-password">
              <a className="text-sm text-cyan-500 hover:border-none">
                Forgot your password?
              </a>
            </Link>
          </div>
        </div>
        <div className="mt-6">
          <button
            data-testid="sign-in"
            type="submit"
            className="w-full items-center rounded-md border border-transparent bg-gradient-to-tl from-indigo-500 to-cyan-500 px-4 py-2 text-center font-['Nunito'] text-sm  text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-full"
          >
            Sign In
          </button>
        </div>
      </form>
    </>
  );
};

Login.getLayout = function getLayout(page: ReactElement) {
  return <LoginLayout title="Nucleus - Login">{page}</LoginLayout>;
};

export default Login;
