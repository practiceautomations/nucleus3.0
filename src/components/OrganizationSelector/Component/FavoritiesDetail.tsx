import type {
  FavoritesFacilities,
  FavoritesPractices,
  FavoritesProviders,
} from '@/store/chrome/types';
import type { GroupData } from '@/store/shared/types';

type FavoritiesDetailProps = {
  practices?: FavoritesPractices | undefined;
  facilities?: FavoritesFacilities | undefined;
  providers?: FavoritesProviders | undefined;
  groupData?: GroupData | undefined;
};

const FavoritiesDetail = ({
  groupData,
  practices,
  facilities,
  providers,
}: FavoritiesDetailProps) => {
  return (
    <div className="ml-8 inline-flex h-40 w-56 flex-col items-start justify-start space-y-2">
      <p className="text-sm font-bold leading-tight text-gray-500">
        Item Details
      </p>
      <div className="flex  h-40 flex-col items-start justify-start">
        {groupData && (
          <div
            key={groupData.id}
            className="inline-flex h-40 flex-col justify-start space-y-1 text-left "
          >
            <p className="w-52 text-sm  font-bold leading-4 text-gray-400">
              {groupData.value}
            </p>
            {!!groupData.einNumber && (
              <p className="w-52 text-xs  leading-4 text-gray-400">
                EIN: {groupData.einNumber}{' '}
              </p>
            )}
            <hr />
            <div className="inline-flex h-auto w-52 items-center justify-center space-x-2">
              <p className="flex-1 text-xs leading-none text-gray-400">
                <span>{groupData.value}</span>
              </p>
            </div>
          </div>
        )}
        {practices && (
          <div
            key={practices.id}
            className="inline-flex h-40 flex-col justify-start space-y-1 text-left "
          >
            <p className="w-52 text-sm  font-bold leading-4 text-gray-400">
              {practices.value}
            </p>
            <p className="w-52 text-xs  leading-4 text-gray-400">
              {practices.address}
            </p>
            {!!practices.einNumber && (
              <p className="w-52 text-xs  leading-4 text-gray-400">
                EIN: {practices.einNumber}{' '}
              </p>
            )}
            <hr />
            <div className="inline-flex h-auto w-52 items-center justify-center space-x-2">
              <p className="flex-1 text-xs leading-none text-gray-400">
                <span>
                  {practices.group} &#62; {practices.value}
                </span>
              </p>
            </div>
          </div>
        )}
        {facilities && (
          <div
            key={facilities.id}
            className="inline-flex h-40 flex-col justify-start space-y-1 text-left "
          >
            <p className="w-52 text-sm  font-bold leading-4 text-gray-400">
              {facilities.value}
            </p>
            <p className="w-52 text-xs  leading-4 text-gray-400">
              {facilities.address}
            </p>
            <p className="w-52 text-xs  leading-4 text-gray-400">
              PoS Code: {facilities.placeOfServiceCode}
            </p>
            <p className="w-52 text-xs  leading-4 text-gray-400">
              PoS Description: {facilities.placeOfServiceDescription}
            </p>
            <hr />
            <div className="inline-flex h-auto w-52 items-center justify-center space-x-2">
              <p className="flex-1 text-xs leading-none text-gray-400">
                <span>
                  {facilities.group} &#62; {facilities.practice} &#62;{' '}
                  {facilities.value}
                </span>
              </p>
            </div>
          </div>
        )}
        {providers && (
          <div
            key={providers.id}
            className="inline-flex h-40 flex-col justify-start space-y-1 text-left "
          >
            <p className="w-52 text-sm  font-bold leading-4 text-gray-400">
              {providers.value}
            </p>
            {!!providers.providerNPI && (
              <p className="w-52 text-xs  leading-4 text-gray-400">
                NPI: {providers.providerNPI}{' '}
              </p>
            )}
            <hr />
            <div className="inline-flex h-auto w-52 items-center justify-center space-x-2">
              <p className="flex-1 text-xs leading-none text-gray-400">
                <span>
                  {providers.group} &#62; {providers.value}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritiesDetail;
