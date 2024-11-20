import jsPDF from 'jspdf';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';

import Icon from '@/components/Icon';
import ImageIcon from '@/components/ImageIcon';
import Badge from '@/components/UI/Badge';
import AppLayout from '@/layouts/AppLayout';
import store from '@/store';
import {
  fetchClaimDetailDataByID,
  fetchClaimDNADataByID,
} from '@/store/shared/sagas';
import type {
  ClaimDetailResultById,
  ClaimLogItem,
  ClaimLogsData,
} from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

export default function Main() {
  const router = useRouter();
  const { claimIdx } = router.query;
  const claimID =
    claimIdx && typeof claimIdx === 'string' ? Number(claimIdx) : 0;
  const [currentDateTime, setCurrentDateTime] = useState('');
  const getCurrentDateTime = () => {
    const now = new Date();
    const dateFormat = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeFormat = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
    });
    const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
    const formattedDate = dateFormat.format(now);
    const formattedTime = timeFormat.format(now);
    setCurrentDateTime(`${formattedDate}, ${formattedTime}, ${timeZone}`);
  };
  useEffect(() => {
    getCurrentDateTime();
  }, []);
  const [selectedClaimData, setSelectedClaimData] =
    useState<ClaimDetailResultById | null>();

  const [dataList, setdataList] = useState<ClaimLogsData>({
    primaryClaimID: null,
    secondaryClaimID: null,
    tertiaryClaimID: null,
    primaryClaimLogsData: [],
    secondaryClaimLogsData: [],
    tertiaryClaimLogsData: [],
  });
  const sortDataByLogTime = (
    a: ClaimLogItem,
    b: ClaimLogItem,
    type: string
  ) => {
    if (type === 'asc')
      return Date.parse(a.logTime || '') - Date.parse(b.logTime || '');
    return Date.parse(b.logTime || '') - Date.parse(a.logTime || '');
  };
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
    }
  };
  const getClaimDataByID = async (id: number) => {
    const res = await fetchClaimDetailDataByID(id);
    if (res) {
      setSelectedClaimData(res);
    }
  };
  useEffect(() => {
    if (claimID) {
      getClaimDNADataByID();
      getClaimDataByID(claimID);
    }
  }, [claimID]);
  const renderLogItem = (d: ClaimLogItem, claimType: string) => {
    const formattedTime = d.logTime ? DateToStringPipe(d.logTime, 8) : '';
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
          {!!property && <>{property || type}:&nbsp; </>}
          <p
            className={classNames(
              'font-semibold',
              isClickAble
                ? 'cursor-pointer text-cyan-500 underline'
                : 'text-gray-500'
            )}
            onClick={() => {}}
          >
            {value}
          </p>
        </p>
      );
    };
    return (
      <div className="flex w-full items-center">
        <div className="z-[0] flex items-center justify-start bg-white pr-1">
          <div
            className={classNames(
              'flex space-x-2 items-center justify-start',
              d.tagID === 10 ? 'h-[96px]' : ''
            )}
          >
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
                    <ImageIcon
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
                  <ImageIcon name={'refresh'} />
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
                    <ImageIcon
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
                  renderEntityPropertyValue('Note Subject', d.title, '', false)}
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
                  renderEntityPropertyValue('Check Number', d.title, '', false)}
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
                  renderEntityPropertyValue('Document Type', d.type, '', false)}
                {!!d.title &&
                  renderEntityPropertyValue('Document Name', d.title, '', true)}
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
  };
  const [isExport, setIsExport] = useState(false);

  const reportTemplateRef = useRef<HTMLDivElement>(null);
  const handleGeneratePdf = () => {
    // eslint-disable-next-line new-cap
    const doc1 = new jsPDF('p', 'pt', 'a4');
    document.body.style.scale = 'none';
    if (reportTemplateRef.current) {
      try {
        doc1.html(reportTemplateRef.current, {
          callback: (generatedDoc) => {
            generatedDoc.save('Claim DNA.pdf');
            setIsExport(false);
          },
          margin: [40, 0, 40, 0],
          autoPaging: 'text',
          width: 560,
          windowWidth: 1066,
        });
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    }
  };
  return (
    <AppLayout title="Nucleus - Claim Detail">
      <div className="h-full w-full items-center  justify-center overflow-y-auto bg-gray-100">
        <div className="float-right mr-14 py-4">
          <button
            className={`inline-flex items-center justify-center gap-2 border border-solid border-gray-300 bg-white pt-[9px] pb-[9px] pl-[13px] pr-[17px] text-left font-medium leading-5 text-gray-700 transition-all rounded-r-md`}
            onClick={() => {
              // const inputElement = document.getElementById('claim-dna-id'); // Replace 'your-div-id' with the actual ID of your div
              // if (inputElement) {
              //   html2canvas(inputElement, {}).then((canvas) => {
              //     const imgData = canvas.toDataURL('image/png');
              //     // eslint-disable-next-line new-cap
              //     const pdf = new jsPDF();
              //     const pdfWidth = pdf.internal.pageSize.getWidth();
              //     const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
              //     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
              //     pdf.save('ClaimDNAData.pdf');
              //   });
              // }
              setIsExport(true);
              handleGeneratePdf();
            }}
          >
            <Icon name={'pdfDocument'} size={18} />
            <p className="text-sm">Export to PDF</p>
          </button>
        </div>
        <div
          ref={reportTemplateRef}
          id={'claim-dna-id'}
          style={{
            fontFamily: isExport ? 'Arial, sans-serif' : 'Nunito, sans-serif',
          }}
          className="m-16 w-11/12 bg-white p-6"
        >
          <div className="inline-flex w-full  flex-col items-start justify-start space-y-1">
            <p className="text-lg font-bold text-gray-700">
              Claim DNA - Claim ID #{dataList.primaryClaimID}
            </p>
            <p className="text-xs text-gray-700">
              Exported on: {currentDateTime}
              <br />
              Exported by: {store.getState().login.user?.name || ''}
            </p>
            <div className="inline-flex w-full items-center justify-start space-x-2 rounded border border-gray-300 bg-white p-1">
              <div className="flex flex-1 items-center justify-start space-x-1 rounded">
                <ImageIcon color={IconColors.NONE} name={'user'} size={16} />
                <div className="inline-flex flex-col items-start justify-start pl-2">
                  <p className="text-xs font-bold text-gray-600">Patient:</p>
                  <p className="text-xs text-gray-900">
                    {selectedClaimData?.patient || ''}
                  </p>
                </div>
              </div>
              <div className=" h-px w-10 rotate-90 bg-gray-200" />
              <div className="flex flex-1 items-center justify-start space-x-1">
                <ImageIcon
                  color={IconColors.NONE}
                  name={'calender'}
                  size={16}
                />
                <div className="inline-flex flex-col items-start justify-start pl-2">
                  <p className="text-xs font-bold text-gray-600">DoS:</p>
                  <p className="text-xs text-gray-900">
                    From:{' '}
                    {selectedClaimData && selectedClaimData.dosFrom
                      ? DateToStringPipe(selectedClaimData.dosFrom, 2)
                      : ''}
                    <br />
                    To:
                    {selectedClaimData && selectedClaimData.dosTo
                      ? DateToStringPipe(selectedClaimData.dosTo, 2)
                      : ''}
                  </p>
                </div>
              </div>
              <div className=" h-px w-10 rotate-90 bg-gray-200" />
              <div className="flex flex-1 items-center justify-start space-x-1">
                <ImageIcon
                  color={IconColors.NONE}
                  name={'building'}
                  size={16}
                />
                <div className="inline-flex flex-col items-start justify-start pl-2">
                  <p className="text-xs font-bold text-gray-600">Group:</p>
                  <p className="text-xs text-gray-900">
                    {selectedClaimData?.group || ''}
                  </p>
                  <p className="text-xs text-gray-600">
                    EIN: {selectedClaimData?.groupEIN || ''}
                  </p>
                </div>
              </div>
              <div className=" h-px w-10 rotate-90 bg-gray-200" />
              <div className="flex flex-1 items-center justify-start space-x-1">
                <ImageIcon color={IconColors.NONE} name={'bag'} size={16} />
                <div className="inline-flex flex-col items-start justify-start pl-2">
                  <p className="text-xs font-bold text-gray-600">Provider:</p>
                  <p className="text-xs text-gray-900">
                    {selectedClaimData?.provider || ''}
                  </p>
                  <p className="text-xs text-gray-600">
                    NPI: {selectedClaimData?.providerNPI || ''}
                  </p>
                </div>
              </div>
            </div>
            <div className="inline-flex w-full items-start justify-start space-x-1">
              <div className="flex w-2/12 items-start justify-end rounded-md border border-gray-300 px-2 py-1.5">
                <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                  <p className="text-xs font-bold text-gray-600">
                    Total Claim Fee:
                  </p>
                  <div className="inline-flex items-end justify-start">
                    <div className="flex items-end justify-start space-x-2">
                      <p className="text-xs font-bold text-gray-600">
                        ${' '}
                        {selectedClaimData?.totalFee
                          ? Number(selectedClaimData?.totalFee).toFixed(2)
                          : '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-2/12 items-start justify-start rounded-md border border-gray-300 px-2 py-1.5">
                <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                  <p className="text-xs font-bold text-gray-600">
                    Total Claim Balance:
                  </p>
                  <div className="inline-flex items-end justify-start">
                    <div className="flex items-end justify-start space-x-2">
                      <p className="text-xs font-bold text-gray-600">
                        ${' '}
                        {selectedClaimData?.totalBalance
                          ? Number(selectedClaimData?.totalBalance).toFixed(2)
                          : '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* body */}
          <div className="my-6 w-full items-center justify-end space-y-1">
            <div className="flex items-center justify-start space-x-2">
              <p className="text-base font-bold text-gray-700">
                Claim ID #{dataList.primaryClaimID} - Primary Claim - Billed to:{' '}
                {dataList.primaryClaimInsurance || ''}
              </p>
            </div>
            <div className="h-px w-full bg-gray-300" />
          </div>

          {dataList.primaryClaimLogsData.map((item) => (
            <div
              key={item.id}
              className="inline-flex h-full w-full items-stretch  justify-start space-x-1"
            >
              <div className="flex w-1/12 items-center justify-center border border-gray-300 p-1">
                <p className="text-xs font-medium text-gray-700">
                  {item.logTime ? DateToStringPipe(item.logTime, 2) : ''}
                </p>
              </div>

              <div className="flex w-3/12 items-center justify-start border border-gray-300 px-2 py-1">
                <div className="flex items-center justify-center rounded-sm bg-gray-100 px-1.5 py-1">
                  <p className="text-center text-xs font-medium leading-none text-gray-800">
                    {item.tag}
                  </p>
                </div>
              </div>

              <div className="inline-flex w-8/12 flex-col items-start justify-center border border-gray-300 px-2 py-1">
                <div className="inline-flex items-center justify-start space-x-1">
                  {renderLogItem(item, 'Primary')}
                </div>
              </div>
            </div>
          ))}
          {/* Secondary Claim  */}
          {dataList.secondaryClaimID && (
            <>
              <div className="my-6 w-full items-center justify-end space-y-1">
                <div className=" items-center justify-start space-x-2">
                  <p className="text-base font-bold text-gray-700">
                    Claim ID #{dataList.secondaryClaimID} - Secondary Claim -
                    Billed to: {dataList.secondaryClaimInsurance || ''}
                  </p>
                </div>
                <div className="h-px w-full bg-gray-300" />
              </div>

              {dataList.secondaryClaimLogsData.map((item) => (
                <div
                  key={item.id}
                  className="inline-flex h-full w-full items-stretch  justify-start space-x-1"
                >
                  <div className="flex w-1/12 items-center justify-center border border-gray-300 p-1">
                    <p className="text-xs font-medium text-gray-700">
                      {item.logTime ? DateToStringPipe(item.logTime, 2) : ''}
                    </p>
                  </div>

                  <div className="flex w-3/12 items-center justify-start border border-gray-300 px-2 py-1">
                    <div className="flex items-center justify-center rounded-sm bg-gray-100 px-1.5 py-1">
                      <p className="text-center text-xs font-medium leading-none text-gray-800">
                        {item.tag}
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex w-8/12 flex-col items-start justify-center border border-gray-300 px-2 py-1">
                    <div className="inline-flex items-center justify-start space-x-1">
                      {renderLogItem(item, 'Secondary')}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
          {/* Tertiary Claim  */}
          {dataList.tertiaryClaimID && (
            <>
              <div className="my-6 w-full items-center justify-end space-y-1">
                <div className=" items-center justify-start space-x-2">
                  <p className="text-base font-bold text-gray-700">
                    Claim ID #{dataList.tertiaryClaimID} - Tertiary Claim -
                    Billed to: {dataList.tertiaryClaimInsurance || ''}
                  </p>
                </div>
                <div className="h-px w-full bg-gray-300" />
              </div>

              {dataList.tertiaryClaimLogsData.map((item) => (
                <div
                  key={item.id}
                  className="inline-flex h-full w-full items-stretch  justify-start space-x-1"
                >
                  <div className="flex w-1/12 items-center justify-center border border-gray-300 p-1">
                    <p className="text-xs font-medium text-gray-700">
                      {item.logTime ? DateToStringPipe(item.logTime, 2) : ''}
                    </p>
                  </div>

                  <div className="flex w-3/12 items-center justify-start border border-gray-300 px-2 py-1">
                    <div className="flex items-center justify-center rounded-sm bg-gray-100 px-1.5 py-1">
                      <p className="text-center text-xs font-medium leading-none text-gray-800">
                        {item.tag}
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex w-8/12 flex-col items-start justify-center border border-gray-300 px-2 py-1">
                    <div className="inline-flex items-center justify-start space-x-1">
                      {renderLogItem(item, 'Tertiary')}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
