import classNames from '@/utils/classNames';

//  Todo: add proper typing
interface TabsProps {
  tabs: any[];
  onChangeTab: (tab: any) => void;
  currentTab: any;
}

const Tabs = ({ tabs, onChangeTab, currentTab }: TabsProps) => {
  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 sm:text-sm"
          defaultValue={tabs.find((tab) => tab.current)?.name}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const isCurrentTab = tab.name === currentTab.name;
              return (
                <button
                  key={tab.name}
                  className={classNames(
                    isCurrentTab
                      ? 'border-cyan-500 text-cyan-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200',
                    'whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm'
                  )}
                  aria-current={isCurrentTab ? 'page' : undefined}
                  onClick={() => onChangeTab(tab)}
                >
                  {tab.name}
                  {!!tab.count || tab.count === 0 ? (
                    <span
                      className={classNames(
                        isCurrentTab
                          ? 'bg-cyan-500 text-white'
                          : 'bg-gray-100 text-gray-900',
                        'hidden ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block'
                      )}
                    >
                      {tab.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Tabs;
