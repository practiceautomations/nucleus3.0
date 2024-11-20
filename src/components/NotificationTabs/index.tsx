import classNames from '@/utils/classNames';

// Todo: replace mockData
import { notificationsData } from '../NotificationContainer/mockData';

export enum TabType {
  All = 'All',
  Claims = 'Claims',
  Remittance = 'Remittance',
  Team = 'Team',
}

type NotificationTabsProps = {
  currentTab: TabType;
  onChangeTab: (newTab: TabType) => void;
};

const NotificationTabs = ({
  currentTab,
  onChangeTab,
}: NotificationTabsProps) => {
  const tabs: TabType[] = [
    TabType.All,
    TabType.Claims,
    TabType.Remittance,
    TabType.Team,
  ];

  const getCount = (tab: TabType) => {
    if (tab === TabType.All) return notificationsData.length;
    return notificationsData.filter(
      (notification: any) => notification.group === tab
    ).length;
  };

  return (
    <>
      <div>
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            defaultValue={tabs[0]}
            onChange={(ev) => onChangeTab(ev.target.value as TabType)}
          >
            {tabs.map((tab) => (
              <option key={tab}>{tab}</option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <span
                  key={tab}
                  className={classNames(
                    currentTab === tab
                      ? 'border-cyan-500 text-cyan-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200',
                    'whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm cursor-pointer'
                  )}
                  aria-current={currentTab === tab ? 'page' : undefined}
                  onClick={() => onChangeTab(tab)}
                >
                  {tab}
                  {getCount(tab) > 0 && (
                    <span
                      className={classNames(
                        currentTab === tab
                          ? 'bg-cyan-500 text-white'
                          : 'bg-gray-100 text-gray-800',
                        'ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block'
                      )}
                    >
                      {getCount(tab)}
                    </span>
                  )}
                </span>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationTabs;
