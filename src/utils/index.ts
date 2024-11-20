import type { GridColTypeDef } from '@mui/x-data-grid-pro';
import type { AnyAction } from '@reduxjs/toolkit';
import JsPDF from 'jspdf';
import type {
  ColumnInput as PDFColumnInput,
  RowInput as PDFRowInput,
} from 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import type { Dispatch } from 'react';

import { addToastNotification } from '@/store/shared/actions';
import { ToastType } from '@/store/shared/types';

export type { PDFColumnInput, PDFRowInput };

export const isOrganizationSelectorDisabled = () => {
  const { pathname } = window.location;

  const disableArray = [
    '/app/create-claim',
    '/app/create-claim/[claim_id]',
    '/app/claim-detail/[claim_id]',
    '/app/register-patient',
    '/app/register-patient/[patient_id]',
  ];

  const isItemDisabled = disableArray.some((item) => {
    if (item === pathname) {
      return true;
    }

    const itemParts = item.split('/');
    const inputParts = pathname.split('/');

    if (itemParts.length !== inputParts.length) {
      return false;
    }

    return itemParts.every((itemPart, i) => {
      const inputPart = inputParts[i];

      return (
        !itemPart ||
        itemPart === inputPart ||
        itemPart.startsWith('[') ||
        itemPart.endsWith(']')
      );
    });
  });

  return isItemDisabled;
};

export interface DownloadDataPDFDataType {
  columns: PDFColumnInput[] | undefined;
  body: PDFRowInput[] | undefined;
}

export const ExportDataToPDF = (
  data: DownloadDataPDFDataType[],
  heading: string,
  fileName?: string,
  columnStyles?: any
) => {
  let totalFlag = false;
  let avgFlag = false;
  const doc1 = new JsPDF('landscape', 'mm', 'a4', true);
  const myROW: any[] = [];
  data.forEach((r: any) => {
    autoTable(doc1, {
      body: r.body,
      columns: r.columns,
      rowPageBreak: 'avoid',
      styles: {
        overflow: 'linebreak',
        minCellHeight: 5,
        cellPadding: 0.5,
        fontSize: 6,
      },
      columnStyles,
      headStyles: {
        fillColor: '#06B6D4', // Set header background color here
        textColor: '#FFFFFF', // Set header text color here
        // fontSize: 8, // Set header font size here (optional)
      },
      didDrawPage: () => {
        doc1.text(heading, 20, 10);
      },
      willDrawCell: function drawCell(g: any) {
        const rowData = g.row.raw;
        const cellValue = g.cell.raw;

        if (rowData && rowData.Month) {
          const month = rowData.Month;

          if (month === 'Total' && !totalFlag) {
            myROW.push(month);
            totalFlag = true;
          }

          if (month === 'AVG' && !avgFlag) {
            myROW.push(month);
            avgFlag = true;
          }

          if (myROW.includes(month)) {
            doc1.setFillColor('#06B6D4');
            doc1.setTextColor('#FFFFFF');
            doc1.setFont('helvetica', 'bold');
            // doc1.setFontStyle('bold');
          }
          if (
            typeof cellValue === 'string' &&
            (cellValue.startsWith('$') || cellValue.startsWith('-$'))
          ) {
            // Parse the formatted currency string to a number
            const numericValue = Number(cellValue.replace(/[^0-9.-]+/g, ''));
            if (numericValue < 0) {
              doc1.setTextColor(255, 0, 0); // Set text color to red for negative values
            }
          }
          if (typeof cellValue === 'number' && cellValue < 0 && rowData.Month) {
            doc1.setTextColor(255, 0, 0); // Set text color to red
          }
          if (cellValue === '$0.00' && myROW.includes(month)) {
            // eslint-disable-next-line no-param-reassign
            g.cell.text = '';
          }
        }
      },
      margin: { top: 30 },
    });
  });
  doc1.save(`${fileName || heading}.pdf`);
};

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

