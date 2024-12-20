import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import Icon from '@/components/Icon';
// eslint-disable-next-line import/no-cycle
import { PaymentDetailModal } from '@/components/PaymentDetailsModal';
import Badge from '@/components/UI/Badge';
import Button, { ButtonType } from '@/components/UI/Button';
import type { ButtonSelectDropdownDataType } from '@/components/UI/ButtonSelectDropdown';
import ButtonSelectDropdown from '@/components/UI/ButtonSelectDropdown';
import ClaimDNALogDetail from '@/components/UI/ClaimDetailsModals/ClaimDNALogDetail';
import CreateTaskModal from '@/components/UI/ClaimDetailsModals/CreateTask';
import EditCreateClaimNote from '@/components/UI/EditCreateNote';
import type { FilterModalTabProps } from '@/components/UI/FilterModal';
import FilterModal from '@/components/UI/FilterModal';
import Modal from '@/components/UI/Modal';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import type { StatusModalProps } from '@/components/UI/StatusModal';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import UserProfileModal from '@/components/UI/UserProfileModal';
import {
  downloadDocumentBase64,
  fetchClaimDNADataByID,
  getClaimAssignToData,
  getClaimDNALogData,
  getClaimNoteType,
  getClaimStatData,
  getNoteDataById,
  getTaskDataById,
} from '@/store/shared/sagas';
import { getLookupDropdownsDataSelector } from '@/store/shared/selectors';
import type {
  AssignClaimToData,
  ClaimDNALogResult,
  ClaimLogItem,
  ClaimLogsData,
  ClaimNotesData,
  ClaimStatsData,
  TaskGridData,
} from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

import ClaimStat from './claimStat';

interface ActivefiltersProps {
  id: number | string | undefined;
  value: string;
  type: string | undefined;
}

interface TPropsRenderLogsMainSection {
  dataList: ClaimLogsData;
  activefilters: ActivefiltersProps[];
}

