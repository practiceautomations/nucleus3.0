import Icon from '@/components/Icon';

const Item = () => {
  return (
    <div className="flex flex-row">
      {/* Groups */}
      <div className="flex flex-row">
        <div className="flex flex-col items-start">
          <p className="mb-2 font-bold text-gray-500">Groups</p>
          <div className="flex w-56 flex-col rounded-md p-2 hover:bg-gray-100">
            <div className="flex flex-row items-center">
              <Icon name="starFavorite" />
              <span className="ml-2 flex-1 text-sm leading-5 text-gray-600">
                Be Well Health Care
              </span>
              <span className="pr-2">
                <Icon
                  name="ellipsisHorizontal"
                  className="rotate-90 pr-10"
                  size={13}
                />
              </span>

              <Icon name="chevron" size={13} />
            </div>
            <div className="flex items-start">
              <span className="text-xs leading-4 text-gray-400">
                EIN:: 123456789
              </span>
            </div>
          </div>
        </div>
      </div>
      <hr className="mx-6 h-auto w-[1px] bg-gray-200" />
      {/* Practices */}
      <div className="flex flex-row">
        <div>
          <p className="mb-2 font-bold text-gray-500">Practices</p>
          <div className="flex w-56 flex-col rounded-md p-2 hover:bg-gray-100">
            <div className="flex flex-row items-center">
              <Icon name="starFavorite" />
              <span className="mx-2 flex-1 text-sm leading-5 text-gray-600">
                Be Well Health Care
              </span>
              <span className="pr-2">
                <Icon
                  name="ellipsisHorizontal"
                  className="rotate-90 pr-10"
                  size={13}
                />
              </span>

              <Icon name="chevron" size={13} />
            </div>
            <div>
              <p className="mb-1 text-xs leading-4 text-gray-400">
                EIN: 123456789
              </p>
              <p className="text-xs leading-4 text-gray-400">
                8 Brandywine Ave, Opa Locka, FL 33054
              </p>
            </div>
          </div>
        </div>
      </div>
      <hr className="mx-6 h-auto w-[1px] bg-gray-200" />
      {/* Facilities */}
      <div className="flex flex-row">
        <div>
          <p className="mb-2 font-bold text-gray-500">Facilities</p>
          <div className="flex w-56 flex-col rounded-md p-2 hover:bg-gray-100">
            <div className="flex flex-row items-center">
              <Icon name="starFavorite" />
              <span className="mx-2 flex-1 text-sm leading-5 text-gray-600">
                Be Well Health Care | Office
              </span>
              <span className="pr-2">
                <Icon
                  name="ellipsisHorizontal"
                  className="rotate-90 pr-10"
                  size={13}
                />
              </span>

              <Icon name="chevron" size={13} />
            </div>
            <div>
              <span className="text-xs leading-4 text-gray-400">
                PoS: 11 | Office
              </span>
            </div>
          </div>
        </div>
      </div>
      <hr className="mx-6 h-auto w-[1px] bg-gray-200" />
      {/* Providers */}
      <div className="flex flex-row">
        <div>
          <p className="mb-2 font-bold text-gray-500">Providers</p>
          <div className="flex w-56 flex-col rounded-md p-2 hover:bg-gray-100">
            <div className="flex flex-row items-center">
              <Icon name="starFavorite" />
              <span className="mx-2 flex-1 text-sm leading-5 text-gray-600">
                Dr. Antoine F. Ferneini
              </span>
              <span className="pr-2">
                <Icon
                  name="ellipsisHorizontal"
                  className="rotate-90 pr-10"
                  size={13}
                />
              </span>

              <Icon name="chevron" size={13} />
            </div>
            <div>
              <span className="text-xs leading-4 text-gray-400">
                NPI: 6423827509
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Item;
