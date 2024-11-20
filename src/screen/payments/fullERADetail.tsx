import html2canvas from 'html2canvas';
import Image from 'next/image';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import { useEffect, useState } from 'react';

import Icon from '@/components/Icon';
import Button, { ButtonType } from '@/components/UI/Button';
import CloseButton from '@/components/UI/CloseButton';
import Modal from '@/components/UI/Modal';
import store from '@/store';
import { setAppSpinner } from '@/store/shared/actions';
import { getERAFullDetail } from '@/store/shared/sagas';
import type {
  ERADetailERAClaimsList,
  ERAFullDetailResult,
} from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface FullERADetailProps {
  openpopup: boolean;
  onClose: (isAddedUpdated: boolean) => void;
  eraID: number;
  claimIDs: string | null;
}
export default function FullERADetail({
  openpopup,
  onClose,
  eraID,
  claimIDs = null,
}: FullERADetailProps) {
  const onPressClose = () => {
    onClose(false);
  };

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const [eraFullDetailData, setERAFullDetailData] =
    useState<ERAFullDetailResult>();
  const [claimsListData, setClaimsListData] = useState<
    ERADetailERAClaimsList[]
  >([]);
  const getERAFullDetailResult = async () => {
    const res = await getERAFullDetail(eraID, claimIDs);
    if (res) {
      setERAFullDetailData(res);
      setClaimsListData(res.eraClaimsData);
    }
  };
  useEffect(() => {
    getERAFullDetailResult();
  }, []);
  const [logoBase64, setLogoBase64] = useState('');

  useEffect(() => {
    // Function to fetch the SVG file
    const fetchLogo = async () => {
      try {
        const response = await fetch('/assets/Light.png'); // Replace with the correct URL
        const logoBlob = await response.blob(); // Get logo content as Blob

        const reader = new FileReader();
        reader.onload = () => {
          // Update state with the Base64-encoded data
          if (reader.result) {
            setLogoBase64(reader.result.toString());
          }
        };
        reader.readAsDataURL(logoBlob); // Convert Blob to Base64
      } catch (error) {
        console.error('Error fetching or processing logo:', error);
      }
    };

    fetchLogo();
  }, []);

  const createpdfdata = () => {
    store.dispatch(setAppSpinner(true));

    const body2: any[] = [];

    // claimsListData.forEach((claims) => {
    for (let i = 0; i < claimsListData.length; i += 1) {
      if (claimsListData[i]) {
        body2.push([
          {
            borderColor: ['#000000', '#000000', '#000000', '#000000'],
            fillColor: '#64c2ce',
            border: [false, false, false, true],
            text: 'REND -PROV\nRARC',
            style: 'tableHeader',
            fontSize: 7,
            bold: true,
            color: 'white',
          },
          {
            borderColor: ['#000000', '#000000', '#000000', '#000000'],
            fillColor: '#64c2ce',
            border: [false, false, false, true],
            text: 'SERV-DATE',
            style: 'tableHeader',
            fontSize: 7,
            bold: true,
            color: 'white',
          },
          {
            borderColor: ['#000000', '#000000', '#000000', '#000000'],
            fillColor: '#64c2ce',
            text: 'PD-PROC/MODS',
            border: [false, false, false, true],
            style: 'tableHeader',
            fontSize: 7,
            bold: true,
            color: 'white',
          },
          {
            borderColor: ['#000000', '#000000', '#000000', '#000000'],
            fillColor: '#64c2ce',
            border: [false, false, false, true],
            text: 'PD-NOS \nSUB- NOS',
            style: 'tableHeader',
            fontSize: 7,
            bold: true,
            color: 'white',
          },
          {
            borderColor: ['#000000', '#000000', '#000000', '#000000'],
            fillColor: '#64c2ce',
            border: [false, false, false, true],
            text: 'BILLED \nSUB-PROC',
            style: 'tableHeader',
            fontSize: 7,
            bold: true,
            color: 'white',
          },
          {
            border: [false, false, false, true],
            borderColor: ['#000000', '#000000', '#000000', '#000000'],
            fillColor: '#64c2ce',
            text: ' ALLOWED \nGRP/CARC',
            style: 'tableHeader',
            fontSize: 7,
            bold: true,
            color: 'white',
          },
          {
            border: [false, false, false, true],
            borderColor: ['#000000', '#000000', '#000000', '#000000'],
            fillColor: '#64c2ce',
            text: 'DEDUCT \nCARC-AMT',
            style: 'tableHeader',
            fontSize: 7,
            bold: true,
            color: 'white',
          },
          {
            border: [false, false, false, true],
            borderColor: ['#000000', '#000000', '#000000', '#000000'],
            fillColor: '#64c2ce',
            text: 'COINS \nADJ-QTY',
            style: 'tableHeader',
            fontSize: 7,
            bold: true,
            color: 'white',
          },
          {
            border: [false, false, false, true],
            text: 'PROV-PD\nBS',
            borderColor: ['#000000', '#000000', '#000000', '#000000'],
            fillColor: '#64c2ce',
            style: 'tableHeader',
            fontSize: 7,
            bold: true,
            color: 'white',
          },
        ]);
        body2.push([
          {
            border: [false, false, false, false],
            colSpan: 3,
            fillColor: '#B0E0E6',
            text: `Name: ${claimsListData[i]?.rendProv || ''}`,
            fontSize: 6,
          },
          {},
          {},
          {
            border: [false, false, false, false],
            fillColor: '#B0E0E6',
            text: `HIC: ${claimsListData[i]?.pdNOS || ''}`,
            fontSize: 6,
          },
          {
            border: [false, false, false, false],
            fillColor: '#B0E0E6',
            text: `ACNT: ${claimsListData[i]?.billedSubProc || ''}`,
            fontSize: 6,
          },
          {
            border: [false, false, false, false],
            fillColor: '#B0E0E6',
            colSpan: 2,
            text: `ICN: ${claimsListData[i]?.allowed || ''}`,
            fontSize: 6,
          },
          {},
          {
            border: [false, false, false, false],
            colSpan: 2,
            fillColor: '#B0E0E6',
            text: `	MOA: ${
              claimsListData[i]?.coins ? claimsListData[i]?.coins : ''
            }`,
            fontSize: 6,
          },
          {},
        ]);
        claimsListData[i]?.eraPaymentsData.forEach((payments) => {
          if (claimsListData[i]?.eraClaimID === payments.eraClaimID) {
            body2.push(
              [
                {
                  border: [false, false, false, false],
                  text: payments.rendProv,
                  fontSize: 6,
                },
                {
                  border: [false, false, false, false],
                  text: payments.servDate,
                  fontSize: 6,
                },
                {
                  border: [false, false, false, false],
                  text: payments.mods,
                  fontSize: 6,
                },
                {
                  border: [false, false, false, false],
                  text: payments.pdNOS,
                  fontSize: 6,
                },
                {
                  border: [false, false, false, false],
                  text: currencyFormatter.format(payments.billedSubProc),
                  fontSize: 6,
                },
                {
                  border: [false, false, false, false],
                  text: currencyFormatter.format(payments.allowed),
                  fontSize: 6,
                },
                {
                  border: [false, false, false, false],
                  text: currencyFormatter.format(payments.deduct),
                  fontSize: 6,
                },
                {
                  border: [false, false, false, false],
                  text: currencyFormatter.format(payments.coins),
                  fontSize: 6,
                },
                {
                  border: [false, false, false, false],
                  text: currencyFormatter.format(payments.provPD),
                  fontSize: 6,
                },
              ],
              [
                {
                  border: [false, false, false, false],
                  colSpan: 9,

                  text: `${
                    payments.remarks !== null ? payments.remarks : ''
                  } \nCNTL #: ${
                    payments.eraChargeID ? payments.eraChargeID : ''
                  }`,
                  fontSize: 6,
                },
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
              ],
              [
                {
                  colSpan: 4,
                  border: [false, false, false, false],
                  text: '',
                  fontSize: 6,
                },
                {},
                {},
                {},
                {
                  // colSpan: 5,
                  border: [false, false, false, false],
                  text:
                    claimsListData[i]?.eraClaimID ===
                    claimsListData[i]?.eraClaimsTotal
                      .eraClaimID /* && payments.eraPaymentID === claimsListData[i]?.eraClaimsTotal.aar_wrk_era_payment_id */
                      ? `${payments.eraAdjustmentsData[i]?.adjustmentGroupCode} - ${payments.eraAdjustmentsData[i]?.claimAdjustmentReasonCode}`
                      : '',
                  fontSize: 6,
                }, // {}, {}, {}, {},
                {
                  colSpan: 4,
                  border: [false, false, false, false],
                  text: payments.eraAdjustmentsData[i]?.adjustmentAmount
                    ? currencyFormatter.format(
                        payments.eraAdjustmentsData[i]?.adjustmentAmount || 0
                      )
                    : '',
                  fontSize: 6,
                },
                {},
                {},
                {},
              ],
              [
                {
                  border: [false, false, false, false],
                  colSpan: 9,
                  text: '',
                  fontSize: 6,
                },
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
              ]
            );
          }
        });
        body2.push([
          {
            colSpan: 3,
            border: [false, false, false, false],
            fillColor: '#B0E0E6',
            text: `PT RESP   ${currencyFormatter.format(
              claimsListData[i]?.eraClaimsTotal.patientResponsibilityAmount || 0
            )}`,
            fontSize: 6,
          },
          {},
          {},
          {
            border: [false, false, false, false],
            fillColor: '#B0E0E6',
            text: claimsListData[i]?.eraClaimsTotal.adjustmentAmount
              ? `CARC   ${currencyFormatter.format(
                  claimsListData[i]?.eraClaimsTotal.adjustmentAmount || 0
                )}`
              : '0.00',
            fontSize: 6,
          },
          {
            border: [false, false, false, false],
            fillColor: '#B0E0E6',
            text: `CLAIM TOTALS   ${currencyFormatter.format(
              claimsListData[i]?.eraClaimsTotal.charges || 0
            )}`,
            fontSize: 6,
          },
          {
            border: [false, false, false, false],
            fillColor: '#B0E0E6',
            text: currencyFormatter.format(
              claimsListData[i]?.eraClaimsTotal.allowedAmount || 0
            ),
            fontSize: 6,
          },
          {
            border: [false, false, false, false],
            fillColor: '#B0E0E6',
            text: currencyFormatter.format(
              claimsListData[i]?.eraClaimsTotal.deductAmount || 0
            ),
            fontSize: 6,
          },
          {
            border: [false, false, false, false],
            fillColor: '#B0E0E6',
            text: currencyFormatter.format(
              claimsListData[i]?.eraClaimsTotal.cOInsAmount || 0
            ),
            fontSize: 6,
          },
          {
            border: [false, false, false, false],
            fillColor: '#B0E0E6',
            text: currencyFormatter.format(
              claimsListData[i]?.eraClaimsTotal.paidAmount || 0
            ),
            fontSize: 6,
          },
        ]);
        body2.push([
          {
            colSpan: 4,
            borderColor: ['', '#000000', '', ''],
            border: [false, false, false, true],
            fillColor: '#B0E0E6',
            text: ' ADJ TOTALS:      PREV PD',
            fontSize: 6,
          },
          {},
          {},
          {},
          {
            borderColor: ['', '#000000', '', ''],
            border: [false, false, false, true],
            fillColor: '#B0E0E6',
            text: `INTEREST ${currencyFormatter.format(
              claimsListData[i]?.eraClaimsTotal.eRAInterest || 0
            )}`,
            fontSize: 6,
          },
          {
            borderColor: ['', '', '#000000', ''],
            border: [false, false, false, true],
            fillColor: '#B0E0E6',
            text: 'LATE FILING CHARGE',
            fontSize: 6,
          },
          {
            borderColor: ['#000000', '', '', ''],
            border: [false, false, false, true],
            fillColor: '#B0E0E6',
            text: currencyFormatter.format(
              claimsListData[i]?.eraClaimsTotal.eRALateFillingCharges || 0
            ),
            fontSize: 6,
          },
          {
            borderColor: ['', '#000000', '', ''],
            border: [false, false, false, true],
            fillColor: '#B0E0E6',
            text: 'NET',
            fontSize: 6,
          },
          {
            borderColor: ['', '', '#000000', ''],
            border: [false, false, false, true],
            fillColor: '#B0E0E6',
            text: currencyFormatter.format(
              claimsListData[i]?.eraClaimsTotal.netTotal || 0
            ),
            fontSize: 6,
          },
        ]);
      }
    }
    // });
    let contentDataURL1 = '';
    let contentDataURL2 = '';

    const headerDiv = document.getElementById('headerDiv');

    const summaryDiv = document.getElementById('secondElement');
    if (headerDiv && summaryDiv) {
      html2canvas(headerDiv, {
        useCORS: true,
        scrollX: 0,
        scale: 3,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
      })
        .then(function (canvas1) {
          contentDataURL1 = canvas1.toDataURL('image/png');
          return html2canvas(summaryDiv, {
            useCORS: true,
            scrollX: 0,
            // scale:3,
            scale: 3,
            scrollY: -window.scrollY,
            windowWidth: document.documentElement.offsetWidth,
            windowHeight: document.documentElement.offsetHeight,
          });
        })
        .then(function (canvas2) {
          contentDataURL2 = canvas2.toDataURL('image/png');

          const documentDefinition: TDocumentDefinitions = {
            pageSize: 'LEGAL',
            pageMargins: [40, 70, 40, 45],
            footer(currentPage: any, pageCount: any /* pageSize: any */) {
              return {
                text: `${currentPage.toString()} of ${pageCount}`,
                alignment: 'center',
                fontSize: 7,
              };
            },
            header() {
              return [
                {
                  image: logoBase64,
                  width: 77,
                  height: 15,
                  margin: [40, 40, 0, 0],
                },
              ];
            },
            content: [
              {
                image: contentDataURL1,
                width: 560,
                margin: [0, 20, 0, 40],
              },
              {
                text: 'Claim Details',
                bold: true,
                fontSize: 10,
                alignment: 'left',
                margin: [0, 0, 20, 20],
              },
              {
                style: 'tableExample',
                table: {
                  dontBreakRows: true,
                  headerRows: 1,
                  widths: [42, 42, 55, 55, 75, 65, 50, 40, 35],
                  body: body2,
                },
                layout: {
                  hLineWidth() {
                    return 0.5;
                  },
                  vLineWidth() {
                    return 0.5;
                  },
                },
              },
              {
                image: contentDataURL2,
                width: 540,
                margin: [0, 40, 0, 40],
              },
            ],
          };
          pdfMake
            .createPdf(documentDefinition)
            .download('Full ERA Details.pdf');
          store.dispatch(setAppSpinner(false));
        })
        .catch(function (err) {
          console.error('Error capturing images:', err);
          store.dispatch(setAppSpinner(false));
        });
    }
  };
  return (
    <>
      <Modal
        open={openpopup}
        onClose={() => {}}
        modalContentClassName={classNames(
          'w-[80%] shadow h-[calc(100%-80px)] relative rounded-lg bg-white transition-all sm:my-8'
        )}
        modalBackgroundClassName={classNames('!overflow-hidden')}
      >
        <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-gray-200 shadow">
          <div className="flex w-full flex-col items-start justify-start px-6 py-4">
            <div className="inline-flex w-full items-center justify-between">
              <div className="flex items-center justify-start space-x-2">
                <p className="text-xl font-bold leading-7 text-gray-700">
                  ERA Payment {eraID ? `#${eraID}` : ''}
                </p>
              </div>
              <div className="inline-flex items-center gap-4">
                <CloseButton onClick={onPressClose} />
              </div>
            </div>
          </div>
          {!eraFullDetailData ? (
            <> </>
          ) : (
            <>
              <div className="w-full flex-1 overflow-y-auto bg-gray-50 pb-[55px]">
                <div className="mx-auto">
                  <div className="flex h-16 justify-between">
                    <div className="mt-6 hidden w-[232px] shrink-0 items-center pl-1 sm:flex">
                      <Image
                        className="h-8 w-8"
                        src="/assets/logo4.svg"
                        alt="Nucleus"
                        width={220}
                        height={26}
                      />
                    </div>
                  </div>
                </div>
                <div className="py-[38px]">
                  <div id="headerDiv">
                    <div className="w-full gap-4 px-7 pl-[37px]">
                      <div className="mb-2 flex h-[30px] w-full gap-4">
                        <div className="inline-flex items-center justify-start space-x-2">
                          <p className="text-xl font-bold leading-7 text-gray-700">
                            Full ERA Details
                          </p>
                        </div>
                      </div>
                      <div className="mb-2 flex h-[8px] w-full gap-4">
                        <div className="inline-flex items-center justify-start space-x-2">
                          <p className="text-sm font-normal leading-4 text-gray-700">
                            Date:{' '}
                            {eraFullDetailData?.checkDate
                              ? `${eraFullDetailData.checkDate}`
                              : ''}
                          </p>
                        </div>
                      </div>
                      <div className="mb-2 flex  w-full gap-4">
                        <div className="inline-flex items-center justify-start space-x-2">
                          <p className="leading-2 text-sm font-normal text-gray-700">
                            Check/EFT:{' '}
                            {eraFullDetailData?.checkNumber
                              ? `#${eraFullDetailData.checkNumber}`
                              : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full flex-col items-start gap-1.5 px-[38px]">
                      <div className="inline-flex w-full items-center justify-start gap-[12.91px] rounded-lg border border-gray-300 bg-white p-[6.45px]">
                        <div className="flex w-[50%] items-center rounded-[0.4375rem]">
                          <div data-html2canvas-ignore>
                            <Icon
                              name="user"
                              size={20}
                              color={IconColors.GRAY_300}
                            />
                          </div>
                          <div className="flex flex-col items-start">
                            <div className="text-sm font-bold text-gray-600">
                              Payer Business Contact Info:
                            </div>
                            <div className="text-sm font-normal text-gray-900">
                              {eraFullDetailData?.insuranceBusinessContactName}
                            </div>
                            <div className="text-sm font-normal text-gray-900">
                              {' '}
                              {eraFullDetailData?.insuranceBusinessContactPhone}
                            </div>
                          </div>
                        </div>
                        <div className="flex h-[100px] items-center justify-start space-x-2 px-2 py-1">
                          <div className="h-full w-[1px] bg-gray-300"></div>
                        </div>

                        <div className="flex w-[50%] items-center gap-1.5">
                          <div data-html2canvas-ignore>
                            <Icon
                              name="briefcasegray"
                              size={20}
                              color={IconColors.GRAY_300}
                            />
                          </div>
                          <div className="inline-flex w-[189px] flex-col items-start justify-start">
                            <div className="font-['Nunito'] text-sm font-bold text-gray-600">
                              Provider Info:
                            </div>
                            <div
                              className="text-sm font-normal text-gray-900"
                              style={{ textAlign: 'start' }}
                            >
                              {eraFullDetailData?.payeeName}{' '}
                            </div>
                            <div
                              className="text-sm font-normal text-gray-600"
                              style={{ textAlign: 'start' }}
                            >
                              NPI: {eraFullDetailData?.payeeNPI}
                            </div>
                            <div
                              className=" text-sm font-normal text-gray-600"
                              style={{ textAlign: 'start' }}
                            >
                              {' '}
                              {`${eraFullDetailData?.payeeCity} ${eraFullDetailData?.payeeState} ${eraFullDetailData?.payeeZipCode}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-col items-start p-[38px]">
                    <div className="flex w-full flex-col pb-3">
                      <div
                        className="py-2 text-sm font-bold text-gray-700 "
                        style={{ textAlign: 'start' }}
                      >
                        Claim Details
                      </div>
                      <div className="h-px w-full bg-gray-300"></div>
                    </div>

                    <div className="w-full pb-[38px]">
                      {claimsListData &&
                        claimsListData.map((claims) => (
                          <table
                            key={claims.billedSubProc}
                            className=" w-full table-auto border-0"
                          >
                            <thead>
                              <tr className="table-row w-full border-b-[0.5px] border-solid border-t-black bg-[#0e8b98a8] text-sm font-bold text-white ">
                                <th style={{ textAlign: 'start' }}>
                                  REND-PROV
                                  <br />
                                  RARC
                                </th>
                                <th style={{ textAlign: 'start' }}>
                                  SERV-DATE
                                </th>
                                <th style={{ textAlign: 'start' }}>
                                  PD-PROC/MODS
                                </th>
                                <th style={{ textAlign: 'start' }}>
                                  PD-NOS
                                  <br />
                                  SUB-NOS
                                </th>
                                <th style={{ textAlign: 'start' }}>
                                  BILLED
                                  <br />
                                  SUB-PROC
                                </th>
                                <th style={{ textAlign: 'start' }}>
                                  ALLOWED
                                  <br />
                                  GRP/CARC
                                </th>
                                <th style={{ textAlign: 'start' }}>
                                  DEDUCT
                                  <br />
                                  CARC-AMT
                                </th>
                                <th style={{ textAlign: 'start' }}>
                                  COINS
                                  <br />
                                  ADJ-QTY
                                </th>
                                <th style={{ textAlign: 'start' }}>
                                  PROV-PD
                                  <br />
                                  BS
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                key={claims.billedSubProc}
                                className="table-row bg-[#0e8b9852] text-xs"
                              >
                                <td colSpan={3} style={{ textAlign: 'start' }}>
                                  Name: {claims.rendProv}
                                </td>
                                <td style={{ textAlign: 'start' }}>
                                  HIC: {claims.pdNOS}
                                </td>
                                <td style={{ textAlign: 'start' }}>
                                  ACNT: {claims.billedSubProc}
                                </td>
                                <td style={{ textAlign: 'start' }} colSpan={2}>
                                  ICN: {claims.allowed}
                                </td>
                                <td style={{ textAlign: 'start' }} colSpan={2}>
                                  MOA: {claims.coins}
                                </td>
                              </tr>
                              {claims.eraPaymentsData &&
                                claims.eraPaymentsData.map((payments) => (
                                  <>
                                    {' '}
                                    {claims.eraClaimID ===
                                    payments.eraClaimID ? (
                                      <tr className="text-xs">
                                        <td style={{ textAlign: 'start' }}>
                                          {payments.rendProv}
                                        </td>
                                        <td style={{ textAlign: 'start' }}>
                                          {payments.servDate}
                                        </td>
                                        <td style={{ textAlign: 'start' }}>
                                          {payments.mods}
                                        </td>
                                        <td style={{ textAlign: 'start' }}>
                                          {payments.pdNOS}
                                        </td>
                                        <td style={{ textAlign: 'start' }}>
                                          {currencyFormatter.format(
                                            payments.billedSubProc || 0
                                          )}
                                        </td>
                                        <td style={{ textAlign: 'start' }}>
                                          {currencyFormatter.format(
                                            payments.allowed || 0
                                          )}
                                        </td>
                                        <td style={{ textAlign: 'start' }}>
                                          {currencyFormatter.format(
                                            payments.deduct || 0
                                          )}
                                        </td>
                                        <td style={{ textAlign: 'start' }}>
                                          {currencyFormatter.format(
                                            payments.coins || 0
                                          )}
                                        </td>
                                        <td style={{ textAlign: 'start' }}>
                                          {currencyFormatter.format(
                                            payments.provPD || 0
                                          )}
                                        </td>
                                      </tr>
                                    ) : (
                                      <tr></tr>
                                    )}
                                    {claims.eraClaimID ===
                                    payments.eraClaimID ? (
                                      <tr>
                                        <td
                                          style={{ textAlign: 'start' }}
                                          className="text-xs"
                                          colSpan={9}
                                        >
                                          {/* colspan="9" */}
                                          {payments.remarks}
                                          <br />
                                          CNTL #: {payments.eraChargeID}
                                        </td>
                                      </tr>
                                    ) : (
                                      <tr></tr>
                                    )}
                                    {payments.eraAdjustmentsData.map(
                                      (adjustments) => (
                                        <>
                                          {' '}
                                          {claims.eraClaimID ===
                                            adjustments.eraClaimID &&
                                          payments.eraPaymentID ===
                                            adjustments.eraPaymentID ? (
                                            <tr className="text-xs">
                                              <td colSpan={5}></td>
                                              <td
                                                style={{ textAlign: 'start' }}
                                              >
                                                {
                                                  adjustments.adjustmentGroupCode
                                                }
                                                -
                                                {
                                                  adjustments.claimAdjustmentReasonCode
                                                }
                                              </td>
                                              <td
                                                style={{ textAlign: 'start' }}
                                              >
                                                {currencyFormatter.format(
                                                  adjustments.adjustmentAmount ||
                                                    0
                                                )}
                                              </td>
                                              <td colSpan={2}></td>
                                            </tr>
                                          ) : (
                                            <tr></tr>
                                          )}
                                        </>
                                      )
                                    )}
                                    {claims.eraClaimID ===
                                    payments.eraClaimID ? (
                                      <tr>
                                        <td colSpan={9}>&nbsp;&nbsp;&nbsp;</td>
                                      </tr>
                                    ) : (
                                      <tr></tr>
                                    )}
                                  </>
                                ))}

                              {claims.eraClaimID ===
                              claims.eraClaimsTotal.eraClaimID ? (
                                <tr className="bg-[#0e8b9852] text-xs">
                                  <td
                                    colSpan={3}
                                    style={{ textAlign: 'start' }}
                                  >
                                    PT RESP
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{' '}
                                    {currencyFormatter.format(
                                      claims.eraClaimsTotal
                                        .patientResponsibilityAmount || 0
                                    )}
                                  </td>
                                  <td style={{ textAlign: 'start' }}>
                                    CARC &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{' '}
                                    {currencyFormatter.format(
                                      claims.eraClaimsTotal.adjustmentAmount ||
                                        0
                                    )}
                                  </td>
                                  <td style={{ textAlign: 'start' }}>
                                    CLAIM TOTALS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{' '}
                                    {currencyFormatter.format(
                                      claims.eraClaimsTotal.charges || 0
                                    )}
                                  </td>
                                  <td style={{ textAlign: 'start' }}>
                                    {currencyFormatter.format(
                                      claims.eraClaimsTotal.allowedAmount || 0
                                    )}
                                  </td>
                                  <td style={{ textAlign: 'start' }}>
                                    {currencyFormatter.format(
                                      claims.eraClaimsTotal.deductAmount || 0
                                    )}
                                  </td>
                                  <td style={{ textAlign: 'start' }}>
                                    {currencyFormatter.format(
                                      claims.eraClaimsTotal.cOInsAmount || 0
                                    )}
                                  </td>
                                  <td style={{ textAlign: 'start' }}>
                                    {currencyFormatter.format(
                                      claims.eraClaimsTotal.paidAmount || 0
                                    )}
                                  </td>
                                </tr>
                              ) : (
                                <tr></tr>
                              )}
                              {claims.eraClaimID ===
                              claims.eraClaimsTotal.eraClaimID ? (
                                <tr className="border-b-[0.3px]  border-solid border-black bg-[#0e8b9852] text-xs">
                                  <td
                                    colSpan={4}
                                    style={{ textAlign: 'start' }}
                                  >
                                    ADJ TOTALS:
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                    PREV PD
                                  </td>
                                  <td style={{ textAlign: 'start' }}>
                                    INTEREST
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{' '}
                                    {currencyFormatter.format(
                                      claims.eraClaimsTotal.eRAInterest || 0
                                    )}
                                  </td>
                                  <td className="pr-[3em] text-right">
                                    LATE FILING CHARGE
                                  </td>
                                  <td style={{ textAlign: 'start' }}>
                                    {currencyFormatter.format(
                                      claims.eraClaimsTotal
                                        .eRALateFillingCharges || 0
                                    )}
                                  </td>

                                  <td className="pr-[3em] text-right">NET</td>
                                  <td style={{ textAlign: 'start' }}>
                                    {currencyFormatter.format(
                                      claims.eraClaimsTotal.netTotal || 0
                                    )}
                                  </td>
                                </tr>
                              ) : (
                                <tr className="border-b-[0.3px] border-solid border-black"></tr>
                              )}
                            </tbody>
                          </table>
                        ))}
                    </div>
                    <div id="secondElement" className="w-full">
                      <div className="text-xl font-bold text-gray-700">
                        <p style={{ textAlign: 'start' }}> Remit Summary</p>
                        <div className="left-0 top-[16px] h-px w-full bg-gray-300"></div>
                      </div>
                      <div className="text-md flex w-full p-[5px] font-bold text-gray-700">
                        <p style={{ width: '25.5%', textAlign: 'start' }}>
                          Parameter
                        </p>
                        <p style={{ width: '74.5%', textAlign: 'start' }}>
                          Value
                        </p>
                      </div>

                      <div className="flex flex-col">
                        <div className="inline-flex w-full flex-col items-start justify-start">
                          <div className="flex w-full flex-col gap-2">
                            <>
                              <div className="flex border border-gray-300 bg-gray-100 px-2 py-1">
                                <div className="text-sm font-extrabold text-gray-700">
                                  ERA INFO.
                                </div>
                              </div>
                              <div className=" flex gap-2">
                                <div className="inline-flex w-[25%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-extrabold text-gray-700">
                                    Provider Name:
                                  </div>
                                </div>
                                <div className="inline-flex w-[75%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-normal text-gray-700">
                                    {eraFullDetailData?.payeeName}
                                  </div>
                                </div>
                              </div>

                              <div className=" flex gap-2">
                                <div className="inline-flex w-[25%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-extrabold text-gray-700">
                                    Provider NPI:
                                  </div>
                                </div>
                                <div className="inline-flex w-[75%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-normal text-gray-700">
                                    {eraFullDetailData?.payeeNPI}
                                  </div>
                                </div>
                              </div>
                              <div className=" flex gap-2">
                                <div className="inline-flex w-[25%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-extrabold text-gray-700">
                                    Check Date:
                                  </div>
                                </div>
                                <div className="inline-flex w-[75%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-normal text-gray-700">
                                    {eraFullDetailData?.checkDate}
                                  </div>
                                </div>
                              </div>
                              <div className=" flex gap-2">
                                <div className="inline-flex w-[25%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-extrabold text-gray-700">
                                    Check / EFT Trace #:
                                  </div>
                                </div>
                                <div className="inline-flex w-[75%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-normal text-gray-700">
                                    {eraFullDetailData?.checkNumber}
                                  </div>
                                </div>
                              </div>
                            </>
                            <>
                              <div className="flex border border-gray-300 bg-gray-100 px-2 py-1">
                                <div className="text-sm font-extrabold text-gray-700">
                                  CLAIMS INFO.
                                </div>
                              </div>
                              <div className=" flex gap-2">
                                <div className="inline-flex w-[25%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-extrabold text-gray-700">
                                    Total Claims:
                                  </div>
                                </div>
                                <div className="inline-flex w-[75%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-normal text-gray-700">
                                    {eraFullDetailData?.claimsCount}
                                  </div>
                                </div>
                              </div>
                            </>
                            <>
                              <div className="flex border border-gray-300 bg-gray-100 px-2 py-1">
                                <div className="text-sm font-extrabold text-gray-700">
                                  FINANCIAL INFO.
                                </div>
                              </div>
                              <div className=" flex gap-2">
                                <div className="inline-flex w-[25%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-extrabold text-gray-700">
                                    Billed Amount:
                                  </div>
                                </div>
                                <div className="inline-flex w-[75%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-normal text-gray-700">
                                    {currencyFormatter.format(
                                      eraFullDetailData?.billedAmount || 0
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className=" flex gap-2">
                                <div className="inline-flex w-[25%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-extrabold text-gray-700">
                                    Total Reason Code Adjustment Amount:
                                  </div>
                                </div>
                                <div className="inline-flex w-[75%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-normal text-gray-700">
                                    {currencyFormatter.format(
                                      eraFullDetailData?.adjustmentAmount || 0
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className=" flex gap-2">
                                <div className="inline-flex w-[25%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-extrabold text-gray-700">
                                    Total Allowed Amount:
                                  </div>
                                </div>
                                <div className="inline-flex w-[75%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-normal text-gray-700">
                                    {currencyFormatter.format(
                                      eraFullDetailData?.allowedAmount || 0
                                    )}
                                  </div>
                                </div>
                              </div>
                            </>
                            <>
                              <div className="flex border border-gray-300 bg-gray-100 px-2 py-1">
                                <div className="text-sm font-extrabold text-gray-700">
                                  PATIENT RESPONSIBILITY INFO.
                                </div>
                              </div>
                              <div className=" flex gap-2">
                                <div className="inline-flex w-[25%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-extrabold text-gray-700">
                                    Total Coinsurance Amount:
                                  </div>
                                </div>
                                <div className="inline-flex w-[75%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-normal text-gray-700">
                                    {currencyFormatter.format(
                                      eraFullDetailData?.coInsuranceAmount || 0
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className=" flex gap-2">
                                <div className="inline-flex w-[25%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-extrabold text-gray-700">
                                    Total Deductible Amount:
                                  </div>
                                </div>
                                <div className="inline-flex w-[75%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-normal text-gray-700">
                                    {currencyFormatter.format(
                                      eraFullDetailData?.deductibleAmount || 0
                                    )}
                                  </div>
                                </div>
                              </div>
                            </>
                            <>
                              <div className="flex border border-gray-300 bg-gray-100 px-2 py-1">
                                <div className="text-sm font-extrabold text-gray-700">
                                  TOTALS INFO.
                                </div>
                              </div>
                              <div className=" flex gap-2">
                                <div className="inline-flex w-[25%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-extrabold text-gray-700">
                                    Total Patient Responsibility:
                                  </div>
                                </div>
                                <div className="inline-flex w-[75%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-normal text-gray-700">
                                    {currencyFormatter.format(
                                      eraFullDetailData?.patientResponsibilityAmount ||
                                        0
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className=" flex gap-2">
                                <div className="inline-flex w-[25%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-extrabold text-gray-700">
                                    Total Paid to Provider:
                                  </div>
                                </div>
                                <div className="inline-flex w-[75%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-normal text-gray-700">
                                    {currencyFormatter.format(
                                      eraFullDetailData?.paidAmount || 0
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className=" flex gap-2">
                                <div className="inline-flex w-[25%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-extrabold text-gray-700">
                                    Total Check / EFT Amount:
                                  </div>
                                </div>
                                <div className="inline-flex w-[75%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                  <div className="text-sm font-normal text-gray-700">
                                    {currencyFormatter.format(
                                      eraFullDetailData?.checkAmount || 0
                                    )}
                                  </div>
                                </div>
                              </div>
                            </>
                          </div>
                        </div>
                      </div>
                      <div className="pt-[25px] text-xl font-bold text-gray-700">
                        <p style={{ textAlign: 'start' }}>Glossary</p>
                        <div className="left-0 top-[16px] h-px w-full bg-gray-300"></div>
                      </div>
                      <div className="text-md flex w-full p-[5px] font-bold text-gray-700">
                        <p style={{ width: '25.5%', textAlign: 'start' }}>
                          Code
                        </p>
                        <p style={{ width: '74.5%', textAlign: 'start' }}>
                          Meaning
                        </p>
                      </div>

                      <div className="flex flex-col">
                        <div className="inline-flex w-full flex-col items-start justify-start">
                          <div className="flex w-full flex-col gap-2">
                            <>
                              {eraFullDetailData?.eraGlossary.map(
                                (glossary) => (
                                  <div
                                    className=" flex gap-2"
                                    key={glossary.id}
                                  >
                                    <div className="inline-flex w-[25%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                      <div
                                        className="text-sm font-extrabold text-gray-700"
                                        style={{ textAlign: 'start' }}
                                      >
                                        {glossary.code}
                                      </div>
                                    </div>
                                    <div className="inline-flex w-[75%] items-center justify-start gap-2 border border-gray-300 px-2 py-1">
                                      <div
                                        className="text-sm font-normal text-gray-700"
                                        style={{ textAlign: 'start' }}
                                      >
                                        {glossary.codeDescription}
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`h-[100px] bg-gray-200 w-full pd-0`}>
                <div className="flex flex-row-reverse gap-4 p-6 ">
                  {!!eraFullDetailData && (
                    <div>
                      <Button
                        buttonType={ButtonType.primary}
                        onClick={() => {
                          createpdfdata();
                        }}
                      >
                        Download to PDF
                      </Button>
                    </div>
                  )}
                  <div>
                    <Button
                      buttonType={ButtonType.secondary}
                      cls={`w-[102px]`}
                      onClick={onPressClose}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
