import Button, { ButtonType } from '@/components/UI/Button';
import CloseButton from '@/components/UI/CloseButton';
import type { ClaimDNALogResult } from '@/store/shared/types';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

import AppTable, { AppTableCell, AppTableRow } from '../../Table';

type ClaimDNALogDetailProps = {
  onClose: () => void;
  claimLogData: ClaimDNALogResult[];
  label: string;
};
const ClaimDNALogDetail = ({
  onClose,
  claimLogData,
  label,
}: ClaimDNALogDetailProps) => {
  const logHeader = [
    'Order',
    'Section',
    'Action Type',
    'Feild',
    'Before',
    'After',
    'User',
    'Date',
    'Time',
  ];
  return (
    <div className="flex flex-col ">
      <div className="flex max-w-full flex-col bg-gray-100  p-[10px]">
        <div className="mt-4 flex flex-row justify-between">
          <div>
            <h1 className=" text-left  text-xl font-bold leading-7 text-gray-700">
              {label}
            </h1>
          </div>
          <div className="">
            <CloseButton onClick={onClose} />
          </div>
        </div>
        <div className={`w-full`}>
          <div className={`h-px`}></div>
        </div>
      </div>
      <div className="flex flex-col bg-white p-[24px] px-6">
        <div className=" flex flex-col rounded-md border border-gray-300">
          <AppTable
            cls=" bg-red-500 max-h-[400px]"
            renderHead={
              <>
                <AppTableRow>
                  {logHeader.map((header) => (
                    <>
                      <AppTableCell cls="!font-bold !whitespace-nowrap">
                        {header}
                      </AppTableCell>
                    </>
                  ))}
                </AppTableRow>
              </>
            }
            renderBody={
              <>
                {claimLogData?.map((row: ClaimDNALogResult) => (
                  <AppTableRow key={row?.id}>
                    <AppTableCell>{`#${row?.id}`}</AppTableCell>
                    <AppTableCell>{row.section}</AppTableCell>
                    <AppTableCell>{row.actionType}</AppTableCell>
                    <AppTableCell>{row.field}</AppTableCell>
                    <AppTableCell>{row.before}</AppTableCell>
                    <AppTableCell>{row.after}</AppTableCell>
                    <AppTableCell>{row.user}</AppTableCell>

                    <AppTableCell>
                      {DateToStringPipe(row.updatedOn, 2)}
                    </AppTableCell>
                    <AppTableCell>
                      {`${DateToStringPipe(row.updatedOn, 8)}`}
                    </AppTableCell>
                  </AppTableRow>
                ))}
              </>
            }
          />
        </div>
      </div>
      <div className={`h-[86px] bg-gray-200 w-full`}>
        <div className="flex flex-row-reverse gap-4 p-6 ">
          <div>
            <Button buttonType={ButtonType.primary} onClick={() => {}}>
              Download
            </Button>
          </div>
          <div>
            <Button
              buttonType={ButtonType.secondary}
              cls={`w-[102px]`}
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ClaimDNALogDetail;
