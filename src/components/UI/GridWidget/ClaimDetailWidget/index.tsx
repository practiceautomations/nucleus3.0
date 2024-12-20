import { ClickAwayListener, Popper } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Icon from '@/components/Icon';
// eslint-disable-next-line import/no-cycle
import MedicalCase from '@/components/MedicalCases';
import Badge from '@/components/UI/Badge';
import { addToastNotification } from '@/store/shared/actions';
import {
  changeChargeStatus,
  changeClaimSrubStatus,
  changeClaimStatus,
  getChargeStatusData,
  getScrubingAPIResponce,
  viewClaimValidationErrors,
} from '@/store/shared/sagas';
import { getLookupDropdownsDataSelector } from '@/store/shared/selectors';
import {
  type ChargeStatus,
  type LookupDropdownsData,
  type LookupDropdownsDataType,
  type RelatedClaims,
  ToastType,
} from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

import Button, { ButtonType } from '../../Button';
import CloseButton from '../../CloseButton';
import InputField from '../../InputField';
import Modal from '../../Modal';
import type { SingleSelectDropDownDataType } from '../../SingleSelectDropDown';
import SingleSelectDropDown from '../../SingleSelectDropDown';
import type { StatusDetailModalDataType } from '../../StatusDetailModal';
import StatusDetailModal from '../../StatusDetailModal';
import StatusModal, { StatusModalType } from '../../StatusModal';
import TextArea from '../../TextArea';

export interface ClaimDetailWidgetProps {
  label?: string;
  insuranceType?: string;
  insurance?: string;
  badgeText: string;
  scrubStatus?: string;
  scrubStatusID?: number;
  submissionCount?: string;
  sublabel2?: string;
  badgeColor?: string;
  time?: string;
  icon?: React.ReactNode;
  showEllipsis: boolean;
  sublabel?: string;
  subBadgeicon?: React.ReactNode;
  subBadgeText?: string;
  subBadgeColor?: string;
  subBadge2icon?: React.ReactNode;
  subBadge2Text?: string;
  subBadge2Color?: string;
  claimID?: number;
  claimStatus?: string;
  onInsuranceClick?: () => void;
  reloadScreen?: () => void;
  onRelatedClaimClick: (id: number | null) => void;
  relatedClaims?: RelatedClaims[];
  chargesData?: ChargeStatus[];
  claimStatusID?: number;
  medicalCaseID?: number;
  groupID?: number;
  patientID?: number;
}

