import { Box, Button, Popover, Tab, Tabs as Tabs1 } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import React, { useEffect, useState } from 'react';

import Icon from '@/components/Icon';
import type { ClaimNotesData } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

import Tabs2 from '../OrganizationSelector/Tabs';
import type { SingleSelectDropDownDataType } from '../UI/SingleSelectDropDown';

export interface ViewNotesDrawerProps {
  claimNoteData: SingleSelectDropDownDataType[];
  peopleData: SingleSelectDropDownDataType[];
  claimDetailData: ClaimNotesData[];
  onClose: () => void;
  openViewNote: boolean;
  onCreateNoteClick: () => void;
  onViewNoteDetailClick: (data: ClaimNotesData) => void;
  tabs: any[];
}

export default function ViewNotesDrawer({
  onClose,
  claimNoteData,
  openViewNote = false,
  peopleData,
  claimDetailData,
  onCreateNoteClick,
  onViewNoteDetailClick,
  tabs,
}: ViewNotesDrawerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<
    SingleSelectDropDownDataType[] | []
  >([]);
  const [claimFilteredData, setClaimFilteredData] = useState<
    ClaimNotesData[] | undefined
  >([]);
  const [applyFilter, setApplyFilter] = useState<
    SingleSelectDropDownDataType[] | []
  >([]);
  const [currentTab, setCurrentTab] = useState(
    tabs.filter((m) => m.id === 1)[0]
  );
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setSelectedFilter(applyFilter);
    setCurrentTab(tabs[0]);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setSelectedFilter([]);
  };
  useEffect(() => {
    if (tabs) {
      setCurrentTab(tabs.filter((m) => m.id === 1)[0]);
    }
  }, [tabs]);
  const [selectedTabValue, setSelectedTabValue] = useState('note');
  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSelectedTabValue(newValue);
  };
  const open = Boolean(anchorEl);
  useEffect(() => {
    if (claimDetailData) {
      setClaimFilteredData(claimDetailData);
    }
  }, [claimDetailData]);
  const id = open ? 'simple-popover' : undefined;
  useEffect(() => {
    if (currentTab.id === 3) {
      setClaimFilteredData(
        claimDetailData.filter((m) => m.category === 'claim')
      );
    }
    if (currentTab.id === 2) {
      setClaimFilteredData(
        claimDetailData.filter((m) => m.category === 'patient')
      );
    }
    if (currentTab.id === 1) {
      setClaimFilteredData(claimDetailData);
    }
  }, [currentTab]);
  return (
    <Drawer
      sx={{
        width: '32%',
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: '32%',
          boxSizing: 'border-box',
        },
        '& .MuiIconButton-root': {
          display: 'none',
        },
      }}
      anchor="right"
      variant="persistent"
      open={openViewNote}
      onClose={() => {
        setApplyFilter([]);
        onClose();
      }}
    >
      <div className="flex h-full w-full flex-row self-end">
        <div className="h-full w-[14px] flex-none border-x border-solid  border-gray-400 bg-gray-300"></div>
        <div className="inline-flex h-full w-full flex-col  bg-white shadow">
          <div className="inline-flex h-[76px] w-full  justify-between space-x-20 border-b border-gray-300 bg-gray-50 p-6">
            <div className="flex space-x-4">
              <p className="text-lg font-medium leading-7 text-gray-900">
                Notes
              </p>
              <div
                className="flex items-center justify-center rounded-md bg-cyan-500 px-4 py-2 shadow"
                onClick={onCreateNoteClick}
              >
                <p className="text-sm font-medium leading-tight text-white">
                  Add Note
                </p>
              </div>
            </div>
            <div
              className="h-[20px] rounded-md border border-gray-300 bg-white"
              onClick={() => {
                setApplyFilter([]);
                onClose();
              }}
            >
              <Icon name={'close'} size={18} />
            </div>
          </div>
          <div className="">
            <div className="no-scrollbar h-[56px] w-full overflow-x-auto bg-white  px-6 ">
              <Tabs2
                tabs={tabs}
                currentTab={currentTab}
                onChangeTab={(newTab: any) => setCurrentTab(newTab)}
              />
            </div>
          </div>
          <div className=" inline-flex h-[54px] w-full items-start justify-start space-x-4 bg-cyan-50 px-6 py-2">
            <div className="hidden w-96 flex-initial justify-center px-2 md:flex">
              <div className="flex w-full max-w-lg flex-col justify-center">
                <label htmlFor="search" className="sr-only">
                  Search
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon name={'search'} size={16} />
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 leading-5 text-gray-500 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-white sm:text-sm"
                    placeholder="Search"
                    onChange={(e) => {
                      const searchValue = e.target.value;
                      if (searchValue && searchValue.length > 0) {
                        if (
                          applyFilter &&
                          applyFilter.length > 0 &&
                          claimDetailData
                        ) {
                          const filterClaimDetailData = claimDetailData.filter(
                            (elem) =>
                              (applyFilter.find(
                                (a) => elem.noteTypeID === a.id
                              ) ||
                                applyFilter.find(
                                  (a) => elem.createdByIDS === a.id.toString()
                                )) &&
                              JSON.stringify(elem)
                                .toLowerCase()
                                .indexOf(searchValue.toLowerCase()) !== -1
                          );
                          setClaimFilteredData(filterClaimDetailData);
                        } else {
                          const data = claimDetailData.filter(
                            (a) =>
                              JSON.stringify(a)
                                .toLowerCase()
                                .indexOf(searchValue.toLowerCase()) !== -1
                          );
                          setClaimFilteredData(data);
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center rounded-md bg-white shadow">
              <div>
                <Button
                  aria-describedby={id}
                  variant="contained"
                  onClick={handleClick}
                  style={{
                    border: '1px solid #D1D5DB',
                    boxShadow: 'none',
                    padding: '6px 11px',
                    textTransform: 'none',
                  }}
                  disableRipple
                  className={`!w-[98px] !h-[38px]  !justify-start rounded-md  !text-gray-800 !shadow-none 
                !bg-white  !border !rounded-md !border-gray-300`}
                >
                  <Icon name={'filter'} size={16} />
                  <p className="ml-1.5 text-sm font-medium leading-tight text-gray-500">
                    Filters
                  </p>
                </Button>
                <Popover
                  id={id}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleClose}
                  className="!mt-1"
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                >
                  <div className="h-[400p] w-[400px] items-center    justify-center rounded-md">
                    <div className="border border-gray-300">
                      <Box sx={{ width: '100%' }}>
                        <Tabs1
                          sx={{
                            '& button.Mui-selected': { color: '#06B6D4' },
                          }}
                          TabIndicatorProps={{
                            style: { marginLeft: '2px', background: '#06B6D4' },
                          }}
                          value={selectedTabValue}
                          onChange={handleChange}
                          aria-label="wrapped label tabs example"
                        >
                          <Tab
                            value="note"
                            label={
                              <div className="!ml-7 inline-flex items-start justify-start">
                                <p>Note Type</p>
                                <div
                                  className={classNames(
                                    'ml-2 flex items-center justify-center rounded-full  px-2.5 py-0.5 ',
                                    selectedTabValue === 'note'
                                      ? 'bg-cyan-500'
                                      : 'bg-gray-100'
                                  )}
                                >
                                  <p
                                    className={classNames(
                                      'text-center text-xs font-medium leading-none ',
                                      selectedTabValue === 'note'
                                        ? 'text-blue-50'
                                        : 'text-gray-800'
                                    )}
                                  >
                                    {selectedFilter
                                      ? selectedFilter.filter((a) =>
                                          claimNoteData.includes(a)
                                        ).length
                                      : 0}
                                  </p>
                                </div>
                              </div>
                            }
                            className="!pl-0.5 !text-sm !font-medium !normal-case !leading-tight "
                            wrapped
                            disableRipple
                          />
                          <Tab
                            className="!ml-8 !pl-0.5 !text-sm !font-medium !normal-case !leading-5 "
                            value="people"
                            disableRipple
                            label={
                              <div className=" inline-flex items-start justify-start">
                                <p>People</p>
                                <div
                                  className={classNames(
                                    'ml-2 flex items-center justify-center rounded-full  px-2.5 py-0.5 ',
                                    selectedTabValue === 'people'
                                      ? 'bg-cyan-500'
                                      : 'bg-gray-100'
                                  )}
                                >
                                  <p
                                    className={classNames(
                                      'text-center text-xs font-medium leading-none ',
                                      selectedTabValue === 'people'
                                        ? 'text-blue-50'
                                        : 'text-gray-800'
                                    )}
                                  >
                                    {selectedFilter
                                      ? selectedFilter.filter((a) =>
                                          peopleData.includes(a)
                                        ).length
                                      : 0}
                                  </p>
                                </div>
                              </div>
                            }
                          />
                        </Tabs1>
                      </Box>
                      {/* selected filter */}
                    </div>
                    <div className="inline-flex h-[239px] w-[400px] flex-col items-center justify-start overflow-y-auto overflow-x-hidden">
                      {claimNoteData &&
                        selectedTabValue === 'note' &&
                        claimNoteData.map((noteData) => (
                          <>
                            <div
                              className="inline-flex items-center justify-center"
                              onClick={() => {
                                if (
                                  selectedFilter &&
                                  selectedFilter?.filter(
                                    (a) => a.id === noteData.id
                                  ).length > 0
                                ) {
                                  const removeData = selectedFilter.findIndex(
                                    (a) => a.id === noteData.id
                                  );
                                  selectedFilter.splice(removeData, 1);
                                  setSelectedFilter([...selectedFilter]);
                                } else {
                                  setSelectedFilter([
                                    ...selectedFilter,
                                    noteData,
                                  ]);
                                }
                              }}
                            >
                              <div className="ml-4  inline-flex">
                                {selectedFilter &&
                                  selectedFilter?.filter(
                                    (a) => a.id === noteData.id
                                  ).length > 0 && (
                                    <Icon name={'tick'} size={14} />
                                  )}
                              </div>
                              <div
                                className={classNames(
                                  'inline-flex h-[36px] w-[400px] items-center space-x-1.5 py-2 ',
                                  selectedFilter &&
                                    selectedFilter?.filter(
                                      (a) => a.id === noteData.id
                                    ).length > 0
                                    ? 'pl-3'
                                    : 'pl-6'
                                )}
                              >
                                <p className="text-sm font-semibold leading-5 text-gray-900">
                                  {noteData.value}
                                </p>
                              </div>
                            </div>
                          </>
                        ))}
                      {peopleData &&
                        selectedTabValue === 'people' &&
                        peopleData.map((people) => (
                          <>
                            <div
                              className="inline-flex items-center justify-center"
                              onClick={() => {
                                if (
                                  selectedFilter &&
                                  selectedFilter?.filter(
                                    (a) => a.id === people.id
                                  ).length > 0
                                ) {
                                  const removeData = selectedFilter.findIndex(
                                    (a) => a.id === people.id
                                  );
                                  selectedFilter.splice(removeData, 1);
                                  setSelectedFilter([...selectedFilter]);
                                } else {
                                  setSelectedFilter([
                                    ...selectedFilter,
                                    people,
                                  ]);
                                }
                              }}
                            >
                              <div className="ml-4  inline-flex">
                                {selectedFilter &&
                                  selectedFilter?.filter(
                                    (a) => a.id === people.id
                                  ).length > 0 && (
                                    <Icon name={'tick'} size={14} />
                                  )}
                              </div>
                              <div
                                className={classNames(
                                  'inline-flex h-[36px] w-[400px] items-center space-x-1.5 py-2 ',
                                  selectedFilter &&
                                    selectedFilter?.filter(
                                      (a) => a.id === people.id
                                    ).length > 0
                                    ? 'pl-3'
                                    : 'pl-6'
                                )}
                              >
                                <p className="">
                                  <span className="text-sm font-semibold leading-5 text-gray-900">
                                    {people.value}
                                  </span>
                                  <span className="text-sm font-normal italic leading-5 text-gray-500">
                                    {`  ${' - '} ${people.appendText}`}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </>
                        ))}
                    </div>
                    <div className="flex min-h-[36px] w-[400px] flex-wrap items-center justify-start space-x-2 border bg-gray-50 p-2">
                      {selectedFilter &&
                        selectedFilter.map((filterData) => (
                          <div
                            key={filterData.id}
                            className=" my-1 flex flex-wrap items-center justify-center space-x-0.5 rounded bg-cyan-100 pl-2 pr-0.5 "
                          >
                            <p className="text-center text-xs font-medium leading-none text-cyan-700">
                              {filterData.value}
                              {filterData.appendText && (
                                <span>{`  ${' - '} ${
                                  filterData.appendText
                                }`}</span>
                              )}
                            </p>
                            <div
                              className="flex items-start justify-start rounded-full p-1"
                              onClick={() => {
                                if (
                                  selectedFilter &&
                                  selectedFilter?.filter(
                                    (a) => a.id === filterData.id
                                  ).length > 0
                                ) {
                                  const removeData = selectedFilter.findIndex(
                                    (a) => a.id === filterData.id
                                  );
                                  selectedFilter.splice(removeData, 1);
                                  setSelectedFilter([...selectedFilter]);
                                }
                              }}
                            >
                              <Icon
                                name={'close'}
                                color={IconColors.Cyan}
                                size={10}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                    {/* Button ui */}

                    <div className=" inline-flex h-[70px] w-[400px] items-center justify-end space-x-2 bg-gray-50 p-4">
                      <div
                        onClick={handleClose}
                        className="flex w-1/4 items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 shadow"
                      >
                        <p className="text-sm font-medium leading-tight text-gray-700">
                          Cancel
                        </p>
                      </div>
                      <div
                        className="flex w-[103px] items-center justify-center rounded-md bg-cyan-500  p-2 shadow"
                        onClick={() => {
                          setAnchorEl(null);
                          setApplyFilter(selectedFilter);
                          if (selectedFilter && selectedFilter.length > 0) {
                            const filterClaimDetailData =
                              claimDetailData.filter(
                                (elem) =>
                                  selectedFilter.find(
                                    (a) => elem.noteTypeID === a.id
                                  ) ||
                                  selectedFilter.find(
                                    (a) => elem.createdByIDS === a.id.toString()
                                  )
                              );
                            setClaimFilteredData(filterClaimDetailData);
                          } else {
                            setClaimFilteredData(claimDetailData);
                          }
                          setSelectedFilter([]);
                        }}
                      >
                        <p className="text-sm font-medium leading-tight text-white">
                          Apply Filters
                        </p>
                      </div>
                    </div>
                  </div>
                </Popover>
              </div>
            </div>
          </div>
          <div className="flex min-h-[52px] w-full  flex-wrap border-y  border-gray-300 bg-gray-50">
            <div className="flex flex-wrap items-center justify-start pl-6">
              <p className=" w-[87px] items-center justify-center text-sm font-bold leading-tight text-gray-600">
                Active filters:
              </p>
              {applyFilter &&
                applyFilter.map((filterData) => (
                  <>
                    <div
                      key={filterData.id}
                      className="mr-2 flex min-h-[20px]  flex-wrap items-center justify-center space-x-1 rounded bg-cyan-100 py-0.5 pl-2 pr-1"
                    >
                      <p className="text-center text-xs font-medium leading-none text-cyan-700">
                        {filterData.value}
                      </p>
                      <div
                        className="flex items-start justify-start rounded-full p-1"
                        onClick={() => {
                          if (
                            applyFilter &&
                            applyFilter?.filter((a) => a.id === filterData.id)
                              .length > 0
                          ) {
                            const removeData = applyFilter.findIndex(
                              (a) => a.id === filterData.id
                            );
                            applyFilter.splice(removeData, 1);
                            setApplyFilter([...applyFilter]);
                          }
                          if (applyFilter && applyFilter.length > 0) {
                            const filterClaimDetailData =
                              claimDetailData.filter(
                                (elem) =>
                                  applyFilter.find(
                                    (a) => elem.noteTypeID === a.id
                                  ) ||
                                  applyFilter.find(
                                    (a) => elem.createdByIDS === a.id.toString()
                                  )
                              );
                            setClaimFilteredData(filterClaimDetailData);
                          } else {
                            setClaimFilteredData(claimDetailData);
                          }
                        }}
                      >
                        <Icon color={IconColors.Cyan} name={'close'} size={8} />
                      </div>
                    </div>
                  </>
                ))}
            </div>
          </div>
          <div className="inline-flex h-full flex-col items-start justify-start overflow-y-auto overflow-x-hidden">
            <div className="flex h-full w-full flex-col ">
              {claimFilteredData ? (
                <>
                  {claimFilteredData &&
                  claimFilteredData.filter((m) => m.category === 'claim')
                    .length ? (
                    <div className="w-full bg-gray-100 py-[4px] px-[16px] text-xs font-normal leading-4 text-gray-500">
                      Claim Notes
                    </div>
                  ) : (
                    <></>
                  )}
                  {claimFilteredData &&
                  claimFilteredData.filter((m) => m.category === 'claim')
                    .length ? (
                    claimFilteredData
                      .filter((m) => m.category === 'claim')
                      .map((notesData) => (
                        <>
                          <div
                            key={notesData.id}
                            className="inline-flex h-[96px] w-full items-start  justify-between border-b border-gray-200 py-4 pl-6 pr-4"
                          >
                            <div className="flex items-center justify-start">
                              <div className="inline-flex h-[34px] w-[34px] flex-col items-center justify-center ">
                                <div className="flex w-full flex-1 flex-col items-center justify-center rounded-full bg-gray-100 shadow">
                                  <Icon name={'userNote'} size={20} />
                                </div>
                              </div>
                              <div className="ml-4 inline-flex flex-col items-start justify-start">
                                <p className="text-base font-semibold leading-normal">
                                  {notesData.createdBy}
                                </p>
                                <p className="text-sm font-bold leading-tight text-gray-800">
                                  {notesData.noteType}
                                </p>
                                <p className="w-[261px] truncate text-sm leading-tight text-gray-500">
                                  {notesData.comment}
                                </p>
                              </div>
                            </div>
                            <div className="inline-flex h-full flex-col items-end justify-between">
                              <p className="mt-1 text-xs leading-3 text-gray-500">
                                {new Intl.DateTimeFormat('en-US', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                }).format(new Date(notesData.createdOn))}
                              </p>
                              <p
                                className="text-sm leading-tight text-cyan-500"
                                onClick={() => {
                                  onViewNoteDetailClick(notesData);
                                }}
                              >
                                View Note
                              </p>
                            </div>
                          </div>
                        </>
                      ))
                  ) : (
                    <></>
                  )}
                  {claimFilteredData &&
                  claimFilteredData.filter((m) => m.category === 'patient')
                    .length ? (
                    <div className="w-full bg-gray-100 py-[4px] px-[16px] text-xs font-normal leading-4 text-gray-500">
                      Patient Notes
                    </div>
                  ) : (
                    <></>
                  )}
                  {claimFilteredData &&
                  claimFilteredData.filter((s) => s.category === 'patient')
                    .length ? (
                    claimFilteredData
                      .filter((k) => k.category === 'patient')
                      .map((r) => (
                        <>
                          <div
                            key={r.id}
                            className="inline-flex h-[96px] w-full items-start  justify-between border-b border-gray-200 py-4 pl-6 pr-4"
                          >
                            <div className="flex items-center justify-start">
                              <div className="inline-flex h-[34px] w-[34px] flex-col items-center justify-center ">
                                <div className="flex w-full flex-1 flex-col items-center justify-center rounded-full bg-gray-100 shadow">
                                  <Icon name={'userNote'} size={20} />
                                </div>
                              </div>
                              <div className="ml-4 inline-flex flex-col items-start justify-start">
                                <p className="text-base font-semibold leading-normal">
                                  {r.createdBy}
                                </p>
                                <p className="text-sm font-bold leading-tight text-gray-800">
                                  {r.noteType}
                                </p>
                                <p className="w-[261px] truncate text-sm leading-tight text-gray-500">
                                  {r.comment}
                                </p>
                              </div>
                            </div>
                            <div className="inline-flex h-full flex-col items-end justify-between">
                              <p className="mt-1 text-xs leading-3 text-gray-500">
                                {new Intl.DateTimeFormat('en-US', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                }).format(new Date(r.createdOn))}
                              </p>
                              <p
                                className="text-sm leading-tight text-cyan-500"
                                onClick={() => {
                                  onViewNoteDetailClick(r);
                                }}
                              >
                                View Note
                              </p>
                            </div>
                          </div>
                        </>
                      ))
                  ) : (
                    <></>
                  )}
                </>
              ) : (
                <div className="py-[16px] px-[38px] text-sm font-normal leading-5 text-gray-500">
                  {
                    'Currently, no Patient or Claim notes have been added to this claim. Click the “Add Note” button to add one.'
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
