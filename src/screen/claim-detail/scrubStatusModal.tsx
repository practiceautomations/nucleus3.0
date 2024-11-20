import type { GridColDef } from '@mui/x-data-grid-pro';
import React, { useEffect, useState } from 'react';

import Icon from '@/components/Icon';
import Button, { ButtonType } from '@/components/UI/Button';
import CloseButton from '@/components/UI/CloseButton';
import Modal from '@/components/UI/Modal';
import SearchDetailGrid from '@/components/UI/SearchDetailGrid';
import {
  getClaimScrubingErrors,
  getScrubingAPIResponce,
} from '@/store/shared/sagas';
import type { ClaimScrubbingErrorsResult } from '@/store/shared/types';

interface TProps {
  headingText: string;
  open: boolean;
  onClose?: () => void;
  onDownload?: () => void;
  claimID: number | null;
}
export default function ScrubStatusModal({
  headingText,
  open,
  onClose,
  claimID,
}: TProps) {
  const [searchResult, setSearchResult] = useState<
    ClaimScrubbingErrorsResult[]
  >([]);
  const getErrorTokenColor = (status: string) => {
    if (status === 'Fatal Error' || status === 'Error') {
      return '!bg-red-500';
    }
    if (status === 'Forcefully passed' || status === 'Warning') {
      return '!bg-amber-300';
    }
    if (status === 'Passed') {
      return '!bg-green-300';
    }

    return '!bg-gray-300';
  };
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: '#',
      // flex: 1,
      minWidth: 100,
      disableReorder: true,
    },
    {
      field: 'token',
      headerName: 'Errors',
      // flex: 1,
      minWidth: 180,
      disableReorder: true,
      cellClassName: (params) => {
        return getErrorTokenColor(params.row.color);
      },
      renderCell: (params) => {
        return (
          <div
            className="font-bold text-gray-900"
            style={{
              textShadow: '0 0 5px #FFFFFF',
              backgroundColor: params.row.color, // Setting background color
            }}
          >
            {params.value || '-'}
          </div>
        );
      },
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      // minWidth: 700,
      minWidth: 230,
      disableReorder: true,
      // renderCell: (params) => {
      //   return <div className="flex flex-col">{params.value}</div>;
      // },
    },
  ];
  const getScrubingResponce = async (id: number) => {
    const res: any = await getScrubingAPIResponce(id);
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
  const getClaimScrubingErrorsData = async (id: number) => {
    const res = await getClaimScrubingErrors(id);
    if (res) {
      setSearchResult(res);
    }
  };
  useEffect(() => {
    if (claimID) {
      getClaimScrubingErrorsData(claimID);
    }
  }, [claimID]);
  return (
    <Modal
      open={open}
      modalContentClassName="h-[calc(100%-180px)] w-[68%] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
      onClose={() => {
        if (onClose) {
          onClose();
        }
      }}
    >
      <>
        <div
          className="flex h-full w-full flex-col gap-4 overflow-y-auto rounded-lg bg-gray-100 p-4"
          style={{ textAlign: 'left' }}
        >
          <div className="mt-3 w-full">
            <div className="flex w-full flex-row justify-between">
              <div className="flex self-start">
                <h1 className=" ml-2  text-left text-xl font-bold leading-7 text-gray-700">
                  {headingText}
                  {/* selectedValue.name ||  */}
                </h1>
              </div>

              <div className=" flex gap-4">
                <Button
                  buttonType={ButtonType.secondary}
                  cls={`inline-flex  gap-2 leading-5`}
                  onClick={() => {
                    if (claimID) {
                      getScrubingResponce(claimID);
                    }
                  }}
                >
                  <Icon name={'eye'} size={18} />
                  <p className="text-sm">View Details</p>
                </Button>
                <div className="self-center">
                  <CloseButton
                    onClick={() => {
                      setSearchResult([]);
                      if (onClose) onClose();
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 h-px w-full bg-gray-300" />
          </div>
          <div className="flex flex-col gap-4">
            {searchResult.filter((m) => m.type === 'adnare').length ? (
              <div className="py-2 text-xl font-bold text-gray-500">
                {'Alpha II Response:'}
              </div>
            ) : (
              <>{''}</>
            )}
            {searchResult.filter((m) => m.type === 'alpha2').length ? (
              <SearchDetailGrid
                checkboxSelection={false}
                hideHeader={true}
                hideFooter={true}
                columns={columns}
                rows={searchResult.filter((m) => m.type === 'alpha2')}
                setHeaderRadiusCSS={true}
              />
            ) : (
              <>{''}</>
            )}
            {searchResult.filter((m) => m.type === 'adnare').length ? (
              <div className="py-2 text-xl font-bold text-gray-500">
                {'AI Denial Predictor Response:'}
              </div>
            ) : (
              <>{''}</>
            )}
            {searchResult.filter((m) => m.type === 'adnare').length ? (
              <SearchDetailGrid
                checkboxSelection={false}
                hideHeader={true}
                hideFooter={true}
                columns={columns}
                rows={searchResult.filter((m) => m.type === 'adnare')}
                setHeaderRadiusCSS={true}
              />
            ) : (
              <>{''}</>
            )}
          </div>
        </div>
      </>
    </Modal>
  );
}