export default function ClaimDetailWidget({
  label,
  claimID,
  claimStatus,
  scrubStatus,
  submissionCount,
  insurance,
  insuranceType,
  sublabel2,
  showEllipsis,
  badgeText,
  subBadgeicon,
  subBadgeText,
  subBadgeColor,
  subBadge2icon,
  subBadge2Text,
  subBadge2Color,
  relatedClaims,
  chargesData,
  onRelatedClaimClick,
  reloadScreen,
  badgeColor = 'bg-gray-100 text-black-400 rounded-[2px]',
  icon,
  time,
  sublabel,
  onInsuranceClick,
  scrubStatusID,
  claimStatusID,
  medicalCaseID,
  groupID,
  patientID,
}: ClaimDetailWidgetProps) {
  const dispatch = useDispatch();
  const lookupsData = useSelector(getLookupDropdownsDataSelector);
  const [changeStatus, setChangeStatus] = useState<boolean>(false);
  const [editNote, setEditNote] = useState<string>();
  const [status, setStatus] = useState<string>();
  const [statusValue, setStatusValue] = useState<string>();
  const [changeStatusToDropdownList, setStatusDropDown] = useState<
    LookupDropdownsDataType[]
  >([]);
  const [changedStatusVal, setChangedStatusVal] =
    useState<SingleSelectDropDownDataType>();
  const [chargeIDData, setChargeIDData] =
    useState<SingleSelectDropDownDataType[]>();
  const [selectedChargeID, setSelectedChargeID] =
    useState<SingleSelectDropDownDataType>();
  const [claimStatusData, setClaimStatusData] = useState<LookupDropdownsData>();
  const isClickAwayListener = useRef(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [scrubClass, setScrubClass] = useState<string>(
    'bg-gray-100 text-gray-800 rounded-[2px] mb-2'
  );
  const [scrubIconColor, setScrubIconColor] = useState<IconColors>(
    IconColors.GRAY
  );
  const [open, setOpen] = React.useState(false);
  const id = open ? 'simple-popover' : undefined;
  const [changeModalState, setChangeModalState] = useState<{
    open: boolean;
    heading: string;
    description: string;
    okButtonText: string;
    closeButtonText: string;
    statusModalType: StatusModalType;
    // okButtonColor: ButtonType;
    showCloseButton: boolean;
    closeOnClickOutside: boolean;
  }>({
    open: false,
    heading: '',
    description: '',
    okButtonText: '',
    closeButtonText: '',
    statusModalType: StatusModalType.WARNING,
    // okButtonColor: ButtonType.secondary,
    showCloseButton: true,
    closeOnClickOutside: true,
  });
  useEffect(() => {
    if (lookupsData) {
      setClaimStatusData(lookupsData);
    }
  }, [lookupsData]);
  useEffect(() => {
    if (chargesData) {
      const data = chargesData.map((a) => {
        return {
          id: a.id,
          value: `#${a.id}`,
          appendText: `CPT ${a.cpt}`,
        };
      });
      setChargeIDData(data);
    }
  }, [chargesData]);
  useEffect(() => {
    if (scrubStatus) {
      if (scrubStatus === 'Passed') {
        setScrubClass('bg-green-100 text-green-800 rounded-[2px] mb-2');
        setScrubIconColor(IconColors.GREEN);
      } else if (
        scrubStatus.includes('Warning') ||
        scrubStatus.includes('Error')
      ) {
        setScrubClass('bg-red-100 text-red-800 rounded-[2px] mb-2');
        setScrubIconColor(IconColors.RED);
      } else if (scrubStatus.includes('Unscrubbed')) {
        setScrubClass('bg-gray-100 text-gray-800 rounded-[2px] mb-2');
        setScrubIconColor(IconColors.GRAY);
      } else {
        setScrubClass('bg-yellow-100 text-yellow-800 rounded-[2px] mb-2');
        setScrubIconColor(IconColors.Yellow);
      }
    }
  }, [scrubStatus]);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!isClickAwayListener.current) {
      setAnchorEl(event.currentTarget);
      setOpen(!open);
    }
  };
  const getScrubingResponce = async (claimId: number) => {
    const res = await getScrubingAPIResponce(claimId);
    if (res) {
      const responseWindow = window.open('about:blank', '_blank');
      let adnareResponseWindow;
      if (res.adnareResponse) {
        adnareResponseWindow = window.open('about:blank', '_blank');
      }
      if (responseWindow) {
        // Write the response content to the first window
        responseWindow.document.write(res.response);
        responseWindow.document.close();
      }

      if (adnareResponseWindow) {
        adnareResponseWindow.document.write(res.adnareResponse);
        adnareResponseWindow.document.close();
      }
    }
  };
  const badgeClasses = (chargeValue: string) => {
    let badgeClass;
    if (chargeValue.includes('Paid')) {
      badgeClass = 'bg-green-100 text-green-800 rounded-[2px]';
    } else if (chargeValue.includes('Denied')) {
      badgeClass = 'bg-red-100 text-red-800 rounded-[2px]';
    } else if (chargeValue.includes('Responsib')) {
      badgeClass = 'bg-yellow-100 text-yellow-800 rounded-[2px]';
    } else {
      badgeClass = 'bg-gray-100 text-gray-800 rounded-[2px]';
    }
    return badgeClass;
  };
  const badgeIcon = (chargeStatus: string) => {
    let iconColor;
    if (chargeStatus.includes('Paid')) {
      iconColor = IconColors.GREEN;
    } else if (chargeStatus.includes('Denied')) {
      iconColor = IconColors.RED;
    } else if (chargeStatus.includes('Responsib')) {
      iconColor = IconColors.Yellow;
    } else {
      iconColor = IconColors.GRAY;
    }
    return iconColor;
  };
  const [statusDetailModalState, setStatusDetailModalState] = useState<{
    open: boolean;
    headingText: string;
    data: StatusDetailModalDataType[];
  }>({
    open: false,
    headingText: '',
    data: [],
  });
  const viewClaimValidationErrorsData = async (
    vClaimID: number,
    type: string
  ) => {
    const res = await viewClaimValidationErrors(vClaimID, type);
    if (res?.length) {
      // setClaimValidationErrorResult(res);
      const issues = res.map((m) => ({
        issue: m.errorMessage,
        claimID: m.claimID,
      }));
      setStatusDetailModalState({
        ...statusDetailModalState,
        open: true,
        headingText:
          type === 'scrubing'
            ? 'Claim Scrubbed Validation'
            : 'Claim Submission Validation',

        data:
          res.length > 0
            ? [
                {
                  id: res[0]?.claimID || 0,
                  type: res[0]?.errorType || '',
                  title: `#${res[0]?.claimID || ''} - ${badgeText || ''}`,
                  issues: issues.map((m) => ({ issue: m.issue })),
                },
              ]
            : [],
      });
    }
  };
  const [isMedicalCaseModalOpen, setMedicalCaseModalOpen] = useState(false);
  const [isViewMedicalCaseMode, setIsViewMedicalCaseMode] = useState(false);

  return (
    <div
      className={classNames(
        'flex flex-col w-full h-full rounded-md box-border border border-solid shadow-md bg-gray-50'
      )}
    >
      <div className={classNames('w-full rounded-md')}>
        <div className={classNames('flex flex-col  gap-0 py-[14px] px-[24px]')}>
          <div className="flex justify-between gap-2">
            <p className="self-stretch truncate text-sm leading-6 text-gray-700">
              {label}
            </p>
            {showEllipsis && (
              <div>
                <button
                  onClick={handleClick}
                  className="box-border flex h-full w-full flex-col rounded-md border bg-white p-2"
                >
                  <Icon className="rotate-90" name="ellipsisHorizontal" />
                </button>
                <ClickAwayListener
                  mouseEvent="onMouseDown"
                  touchEvent="onTouchStart"
                  onClickAway={() => {
                    isClickAwayListener.current = true;
                    setOpen(false);
                    setTimeout(() => {
                      isClickAwayListener.current = false;
                    }, 300);
                  }}
                >
                  <Popper
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    className="z-[13] ml-12"
                    onPointerEnterCapture={undefined} // Ensure this event handler is defined
                    onPointerLeaveCapture={undefined}
                    placeholder=""
                  >
                    <div className="mt-1 mr-7 flex w-[400px] flex-col items-start justify-start rounded-lg border border-gray-200 bg-white">
                      <div className="flex w-[400px] flex-col items-start justify-start rounded-lg border border-gray-200 bg-white">
                        <p
                          className="w-full cursor-pointer border-b border-gray-300 p-2 text-lg font-medium leading-tight text-gray-700"
                          onClick={() => {
                            setChangeStatus(true);
                            setOpen(false);
                            setStatus('Claim');
                            setStatusValue(claimStatus);
                            if (claimStatusData?.claimStatus) {
                              setStatusDropDown(claimStatusData?.claimStatus);
                            }
                          }}
                        >
                          Manually Change Claim Status{' '}
                        </p>
                        <p
                          className="w-full cursor-pointer border-b border-gray-300 p-2 text-lg font-medium leading-tight text-gray-700"
                          onClick={async () => {
                            setChangeStatus(true);
                            setOpen(false);
                            setStatus('Charge');
                            const chargeData = await getChargeStatusData();
                            if (chargeData) {
                              setStatusDropDown(chargeData);
                            }
                          }}
                        >
                          Manually Change Charge Status{' '}
                        </p>
                        <p
                          className="w-full cursor-pointer p-2 text-lg font-medium leading-tight text-gray-700"
                          onClick={() => {
                            setChangeStatus(true);
                            setOpen(false);
                            setStatusValue(scrubStatus);
                            setStatus('Scrub');
                            if (claimStatusData?.scrubStatus) {
                              setStatusDropDown(
                                claimStatusData?.scrubStatus.filter((a) =>
                                  a.value.includes('Forcefully')
                                )
                              );
                            }
                          }}
                        >
                          Manually Change Scrub Status{' '}
                        </p>
                      </div>
                    </div>
                  </Popper>
                </ClickAwayListener>
              </div>
            )}
          </div>
          <div className="flex justify-between gap-2">
            <div
              onClick={() => {
                if (claimID && claimStatusID === 9) {
                  viewClaimValidationErrorsData(claimID, 'submission');
                }
              }}
            >
              <Badge cls={badgeColor} text={badgeText} icon={icon} />
            </div>
            {medicalCaseID && (
              <div className="flex gap-2 self-end truncate text-sm leading-6 text-gray-700">
                <p>Medical CaseID:</p>
                <p
                  className="cursor-pointer text-sm text-cyan-500 underline"
                  onClick={() => {
                    setIsViewMedicalCaseMode(true);
                    setMedicalCaseModalOpen(true);
                  }}
                >
                  {' '}
                  #{medicalCaseID}
                </p>
              </div>
            )}
          </div>
          {time && (
            <div>
              <p className="self-stretch truncate text-xs leading-6 text-gray-400">
                {time}
              </p>
            </div>
          )}
          <div className="mt-3 h-px w-full bg-gray-200" />
        </div>
      </div>
      <div className="no-scrollbar flex max-h-[140px] w-full gap-0 overflow-y-auto rounded-b-md">
        <div className="flex  w-full flex-col gap-0 px-6">
          {sublabel && (
            <>
              <div className="flex justify-between">
                <p className="self-stretch truncate text-sm leading-6 text-gray-600">
                  {sublabel}
                </p>
              </div>
              <div>
                <p
                  className="cursor-pointer text-sm text-cyan-500 underline"
                  onClick={onInsuranceClick}
                >
                  {insurance}
                </p>
                <p className="text-sm font-bold">{insuranceType}</p>
                <Badge
                  cls={subBadgeColor}
                  text={subBadgeText}
                  icon={subBadgeicon}
                />
              </div>
            </>
          )}
          <div className="flex justify-between">
            <p className="self-stretch truncate text-sm leading-6 text-gray-600">
              {sublabel2}
            </p>
          </div>
          <div>
            {relatedClaims &&
              relatedClaims.map((row) => (
                <>
                  <p
                    className="cursor-pointer text-sm text-cyan-500 underline"
                    onClick={() => {
                      onRelatedClaimClick(row.id);
                    }}
                  >
                    {`Claim #${row.id}`}
                  </p>
                  <p className=" text-sm font-bold">{row.value}</p>
                </>
              ))}
            {chargesData &&
              chargesData.map((chargeRow) => (
                <>
                  <div className="flex justify-between">
                    <p className="self-stretch truncate text-sm leading-6 text-gray-500">
                      {`Charge ID #${chargeRow.id} Status - CPT ${chargeRow.cpt}`}
                    </p>
                  </div>
                  <Badge
                    cls={badgeClasses(chargeRow.chargeStatus)}
                    text={chargeRow.chargeStatus}
                    icon={
                      <Icon
                        name={
                          chargeRow.chargeStatus.includes('Responsib')
                            ? 'user'
                            : 'desktop'
                        }
                        color={badgeIcon(chargeRow.chargeStatus)}
                      />
                    }
                  />
                </>
              ))}
            {scrubStatus && (
              <>
                <div className="mt-3 h-px w-full bg-gray-200" />
                <div className="mt-5 mb-2 flex justify-between">
                  <p className="text-sm font-medium leading-none text-gray-500">
                    Scrub Status:
                  </p>
                </div>
                <Badge
                  cls={classNames(
                    scrubClass,
                    [6, 7].includes(scrubStatusID || 0) ? '' : 'cursor-pointer'
                  )}
                  onClick={() => {
                    if (claimID && ![6, 7].includes(scrubStatusID || 0)) {
                      getScrubingResponce(claimID);
                      // setScrubStatusModalData({
                      //   open: true,
                      //   headingText: 'Scrubbing Errors',
                      //   claimID,
                      // });
                    }
                    if (claimID && scrubStatusID === 7) {
                      viewClaimValidationErrorsData(claimID, 'scrubing');
                    }
                    // getScrubingResponce(claimID);
                  }}
                  text={scrubStatus}
                  icon={
                    <Icon
                      name={scrubStatus.includes('Force') ? 'user' : 'desktop'}
                      color={scrubIconColor}
                    />
                  }
                />
              </>
            )}
            <Badge
              cls={subBadge2Color}
              text={subBadge2Text}
              icon={subBadge2icon}
            />
          </div>
        </div>
        {submissionCount && (
          <div className="px-6 ">
            <p className="text-sm text-gray-600 ">Submission Count</p>
            <p className="text-sm font-bold">{submissionCount}</p>
          </div>
        )}
      </div>
      <>
        <Modal
          open={changeStatus}
          onClose={() => {}}
          modalContentClassName="relative w-[60%] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
        >
          <div className="flex flex-col bg-gray-100">
            <div className="mt-3 max-w-full p-4">
              <div className="flex flex-row justify-between">
                <div>
                  <h1 className=" text-left  text-xl font-bold leading-7 text-gray-700">
                    Manually Change {status} Status
                  </h1>
                </div>
                <div className="">
                  <CloseButton
                    onClick={() => {
                      setChangeStatus(false);
                      setSelectedChargeID(undefined);
                      setChangedStatusVal(undefined);
                      setEditNote('');
                      setStatusValue('');
                    }}
                  />
                </div>
              </div>
              <div className="mt-3 h-px w-full bg-gray-200" />
            </div>
            <div className="flex flex-col">
              <div className=" px-6 pt-6">
                <div className={` `}>
                  <div className={`   `}>
                    <div>
                      <div className="flex gap-3">
                        {status === 'Charge' && (
                          <div className="flex w-[32%] shrink flex-col items-start gap-1 text-left ">
                            <label className="text-sm font-medium leading-5 text-gray-900">
                              Charge ID*:
                            </label>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="select a value"
                                showSearchBar={false}
                                disabled={false}
                                data={chargeIDData || []}
                                onSelect={(e) => {
                                  setSelectedChargeID(e);
                                  const statusVal = chargesData
                                    ? chargesData
                                        .filter((a) => a.id === e.id)
                                        .map((a) => a.chargeStatus)
                                    : [];
                                  if (statusVal && statusVal.length > 0) {
                                    setStatusValue(statusVal[0]);
                                  } else {
                                    setStatusValue('');
                                  }
                                }}
                                selectedValue={selectedChargeID}
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex w-[32%] shrink flex-col items-start gap-1 ">
                          <label className="text-sm font-medium leading-5 text-gray-900">
                            Current {status} Status:
                          </label>
                          <div className="h-[38px] w-full">
                            <InputField
                              placeholder="Value"
                              disabled={true}
                              value={statusValue || ''}
                            />
                          </div>
                        </div>
                        <div className="flex w-[32%] shrink flex-col items-start gap-1 text-left ">
                          <label className="text-sm font-medium leading-5 text-gray-900">
                            Change {status} Status to*:
                          </label>
                          <div className="w-full">
                            <SingleSelectDropDown
                              placeholder="select a value"
                              showSearchBar={false}
                              disabled={false}
                              data={
                                // hide void status in dropdown
                                changeStatusToDropdownList.filter(
                                  (item) => item.value !== 'Void'
                                )
                              }
                              onSelect={(e) => {
                                setChangedStatusVal(e);
                              }}
                              selectedValue={changedStatusVal}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 h-px w-full bg-gray-200" />
              </div>
              <div className="flex flex-col p-[24px] px-6">
                <div className="mb-3">
                  <label className="flex text-sm  font-bold leading-5 text-gray-700">
                    Why are you manually changing the{' '}
                    {status ? status.toLowerCase() : ''} status?
                  </label>
                </div>
                <div>
                  <TextArea
                    id="textarea"
                    value={editNote}
                    cls="flex h-36 flex-col overflow-y-auto rounded-md border border-gray-300 bg-white"
                    placeholder={'Click here to write note'}
                    onChange={(e) => {
                      setEditNote(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
            <div className={`h-[120px] bg-gray-200 w-full`}>
              <div className="flex flex-row-reverse gap-4 p-6 ">
                <div>
                  <Button
                    buttonType={ButtonType.primary}
                    onClick={async () => {
                      if (status === 'Scrub') {
                        if (!changedStatusVal) {
                          setChangeModalState({
                            ...changeModalState,
                            open: true,
                            heading: 'Alert',
                            statusModalType: StatusModalType.WARNING,
                            description:
                              'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
                          });
                          return;
                        }
                        const scrubData = {
                          claimID,
                          scrubStatusID: changedStatusVal?.id,
                          note: editNote,
                        };
                        const res = await changeClaimSrubStatus(scrubData);
                        if (!res) {
                          setChangeModalState({
                            ...changeModalState,
                            open: true,
                            heading: 'Error',
                            statusModalType: StatusModalType.ERROR,
                            description:
                              'A system error prevented the scrub status to be updated.\n Please try again.',
                          });
                          return;
                        }

                        setChangeStatus(false);
                        setChangedStatusVal(undefined);
                        setEditNote('');
                        setStatusValue('');
                        if (reloadScreen) {
                          reloadScreen();
                        }
                      }
                      if (status === 'Claim') {
                        if (!changedStatusVal) {
                          setChangeModalState({
                            ...changeModalState,
                            open: true,
                            heading: 'Alert',
                            statusModalType: StatusModalType.WARNING,
                            description:
                              'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
                          });
                          return;
                        }
                        const claimSdata = {
                          claimID,
                          claimStatusID: changedStatusVal?.id,
                          note: editNote,
                        };
                        const resStatus = await changeClaimStatus(claimSdata);
                        if (!resStatus) {
                          setChangeModalState({
                            ...changeModalState,
                            open: true,
                            heading: 'Error',
                            statusModalType: StatusModalType.ERROR,
                            description:
                              'A system error prevented the claim status to be updated.\n Please try again.',
                          });
                          return;
                        }

                        setChangeStatus(false);
                        setChangedStatusVal(undefined);
                        setEditNote('');
                        setStatusValue('');
                        if (reloadScreen) {
                          reloadScreen();
                        }
                      }
                      if (status === 'Charge') {
                        if (!selectedChargeID || !changedStatusVal) {
                          setChangeModalState({
                            ...changeModalState,
                            open: true,
                            heading: 'Alert',
                            statusModalType: StatusModalType.WARNING,
                            description:
                              'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
                          });
                          return;
                        }
                        const claimStatusData1 = {
                          chargeID: selectedChargeID?.id,
                          chargeStatusID: changedStatusVal?.id,
                          note: editNote,
                        };
                        const resStatus = await changeChargeStatus(
                          claimStatusData1
                        );
                        if (resStatus && !!resStatus.errors?.length) {
                          dispatch(
                            addToastNotification({
                              id: uuidv4(),
                              text: resStatus.errors,
                              toastType: ToastType.ERROR,
                            })
                          );
                        } else if (!resStatus) {
                          setChangeModalState({
                            ...changeModalState,
                            open: true,
                            heading: 'Error',
                            statusModalType: StatusModalType.ERROR,
                            description:
                              'A system error prevented the charge status to be updated.\n Please try again.',
                          });
                        } else {
                          setChangeStatus(false);
                          setSelectedChargeID(undefined);
                          setChangedStatusVal(undefined);
                          setEditNote('');
                          setStatusValue('');
                          if (reloadScreen) {
                            reloadScreen();
                          }
                        }
                      }
                    }}
                  >
                    Confirm
                  </Button>
                </div>
                <div>
                  <Button
                    buttonType={ButtonType.secondary}
                    cls={`w-[102px]`}
                    onClick={() => {
                      setChangeStatus(false);
                      setSelectedChargeID(undefined);
                      setChangedStatusVal(undefined);
                      setEditNote('');
                      setStatusValue('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
        <StatusModal
          open={changeModalState.open}
          heading={changeModalState.heading}
          description={changeModalState.description}
          closeButtonText={'Ok'}
          statusModalType={changeModalState.statusModalType}
          showCloseButton={false}
          closeOnClickOutside={false}
          onChange={() => {
            setChangeModalState({
              ...changeModalState,
              open: false,
            });
          }}
        />
        <StatusDetailModal
          open={statusDetailModalState.open}
          headingText={statusDetailModalState.headingText}
          data={statusDetailModalState.data}
          onClose={() => {
            setStatusDetailModalState({
              ...statusDetailModalState,
              open: false,
            });
            // setIsScrubButtonClicked(false);
          }}
        />
        <Modal
          open={isMedicalCaseModalOpen}
          onClose={() => {
            // setMedicalCaseModalOpen(false);
            // setIsViewMedicalCaseMode(false);
          }}
          modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
        >
          <MedicalCase
            onClose={() => {
              setMedicalCaseModalOpen(false);
              setIsViewMedicalCaseMode(false);
            }}
            selectedPatientID={patientID || null}
            groupID={groupID}
            isViewMode={isViewMedicalCaseMode}
            medicalCaseID={medicalCaseID || null}
          />
        </Modal>
      </>
    </div>
  );
}
