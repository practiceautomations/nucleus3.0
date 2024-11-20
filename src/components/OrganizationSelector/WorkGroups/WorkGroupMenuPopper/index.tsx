import { Popover } from '@mui/material';
import * as React from 'react';
import { useState } from 'react';

import Icon from '@/components/Icon';
import Modal from '@/components/UI/Modal';
import type { WorkGroupsData } from '@/store/chrome/types';
import classNames from '@/utils/classNames';
import type { IconColors } from '@/utils/ColorFilters';

import DeleteWorkgroupForm from '../DeleteWorkGroupForm';
import RenameWorkgroupForm from '../RenameWorkGroupForm';

interface DataType {
  id: number;
  title: string;
  showBottomDivider: boolean;
}
interface Tprops {
  dataList: DataType[];
  onDelete: () => void;
  cls?: string;
  iconColor?: IconColors | undefined;
  workGroup: WorkGroupsData;
}
export default function WorkGroupMenuPopper({
  dataList,
  iconColor,
  workGroup,
  onDelete,
}: Tprops) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const open = Boolean(anchorEl);
  const id = open ? 'menu' : undefined;
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <div style={{}}>
      <button
        className="relative flex "
        aria-describedby={id}
        onClick={handleClick}
      >
        <Icon
          name="ellipsisHorizontal"
          className="pr-10"
          size={13}
          color={iconColor}
        />
      </button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        className=""
      >
        <div className="ring-opacity/5 top-12 z-40 w-[224px] py-1 shadow-lg ring-1  ring-black">
          <div className="flex flex-col">
            {!!dataList &&
              dataList.map((d) => (
                <div
                  key={d.id}
                  className="inline-flex w-56 items-center justify-between space-x-3 px-4 py-2 "
                  onClick={() => {
                    if (d.id === 2) {
                      setIsModalOpen(true);
                      setAnchorEl(null);
                    }
                    if (d.id === 1) {
                      setIsRenameModalOpen(true);
                      setAnchorEl(null);
                    }
                  }}
                >
                  <div className="">
                    <div
                      className={classNames(
                        d.showBottomDivider
                          ? 'border-zinc-100'
                          : 'hover:border-0',
                        'w-full cursor-pointer text-left text-sm leading-5 font-normal text-zinc-800 hover:opacity-75 focus:outline-none'
                      )}
                    >
                      {d.title}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </Popover>
      <>
        <Modal
          open={isModalOpen}
          onClose={() => {}}
          modalContentClassName="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 w-full sm:max-w-lg sm:p-6 "
          modalClassName={'!z-[4]'}
        >
          <DeleteWorkgroupForm
            workGroup={workGroup}
            onClose={(v) => {
              if (v && onDelete) {
                onDelete();
              }
              setIsModalOpen(false);
            }}
          />
        </Modal>
      </>
      <>
        <Modal
          open={isRenameModalOpen}
          onClose={() => {}}
          modalContentClassName="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 w-full sm:max-w-lg sm:p-6 "
          modalClassName={'!z-[4]'}
        >
          <RenameWorkgroupForm
            workGroup={workGroup}
            onClose={() => {
              setIsRenameModalOpen(false);
            }}
          />
        </Modal>
      </>
    </div>
  );
}
