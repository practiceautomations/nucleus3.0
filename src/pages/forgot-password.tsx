import { yupResolver } from '@hookform/resolvers/yup';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { type ReactElement, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import * as Yup from 'yup';

import Button, { ButtonType } from '@/components/UI/Button';
import CloseButton from '@/components/UI/CloseButton';
import InputField from '@/components/UI/InputField';
import Modal from '@/components/UI/Modal';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import LoginLayout from '@/layouts/LoginLayout';
import { addToastNotification } from '@/store/shared/actions';
import {
  sendVerificationCodeToUser,
  updateUserPassword,
  validatePasscode,
} from '@/store/shared/sagas';
import type { UpdateUserPasswordData } from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';

const ForgotPassword = () => {
  // form validation rules
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('You should provide a valid email address')
      .required('Email is required'),
  });

  const formOptions = {
    resolver: yupResolver(validationSchema),
    initialValues: { email: '' },
  };

  // get functions to build form with useForm() hook
  const { formState } = useForm(formOptions);
  const { errors } = formState;
  const [verificationResponse, setVerificationResponse] = useState<string>();
  const [email, setEmail] = useState<string>();
  const dispatch = useDispatch();
  async function onSubmit() {
    if (email) {
      const res = await sendVerificationCodeToUser(email);
      if (res) {
        setVerificationResponse(res.message);
      } else {
        setVerificationResponse(undefined);
      }
    }
  }
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
  const [resetPasswordJson, setResetPasswordJson] =
    useState<UpdateUserPasswordData>({
      email: '',
      password: '',
      confirmPassword: '',
      passCode: '',
    });
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string>();
  async function checkPasscodeValidation() {
    if (email && verificationCode) {
      const res = await validatePasscode(email, verificationCode);
      if (res) {
        if (res.message === 'Done') {
          setShowResetPasswordModal(true);
        } else if (res.message === 'TimeExpire') {
          setStatusModalInfo({
            ...statusModalInfo,
            show: true,
            heading: 'Error',
            type: StatusModalType.ERROR,
            text: 'Passcode expired please try again.',
          });
        } else if (res.message === 'NotMatch') {
          setStatusModalInfo({
            ...statusModalInfo,
            show: true,
            heading: 'Invalid Passcode',
            type: StatusModalType.ERROR,
            text: 'Passcode does not match.',
          });
        }
      } else {
        setStatusModalInfo({
          ...statusModalInfo,
          show: true,
          heading: 'Error',
          type: StatusModalType.ERROR,
          text: 'A system error occurred while searching for results.\nPlease try again.',
        });
      }
    }
  }
  const onCloseResetPasswordModal = () => {
    setShowResetPasswordModal(false);
  };

  const onResetPassword = () => {
    if (!resetPasswordJson?.password || !resetPasswordJson?.confirmPassword) {
      setStatusModalInfo({
        show: true,
        heading: 'Alert',
        showCloseButton: false,
        text: 'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
        type: StatusModalType.WARNING,
      });
      return;
    }
    if (resetPasswordJson.password !== resetPasswordJson.confirmPassword) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'New password and Confirm password does not match.',
          toastType: ToastType.ERROR,
        })
      );
      return;
    }
    setStatusModalInfo({
      show: true,
      showCloseButton: true,
      heading: 'Reset Password Confirmation',
      text: `Are you sure you want to proceed with this action?`,
      type: StatusModalType.WARNING,
      okButtonText: 'Yes, Reset Password',
      okButtonColor: ButtonType.primary,
      confirmType: 'CancelConfirmationOnReset',
    });
  };
  const router = useRouter();
  const isResetPassword = async () => {
    if (email) {
      const obj = {
        ...resetPasswordJson,
        email,
        passCode: verificationCode || '',
      };
      const res = await updateUserPassword(obj);

      if (res && res?.errors?.includes('InvalidPattern')) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Password should contain at least one uppercase letter, lowercase letter, number, special character and should be greater than 8 characters in length.',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }

      if (res && res?.errors?.includes('Repetition')) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'User password already exists. Choose another.',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }

      if (res) {
        setResetPasswordJson({
          email: '',
          password: '',
          confirmPassword: '',
          passCode: '',
        });
        setShowResetPasswordModal(false);
        setVerificationResponse(undefined);
        router.push('/login');
      } else {
        setStatusModalInfo({
          show: true,
          heading: 'Error',
          showCloseButton: false,
          text: `A system error prevented the Password to be reset.\nPlease try again.`,
          type: StatusModalType.ERROR,
        });
      }
    }
  };
  return (
    <>
      <div>
        <>
          {' '}
          {!verificationResponse ? (
            <>
              <h1 className="text-gradient my-8 text-2xl font-extrabold xs:max-w-full lg:max-w-full">
                To recover your password, please enter your e-mail address
              </h1>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1 w-full">
                  <InputField
                    placeholder="Enter Email Address"
                    value={email || ''}
                    onChange={(evt) => setEmail(evt.target.value)}
                  />
                </div>
                <p className="mb-1 text-sm text-red-700" id="email-error">
                  {errors.email?.message as string}
                </p>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => {
                    onSubmit();
                  }}
                  type="submit"
                  className="w-full items-center rounded-md border border-transparent bg-gradient-to-tl from-indigo-500 to-cyan-500 px-4 py-2 text-center font-['Nunito'] text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-full"
                >
                  Recover Password
                </button>
              </div>

              <div className="mt-6">
                <Link href="/login">
                  <a className="text-sm text-cyan-500 hover:border-none">
                    Back to Login
                  </a>
                </Link>
              </div>
            </>
          ) : (
            <>
              {verificationResponse === 'Done' ? (
                <div className="mt-24 flex w-full flex-col gap-8">
                  <div className="w-full">
                    <InputField
                      placeholder="Enter Verification Code"
                      value={verificationCode || ''}
                      onChange={(evt) => setVerificationCode(evt.target.value)}
                    />
                  </div>
                  <div className="w-full">
                    <Button
                      buttonType={ButtonType.primary}
                      cls={` w-full lg:max-w-full bg-gradient-to-tl from-indigo-500 to-cyan-500 font-['Nunito']`}
                      onClick={() => {
                        checkPasscodeValidation();
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
              ) : (
                <>
                  <div className="mt-2 mb-8 text-2xl font-extrabold text-gray-500 xs:max-w-full lg:max-w-md">
                    {verificationResponse}
                  </div>
                  <div className="mt-6">
                    <Link href="/login">
                      <a className="text-sm text-cyan-500 hover:border-none">
                        Back to Login
                      </a>
                    </Link>
                  </div>
                </>
              )}
            </>
          )}
        </>
        <Modal
          open={showResetPasswordModal}
          onClose={() => {}}
          modalContentClassName="relative w-[860px] rounded-lg bg-white shadow-xl transition-all sm:my-8"
          modalBackgroundClassName={'!overflow-hidden'}
        >
          <div className="flex w-full flex-col items-center justify-start rounded-lg bg-gray-100 shadow">
            <div className="flex w-full flex-col items-start justify-start p-6">
              <div className="inline-flex w-full items-center justify-between">
                <div className="flex items-center justify-start space-x-2">
                  <p className="text-xl font-bold leading-7 text-gray-700">
                    Reset Password
                  </p>
                </div>
                <CloseButton onClick={onCloseResetPasswordModal} />
              </div>
            </div>
            <div className={'w-full px-6'}>
              <div className={`h-[1px] w-full bg-gray-300`} />
            </div>
            <div className="w-full flex-1 overflow-y-auto p-6">
              <div className="flex w-full flex-col items-start">
                <div className="flex w-full">
                  <div className="px-[5px] md:w-[50%] lg:w-[33.33%]">
                    <div
                      className={`flex w-full flex-col items-start self-stretch`}
                    >
                      <label className="text-sm font-medium leading-tight text-gray-700">
                        User
                      </label>
                      <div className="w-full">
                        <InputField
                          disabled={true}
                          placeholder="Enter Verification Code"
                          value={email || ''}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="px-[5px] md:w-[50%] lg:w-[33.33%]">
                    <div
                      className={`flex w-full flex-col items-start self-stretch`}
                    >
                      <label className="text-sm font-medium leading-tight text-gray-700">
                        New Password <span className="text-cyan-500">*</span>
                      </label>
                      <div className="w-full">
                        <InputField
                          type="password"
                          placeholder="Enter New Password"
                          value={resetPasswordJson?.password}
                          onChange={(evt) => {
                            setResetPasswordJson({
                              ...resetPasswordJson,
                              password: evt.target.value,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="px-[5px] md:w-[50%] lg:w-[33.33%]">
                    <div
                      className={`flex w-full flex-col items-start self-stretch`}
                    >
                      <label className="text-sm font-medium leading-tight text-gray-700">
                        Confirm Password{' '}
                        <span className="text-cyan-500">*</span>
                      </label>
                      <div className="w-full">
                        <InputField
                          type="password"
                          placeholder="Confirm New Password"
                          value={resetPasswordJson?.confirmPassword}
                          onChange={(evt) => {
                            setResetPasswordJson({
                              ...resetPasswordJson,
                              confirmPassword: evt.target.value,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex w-full items-center justify-center rounded-b-lg bg-gray-200 py-6">
              <div className="flex w-full items-center justify-end space-x-4 px-7">
                <Button
                  buttonType={ButtonType.secondary}
                  cls={`inline-flex px-4 py-2 gap-2 leading-5`}
                  onClick={onCloseResetPasswordModal}
                >
                  <p className="text-sm font-medium leading-tight text-gray-700">
                    Cancel
                  </p>
                </Button>
                <Button
                  buttonType={ButtonType.primary}
                  cls={`inline-flex px-4 py-2 gap-2 leading-5`}
                  onClick={() => {
                    onResetPassword();
                  }}
                >
                  <p className="text-sm font-medium leading-tight">
                    Reset Password
                  </p>
                </Button>
              </div>
            </div>
          </div>
        </Modal>
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
          if (statusModalInfo?.confirmType === 'CancelConfirmationOnReset') {
            isResetPassword();
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

ForgotPassword.getLayout = function getLayout(page: ReactElement) {
  return <LoginLayout title="Nucleus - Forgot Password">{page}</LoginLayout>;
};

export default ForgotPassword;