export const ExportDataToCSV = (array: any[], name: string) => {
  const csvData = ConvertToCSV(array);
  const a = document.createElement('a');
  a.setAttribute('style', 'displa.y:none;');
  document.body.appendChild(a);
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = `${name}.csv`;
  a.click();
};
export const ExportDataToTextFile = (
  data: string,
  fileType: string,
  fileName: string
) => {
  const downloadFilename = `${fileName}.${fileType}`;
  const blob = new Blob([data], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  document.body.appendChild(a);
  a.href = url;
  a.download = downloadFilename;
  a.click();
};
export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});
export const usdPrice: GridColTypeDef = {
  type: 'number',
  width: 130,
  align: 'left',
  valueFormatter: ({ value }) => currencyFormatter.format(value),
  cellClassName: 'font-tabular-nums',
};

export const uploadDataToDrive = async (
  dataArray: [],
  filename: string,
  accessToken: string,
  dispatch: Dispatch<AnyAction>
) => {
  const rows = dataArray.map((obj) => Object.values(obj));
  const dt = new Date();
  const spreadSheetTitle = `${filename} (${
    dt.getMonth() + 1
  }/${dt.getDate()}/${dt.getFullYear()} ${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()})`;
  const spreadsheetBody = {
    properties: {
      title: spreadSheetTitle,
    },
    sheets: [
      {
        properties: { title: filename },
      },
    ],
  };

  const request: any = await (gapi.client as any).sheets.spreadsheets.create(
    {},
    spreadsheetBody
  );
  const { spreadsheetId } = request.result;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A:ZZ:append?insertDataOption=INSERT_ROWS&valueInputOption=RAW`;

  const data = {
    range: 'A:ZZ',
    majorDimension: 'ROWS',
    values: rows,
  };

  fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then(() => {
      dispatch(
        addToastNotification({
          text: 'Export successful.',
          toastType: ToastType.SUCCESS,
          id: '',
        })
      );
    })
    .catch(() => {
      dispatch(
        addToastNotification({
          text: 'Export error.',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
    });
};
const initGoogleAuth = (
  dataArray: any,
  filename: string,
  dispatch: Dispatch<AnyAction>
) => {
  gapi.load('client:auth2', () => {
    gapi.client
      .init({
        apiKey: 'AIzaSyBIa8VlNeRDBftQbliYiapv2lWX_Vs_7Fc',
        clientId:
          '983201407144-00pqs49ult9kjhflti8108h813lpg1ia.apps.googleusercontent.com',
        discoveryDocs: [
          'https://sheets.googleapis.com/$discovery/rest?version=v4',
        ],
        scope: 'https://www.googleapis.com/auth/drive.file',
      })
      .then(() => {
        const authInstance = gapi.auth2.getAuthInstance();
        if (!authInstance.isSignedIn.get()) {
          authInstance.signIn({ prompt: 'select_account' }).then((user) => {
            console.log('User signed in:', user.getId());
            // Handle CSV data upload to Google Sheets
            uploadDataToDrive(
              dataArray,
              filename,
              gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse()
                .access_token,
              dispatch
            );
            gapi.auth2.getAuthInstance().signOut();
          });
        } else {
          console.log('User is already signed in');
          // Optionally sign out and sign in again
          authInstance.signOut().then(() => {
            authInstance.signIn({ prompt: 'select_account' }).then((user) => {
              console.log('User signed in:', user.getId());
              // Handle CSV data upload to Google Sheets
              uploadDataToDrive(
                dataArray,
                filename,
                gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse()
                  .access_token,
                dispatch
              );
              gapi.auth2.getAuthInstance().signOut();
            });
          });
        }
      });
  });
};

export const ExportDataToDrive = (
  dataArray: any,
  filename: string,
  dispatch: Dispatch<AnyAction>
) => {
  const script = document.createElement('script');
  script.src = 'https://apis.google.com/js/api.js';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    // Now that the script is loaded, you can call handleSignIn
    initGoogleAuth(dataArray, filename, dispatch);
  };
  document.head.appendChild(script);
};