function RenderLogsMainSection({ dataList }: TPropsRenderLogsMainSection) {
  // claim links
  const router = useRouter();
  const [isClaimDNALogPopup, setIsClaimDNALogPopup] = useState<boolean>(false);
  const [claimLogLabelPopup, setClaimLogLabelPopup] = useState<string>();
  const [createTaskModal, setCreateTaskModal] = useState<{
    open: boolean;
    selectedTaskData?: TaskGridData;
  }>({ open: false });
  const [noteTypeData, setNoteTypeData] = useState<
    SingleSelectDropDownDataType[]
  >([]);
  const [claimNoteDetailData, setClaimNoteDetailData] =
    useState<ClaimNotesData>();
  const [claimLogData, setClaimLogData] = useState<ClaimDNALogResult[]>();
  const [assignClaimToData, setAssignClaimToData] =
    useState<AssignClaimToData[]>();
  const [noteSliderOpen, setNoteSliderOpen] = useState(false);
  const [routePath, setRoutePath] = useState<string>();
  useEffect(() => {
    if (routePath) {
      router.push(routePath);
    }
  }, [routePath]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const closeModal = () => {
    setModalOpen(false);
  };
  const [isPaymentDetailsModalOpen, setPaymentDetailsModalOpen] = useState<{
    open: boolean;
    ledgerID: number | null;
  }>({
    open: false,
    ledgerID: null,
  });
  const onPressLogEntity = async (d: ClaimLogItem, type: string) => {
    let claimID;
    if (type === 'user') {
      setSelectedUserId(d.logUserID);
      setModalOpen(true);
    }
    if (type === 'viewPaymentDetails') {
      setPaymentDetailsModalOpen({ open: true, ledgerID: d.linkID || null });
    }
    if (d.tagID === 5 && type !== 'user') {
      if (type.toLowerCase() === 'primary') {
        claimID = dataList.primaryClaimID;
      } else if (type.toLowerCase() === 'secondary') {
        claimID = dataList.secondaryClaimID;
      } else {
        claimID = dataList.tertiaryClaimID;
      }
      const data = await getClaimDNALogData(d.linkID || null);
      if (data) {
        setClaimLogData(data);
        setIsClaimDNALogPopup(true);
        setClaimLogLabelPopup(
          `Claim#${claimID} - ${d.tag} Detail - ${DateToStringPipe(
            d.logTime,
            5
          )}`
        );
      }
    }
    if (d.tagID === 11 && type === 'viewNote') {
      const noteData = await getClaimNoteType(null, 'claim');
      if (noteData) {
        setNoteSliderOpen(true);
        setNoteTypeData(noteData);
      }
      const res = await getNoteDataById(d.linkID || null);
      if (res) {
        setClaimNoteDetailData(res);
      }
    }
    if (type === 'viewTaskDetails' && (d.tagID === 13 || d.tagID === 12)) {
      const res = await getTaskDataById(d.linkID || null);
      if (res) {
        const claimAssigneeData = await getClaimAssignToData(res.groupID);
        if (claimAssigneeData) {
          setAssignClaimToData(claimAssigneeData);
        }
        setCreateTaskModal({
          open: true,
          selectedTaskData: res,
        });
      }
    }
    if (d.tagID === 14 && d.linkID) {
      const downloadDocData = await downloadDocumentBase64(d.linkID);
      if (downloadDocData && downloadDocData.documentBase64) {
        const pdfResult = downloadDocData.documentBase64;
        const pdfWindow = window.open('');
        if (downloadDocData.documentExtension !== '.pdf') {
          if (pdfWindow) {
            pdfWindow.document.write(
              `<iframe  width='100%' height='100%'  style='position:fixed; top:0; left:0; bottom:0; right:0; transform: translate(5%, 5%); width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;' src='data:image/png;base64, ${pdfResult}
              '></iframe>`
            );
          }
        } else if (pdfWindow) {
          pdfWindow.document.write(
            `<iframe width='100%' height='100%' src='data:application/pdf;base64, ${encodeURI(
              pdfResult
            )}'></iframe>`
          );
        }
      }
    }
  };

  const [secondaryLogSectionFromTop, setSecondaryLogSectionFromTop] =
    useState(0);
  const [tertiaryLogSectionFromTop, setTertiaryLogSectionFromTop] = useState(0);
  useEffect(() => {
    const getTopOffset = (elementId: string) => {
      const mainClaimLogSectionDOMRect = document
        .getElementById('mainClaimLogSection')
        ?.getBoundingClientRect();
      const elementDOMRect = document
        .getElementById(elementId)
        ?.getBoundingClientRect();
      if (mainClaimLogSectionDOMRect && elementDOMRect)
        return elementDOMRect.top - mainClaimLogSectionDOMRect.top;
      return 0;
    };
    setSecondaryLogSectionFromTop(getTopOffset('horizontalLinePrimary'));
    setTertiaryLogSectionFromTop(getTopOffset('horizontalLineSecondary'));
  }, [secondaryLogSectionFromTop, tertiaryLogSectionFromTop]);

  const renderLogItem = (data: ClaimLogItem[], claimType: string) => {
    const renderedDates: String[] = [];
    return data.map((d, i) => {
      let formattedTime = '';
      let formattedDate = '';
      if (d.logTime) {
        formattedDate = DateToStringPipe(d.logTime, 3);
        formattedTime = DateToStringPipe(d.logTime, 8);
        if (renderedDates.includes(formattedDate)) formattedDate = '';
        else renderedDates.push(formattedDate);
      }

      const getBadgeStatusInfo = (
        color: string | null | undefined,
        id: string | null,
        type: string
      ) => {
        if (type === 'color') {
          return color
            ? `bg-${color}-100 text-${color}-800`
            : 'bg-gray-100 text-gray-800';
        }
        if (type === 'IconColor') {
          const IconColorsMap: any = {
            green: IconColors.GREEN,
            red: IconColors.RED,
            yellow: IconColors.Yellow,
            default: IconColors.GRAY,
          };
          return IconColorsMap[color || 'default'];
        }
        if (type === 'icon') {
          const isInteger = (str: any) => /^\d+$/.test(str);
          if (id && isInteger(Number(id))) {
            return [2, 3, 5].includes(Number(id)) ? 'desktop' : 'user';
          }
          return 'desktop';
        }
        return '';
      };

      const renderEntityPropertyValue = (
        property: string,
        value: string,
        type: string,
        isClickAble: boolean
      ) => {
        return (
          <p className="flex text-xs leading-4 text-gray-400">
            {!!property && <>{property}:&nbsp; </>}
            <p
              className={classNames(
                'font-semibold',
                isClickAble
                  ? 'cursor-pointer text-cyan-500 underline'
                  : 'text-gray-500'
              )}
              onClick={() => {
                if (isClickAble) onPressLogEntity(d, type);
              }}
            >
              {value}
            </p>
          </p>
        );
      };

      // const applyFilterStyles = () => {
      //   let style: CSSProperties | undefined = undefined;
      //   if (activefilters.length) {
      //     const eventTypeFilters = activefilters.filter(filter => filter.type === 'Event Type');
      //     const peopleFilters = activefilters.filter(filter => filter.type === 'People');

      //     const hasMatchingEventType = eventTypeFilters.some(filter => filter.id === d.tagID);
      //     const hasMatchingPerson = peopleFilters.some(filter => filter.id === d.logUserID);

      //     style = { opacity: (hasMatchingEventType || hasMatchingPerson) ? 1 : 0.3 }
      //   }
      //   return style;
      // }

      return (
        <div key={i} className="flex w-full items-center">
          {d.tagID === 10 && (
            <div
              id={`horizontalLine${claimType}`}
              className="absolute left-[0px] z-[0] h-[1.5px] w-[1080px] bg-gray-300"
            />
          )}
          <div className="z-[0] flex items-center justify-start bg-white pr-1">
            <div className="flex flex w-[85px] items-center justify-center">
              <p className="text-xs leading-3 text-gray-400">{formattedDate}</p>
            </div>
            <div className="mx-2 flex">
              <div className="h-2 w-2 rounded-full bg-gray-300"></div>
            </div>
            <div
              className={classNames(
                'flex space-x-2 items-center justify-start',
                d.tagID === 10 ? 'h-[96px]' : ''
              )}
            >
              <div
                className={classNames(
                  'flex items-center justify-center px-3 py-0.5 rounded',
                  d.tagID === 10 ? 'bg-yellow-100' : 'bg-gray-100'
                )}
              >
                <p
                  className={classNames(
                    'text-sm font-medium leading-tight text-center',
                    d.tagID === 10 ? 'text-yellow-800' : 'text-gray-800'
                  )}
                >
                  {d.tag}
                </p>
              </div>
              {d.tagID && [2, 3, 6, 7, 15, 16, 17].includes(d.tagID) && (
                <>
                  <Badge
                    text={d.fromLabel || undefined}
                    textCls={
                      'max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis'
                    }
                    cls={classNames(
                      `!rounded-[3px] ${getBadgeStatusInfo(
                        d.fromLabelColor,
                        d.fromValue,
                        'color'
                      )}`
                    )}
                    icon={
                      <Icon
                        name={getBadgeStatusInfo(null, d.fromValue, 'icon')}
                        color={getBadgeStatusInfo(
                          d.fromLabelColor,
                          d.fromValue,
                          'IconColor'
                        )}
                      />
                    }
                  />
                  <div className="flex">
                    <Icon name={'refresh'} />
                  </div>
                  <Badge
                    text={d.toLabel || undefined}
                    textCls={
                      'max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis'
                    }
                    cls={classNames(
                      `!rounded-[3px] ${getBadgeStatusInfo(
                        d.toLabelColor,
                        d.fromValue,
                        'color'
                      )}`
                    )}
                    icon={
                      <Icon
                        name={getBadgeStatusInfo(null, d.toValue, 'icon')}
                        color={getBadgeStatusInfo(
                          d.toLabelColor,
                          d.toValue,
                          'IconColor'
                        )}
                      />
                    }
                  />
                </>
              )}
              {d.tagID && [4, 10].includes(d.tagID) && (
                <>
                  {!!d.fromLabel &&
                    renderEntityPropertyValue(
                      'From',
                      d.fromLabel,
                      'fromLabelClickable',
                      true
                    )}
                  {!!d.toLabel &&
                    renderEntityPropertyValue(
                      'To',
                      d.toLabel,
                      'toLabelClickable',
                      true
                    )}
                </>
              )}
              {d.tagID && [11].includes(d.tagID) && (
                <>
                  {!!d.type &&
                    renderEntityPropertyValue('Note Type', d.type, '', false)}
                  {!!d.title &&
                    renderEntityPropertyValue(
                      'Note Subject',
                      d.title,
                      '',
                      false
                    )}
                  {renderEntityPropertyValue('', 'View Note', 'viewNote', true)}
                </>
              )}
              {d.tagID && [18, 19, 20].includes(d.tagID) && (
                <>
                  {!!d.fromLabel &&
                    renderEntityPropertyValue(
                      'From',
                      d.fromLabel,
                      'fromLabelClickable',
                      true
                    )}
                  {!!d.title &&
                    renderEntityPropertyValue(
                      'Check Number',
                      d.title,
                      '',
                      false
                    )}
                  {renderEntityPropertyValue(
                    '',
                    'View Payment Details',
                    'viewPaymentDetails',
                    true
                  )}
                </>
              )}
              {d.tagID && [12, 13].includes(d.tagID) && (
                <>
                  {!!d.title &&
                    renderEntityPropertyValue('Task Title', d.title, '', false)}
                  {!!d.toLabel &&
                    renderEntityPropertyValue(
                      'Task Assigned To',
                      d.toLabel,
                      'taskAssignedTo',
                      true
                    )}
                  {renderEntityPropertyValue(
                    '',
                    'View Task Details',
                    'viewTaskDetails',
                    true
                  )}
                </>
              )}
              {d.tagID && [14].includes(d.tagID) && (
                <>
                  {!!d.type &&
                    renderEntityPropertyValue(
                      'Document Type',
                      d.type,
                      '',
                      false
                    )}
                  {!!d.title &&
                    renderEntityPropertyValue(
                      'Document Name',
                      d.title,
                      '',
                      true
                    )}
                </>
              )}
              {d.tagID === 5 && d.section && (
                <>
                  {d.section.split(',').map((v, sec_uid) => {
                    return (
                      <div key={sec_uid}>
                        {renderEntityPropertyValue('Edit', v, '', false)}
                      </div>
                    );
                  })}
                  {renderEntityPropertyValue(
                    '',
                    'View Edit Details',
                    claimType,
                    true
                  )}
                </>
              )}
              {d.logUserName &&
                renderEntityPropertyValue('by', d.logUserName, 'user', true)}
              {formattedTime && (
                <p className="text-xs leading-3 text-gray-400">
                  at {formattedTime}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  const renderLogsSection = (data: ClaimLogItem[], claimType: string) => {
    let claimID: number | null = null;
    let topPosition: number | null = null;
    if (claimType === 'Primary') {
      claimID = dataList.primaryClaimID;
    } else if (claimType === 'Secondary') {
      claimID = dataList.secondaryClaimID;
      topPosition = secondaryLogSectionFromTop;
    } else {
      claimID = dataList.tertiaryClaimID;
      topPosition = tertiaryLogSectionFromTop;
    }

    return (
      <>
        {!!data.length && (
          <div
            className={classNames(
              'relative z-[0] ',
              claimType !== 'Primary' ? 'left-[80px]' : ''
            )}
            style={{ top: topPosition ? topPosition - 30 : 0 }}
          >
            <div className="absolute left-[96px] z-[1] h-full w-[1.5px] bg-gray-300" />
            <div className="relative flex flex-col justify-center pl-8 pb-3">
              {!!claimID && (
                <div className="z-[1] inline-flex items-center justify-start space-x-2">
                  <div className="flex items-center justify-center rounded bg-cyan-100 px-3 py-0.5">
                    <p className="text-center text-sm font-medium leading-tight text-cyan-800">
                      Claim #{claimID}
                    </p>
                  </div>
                  <p
                    onClick={() => {
                      setRoutePath(`/app/claim-detail/${claimID}`);
                    }}
                    className="cursor-pointer text-xs font-semibold text-cyan-500 underline"
                  >
                    {claimType} Claim
                  </p>
                </div>
              )}
            </div>
            {modalOpen && (
              <UserProfileModal
                open={true}
                userID={selectedUserId}
                onClose={closeModal}
              />
            )}
            <div className="relative flex flex-col">
              <div className="z-[0] inline-flex w-[950px] flex-col items-start justify-start space-y-4">
                {renderLogItem(data, claimType)}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <Modal
        open={createTaskModal.open}
        onClose={() => {}}
        modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-420px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
      >
        <CreateTaskModal
          assignClaimToData={assignClaimToData || []}
          hideEditButton={true}
          onCloseModal={() => {
            setCreateTaskModal({
              open: false,
              selectedTaskData: undefined,
            });
          }}
          selectedTaskData={createTaskModal.selectedTaskData}
          taskModalInEditMode={false}
        />
      </Modal>
      <Modal
        open={isClaimDNALogPopup}
        onClose={() => {}}
        modalContentClassName="relative w-[1232px] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-fullinset-0 bg-gray-500/75 "
      >
        <ClaimDNALogDetail
          label={claimLogLabelPopup || ''}
          onClose={() => {
            setIsClaimDNALogPopup(false);
          }}
          claimLogData={claimLogData || []}
        />
      </Modal>
      <EditCreateClaimNote
        data={
          noteTypeData && noteTypeData.length > 0
            ? noteTypeData
            : [
                {
                  id: 1,
                  value: 'No Record Found',
                  active: false,
                },
              ]
        }
        notesProfileType="claim"
        isPatientNote={true}
        isCreateNote={false}
        selectedLineItemID={null}
        open={noteSliderOpen}
        onClose={() => {
          setNoteSliderOpen(false);
        }}
        onAddNoteClick={() => {}}
        noteDetailsData={claimNoteDetailData}
      />
      <div
        id="mainClaimLogSection"
        className="flex h-full flex-row bg-white p-[20px]"
        style={{ overflow: 'scroll' }}
      >
        {renderLogsSection(dataList.primaryClaimLogsData, 'Primary')}
        {renderLogsSection(dataList.secondaryClaimLogsData, 'Secondary')}
        {renderLogsSection(dataList.tertiaryClaimLogsData, 'Tertiary')}
      </div>
      <Modal
        open={isPaymentDetailsModalOpen.open}
        onClose={() => {}}
        modalContentClassName="relative w-[70%] h-[95%] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-fullinset-0 bg-gray-500/75 "
      >
        <PaymentDetailModal
          onClose={() => {
            setPaymentDetailsModalOpen({ open: false, ledgerID: null });
          }}
          paymentLedgerID={isPaymentDetailsModalOpen.ledgerID}
        />
      </Modal>
    </>
  );
}

interface IClaimDNAProps {
  claimID: number;
  groupID?: number;
  showExpandedView?: boolean;
}

export default function ClaimDNA({
  claimID,
  groupID,
  showExpandedView = true,
}: IClaimDNAProps) {
  const sortDataByLogTime = (
    a: ClaimLogItem,
    b: ClaimLogItem,
    type: string
  ) => {
    if (type === 'asc')
      return Date.parse(a.logTime || '') - Date.parse(b.logTime || '');
    return Date.parse(b.logTime || '') - Date.parse(a.logTime || '');
  };
  const [claimStatData, setClaimStatData] = useState<ClaimStatsData>();
  const [dataList, setdataList] = useState<ClaimLogsData>({
    primaryClaimID: null,
    secondaryClaimID: null,
    tertiaryClaimID: null,
    primaryClaimLogsData: [],
    secondaryClaimLogsData: [],
    tertiaryClaimLogsData: [],
  });
  const [orignalDataList, setOrignalDataList] = useState<ClaimLogsData>({
    primaryClaimID: null,
    secondaryClaimID: null,
    tertiaryClaimID: null,
    primaryClaimLogsData: [],
    secondaryClaimLogsData: [],
    tertiaryClaimLogsData: [],
  });
  const [exportSelected, setExportSelected] = useState<
    ButtonSelectDropdownDataType[]
  >([]);
  const sortDropdownData: ButtonSelectDropdownDataType[] = [
    {
      id: 1,
      value: 'Recent Events First',
    },
    {
      id: 2,
      value: 'Recent Events Last',
    },
  ];
  const [sortSelected, setSortSelected] = useState<
    ButtonSelectDropdownDataType[]
  >(
    sortDropdownData.length && sortDropdownData[0] ? [sortDropdownData[0]] : []
  );

  const exportDropdownData: ButtonSelectDropdownDataType[] = [
    // {
    //   id: 1,
    //   value: 'Export to PDF',
    //   icon: 'pdfDocument',
    // },
    {
      id: 2,
      value: 'Export to CSV',
      icon: 'xmlDocument',
    },
  ];
  const [statusModalState, setStatusModalState] = useState<StatusModalProps>({
    open: false,
    heading: '',
    description: '',
    okButtonText: 'Ok',
    statusModalType: StatusModalType.ERROR,
    showCloseButton: false,
    closeOnClickOutside: false,
  });

  const getClaimDNADataByID = async () => {
    const res = await fetchClaimDNADataByID(claimID);
    if (res) {
      setdataList({
        ...res,
        primaryClaimLogsData: res.primaryClaimLogsData.sort((a, b) =>
          sortDataByLogTime(a, b, 'desc')
        ),
        secondaryClaimLogsData: res.secondaryClaimLogsData.sort((a, b) =>
          sortDataByLogTime(a, b, 'desc')
        ),
        tertiaryClaimLogsData: res.tertiaryClaimLogsData.sort((a, b) =>
          sortDataByLogTime(a, b, 'desc')
        ),
      });
      setOrignalDataList({
        ...res,
        primaryClaimLogsData: res.primaryClaimLogsData.sort((a, b) =>
          sortDataByLogTime(a, b, 'desc')
        ),
        secondaryClaimLogsData: res.secondaryClaimLogsData.sort((a, b) =>
          sortDataByLogTime(a, b, 'desc')
        ),
        tertiaryClaimLogsData: res.tertiaryClaimLogsData.sort((a, b) =>
          sortDataByLogTime(a, b, 'desc')
        ),
      });
    }
  };
  const getClaimStatDataById = async () => {
    const res = await getClaimStatData(claimID);
    if (res) {
      setClaimStatData(res);
    }
  };
  useEffect(() => {
    getClaimDNADataByID();
    getClaimStatDataById();
  }, []);

  const ConvertToCSV = (objArray: any[]) => {
    const items = objArray;
    const replacer = (_key: any, value: any) => value || '';
    if (items && items[0]) {
      // specify how you want to handle null values here
      const header = Object.keys(items[0]);
      const csv = items.map((row: any) =>
        header
          .map((fieldName) =>
            JSON.stringify(
              row[fieldName] == null
                ? null
                : String(row[fieldName]).replace(/"/g, "'"),
              replacer
            )
          )
          .join(',')
      );
      return csv.join('\r\n');
    }
    return '';
  };
  const DownloadGridDataCSV = (array: any[]) => {
    if (!array) {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Alert',
        description: 'No Data to Export!',
        okButtonText: 'Ok',
        statusModalType: StatusModalType.WARNING,
        showCloseButton: false,
        closeOnClickOutside: false,
      });
      return;
    }
    const csvData = ConvertToCSV(array);
    const a = document.createElement('a');
    a.setAttribute('style', 'displa.y:none;');
    document.body.appendChild(a);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'data.csv';
    a.click();
  };
  const ExportData = () => {
    const {
      primaryClaimLogsData,
      secondaryClaimLogsData,
      tertiaryClaimLogsData,
    } = dataList;
    const mergeClaimData = (claimLogsData: any[]) =>
      claimLogsData &&
      claimLogsData.map((data) => ({
        ID: data.id,
        'Tag ID': data.tagID,
        Tag: data.tag,
        Section: data.section,
        'Link ID': data.linkID,
        Type: data.type,
        Title: data.title,
        'From Value': data.fromValue,
        'From Label': data.fromLabel,
        'To Value': data.toValue,
        'To Label': data.toLabel,
        'Log Time': data.logTime,
        'Log User ID': data.logUserID,
        'Log User Name': data.logUserName,
      }));
    const primaryClaimData = mergeClaimData(primaryClaimLogsData);
    const secondaryClaimData = mergeClaimData(secondaryClaimLogsData);
    const tertiaryClaimData = mergeClaimData(tertiaryClaimLogsData);
    const mergedLogsData = [
      ...primaryClaimData,
      ...secondaryClaimData,
      ...tertiaryClaimData,
    ];
    if (!mergedLogsData || mergedLogsData.length === 0) {
      return;
    }
    const headerArray = Object.keys(mergedLogsData[0] || {});
    let criteriaObj: { [key: string]: string } = { ...primaryClaimData[0] };
    const criteriaArray = [];
    criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
    criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
    if (dataList.primaryClaimID) {
      criteriaObj = {
        ...criteriaObj,
        ID: 'Primary ClaimID',
        'Tag ID': dataList.primaryClaimID.toString(),
      };
      criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
    }
    criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
    criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
    criteriaObj = Object.fromEntries(headerArray.map((key) => [key, key]));
    criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
    let criteriaObj1: { [key: string]: string } = { ...secondaryClaimData[0] };
    const criteriaArray1 = [];
    criteriaObj1 = Object.fromEntries(headerArray.map((key) => [key, '']));
    criteriaArray1.push(JSON.parse(JSON.stringify(criteriaObj1)));
    if (dataList.secondaryClaimID) {
      criteriaObj1 = {
        ...criteriaObj1,
        ID: 'Secondary ClaimID',
        'Tag ID': dataList.secondaryClaimID.toString(),
      };
      criteriaArray1.push(JSON.parse(JSON.stringify(criteriaObj1)));
    }
    criteriaObj1 = Object.fromEntries(headerArray.map((key) => [key, '']));
    criteriaArray1.push(JSON.parse(JSON.stringify(criteriaObj1)));
    criteriaObj1 = Object.fromEntries(headerArray.map((key) => [key, key]));
    criteriaArray1.push(JSON.parse(JSON.stringify(criteriaObj1)));
    let criteriaObj2: { [key: string]: string } = { ...tertiaryClaimData[0] };
    const criteriaArray2 = [];
    criteriaObj2 = Object.fromEntries(headerArray.map((key) => [key, '']));
    criteriaArray2.push(JSON.parse(JSON.stringify(criteriaObj2)));
    if (dataList.tertiaryClaimID) {
      criteriaObj2 = {
        ...criteriaObj2,
        ID: 'Tertiary ClaimID',
        'Tag ID': dataList.tertiaryClaimID.toString(),
      };
      criteriaArray2.push(JSON.parse(JSON.stringify(criteriaObj2)));
    }
    criteriaObj2 = Object.fromEntries(headerArray.map((key) => [key, '']));
    criteriaArray2.push(JSON.parse(JSON.stringify(criteriaObj2)));
    criteriaObj2 = Object.fromEntries(headerArray.map((key) => [key, key]));
    criteriaArray2.push(JSON.parse(JSON.stringify(criteriaObj2)));
    const primaryClaimExportData = criteriaArray.concat(primaryClaimData);
    const secondaryClaimExportData = criteriaArray1.concat(secondaryClaimData);
    const tertiaryClaimExportData = criteriaArray2.concat(tertiaryClaimData);
    const exportArray1 = secondaryClaimExportData.concat(
      tertiaryClaimExportData
    );
    const exportArray2 = primaryClaimExportData.concat(exportArray1);
    DownloadGridDataCSV(exportArray2);
  };
  const onSelectExportDropdownData = (res: ButtonSelectDropdownDataType[]) => {
    setExportSelected(res);
    const id = res[0]?.id || 0;
    if (id === 2) {
      ExportData();
    }
  };
  const [filterModalTabs, setFilterModalTabs] = React.useState<
    FilterModalTabProps[]
  >([
    {
      id: 1,
      name: 'Event Type',
      active: true,
      count: 0,
      showSearchBar: true,
      selectedValue: [],
      data: [],
    },
    {
      id: 2,
      name: 'People',
      active: false,
      count: 0,
      showSearchBar: true,
      selectedValue: [],
      data: [],
    },
  ]);

  const [loadFilterModal, setLoadFilterModal] = useState(true);
  const [activefilters, setActivefilters] = useState<ActivefiltersProps[]>([]);
  const lookupsData = useSelector(getLookupDropdownsDataSelector);
  const [searchValue, setSearchValue] = useState('');
  const filterIsApplied = useRef(false);

  const onSelectSortDropdownData = (res: ButtonSelectDropdownDataType[]) => {
    setSortSelected(res);
    const id = res[0]?.id || 0;
    const newDataList = {
      ...dataList,
      primaryClaimLogsData: dataList.primaryClaimLogsData.sort((a, b) =>
        sortDataByLogTime(a, b, id === 2 ? 'asc' : 'desc')
      ),
      secondaryClaimLogsData: dataList.secondaryClaimLogsData.sort((a, b) =>
        sortDataByLogTime(a, b, id === 2 ? 'asc' : 'desc')
      ),
      tertiaryClaimLogsData: dataList.tertiaryClaimLogsData.sort((a, b) =>
        sortDataByLogTime(a, b, id === 2 ? 'asc' : 'desc')
      ),
    };
    setdataList(newDataList);
    setOrignalDataList(newDataList);
  };

  useEffect(() => {
    const mergedLogsData = [
      ...dataList.primaryClaimLogsData,
      ...dataList.secondaryClaimLogsData,
      ...dataList.tertiaryClaimLogsData,
    ];
    const uniqueTags = Array.from(
      new Set(
        mergedLogsData.map((d) =>
          JSON.stringify({ id: d.tagID || 0, value: d.tag })
        )
      )
    ).map((str) => JSON.parse(str));
    const uniqueLogUsers = Array.from(
      new Set(
        mergedLogsData.map((d) =>
          JSON.stringify({ id: d.logUserID || 0, value: d.logUserName })
        )
      )
    ).map((str) => JSON.parse(str));
    setFilterModalTabs(
      filterModalTabs.map((d) => {
        return { ...d, data: d.id === 1 ? uniqueTags : uniqueLogUsers };
      })
    );
  }, []);

  const onApplyFilter = (value: FilterModalTabProps[]) => {
    const data = value.flatMap((filter) =>
      filter.selectedValue.map((d) => ({
        id: d.id,
        value: d.value,
        type: filter.name,
      }))
    );
    const newFilters = data.filter(
      (filter) =>
        !activefilters.some((f) => f.id === filter.id && f.type === filter.type)
    );
    const previousFilter = data.filter(
      (filter) =>
        !newFilters.some((f) => f.id === filter.id && f.type === filter.type)
    );
    setActivefilters([...previousFilter, ...newFilters]);
    filterIsApplied.current = true;
  };

  /**
  Updates the selectedValue and count of each tab in FilterModalTabs based on the active filters.
  If a filter is applied, the function filters the data in each tab and sets the selectedValue and count accordingly.
  */
  useEffect(() => {
    if (filterIsApplied.current) {
      setFilterModalTabs(
        filterModalTabs.map((tab) => {
          const matchActivefilter = activefilters.filter(
            (filter) => filter.type === tab.name
          );
          const selectData = tab.data.filter((obj2) => {
            return matchActivefilter.some((obj1) => obj1.id === obj2.id);
          });
          return {
            ...tab,
            selectedValue: selectData,
            count: selectData.length,
          };
        })
      );
      if (activefilters.length > 0) {
        const filteredData = {
          primaryClaimID: orignalDataList.primaryClaimID,
          secondaryClaimID: orignalDataList.secondaryClaimID,
          tertiaryClaimID: orignalDataList.tertiaryClaimID,
          primaryClaimLogsData: orignalDataList.primaryClaimLogsData.filter(
            (item) =>
              activefilters.some(
                (f) => f.id === item.logUserID || f.id === item.tagID
              )
          ),
          secondaryClaimLogsData: orignalDataList.secondaryClaimLogsData.filter(
            (item) =>
              activefilters.some(
                (f) => f.id === item.logUserID || f.id === item.tagID
              )
          ),
          tertiaryClaimLogsData: orignalDataList.tertiaryClaimLogsData.filter(
            (item) =>
              activefilters.some(
                (f) => f.id === item.logUserID || f.id === item.tagID
              )
          ),
        };
        setdataList(filteredData);
      } else {
        setdataList(orignalDataList);
      }
    }
  }, [activefilters]);

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    setSearchValue(newValue);
    if (newValue === '') {
      // If there is search value is empty, remove it from the array
      setActivefilters((filters) =>
        filters.filter((filter) => filter.type !== 'search')
      );
    } else {
      const searchFilterIndex = activefilters.findIndex(
        (filter) => filter.type === 'search'
      );
      if (searchFilterIndex !== -1) {
        // If there is a search filter in the array, update its value
        setActivefilters((filters) =>
          filters.map((filter) => {
            return filter.type === 'search'
              ? { ...filter, value: newValue }
              : filter;
          })
        );
      } else {
        // If there is no search filter in the array, push a new object to the array
        setActivefilters((filters) => [
          ...filters,
          { id: undefined, value: newValue, type: 'search' },
        ]);
      }
    }
  };

  const onDeselecActiveFilter = (d: ActivefiltersProps) => {
    if (d.type === 'search') {
      setSearchValue('');
    }
    setActivefilters((prevFilters) => {
      return prevFilters.filter(
        (filter) => filter.id !== d.id || filter.type !== d.type
      );
    });
    setFilterModalTabs(
      filterModalTabs.map((tab) => {
        if (d.type === tab.name) {
          const newData = tab.selectedValue.filter((a) => a.id !== d.id);
          return {
            ...tab,
            selectedValue: newData,
            count: newData.length,
          };
        }
        return {
          ...tab,
        };
      })
    );
    setLoadFilterModal(!loadFilterModal);
  };

  return (
    <>
      <div className="relative w-full">
        {showExpandedView && (
          <div className="absolute top-[110%] right-4 z-10">
            <Button
              buttonType={ButtonType.secondary}
              cls={`inline-flex  gap-2 leading-5`}
              onClick={() => {
                const url = `/app/expanded-view/${claimID}`;
                window.open(url, '_blank');
              }}
            >
              <Icon name={'expandedview'} size={16} color={IconColors.NONE} />
              <p className="text-sm font-medium leading-tight text-gray-700">
                Expand View
              </p>
            </Button>
          </div>
        )}
        <div className="flex w-full bg-cyan-50 px-6 py-4">
          <div className="flex w-[100%]">
            <div className="flex w-full gap-2">
              <div className="w-full">
                <div className="relative w-full">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    ref={(input) => {
                      setTimeout(() => {
                        if (input) input.focus();
                      }, 500);
                    }}
                    autoComplete="off"
                    id="search"
                    name="search"
                    className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 leading-5 text-gray-500 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-white sm:text-sm"
                    placeholder="Search"
                    value={searchValue}
                    onChange={onSearch}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex h-[38px] w-[420px] items-center justify-center">
            <div className={`truncate `}>
              <FilterModal
                cls={'inline-flex'}
                popperCls={'w-[550px] px-[50px]'}
                filtersData={filterModalTabs}
                loadFilterModal={loadFilterModal}
                onApplyFilter={onApplyFilter}
                buttonContent={
                  <button
                    onClick={async () => {
                      if (loadFilterModal) {
                        const res = await getClaimAssignToData(groupID);
                        if (res) {
                          const updatedTabs = filterModalTabs.map((tab) => {
                            return tab.name === 'People'
                              ? { ...tab, data: res }
                              : { ...tab, data: lookupsData?.tag || [] };
                          });
                          setFilterModalTabs(updatedTabs);
                          setLoadFilterModal(!loadFilterModal);
                        }
                      }
                    }}
                    aria-describedby={'filter-popover'}
                    className={`inline-flex items-center justify-center gap-2  border border-solid border-gray-300 bg-white pt-[9px] pb-[9px] pl-[13px] pr-[17px] text-left font-medium leading-5 text-gray-700 transition-all rounded-md`}
                  >
                    <Icon name={'filter'} size={18} />
                    <p className="text-sm">Filters</p>
                  </button>
                }
              />
              <ButtonSelectDropdown
                selectedValue={sortSelected}
                data={sortDropdownData}
                onChange={onSelectSortDropdownData}
                showSelection={true}
                isSingleSelect={true}
                cls={'inline-flex'}
                buttonContent={
                  <button
                    className={`inline-flex items-center justify-center gap-2  border border-solid border-gray-300 bg-white pt-[9px] pb-[9px] pl-[13px] pr-[17px] text-left  font-medium leading-5 text-gray-700 transition-all`}
                  >
                    <Icon name={'sort'} size={18} />
                    <p className="text-sm">Sort</p>
                  </button>
                }
              />
              <ButtonSelectDropdown
                selectedValue={exportSelected}
                data={exportDropdownData}
                onChange={onSelectExportDropdownData}
                showSelection={false}
                isSingleSelect={true}
                cls={'inline-flex'}
                buttonContent={
                  <button
                    className={`inline-flex items-center justify-center gap-2 border border-solid border-gray-300 bg-white pt-[9px] pb-[9px] pl-[13px] pr-[17px] text-left font-medium leading-5 text-gray-700 transition-all rounded-r-md`}
                  >
                    <Icon name={'export'} size={18} />
                    <p className="text-sm">Export</p>
                  </button>
                }
              />
            </div>
          </div>
        </div>
        <div className="w-full border border-gray-300 bg-gray-50">
          <div className="w-full py-4 px-6">
            <div className="flex w-full flex-wrap gap-2">
              <div className="self-center text-sm font-bold leading-5 text-gray-600">
                Active filters:
              </div>
              {activefilters.map((d, index) => {
                return (
                  <div
                    key={index}
                    className="flex gap-1 rounded bg-cyan-100 px-[8px]"
                  >
                    <div className="py-[2px] text-sm text-cyan-700">
                      {d.value}
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          onDeselecActiveFilter(d);
                        }}
                        className="py-[2px] text-sm font-bold text-cyan-400"
                      >
                        x
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <RenderLogsMainSection
        key={JSON.stringify(dataList)}
        dataList={dataList}
        activefilters={activefilters}
      />
      {showExpandedView && <ClaimStat data={claimStatData} />}
      <StatusModal
        open={statusModalState.open}
        heading={statusModalState.heading}
        description={statusModalState.description}
        okButtonText={statusModalState.okButtonText}
        closeButtonText={statusModalState.closeButtonText}
        statusModalType={statusModalState.statusModalType}
        showCloseButton={statusModalState.showCloseButton}
        closeOnClickOutside={statusModalState.closeOnClickOutside}
        onChange={() => {
          setStatusModalState({
            ...statusModalState,
            open: false,
          });
        }}
      />
    </>
  );
}
