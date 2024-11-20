import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch } from 'react-redux';

import AppDatePicker from '@/components/UI/AppDatePicker';
import Button, { ButtonType } from '@/components/UI/Button';
import CloseButton from '@/components/UI/CloseButton';
import RadioButton from '@/components/UI/RadioButton';
import { addToastNotification } from '@/store/shared/actions';
import { getPatientAccountStatementsDetail } from '@/store/shared/sagas';
import {
  type PatientAccountStatementsDetailCriteria,
  type PatientAccountStatementsDetailResult,
  ToastType,
} from '@/store/shared/types';
import { currencyFormatter } from '@/utils';
import {
  DateToStringPipe,
  StringToDatePipe,
} from '@/utils/dateConversionPipes';

type AccountStatmentModalProps = {
  onClose: () => void;
  patientID: number | null;
  // onSelect: (value: ReferringProviderData) => void;
};

const AccountStatmentModal = ({
  onClose,
  patientID,
}: AccountStatmentModalProps) => {
  const [accountStatementRequestData, setAccountStatementRequestData] =
    useState<PatientAccountStatementsDetailCriteria>({
      patientIDs: patientID?.toString() || '',
      userID: '',
      chargesBy: 'from_dos',
      paymentsBy: '',
      chargesDateFrom: '',
      chargesDateTo: '',
      paymentsDateFrom: '',
      paymentsDateTo: '',
    });

  // const [statementData, setStatementData] =
  //   useState<PatientAccountStatementsDetailResult>();
  // const [chargesDataJson, setChargesData] = useState<any>();
  // useEffect(() => {
  //   if (statementData) {
  //     setChargesData(JSON.parse(statementData.chargeDataJSON));
  //   }
  // }, [statementData]);
  function exportToPdf(data: PatientAccountStatementsDetailResult) {
    // const data = data.data;
    // eslint-disable-next-line new-cap
    const doc = new jsPDF('p', 'in', 'letter', true);
    const chargesData = JSON.parse(data.chargeDataJSON);
    const jsxContent = (
      <div>
        {data && (
          <div className=" w-full p-[44px]">
            <div className="flex w-full flex-col justify-between">
              <div className="flex w-full flex-col">
                <div className="flex w-full justify-between pt-[54px]">
                  <div className="flex w-[20%] flex-col">
                    <div className=" text-2xl font-bold text-cyan-700">
                      {data.practiceName}
                    </div>
                    <div className="text-xl font-bold leading-normal text-gray-700">
                      {`${data.practiceAddress1},`}
                      <br />
                      {`${data.practiceCity}, ${data.practiceState}, ${data.practiceZipCode}`}
                    </div>
                  </div>
                  <div className="h-full w-[50%] rounded-sm border border-gray-300">
                    <div className="flex w-full flex-col">
                      <div className="flex h-full w-full items-stretch rounded-t-sm bg-cyan-500">
                        <div className=" w-[25%] border-r border-gray-300 ">
                          <p className=" bg-cyan-500 p-3 text-xl font-normal leading-5 text-white">
                            Account No.
                          </p>
                        </div>
                        <div className=" w-[33%] border-r border-gray-300">
                          <p className=" bg-cyan-500 p-3 text-xl font-normal leading-5 text-white">
                            Statement Date
                          </p>
                        </div>
                        <div className=" w-[42%]">
                          <p className=" bg-cyan-500 p-3 text-xl font-normal leading-5 text-white">
                            Account Balance
                          </p>
                        </div>
                      </div>
                      <div className="flex h-full w-full items-stretch">
                        <div className="w-[25%] border-r border-gray-300">
                          <p className="p-3 text-xl font-normal leading-5 text-gray-900">
                            {data.patientID}
                          </p>
                        </div>
                        <div className="w-[33%] border-r border-gray-300">
                          <p className=" p-3 text-xl font-normal leading-5 text-gray-900">
                            {DateToStringPipe(new Date(), 2) || ''}
                          </p>
                        </div>
                        <div className="w-[42%]">
                          <p className=" p-3 text-right text-xl font-bold leading-5 text-gray-900">
                            {currencyFormatter.format(
                              data.totalPatientBalance || 0
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between py-[50px]">
                  <div className="w-[20%] ">
                    <div className="text-xl font-bold text-gray-900">
                      {`${data.firstName} ${data.lastName}`}
                    </div>
                    <div className="text-xl font-normal text-gray-900">
                      {data.firstName && (
                        <>
                          {`${data.address1},`}
                          <br />
                          {`${data.city}, ${data.state}, ${data.zipCode}`}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-5 ">
                    <div className="flex">
                      <div className="text-xl font-bold leading-5 text-gray-900">
                        {'Last Patient Payment Date: '}
                      </div>
                      <div className="text-xl font-normal leading-5 text-gray-900">
                        {data.lastPaymentDate
                          ? DateToStringPipe(data.lastPaymentDate, 2)
                          : ''}
                      </div>
                    </div>
                    <div className="flex">
                      <div className="text-xl font-bold leading-5 text-gray-900">
                        {'Last Patient Payment Amount: '}
                      </div>
                      <div className="text-xl font-normal leading-5 text-gray-900">
                        {currencyFormatter.format(data.lastPaymentAmount || 0)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className=" flex w-full py-4">
                  <div className="text-xl font-normal leading-5 text-gray-900">
                    Statement Period:{' '}
                  </div>
                  <div className="text-xl font-normal leading-5 text-gray-900">
                    {` ${
                      chargesData &&
                      chargesData.length &&
                      chargesData[0].chargesBy
                        ? DateToStringPipe(
                            new Date(chargesData[0].chargesBy),
                            2
                          )
                        : ''
                    } - ${
                      chargesData &&
                      chargesData.length &&
                      chargesData[chargesData.length - 1].chargesBy
                        ? DateToStringPipe(
                            new Date(
                              chargesData[chargesData.length - 1].chargesBy
                            ),
                            2
                          )
                        : ''
                    } `}
                  </div>
                </div>
                <div className="w-full rounded-sm border border-gray-300  bg-cyan-500 text-white">
                  <div className="flex justify-between p-2 text-xl font-bold leading-normal">
                    <div>Service Detail </div>
                  </div>
                </div>
                <div className="flex h-full flex-col justify-between">
                  <div className="h-full rounded-sm border-x-[1px] border-t-0 border-gray-300">
                    <div className="flex w-full flex-col">
                      <div className="flex h-full w-full items-stretch rounded-t-sm ">
                        <div className=" w-[15%] border-r-[1px] border-b-[1px] border-gray-300 ">
                          <p className=" p-2 text-xl font-bold leading-normal text-gray-700">
                            Date
                          </p>
                        </div>
                        <div className=" w-[15%] border-r-[1px] border-b-[1px] border-gray-300">
                          <p className=" p-2 text-xl font-bold leading-normal text-gray-700">
                            CPT
                          </p>
                        </div>
                        <div className=" w-[50%] border-r-[1px] border-b-[1px] border-gray-300">
                          <p className=" p-2 text-xl font-bold leading-normal text-gray-700">
                            Description
                          </p>
                        </div>
                        <div className=" w-[20%]">
                          <p className=" border-b-[1px] border-gray-300 p-2 text-xl font-bold leading-normal text-gray-700">
                            Deductibles
                          </p>
                        </div>
                        <div className=" w-[20%]">
                          <p className=" border-b-[1px] border-gray-300 p-2 text-xl font-bold leading-normal text-gray-700">
                            Co-payments
                          </p>
                        </div>
                        <div className=" w-[20%]">
                          <p className=" border-b-[1px] border-gray-300 p-2 text-xl font-bold leading-normal text-gray-700">
                            Insurance Payments
                          </p>
                        </div>
                        <div className=" w-[20%]">
                          <p className=" border-b-[1px] border-gray-300 p-2 text-xl font-bold leading-normal text-gray-700">
                            Patient Payments
                          </p>
                        </div>
                        <div className=" w-[20%]">
                          <p className=" border-b-[1px] border-gray-300 p-2 text-xl font-bold leading-normal text-gray-700">
                            Patient Balance
                          </p>
                        </div>
                      </div>
                      <div className="flex  w-full flex-col border-b border-gray-300">
                        {chargesData &&
                          chargesData.map((m: any) => (
                            <div
                              key={m.chargeID}
                              className="flex w-full items-stretch"
                            >
                              <div className="w-[15%] border-r border-gray-300">
                                <p className="p-3 text-xl font-normal leading-5 text-gray-900">
                                  {DateToStringPipe(m.fromDOS, 2)}
                                </p>
                              </div>
                              <div className="w-[15%] border-r border-gray-300">
                                <p className="p-3 text-xl font-normal leading-5 text-gray-900">
                                  {m.cptCode}
                                </p>
                              </div>
                              <div className="w-[50%] border-r border-gray-300">
                                <p className="p-3 text-xl font-normal leading-5 text-gray-900">
                                  {m.cptDescription}
                                </p>
                              </div>
                              <div className="w-[20%] border-r border-gray-300">
                                <p className="p-3 text-right text-xl font-bold leading-5 text-gray-900">
                                  {currencyFormatter.format(m.deductible || 0)}
                                </p>
                              </div>
                              <div className="w-[20%] border-r border-gray-300">
                                <p className="p-3 text-right text-xl font-bold leading-5 text-gray-900">
                                  {currencyFormatter.format(m.copay || 0)}
                                </p>
                              </div>
                              <div className="w-[20%] border-r border-gray-300">
                                <p className="p-3 text-right text-xl font-bold leading-5 text-gray-900">
                                  {currencyFormatter.format(
                                    m.insurancePayment || 0
                                  )}
                                </p>
                              </div>
                              <div className="w-[20%] border-r border-gray-300">
                                <p className="p-3 text-right text-xl font-bold leading-5 text-gray-900">
                                  {currencyFormatter.format(
                                    m.patientPayment || 0
                                  )}
                                </p>
                              </div>
                              <div className="w-[20%] border-r border-gray-300">
                                <p className="p-3 text-right text-xl font-bold leading-5 text-gray-900">
                                  {currencyFormatter.format(
                                    m.patientBalance || 0
                                  )}
                                </p>
                              </div>
                            </div>
                          ))}
                        <div className="flex h-full w-full items-stretch">
                          <div className="w-[15%] border-r border-gray-300">
                            <p className="p-3 text-xl font-normal leading-5 text-gray-900"></p>
                          </div>
                          <div className="w-[15%] border-r border-gray-300">
                            <p className="p-3 text-xl font-normal leading-5 text-gray-900"></p>
                          </div>
                          <div className="w-[50%] border-r border-gray-300">
                            <p className="p-3 text-xl font-normal leading-5 text-gray-900"></p>
                          </div>
                          <div className="w-[20%] border-r border-gray-300">
                            <p className="p-3 text-xl font-normal leading-5 text-gray-900"></p>
                          </div>
                          <div className="w-[20%] border-r border-gray-300">
                            <p className="p-3 text-xl font-normal leading-5 text-gray-900"></p>
                          </div>
                          <div className="w-[20%] border-r border-gray-300">
                            <p className="p-3 text-xl font-normal leading-5 text-gray-900"></p>
                          </div>
                          <div className="w-[20%] border-r border-gray-300">
                            <p className="p-3 text-xl font-normal leading-5 text-gray-900"></p>
                          </div>
                          <div className="w-[20%] border-r border-gray-300">
                            <p className="p-3 text-right text-xl font-bold leading-5 text-gray-900"></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {chargesData && chargesData.length && (
                    <div className="w-[70%] pt-[52px]">
                      <div className="h-full w-full rounded-sm border border-gray-300">
                        <div className="flex w-full">
                          <div className="flex w-[10%] border-r border-gray-300 bg-cyan-500 text-white">
                            <div className="self-center px-[30%] ">Aging</div>
                          </div>
                          <div className="flex w-[90%] flex-col">
                            <div className="flex h-full w-full items-stretch rounded-t-sm bg-cyan-500">
                              <div className=" w-[16.6%] border-r border-gray-300 ">
                                <p className=" bg-cyan-500 p-3 text-xl font-normal leading-5 text-white">
                                  Current
                                </p>
                              </div>
                              <div className=" w-[16.6%] border-r border-gray-300">
                                <p className=" bg-cyan-500 p-3 text-xl font-normal leading-5 text-white">
                                  31-60 Days
                                </p>
                              </div>
                              <div className=" w-[16.6%] border-r border-gray-300">
                                <p className=" bg-cyan-500 p-3 text-xl font-normal leading-5 text-white">
                                  61-90 Days
                                </p>
                              </div>
                              <div className=" w-[16.6%] border-r border-gray-300">
                                <p className=" bg-cyan-500 p-3 text-xl font-normal leading-5 text-white">
                                  91-120 Days
                                </p>
                              </div>
                              <div className=" w-[16.6%] border-r border-gray-300">
                                <p className=" bg-cyan-500 p-3 text-xl font-normal leading-5 text-white">
                                  120+ Days
                                </p>
                              </div>
                              <div className=" w-[16.6%]">
                                <p className=" bg-cyan-500 p-3 text-xl font-normal leading-5 text-white">
                                  Balance
                                </p>
                              </div>
                            </div>
                            <div className="flex h-full w-full items-stretch">
                              <div className=" w-[16.6%] border-r border-gray-300">
                                <p className=" p-3 text-xl font-normal leading-5 text-gray-900">
                                  {currencyFormatter.format(
                                    chargesData[0].AgingBucketsCurrent || 0
                                  )}
                                </p>
                              </div>
                              <div className=" w-[16.6%] border-r border-gray-300">
                                <p className=" p-3 text-xl font-normal leading-5 text-gray-900">
                                  {currencyFormatter.format(
                                    chargesData[0].AgingBucket30to60 || 0
                                  )}
                                </p>
                              </div>
                              <div className=" w-[16.6%] border-r border-gray-300">
                                <p className=" p-3 text-xl font-normal leading-5 text-gray-900">
                                  {currencyFormatter.format(
                                    chargesData[0].AgingBucket60to90 || 0
                                  )}
                                </p>
                              </div>
                              <div className=" w-[16.6%] border-r border-gray-300">
                                <p className=" p-3 text-xl font-normal leading-5 text-gray-900">
                                  {currencyFormatter.format(
                                    chargesData[0].AgingBucket90to120 || 0
                                  )}
                                </p>
                              </div>
                              <div className=" w-[16.6%] border-r border-gray-300">
                                <p className=" p-3 text-xl font-normal leading-5 text-gray-900">
                                  {currencyFormatter.format(
                                    chargesData[0].AgingBucket120over || 0
                                  )}
                                </p>
                              </div>
                              <div className=" w-[16.6%]">
                                <p className=" p-3 text-xl font-normal leading-5 text-gray-900">
                                  {currencyFormatter.format(
                                    data.totalPatientBalance || 0
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="justify-end self-center pt-[42px] text-lg font-normal leading-5 text-gray-900">
                {
                  'For questions / queries regarding statement please contact the office at Phone # (972) 200-4664'
                }
              </div>
            </div>
          </div>
        )}
      </div>
    );

    const container = document.createElement('div');
    document.body.appendChild(container);

    // Adjust the DPI value for better resolution
    const imageQuality = 0.1;

    ReactDOM.render(jsxContent, container, async () => {
      const canvas = await html2canvas(container, {
        useCORS: true, // Log for debugging purposes
      });
      const imageData = canvas.toDataURL('image/png', imageQuality);

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width - 1;
      let heightLeft = imgHeight;
      let position = 0;

      // Add the first page with the content that fits
      doc.addImage(imageData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // If the content overflows, add more pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight; // Calculate position for next page
        doc.addPage();
        doc.text('Text', 10, 10, { lineHeightFactor: 10 });
        doc.addImage(imageData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      doc.save('Patient Account Statement.pdf');

      ReactDOM.unmountComponentAtNode(container);
      document.body.removeChild(container);
    });

    return doc.output('blob');
  }
  const dispatch = useDispatch();

  const getAccountStatementPDFData = async () => {
    const res = await getPatientAccountStatementsDetail(
      accountStatementRequestData
    );
    if (!res || !res.length) {
      dispatch(
        addToastNotification({
          text: 'No Data Found',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
    }
    if (res && res[0]) {
      // setStatementData(res[0]);
      exportToPdf(res[0]);
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-gray-100 shadow">
      <div className="flex w-full flex-col items-start justify-start px-6 py-4">
        <div className="inline-flex w-full items-center justify-between">
          <div className="flex items-center justify-start space-x-2">
            <p className="text-xl font-bold leading-7 text-cyan-600">
              Account Statement
            </p>
          </div>
          <div className="inline-flex items-center gap-4">
            {/* <ButtonsGroup
            data={[
              { id: 2, name: 'Export', icon: 'export' },
              { id: 3, name: 'Assistant', icon: 'info' },
            ]}
            onClick={() => {}}
          /> */}
            <CloseButton onClick={() => onClose()} />
          </div>
        </div>
      </div>
      {/* <div className="flex"> */}
      <div className="h-full w-full items-start bg-white">
        <div className="flex h-full py-4">
          <div
            className="flex w-[40%] flex-col gap-4 p-6"
            style={{ textAlign: 'start' }}
          >
            <div className="flex flex-col items-start ">
              <div className={`w-full items-start`}>
                <div
                  className="items-start truncate py-[2px] text-sm font-bold leading-tight text-gray-700"
                  style={{ textAlign: 'start' }}
                >
                  Charges by:
                </div>
                <div className="mt-[4px] flex h-[38px] w-full items-center">
                  <RadioButton
                    data={[
                      {
                        value: 'from_dos',
                        label: 'Date of Service',
                      },
                      {
                        value: 'posting_date',
                        label: 'Posting Date',
                      },
                      {
                        value: 'created_on',
                        label: 'Entry Date',
                      },
                    ]}
                    checkedValue={accountStatementRequestData.chargesBy}
                    onChange={(e) => {
                      setAccountStatementRequestData({
                        ...accountStatementRequestData,
                        chargesBy: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            <div
              className="items-start truncate  text-base font-bold leading-tight text-gray-700"
              style={{ textAlign: 'start' }}
            >
              Date:
            </div>
            <div className={` relative w-full  flex gap-4`}>
              <div className={`w-[40%] items-start self-stretch`}>
                <label className="text-sm font-medium leading-5 text-gray-900">
                  Date - From
                </label>
                <div className="">
                  <AppDatePicker
                    testId="newDos"
                    placeholderText="mm/dd/yyyy"
                    cls=""
                    onChange={(date) => {
                      if (date) {
                        setAccountStatementRequestData({
                          ...accountStatementRequestData,
                          chargesDateFrom: DateToStringPipe(date, 1),
                        });
                      }
                    }}
                    selected={StringToDatePipe(
                      accountStatementRequestData.chargesDateFrom
                    )}
                  />
                </div>
              </div>
              <div className={`w-[40%] items-start self-stretch`}>
                <label className="text-sm font-medium leading-5 text-gray-900">
                  Date - To
                </label>
                <div className="">
                  <AppDatePicker
                    placeholderText="mm/dd/yyyy"
                    cls=""
                    onChange={(date) => {
                      if (date) {
                        setAccountStatementRequestData({
                          ...accountStatementRequestData,
                          chargesDateTo: DateToStringPipe(date, 1),
                        });
                      }
                    }}
                    selected={StringToDatePipe(
                      accountStatementRequestData.chargesDateTo
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="h-full w-[1px] bg-gray-300 ">{''}</div>
          <div
            className="flex w-[40%] flex-col gap-4 p-6"
            style={{ textAlign: 'start' }}
          >
            <div className="flex flex-col items-start ">
              <div className={`w-full items-start`}>
                <div
                  className="items-start truncate py-[2px] text-sm font-bold leading-tight text-gray-700"
                  style={{ textAlign: 'start' }}
                >
                  Payments by:
                </div>
                <div className="mt-[4px] flex h-[38px] w-full items-center">
                  <RadioButton
                    data={[
                      {
                        value: '',
                        label: 'None',
                      },
                      {
                        value: 'payment_date',
                        label: 'Posting Date',
                      },
                      {
                        value: 'created_on',
                        label: 'Entry Date',
                      },
                    ]}
                    checkedValue={accountStatementRequestData.paymentsBy}
                    onChange={(e) => {
                      setAccountStatementRequestData({
                        ...accountStatementRequestData,
                        paymentsBy: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            <div
              className="items-start truncate  text-base font-bold leading-tight text-gray-700"
              style={{ textAlign: 'start' }}
            >
              Date:
            </div>
            <div className={` relative w-full  flex gap-4`}>
              <div className={`w-[40%] items-start self-stretch`}>
                <label className="text-sm font-medium leading-5 text-gray-900">
                  Date - From
                </label>
                <div className="">
                  <AppDatePicker
                    testId="newDos"
                    disabled={!accountStatementRequestData.paymentsBy}
                    placeholderText="mm/dd/yyyy"
                    cls=""
                    onChange={(date) => {
                      if (date) {
                        setAccountStatementRequestData({
                          ...accountStatementRequestData,
                          paymentsDateFrom: DateToStringPipe(date, 1),
                        });
                      }
                    }}
                    selected={StringToDatePipe(
                      accountStatementRequestData.paymentsDateFrom
                    )}
                  />
                </div>
              </div>
              <div className={`w-[40%] items-start self-stretch`}>
                <label className="text-sm font-medium leading-5 text-gray-900">
                  Date - To
                </label>
                <div className="">
                  <AppDatePicker
                    placeholderText="mm/dd/yyyy"
                    cls=""
                    disabled={!accountStatementRequestData.paymentsBy}
                    onChange={(date) => {
                      if (date) {
                        setAccountStatementRequestData({
                          ...accountStatementRequestData,
                          paymentsDateTo: DateToStringPipe(date, 1),
                        });
                      }
                    }}
                    selected={StringToDatePipe(
                      accountStatementRequestData.paymentsDateTo
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* </div> */}

      <div className="w-full bg-gray-200 ">
        <div className=" py-[24px] pr-[27px]">
          <div className={`gap-4 flex justify-end `}>
            <div>
              <Button
                buttonType={ButtonType.secondary}
                cls={`w-[110px] `}
                onClick={() => onClose()}
              >
                {' '}
                Close
              </Button>
            </div>
            <div>
              <Button
                buttonType={ButtonType.primary}
                cls={` `}
                onClick={() => {
                  getAccountStatementPDFData();
                }}
              >
                {' '}
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AccountStatmentModal;
