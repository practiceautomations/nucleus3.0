import Drawer from '@mui/material/Drawer';
import React, { useEffect, useState } from 'react';

import Icon from '@/components/Icon';
import type { ClaimNotesData } from '@/store/shared/types';
import classNames from '@/utils/classNames';

import TextArea from '../TextArea';

export interface ClaimNoteDetailProps {
  open: boolean;
  onClose: () => void;
  noteDetailData: ClaimNotesData | undefined;
  onEditNoteSaveClick: (value: string) => void;
}
export default function ClaimNoteDetail({
  onEditNoteSaveClick,
  open,
  onClose,
  noteDetailData,
}: ClaimNoteDetailProps) {
  const [editNote, setEditNote] = useState<string>();
  const [showEditNote, setshowEditNote] = useState(false);
  useEffect(() => {
    if (noteDetailData) {
      setEditNote('');
      setshowEditNote(false);
    }
  }, [noteDetailData]);
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => {
        setEditNote('');
        setshowEditNote(false);
        onClose();
      }}
    >
      <div className="inline-flex h-full flex-col items-center justify-start overflow-x-hidden bg-white shadow">
        <div className="inline-flex h-[76px] w-[448px] items-center justify-between space-x-20 border border-gray-200 bg-gray-50 p-6">
          <div className="flex items-center justify-start space-x-4">
            <div
              onClick={() => {
                setEditNote('');
                setshowEditNote(false);
                onClose();
              }}
              className="mt-1.5"
            >
              {' '}
              <Icon name={'chevronLeft'} size={18} />
            </div>
            <p className="text-lg font-medium leading-7 text-gray-900">
              {noteDetailData && noteDetailData.noteType}
            </p>
          </div>
          <div
            className="h-[20px] rounded-md border border-gray-300 bg-white"
            onClick={() => {
              setEditNote('');
              setshowEditNote(false);
              onClose();
            }}
          >
            <Icon name={'close'} size={18} />
          </div>
        </div>
        <div className="inline-flex h-[264px] w-[448px] flex-col items-start justify-start">
          <div className="h-[52px] w-[448px] bg-white">
            <div className="inline-flex h-[52px] w-[448px] items-start justify-start px-6 py-4">
              <div className="flex h-[20px] w-[400px] items-center justify-center space-x-4">
                <div className="h-0.5 flex-1 bg-gray-300" />
                <p className="text-center text-sm font-semibold leading-tight text-gray-500">
                  {noteDetailData &&
                    new Intl.DateTimeFormat('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: '2-digit',
                    }).format(new Date(noteDetailData.createdOn))}
                </p>
                <div className="h-0.5 flex-1 bg-gray-300" />
              </div>
            </div>
          </div>
          <div className="flex h-full w-[448px] flex-col items-start justify-start bg-white">
            <div className="inline-flex h-full w-[448px] items-start justify-start px-6 py-4">
              <div className="inline-flex flex-col  items-end justify-start space-y-2">
                <div className="inline-flex w-[448px] items-start  justify-start space-x-4">
                  <div className="inline-flex h-[34px] w-[34px] flex-col items-center justify-center ">
                    <div className="flex h-[34px] w-[34px]  flex-1 flex-col items-center justify-center rounded-full bg-gray-100 shadow">
                      <Icon name={'userNote'} size={20} />
                    </div>
                  </div>
                  <div className="inline-flex flex-col items-start justify-start">
                    <p className="text-sm font-semibold leading-tight">
                      {noteDetailData && noteDetailData.createdBy}
                    </p>
                    <p className="w-full pr-12 text-sm leading-tight text-gray-700">
                      {noteDetailData && noteDetailData.comment}
                    </p>
                  </div>
                </div>
                <div className="mr-12 flex flex-col items-end justify-start space-y-2">
                  <p className="text-xs leading-3 text-gray-500">
                    {noteDetailData &&
                      new Intl.DateTimeFormat('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(
                        new Date(noteDetailData ? noteDetailData.createdOn : '')
                      )}
                  </p>
                  <span
                    onClick={() => {
                      setshowEditNote(true);
                      setEditNote(noteDetailData ? noteDetailData.comment : '');
                    }}
                    className="text-xs leading-3 text-cyan-500"
                  >
                    Edit Note
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={classNames(
          'inline-flex h-[240px] w-[448px] items-end justify-end space-x-4 bg-gray-100 p-6 ',
          !showEditNote ? 'hidden' : 'undefined'
        )}
      >
        <TextArea
          id="textarea"
          value={editNote}
          cls="!w-72 text-sm leading-tight text-gray-500 flex-1 h-full px-3 py-2 bg-white shadow border rounded-md border-gray-300"
          placeholder={'Click here to write note'}
          onChange={(e) => {
            setEditNote(e.target.value);
          }}
        />
        <div
          className="flex w-1/4 items-center justify-center rounded-md bg-cyan-500 px-4 py-2 shadow"
          onClick={() => {
            onEditNoteSaveClick(editNote || '');
          }}
        >
          <p className="text-sm font-medium leading-tight text-white">Save</p>
        </div>
      </div>
    </Drawer>
  );
}
