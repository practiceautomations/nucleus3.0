import type { GridColDef } from '@mui/x-data-grid-pro';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import store from '@/store';
import { addToastNotification } from '@/store/shared/actions';
import {
  checkEligibility,
  getEligibilityCheckResponse,
  getPatientInsuranceTabData,
  getPatientLookup,
  patientInsuranceActive,
} from '@/store/shared/sagas';
import { getAllInsuranceDataSelector } from '@/store/shared/selectors';
import {
  type AllInsuranceData,
  type EligibilityRequestData,
  type GetPatientRequestData,
  type PatientInsuranceActiveData,
  type PatientInsuranceTabData,
  type PatientLookupDropdown,
  ToastType,
} from '@/store/shared/types';
import { IconColors } from '@/utils/ColorFilters';
import {
  DateToStringPipe,
  StringToDatePipe,
} from '@/utils/dateConversionPipes';

import Icon from '../Icon';
import Tabs from '../OrganizationSelector/Tabs';
import PatientInsurance from '../PatientInsurance';
import InsuranceFinder from '../PatientTabs/insurancerFinder';
import AppDatePicker from '../UI/AppDatePicker';
import Button, { ButtonType } from '../UI/Button';
import CloseButton from '../UI/CloseButton';
import CrossoverInsurancePayment from '../UI/CrossoverInsurancePayment';
import Modal from '../UI/Modal';
import SearchDetailGrid from '../UI/SearchDetailGrid';
import SectionHeading from '../UI/SectionHeading';
import type { SingleSelectDropDownDataType } from '../UI/SingleSelectDropDown';
import SingleSelectDropDown from '../UI/SingleSelectDropDown';
import type { StatusModalProps } from '../UI/StatusModal';
import StatusModal, { StatusModalType } from '../UI/StatusModal';

export interface PatientInsuranceTabProps {
  patientID: number | null;
  selectedPatientData: GetPatientRequestData;
}

