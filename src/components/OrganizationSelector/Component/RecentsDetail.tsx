import type {
  AllRecentTabData,
  WorkGroupsResponseData,
} from '@/store/chrome/types';

type RecentsDetailProps = {
  dataList: AllRecentTabData | undefined;
  selectedWorkGroupData: WorkGroupsResponseData | null;
};

const RecentsDetail = ({
  dataList,
  selectedWorkGroupData,
}: RecentsDetailProps) => {
  return (
    <div className="h-42 ml-8 inline-flex flex-col items-start justify-start space-y-2 overflow-y-auto overflow-x-hidden">
      <p className="text-sm font-bold leading-tight text-gray-500">
        Item Details
      </p>
      <div className="flex  h-40 flex-col items-start justify-start">
        {dataList?.group && dataList.type === 'group' && (
          <div
            key={dataList.id}
            className="inline-flex h-40 flex-col justify-start space-y-1 text-left "
          >
            <p className="w-52 text-sm  font-bold leading-4 text-gray-400">
              {dataList.group}
            </p>
            {!!dataList.groupEINNumber && (
              <p className="w-52 text-xs  leading-4 text-gray-400">
                EIN: {dataList.groupEINNumber}{' '}
              </p>
            )}
            <hr />
            <div className="inline-flex h-auto w-52 items-center justify-center space-x-2">
              <p className="flex-1 text-xs leading-none text-gray-400">
                <span>{dataList.group}</span>
              </p>
            </div>
          </div>
        )}
        {dataList?.practice && dataList.type === 'practice' && (
          <div
            key={dataList.id}
            className="inline-flex h-40 flex-col justify-start space-y-1 text-left "
          >
            <p className="w-52 text-sm  font-bold leading-4 text-gray-400">
              {dataList?.practice}
            </p>
            <p className="w-52 text-xs  leading-4 text-gray-400">
              {dataList.practiceAddress}
            </p>
            {!!dataList.practiceEINNumber && (
              <p className="w-52 text-xs  leading-4 text-gray-400">
                EIN: {dataList.practiceEINNumber}{' '}
              </p>
            )}
            <hr />
            <div className="inline-flex h-auto w-52 items-center justify-center space-x-2">
              <p className="flex-1 text-xs leading-none text-gray-400">
                <span>
                  {dataList.practiceGroup} &#62; {dataList.practice}
                </span>
              </p>
            </div>
          </div>
        )}
        {dataList?.facility && dataList.type === 'facility' && (
          <div
            key={dataList.id}
            className="inline-flex h-40 flex-col justify-start space-y-1 text-left "
          >
            <p className="w-52 text-sm  font-bold leading-4 text-gray-400">
              {dataList.facility}
            </p>
            <p className="w-52 text-xs  leading-4 text-gray-400">
              {dataList.facilityAddress}
            </p>
            <p className="w-52 text-xs  leading-4 text-gray-400">
              PoS Code: {dataList.facilityPOSCode}
            </p>
            <p className="w-52 text-xs  leading-4 text-gray-400">
              PoS Description: {dataList.facilityPOSDescription}
            </p>
            <hr />
            <div className="inline-flex h-auto w-52 items-center justify-center space-x-2">
              <p className="flex-1 text-xs leading-none text-gray-400">
                <span>
                  {dataList.facilityGroup} &#62; {dataList.facilityPractice}{' '}
                  &#62; {dataList.facility}
                </span>
              </p>
            </div>
          </div>
        )}
        {dataList?.provider && dataList.type === 'provider' && (
          <div
            key={dataList.id}
            className="inline-flex h-40 flex-col justify-start space-y-1 text-left "
          >
            <p className="w-52 text-sm  font-bold leading-4 text-gray-400">
              {dataList.provider}
            </p>
            {!!dataList.providerNPI && (
              <p className="w-52 text-xs  leading-4 text-gray-400">
                NPI: {dataList.providerNPI}{' '}
              </p>
            )}
            <hr />
            <div className="inline-flex h-auto w-52 items-center justify-center space-x-2">
              <p className="flex-1 text-xs leading-none text-gray-400">
                <span>
                  {dataList.providerGroup} &#62; {dataList.provider}
                </span>
              </p>
            </div>
          </div>
        )}
        {dataList?.workGroup && dataList.type === 'work group' && (
          <div
            key={dataList.id}
            className="inline-flex h-40 flex-col justify-start space-y-1 text-left "
          >
            <p className="w-52 text-sm  font-bold leading-4 text-gray-400">
              {dataList.workGroup}
            </p>
            <p className="w-52 text-xs  leading-4 text-gray-400">
              <span className="font-bold">Groups:</span>{' '}
              {selectedWorkGroupData?.groupsData.map((m) => m.value).join(', ')}{' '}
            </p>
            <p className="w-52 text-xs  leading-4 text-gray-400">
              <span className="font-bold">Practices:</span>{' '}
              {selectedWorkGroupData?.practicesData
                .map((m) => m.value)
                .join(', ')}{' '}
            </p>
            <p className="w-52 text-xs  leading-4 text-gray-400">
              <span className="font-bold"> Facilities:</span>{' '}
              {selectedWorkGroupData?.facilitiesData
                .map((m) => m.value)
                .join(', ')}{' '}
            </p>
            <p className="w-52 text-xs  leading-4 text-gray-400">
              <span className="font-bold"> Providers:</span>{' '}
              {selectedWorkGroupData?.providersData
                .map((m) => m.value)
                .join(', ')}{' '}
            </p>
            <hr />
            <div className="inline-flex h-auto w-52 items-center justify-center space-x-2">
              <p className="flex-1 text-xs leading-none text-gray-400">
                <span>{dataList.workGroup}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentsDetail;
