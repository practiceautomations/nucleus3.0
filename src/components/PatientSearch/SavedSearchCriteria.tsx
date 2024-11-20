import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import Icon from '@/components/Icon';
import Button, { ButtonType } from '@/components/UI/Button';
import CloseButton from '@/components/UI/CloseButton';
import { addToastNotification } from '@/store/shared/actions';
import {
  addSavedReport,
  deleteSavedReport,
  getSavedSearchList,
  renameSavedReport,
} from '@/store/shared/sagas';
import type { SavedSearchs } from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { StringToDatePipe } from '@/utils/dateConversionPipes';

import Modal from '../UI/Modal';
import StatusModal, { StatusModalType } from '../UI/StatusModal';
import SavedReportModel from './SavedReportModel';

type SavedSearchProps = {
  onApply: (params: any) => void;
  addNewButtonActive: Boolean | undefined;
  jsonValue?: any;
  moduleUrl?: string;
};
const SavedSearchModel = ({
  onApply,
  addNewButtonActive,
  jsonValue,
  moduleUrl,
}: SavedSearchProps) => {
  const [valueSavedReport, setvalueSavedReport] = useState<string>();
  const [popUpButtonText, setPopUpButtonText] = useState<string>();
  const [statusModalType, setStatusModalType] = useState<StatusModalType>();
  const [selected, setSelected] = useState<number | null | undefined>();
  const [popUpHeadingValue, setPopUpHeadingValue] = useState<string>();
  const [popUpDescriptionValue, setPopUpDescriptionValue] = useState<string>();
  const [btnText, setBtnText] = useState<string>();
  const [btnType, setBtnType] = useState<ButtonType>();
  const [showCloseButton, setShowCloseButton] = useState<boolean>();
  const [patientSavedSearchs, setSavedSearchs] = useState<SavedSearchs[]>([]);
  const [onChangeDelete, setOnChangeDelete] = useState<boolean>();
  const [isSavedReportErrorModalOpen, setIsSavedReportErrorModalOpen] =
    useState(false);
  const [renderSate, setRenderSate] = useState('main');
  const [saveSearchModelOpen, setSaveSearchModelOpen] = useState(false);
  const [newSavedSearch, setNewSavedSearch] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>();
  const dispatch = useDispatch();
  const getSavedSearch = async () => {
    const path = moduleUrl || window.location.pathname;
    const res = await getSavedSearchList(path);
    if (res) setSavedSearchs(res);
  };
  useEffect(() => {
    getSavedSearch();
  }, []);
  const onClose = () => {
    setSaveSearchModelOpen(false);
  };
  const mainView = () => {
    return (
      <div className="flex flex-col bg-gray-100">
        <div className="max-w-full bg-gray-300 p-4">
          <div className="flex flex-row justify-between">
            <div>
              <h1 className=" text-left  text-xl font-bold leading-7 text-gray-700">
                Saved Search
              </h1>
            </div>
            <div className="">
              <CloseButton onClick={onClose} />
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className=" px-6 pt-6">
            <div className={` items-end  `}>
              <div className={`  flex flex-row justify-between `}>
                <div>
                  <div className="h-[38px] text-left font-medium leading-5 text-gray-700">
                    Select a search profile to apply
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (selected) {
                        setRenderSate('edit');
                        setPopUpHeadingValue('Rename Saved Serach');
                        setPopUpButtonText('Save');
                        const label = patientSavedSearchs
                          .filter((header) =>
                            selected === header.id ? header.label : ''
                          )
                          .map((a) => a.label);
                        setvalueSavedReport(
                          label && label.length > 0 ? label[0] : undefined
                        );
                      } else {
                        dispatch(
                          addToastNotification({
                            text: 'Please Select Saved Search to Rename',
                            toastType: ToastType.ERROR,
                            id: '',
                          })
                        );
                      }
                    }}
                    disabled={!selected}
                    buttonType={ButtonType.secondary}
                    cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                  >
                    <Icon name={'pencil'} size={18} color={IconColors.GRAY} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (selected) {
                        setRenderSate('delete');
                        setBtnType(ButtonType.tertiary);
                        setIsSavedReportErrorModalOpen(true);
                        setStatusModalType(StatusModalType.WARNING);
                        setPopUpHeadingValue('Delete Saved Search?');
                        setBtnText('Delete');
                        setShowCloseButton(true);
                        setPopUpDescriptionValue(
                          'Would you like to permanently delete this saved search? Once deleted, it cannot be recovered.'
                        );
                        setOnChangeDelete(true);
                      } else {
                        dispatch(
                          addToastNotification({
                            text: 'Please Select Saved Search to Delete',
                            toastType: ToastType.ERROR,
                            id: '',
                          })
                        );
                      }
                    }}
                    disabled={!selected}
                    buttonType={ButtonType.secondary}
                    cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                  >
                    <Icon name={'trash'} size={18} color={IconColors.NONE} />
                  </Button>
                  <Button
                    data-testid="add-pat"
                    buttonType={ButtonType.secondary}
                    cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                    onClick={() => {
                      if (addNewButtonActive) {
                        setSaveSearchModelOpen(true);
                        setNewSavedSearch(true);
                        setRenderSate('edit');
                        setPopUpHeadingValue('Set New Saved Serach Name');
                        setPopUpButtonText('Create');
                      }
                    }}
                    disabled={!addNewButtonActive}
                  >
                    <Icon name={'plus1'} size={18} color={IconColors.GRAY} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col p-[24px] px-6">
            <div>
              <label className="flex text-sm font-medium leading-5 text-gray-700">
                List of saved searches:
              </label>
            </div>
            <div className=" flex h-36 flex-col overflow-y-auto rounded-md  border border-gray-300 bg-white ">
              <div className="pt-2">
                {patientSavedSearchs.map((header) => (
                  <>
                    <div
                      // className="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"
                      onClick={() => {
                        setSelected(header?.id);
                        setSelectedItem(header.value);
                      }}
                      className={
                        header.id === selected
                          ? 'h-[32px] text-left text-sm leading-loose  hover:bg-cyan-500 bg-cyan-400'
                          : 'h-[32px] text-left text-sm leading-loose  hover:bg-gray-100'
                      }
                    >
                      <span className="pl-5"> {header.label}</span>
                    </div>
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className={`h-[120px] bg-gray-200 w-full`}>
          <div className="flex flex-row-reverse gap-4 p-6 ">
            <div>
              <Button
                buttonType={
                  selected ? ButtonType.primary : ButtonType.secondary
                }
                onClick={() => {
                  const params = selectedItem
                    ? JSON.parse(selectedItem, (_key, value) => {
                        if (typeof value === 'string') {
                          const date = StringToDatePipe(value);
                          if (date) return date;
                        }
                        return value;
                      })
                    : undefined;
                  onApply(params);
                  onClose();
                }}
                disabled={!selected}
              >
                Apply Search
              </Button>
            </div>
            <div>
              <Button
                buttonType={ButtonType.secondary}
                cls={`w-[102px]`}
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const editView = () => {
    return (
      <>
        <SavedReportModel
          onchange={(e) => {
            setvalueSavedReport(e.target.value);
          }}
          value={valueSavedReport}
          savedReportHeading={popUpHeadingValue}
          onClose={() => {
            if (!newSavedSearch) {
              setRenderSate('main');
              setvalueSavedReport('');
            }
            if (newSavedSearch) {
              setvalueSavedReport('');
              setNewSavedSearch(false);
              setSaveSearchModelOpen(false);
            }
          }}
          createButton={popUpButtonText}
          onClick={async () => {
            if (!valueSavedReport) {
              dispatch(
                addToastNotification({
                  text: 'Name cannot be empty',
                  toastType: ToastType.ERROR,
                  id: '',
                })
              );
              return;
            }
            if (valueSavedReport && !newSavedSearch) {
              const id = patientSavedSearchs
                .filter((header) =>
                  selected === header.id ? header.label : ''
                )
                .map((a) => a.id);
              const value = patientSavedSearchs
                .filter((header) =>
                  selected === header.id ? header.label : ''
                )
                .map((a) => a.value);
              const savedSearch = {
                id: id && id.length > 0 ? id[0] : undefined,
                label: valueSavedReport,
                value: value && value.length > 0 ? value[0] : undefined,
              };
              const res = await renameSavedReport(savedSearch);
              setRenderSate('main');
              setvalueSavedReport('');
              getSavedSearch();
              setSelected(null);
              if (res === false) {
                setIsSavedReportErrorModalOpen(true);
                setPopUpHeadingValue('Error');
                setBtnType(ButtonType.primary);
                setRenderSate('delete');
                setStatusModalType(StatusModalType.ERROR);
                setPopUpDescriptionValue(
                  'A system error prevented the Saved Search to be renamed. Please try again.'
                );
                setBtnText('Ok');
                setShowCloseButton(false);
                setOnChangeDelete(false);
              }
            }
            if (valueSavedReport && newSavedSearch) {
              const savedSearch = {
                label: valueSavedReport,
                value: jsonValue,
                moduleUrl: moduleUrl || window.location.pathname,
              };
              const res = await addSavedReport(savedSearch);
              setvalueSavedReport('');
              setNewSavedSearch(false);
              setSaveSearchModelOpen(false);
              getSavedSearch();
              if (res === false) {
                setNewSavedSearch(true);
                setIsSavedReportErrorModalOpen(true);
                setPopUpHeadingValue('Error');
                setBtnType(ButtonType.primary);
                setRenderSate('delete');
                setStatusModalType(StatusModalType.ERROR);
                setPopUpDescriptionValue(
                  'A system error prevented the Saved Search to be created. Please try again.'
                );
                setBtnText('Ok');
                setShowCloseButton(false);
                setOnChangeDelete(false);
              }
            }
          }}
        />
      </>
    );
  };

  const deleteView = () => {
    return (
      <>
        <StatusModal
          open={isSavedReportErrorModalOpen}
          statusModalType={statusModalType}
          showCloseButton={showCloseButton}
          heading={popUpHeadingValue}
          okButtonText={btnText}
          closeButtonText="Cancel"
          closeOnClickOutside={false}
          okButtonColor={btnType}
          onClose={() => {
            setRenderSate('main');
            setIsSavedReportErrorModalOpen(false);
          }}
          description={popUpDescriptionValue}
          onChange={async () => {
            if (onChangeDelete === true) {
              const id = patientSavedSearchs
                .filter((header) =>
                  selected === header.id ? header.label : ''
                )
                .map((a) => a.id);
              const res = await deleteSavedReport(
                id && id.length > 0 ? id[0] : undefined
              );
              getSavedSearch();
              setIsSavedReportErrorModalOpen(false);
              setSelected(null);
              setRenderSate('main');
              if (res === false) {
                setIsSavedReportErrorModalOpen(true);
                setPopUpHeadingValue('Error');
                setBtnType(ButtonType.primary);
                setRenderSate('delete');
                setStatusModalType(StatusModalType.ERROR);
                setPopUpDescriptionValue(
                  'A system error prevented the Saved Search to be deleted. Please try again.'
                );
                setBtnText('Ok');
                setShowCloseButton(false);
                setOnChangeDelete(false);
              }
            }
            if (!onChangeDelete && !newSavedSearch) {
              setIsSavedReportErrorModalOpen(false);
              setRenderSate('main');
            }
            if (!onChangeDelete && newSavedSearch) {
              setIsSavedReportErrorModalOpen(false);
              setSaveSearchModelOpen(false);
            }
          }}
        />
      </>
    );
  };

  return (
    <>
      <div className={`gap-1 w-auto`}>
        <div className={`w-full gap-8 flex flex-row items-start self-stretch`}>
          <div className="w-[169px]">
            <Button
              buttonType={ButtonType.secondary}
              onClick={async () => {
                setSaveSearchModelOpen(true);
                setRenderSate('main');
              }}
              cls="inline-flex space-x-2 h-[38px] items-center justify-center w-48 py-1 px-1 bg-white shadow border rounded-md border-gray-300 focus:!ring-cyan-500"
            >
              <Icon
                className="h-full w-5 rounded-lg"
                name="saveSearch"
                size={16}
              />
              <p className="text-sm font-medium leading-tight text-gray-700">
                Saved Searches
              </p>
              <div className="flex items-center justify-center rounded-full bg-gray-100 px-2.5 py-0.5">
                <p className="text-center text-xs font-medium leading-none text-gray-800">
                  {patientSavedSearchs.length}
                </p>
              </div>
            </Button>
          </div>
          <Button
            buttonType={ButtonType.secondary}
            cls={classNames(
              'focus:!ring-cyan-500 h-[38px] w-[38px] flex items-center justify-center !px-2 !py-1 gap-2 leading-5',
              addNewButtonActive ? 'bg-white' : 'bg-gray-100'
            )}
            onClick={() => {
              if (addNewButtonActive) {
                setSaveSearchModelOpen(true);
                setNewSavedSearch(true);
                setRenderSate('edit');
                setPopUpHeadingValue('Set New Saved Search Name');
                setPopUpButtonText('Create');
              }
            }}
            disabled={!addNewButtonActive}
          >
            <Icon name={'plus1'} size={18} color={IconColors.GRAY} />
          </Button>
        </div>
      </div>
      {renderSate !== 'delete' ? (
        <Modal
          open={saveSearchModelOpen}
          onClose={() => {}}
          modalContentClassName={classNames(
            renderSate === 'main' ? 'w-[1000px]' : 'w-[512px]',
            'relative overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full'
          )}
          modalClassName={'!z-[13]'}
        >
          {renderSate === 'main' && mainView()}
          {renderSate === 'edit' && editView()}
        </Modal>
      ) : (
        deleteView()
      )}
    </>
  );
};

export default SavedSearchModel;