export default function PatientInsuranceTab({
  patientID,
  selectedPatientData,
}: PatientInsuranceTabProps) {
  const [patientlookupData, setPatientlookupData] =
    useState<PatientLookupDropdown>();
  const patientLookupData = async () => {
    const res = await getPatientLookup();
    if (res) {
      setPatientlookupData(res);
    }
  };

  const [selectedInsuranceGridRow, setSelectedInsuranceGridRow] =
    useState<PatientInsuranceTabData>();

  // const [selectedCrossOverChargeId, setSelectedCrossOverChargeId] =
  //    useState<number>();
  const [showCrossoverClaimModal, setShowCrossoverClaimModal] =
    useState<boolean>(false);

  const [insResponsibility, setInsResponsibility] = useState<string>();

  const [isViewInsuranceMode, setIsViewInsuranceMode] = useState(false);
  const [insuranceAllData, setInsuanceAllData] = useState<AllInsuranceData[]>(
    []
  );
  const insuranceData = useSelector(getAllInsuranceDataSelector);

  const [isInsuranceFinderModalOpen, setIsInsuranceFinderModalOpen] =
    useState(false);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [eligibilityCheckData, setEligibilityCheckData] =
    useState<EligibilityRequestData>({
      patientInsuranceID: null,
      insuranceID: null,
      serviceTypeCodeID: null,
      dos: '',
    });
  const onViewEligibilityResponse = (data: string) => {
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(data);
      newTab.document.close();
    }
  };
  const [statusModalState, setStatusModalState] = useState<StatusModalProps>({
    open: false,
    heading: '',
    description: '',
    okButtonText: 'Ok',
    statusModalType: StatusModalType.ERROR,
    showCloseButton: false,
    closeOnClickOutside: false,
  });
  const [insuranceGridRows, setInsuranceGridRows] = useState<
    PatientInsuranceTabData[]
  >([]);
  const insuranceTabs = [
    {
      id: 1,
      name: 'Active',
      count: insuranceGridRows.filter((m) => m.active === true).length,
    },
    {
      id: 2,
      name: 'Inactive',
      count: insuranceGridRows.filter((m) => m.active === false).length,
    },
  ];
  const [selectedInsuranceTab, setSelectedInsuranceTab] = useState(
    insuranceTabs[0]
  );
  const [insuranceDropdownData, setInsruanceDropdownData] = useState<
    SingleSelectDropDownDataType[]
  >([]);
  const getPatientInsuranceData = async () => {
    const res = await getPatientInsuranceTabData(patientID);
    if (res) {
      setInsuranceGridRows(res);
      setInsruanceDropdownData(
        res.map((m) => ({
          id: m.insuranceID,
          value: m.insuranceName,
        }))
      );
    }
  };
  useEffect(() => {
    getPatientInsuranceData();
    patientLookupData();
    setInsuanceAllData(
      insuranceData.filter((m) => m.groupID === selectedPatientData.groupID)
    );
  }, []);
  const [isEligibilityCheckOpen, setIsEligibilityCheckOpen] =
    useState<boolean>(false);
  const checkEligibilityForInsurance = async () => {
    const res = await checkEligibility(eligibilityCheckData);
    if (res) {
      onViewEligibilityResponse(res.response);
      setIsEligibilityCheckOpen(false);
      getPatientInsuranceData();
    }
  };
  const [insuranceInactiveData, setInsuranceInactiveData] = useState({
    open: false,
    patientInsuraceID: 0,
    active: false,
  });
  const columns: GridColDef[] = [
    {
      field: 'insuranceName',
      headerName: 'Insurance Name',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            onClick={() => {
              setSelectedInsuranceGridRow(params.row);
              setIsViewInsuranceMode(false);
              setIsInsuranceModalOpen(true);
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: 'payerResponsibility',
      headerName: 'Payer Responsibility',
      flex: 1,
      minWidth: 170,
      disableReorder: true,
    },
    {
      field: 'insuranceNumber',
      headerName: 'Insurance Number',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'groupNumber',
      headerName: 'Group Number',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'firstName',
      headerName: 'Subscriber Name',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div>
            <> {`${params.value}  ${params.row.lastName}`} </>
          </div>
        );
      },
    },
    {
      field: 'relation',
      headerName: 'Relation',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'active',
      headerName: 'Active',
      flex: 1,
      minWidth: 80,
      disableReorder: true,
      renderCell: (params) => {
        return <div>{params.value ? 'Yes' : 'No'}</div>;
      },
    },
    {
      field: 'checkEligibilityDate',
      headerName: 'Eligibility Checks',
      flex: 1,
      minWidth: 460,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-row  gap-4">
            <div className="self-center">
              {params.value ? (
                <div className=" flex flex-col">
                  <div className="flex flex-row gap-1">
                    <Icon name="greenCheck" size={16} />
                    <div className="text-sm font-medium leading-5 text-green-600">
                      {'Checked'}
                    </div>
                    <div className="text-sm font-normal leading-5 text-gray-500">
                      -
                    </div>
                    <div
                      onClick={async () => {
                        const res = await getEligibilityCheckResponse(
                          params.row.eligibilityRequestID
                        );
                        if (res) {
                          onViewEligibilityResponse(res.eligibilityBenefit);
                        }
                      }}
                      className="text-sm font-normal leading-5 text-cyan-500 underline "
                    >
                      View Report
                    </div>
                  </div>
                  <div>
                    {`${'Last Checked On:'} ${
                      params.row.checkEligibilityDate
                        ? params.row.checkEligibilityDate.split('T')[0]
                        : ''
                    }`}
                  </div>
                </div>
              ) : (
                'Not Checked'
              )}
            </div>
            <div className="text-xs font-normal leading-4">
              <div>
                <Button
                  buttonType={ButtonType.primary}
                  cls={
                    params.value
                      ? 'w-[190px] inline-flex px-4 py-2 gap-2 leading-5 ml-2.5'
                      : 'w-[170px] inline-flex px-4 py-2 gap-2 leading-5 ml-2.5'
                  }
                  onClick={() => {
                    setIsEligibilityCheckOpen(true);
                    setEligibilityCheckData({
                      ...eligibilityCheckData,
                      patientInsuranceID: params.row.id,
                      insuranceID: params.row.insuranceID,
                      serviceTypeCodeID: 29,
                      dos: DateToStringPipe(new Date(), 1),
                    });
                  }}
                >
                  <Icon name={'shieldCheck'} size={18} />
                  {params.value ? (
                    <p className="mt-[2px] self-center text-xs font-medium leading-4">
                      Eligibility Check Again
                    </p>
                  ) : (
                    <p className="mt-[2px] self-center text-xs font-medium leading-4">
                      Eligibility Check
                    </p>
                  )}
                </Button>
                <>
                  <Modal
                    open={isEligibilityCheckOpen}
                    onClose={() => {
                      setIsEligibilityCheckOpen(false);
                    }}
                    modalContentClassName="rounded-lg bg-gray-100  text-left shadow-xl  h-[464px] w-[960px]"
                  >
                    <div className="m-5 text-gray-700">
                      <SectionHeading label={'Eligibility Check'} />
                      <div className="flex items-center justify-end gap-5">
                        <CloseButton
                          onClick={() => {
                            setIsEligibilityCheckOpen(false);
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-[36px] bg-gray-100"></div>
                    <div className="ml-[27px]">
                      <p className="mt-[8px] mb-[4px] w-16  text-base font-bold leading-normal text-gray-700">
                        Insurance
                      </p>
                      <div className="flex w-full gap-4">
                        <div className={`gap-1 w-auto `}>
                          <label className="text-sm font-medium leading-5 text-gray-700">
                            Select Insurance Plan
                            <span className="text-cyan-500">*</span>
                          </label>
                          <div
                            className={`w-full gap-1 justify-center flex flex-col items-start self-stretch `}
                          >
                            <div className="w-[240px] ">
                              <SingleSelectDropDown
                                placeholder="-"
                                showSearchBar={false}
                                data={
                                  insuranceDropdownData
                                    ? (insuranceDropdownData as SingleSelectDropDownDataType[])
                                    : []
                                }
                                selectedValue={
                                  insuranceDropdownData.filter(
                                    (m) =>
                                      m.id === eligibilityCheckData.insuranceID
                                  )[0]
                                }
                                onSelect={(value) => {
                                  setEligibilityCheckData({
                                    ...eligibilityCheckData,
                                    insuranceID: value.id,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className=" ml-[27px]">
                      <p className="mt-[32px] mb-[4px] w-16  text-base font-bold leading-normal text-gray-700">
                        Service
                      </p>
                      <div className="flex w-auto gap-2 ">
                        <div className={`gap-1 w-auto`}>
                          <label className="text-sm font-medium leading-5 text-gray-700">
                            Service Type
                            <span className="text-cyan-500">*</span>
                          </label>
                          <div
                            className={`w-full gap-1 justify-center flex flex-col items-start self-stretch`}
                          >
                            <div className="w-[240px] ">
                              <SingleSelectDropDown
                                placeholder="-"
                                showSearchBar={true}
                                disabled={false}
                                data={
                                  patientlookupData
                                    ? (patientlookupData.serviceType as SingleSelectDropDownDataType[])
                                    : []
                                }
                                selectedValue={
                                  patientlookupData &&
                                  patientlookupData.serviceType.filter(
                                    (m) =>
                                      m.id ===
                                      eligibilityCheckData.serviceTypeCodeID
                                  )[0]
                                }
                                onSelect={(value) => {
                                  setEligibilityCheckData({
                                    ...eligibilityCheckData,
                                    serviceTypeCodeID: value.id,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={` items-start self-stretch`}>
                          <label className="text-sm font-medium leading-loose text-gray-900">
                            Service date
                            <span className="text-cyan-500">*</span>
                          </label>
                          <div className=" h-[38px] w-[240px]">
                            <AppDatePicker
                              placeholderText="mm/dd/yyyy"
                              cls=""
                              onChange={(date) => {
                                if (date) {
                                  setEligibilityCheckData({
                                    ...eligibilityCheckData,
                                    dos: DateToStringPipe(date, 1),
                                  });
                                }
                              }}
                              selected={StringToDatePipe(
                                eligibilityCheckData.dos
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-[77px] ">
                      <div className={`h-[86px] bg-gray-200 rounded-lg`}>
                        <div className="w-full">
                          <div className="h-px w-full bg-gray-300" />
                        </div>
                        <div className="py-[24px] pr-[27px]">
                          <div className={`gap-4 flex justify-end `}>
                            <div>
                              <Button
                                buttonType={ButtonType.secondary}
                                cls={` `}
                                onClick={() => {
                                  setEligibilityCheckData({
                                    patientInsuranceID: null,
                                    serviceTypeCodeID: null,
                                    insuranceID: null,
                                    dos: '',
                                  });
                                  setIsEligibilityCheckOpen(false);
                                }}
                              >
                                {' '}
                                Cancel
                              </Button>
                            </div>
                            <div>
                              <Button
                                buttonType={ButtonType.primary}
                                cls={` `}
                                onClick={() => {
                                  checkEligibilityForInsurance();
                                }}
                              >
                                {' '}
                                Check Eligibility
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Modal>
                </>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      headerClassName: '!bg-cyan-100 !text-center',
      flex: 1,
      minWidth: 220,
      disableReorder: true,
      cellClassName: '!bg-cyan-50',
      renderCell: (params) => {
        return (
          <div>
            <Button
              buttonType={ButtonType.secondary}
              onClick={() => {
                setIsInsuranceModalOpen(true);
                setIsViewInsuranceMode(true);
                setSelectedInsuranceGridRow(params.row);
              }}
              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 mr-1 inline-flex gap-2 leading-5`}
            >
              <Icon name={'eye'} size={18} color={IconColors.NONE} />
            </Button>
            <Button
              buttonType={ButtonType.secondary}
              onClick={() => {
                setSelectedInsuranceGridRow(params.row);
                setIsViewInsuranceMode(false);
                setIsInsuranceModalOpen(true);
              }}
              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 mr-1 inline-flex gap-2 leading-5`}
            >
              <Icon name={'pencil'} size={18} color={IconColors.GRAY} />
            </Button>
            <Button
              buttonType={ButtonType.secondary}
              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
              onClick={() => {
                setInsuranceInactiveData({
                  open: true,
                  patientInsuraceID: params.row.id,
                  active: !params.row.active,
                });
                if (params.row.active) {
                  setStatusModalState({
                    ...statusModalState,
                    open: true,
                    heading: 'Deactivate Insurance Confirmation',
                    okButtonText: 'Yes, Deactivate',
                    description:
                      'Are you sure you want to Deactivate this insurance?',
                    closeButtonText: 'Cancel',
                    okButtonColor: ButtonType.tertiary,
                    statusModalType: StatusModalType.ERROR,
                    showCloseButton: true,
                    closeOnClickOutside: false,
                  });
                } else {
                  setStatusModalState({
                    ...statusModalState,
                    open: true,
                    heading: 'Activate Insurance Confirmation',
                    okButtonText: 'Yes, Activate',
                    description:
                      'Are you sure you want to activate this insurance?',
                    closeButtonText: 'Cancel',
                    okButtonColor: ButtonType.primary,
                    statusModalType: StatusModalType.WARNING,
                    showCloseButton: true,
                    closeOnClickOutside: false,
                  });
                }
              }}
            >
              <Icon name={'trash'} size={18} />
            </Button>
            {params.row.payerResponsibility !== 'Tertiary' && (
              <Button
                buttonType={ButtonType.secondary}
                onClick={() => {
                  setShowCrossoverClaimModal(true);
                  setInsResponsibility(params.row.payerResponsibility);
                }}
                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 mr-1 inline-flex gap-2 leading-5`}
              >
                <Icon
                  name={'moneyTransfer'}
                  size={18}
                  color={IconColors.GRAY}
                />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const [insuranceSubscriberData, setInsuranceSubscriberData] =
    useState<GetPatientRequestData | null>(null);
  const insuranceActive = async () => {
    const data: PatientInsuranceActiveData = {
      patientInsuranceID: insuranceInactiveData.patientInsuraceID,
      active: insuranceInactiveData.active,
    };
    const res = await patientInsuranceActive(data);
    if (res && res.message) {
      store.dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `${res.message}`,
          toastType: ToastType.SUCCESS,
        })
      );
    }
    getPatientInsuranceData();
    setInsuranceInactiveData({
      open: false,
      patientInsuraceID: 0,
      active: false,
    });
  };
  return (
    <>
      <StatusModal
        open={statusModalState.open}
        heading={statusModalState.heading}
        description={statusModalState.description}
        okButtonText={statusModalState.okButtonText}
        okButtonColor={statusModalState.okButtonColor}
        closeButtonText={statusModalState.closeButtonText}
        statusModalType={statusModalState.statusModalType}
        showCloseButton={statusModalState.showCloseButton}
        closeOnClickOutside={statusModalState.closeOnClickOutside}
        onClose={() => {
          setStatusModalState({
            ...statusModalState,
            open: false,
          });
        }}
        onChange={() => {
          setStatusModalState({
            ...statusModalState,
            open: false,
          });

          if (insuranceInactiveData.open) {
            insuranceActive();
          }
        }}
      />
      <div className="w-full bg-gray-100 text-gray-700">
        <div className="inline-flex w-full flex-col items-start justify-end space-y-6">
          <div className="inline-flex w-full items-center justify-start">
            <div className="inline-flex w-full">
              <div className="text-xl font-bold leading-5 text-gray-700">
                <div className="mr-[24px] inline-flex">
                  <div className="mt-[50px] flex items-center">
                    Patient Insurances
                  </div>
                </div>
                <Button
                  buttonType={ButtonType.primary}
                  fullWidth={true}
                  cls={`w-[159px] h-[38px] inline-flex !justify-center leading-loose`}
                  style={{ verticalAlign: 'middle' }}
                  onClick={() => {
                    setIsInsuranceModalOpen(true);
                    setIsViewInsuranceMode(false);
                    setSelectedInsuranceGridRow(undefined);
                  }}
                >
                  <p className="text-justify text-sm">Add New Insurance</p>
                </Button>
                <Button
                  buttonType={ButtonType.primary}
                  fullWidth={true}
                  disabled={false}
                  cls={`ml-[8px] w-[170px] h-[38px] inline-flex !justify-center gap-2 leading-loose`}
                  style={{ verticalAlign: 'middle' }}
                  onClick={() => {
                    setIsInsuranceFinderModalOpen(true);
                  }}
                >
                  <Icon name={'documentSearch'} size={18} />
                  <p className="text-justify text-sm">Insurance Finder</p>
                </Button>
                <Modal
                  open={isInsuranceFinderModalOpen}
                  onClose={() => {
                    setIsInsuranceFinderModalOpen(false);
                  }}
                  modalContentClassName="bg-gray-100 relative overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-[1404px] h-[551px] "
                >
                  <InsuranceFinder
                    onClose={() => {
                      setIsInsuranceFinderModalOpen(false);
                    }}
                    selectedPatientID={patientID}
                    groupID={selectedPatientData.groupID}
                    insuranceData={insuranceAllData || []}
                  />
                </Modal>
                <Modal
                  open={isInsuranceModalOpen}
                  onClose={() => {
                    // setIsInsuranceModalOpen(false);
                    // setIsViewInsuranceMode(false);
                  }}
                  modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
                >
                  <PatientInsurance
                    onClose={() => {
                      setIsInsuranceModalOpen(false);
                      setIsViewInsuranceMode(false);
                      getPatientInsuranceData();
                    }}
                    selectedPatientID={patientID}
                    groupID={selectedPatientData.groupID}
                    selectedPatientInsuranceData={
                      selectedInsuranceGridRow || null
                    }
                    onSelectSelf={(value: boolean) => {
                      if (value === true) {
                        setInsuranceSubscriberData(selectedPatientData);
                      } else {
                        setInsuranceSubscriberData(null);
                      }
                    }}
                    insuranceSubscriberData={insuranceSubscriberData || null}
                    isViewMode={isViewInsuranceMode}
                  />
                </Modal>

                <Modal
                  open={showCrossoverClaimModal}
                  onClose={() => {}}
                  modalContentClassName="relative w-[1232px] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
                >
                  <CrossoverInsurancePayment
                    patientID={patientID || 0}
                    insResponsibilityType={insResponsibility || ''}
                    groupID={selectedPatientData.groupID}
                    onClose={() => {
                      setShowCrossoverClaimModal(false);
                      // setSelectedCrossOverChargeId(undefined);
                      // getCrossoverChargesByPatientID(patientID || 0, insResponsibilityType: String || '')
                      // getClaimSummaryData(claimID);
                    }}
                  />
                </Modal>
              </div>
            </div>
          </div>
          <div className="relative w-full text-sm leading-tight text-gray-500">
            {!insuranceGridRows.length ? (
              <div className="h-[40px] w-[372px]">
                {`There are no insurance policies for this patient yet. To add an insurance policy, click the "Add New Insurance" button.`}
              </div>
            ) : (
              <>
                <div className="">
                  <Tabs
                    tabs={insuranceTabs}
                    onChangeTab={(tab: any) => {
                      setSelectedInsuranceTab(tab);
                    }}
                    currentTab={selectedInsuranceTab}
                  />
                </div>
                <div
                  className="pt-[24px] "
                  style={{ height: '100%', width: '100%' }}
                >
                  <SearchDetailGrid
                    checkboxSelection={false}
                    hideHeader={true}
                    hideFooter={true}
                    columns={columns}
                    rows={
                      selectedInsuranceTab?.id === 1
                        ? insuranceGridRows.filter((m) => m.active === true)
                        : insuranceGridRows.filter((m) => m.active === false)
                    }
                    setHeaderRadiusCSS={true}
                    // pinnedColumns={{
                    //   right: ['actions'],
                    // }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
