import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Button, { ButtonType } from '@/components/UI/Button';
import CloseButton from '@/components/UI/CloseButton';
import InputField from '@/components/UI/InputField';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import AppTable, { AppTableCell, AppTableRow } from '@/components/UI/Table';
import { addToastNotification } from '@/store/shared/actions';
import { getProviderInforFromNPPES } from '@/store/shared/sagas';
import type {
  ReferringProviderData,
  SearchProviderRequestPayload,
  SearchProviderSuccessPayload,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';

type SearchProviderProps = {
  onClose: () => void;
  onSelect: (value: ReferringProviderData) => void;
};
const SearchProvider = ({ onClose, onSelect }: SearchProviderProps) => {
  const dispatch = useDispatch();
  const [firstNameValue, setFirstName] = useState<string | null>();
  const [lastNameValue, setLastName] = useState<string | null>();
  const [npiValue, setNPI] = useState<string | null>();
  const [selectedType, setSelectedType] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const [taxonomyValue, setTaxonomyValue] = useState<string | null>();
  const [ZipValue, setZipValue] = useState<string | null>();
  const [stateCodeValue, setStateCodeValue] = useState<string | null>();
  // validation
  const searchProviderValidation = (
    searchRequest: SearchProviderRequestPayload
  ) => {
    let isValid = true;
    if (
      searchRequest.firstName === '' &&
      searchRequest.lastName === '' &&
      searchRequest.npi === null &&
      searchRequest.taxonomyDescription === '' &&
      searchRequest.zip === null
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select One of these First Name/ Last Name/ NPI/ Taxonomy Description/ Zip ',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    return isValid;
  };
  // api call
  const [providerSearchResult, setProviderSearchResult] = useState<
    SearchProviderSuccessPayload[] | null
  >();
  const onSearchProvider = async () => {
    let searchData: SearchProviderRequestPayload = {
      firstName: '',
      lastName: '',
      taxonomyDescription: '',
      npi: null,
      type: '',
      exactMatch: false,
      zip: null,
      state: null,
      limit: null,
    };
    searchData = {
      ...searchData,
      firstName: firstNameValue || '',
      lastName: lastNameValue || '',
      npi: npiValue || null,
      type: selectedType ? selectedType.value : '',
      taxonomyDescription: taxonomyValue || '',
      state: stateCodeValue || null,
      zip: ZipValue || null,
      limit: '100',
    };
    const isValid = searchProviderValidation(searchData);
    if (isValid) {
      const res = await getProviderInforFromNPPES(searchData);
      if (res) {
        setProviderSearchResult(res);
      }
    }
  };
  // const searchResult = useSelector(getSearchProviderDataSelector);

  // useEffect(() => {
  //   if (searchResult) {
  //     setProviderSearchResult(searchResult);
  //   }
  // }, [searchResult]);
  const [isRowSelected, SetIsRowSelected] = useState('');
  const [selectedRow, setSelectedRow] =
    useState<SearchProviderSuccessPayload>();
  const onNpiClick = (selectedRowNPI: string) => {
    SetIsRowSelected(selectedRowNPI);
    const selectedRoww = providerSearchResult?.filter(
      (m) => m.npi === selectedRowNPI
    )[0];
    setSelectedRow(selectedRoww);
  };
  const tableHeader = [
    'NPI',
    'Last Name',
    'First Name',
    'Address 1',
    'City',
    'State',
    'Zip',
    'Taxonomy Number',
    'License Number',
    'Gender',
  ];
  const rowClass = '!text-white !py-2 !whitespace-nowrap !px-2';
  const defaultClass = '!py-2 !whitespace-nowrap !px-2';
  const renderProviderTableCell = (v: any, npi: string) => {
    return (
      <div
        onClick={() => {
          onNpiClick(npi);
        }}
      >
        {v}
      </div>
    );
  };
  const selectedRowData = () => {
    if (selectedRow) {
      onSelect({
        id: Number(selectedRow.npi),
        value: `${selectedRow.providerLastName} ${selectedRow.providerFirstName}`,
        firstName: selectedRow.providerFirstName,
        lastName: selectedRow.providerLastName,
        appendText: `NPI: ${selectedRow.npi}`,
      });
    }
    onClose();
  };
  return (
    <div className="flex flex-col bg-gray-100">
      <div className="max-w-full bg-gray-300 p-4">
        <div className="flex flex-row justify-between">
          <div>
            <h1 className=" text-left  text-xl font-bold leading-7 text-gray-700">
              Search Provider
            </h1>
          </div>
          <div className="">
            <CloseButton onClick={onClose} />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex flex-row gap-4 px-6 pt-6">
          <div className={`text-gray-700 leading-5 text-left font-medium`}>
            <label className="text-sm font-medium leading-5 text-gray-900">
              First Name
            </label>
            <div className="h-[38px] w-[220px] ">
              <InputField
                placeholder="First Name"
                value={firstNameValue || ''}
                onChange={(evt) => setFirstName(evt.target.value)}
              />
            </div>
          </div>
          <div className={` text-gray-700 leading-5 text-left font-medium`}>
            <label className="text-sm font-medium leading-5 text-gray-900">
              Last Name
            </label>
            <div className="h-[38px] w-[220px] ">
              <InputField
                placeholder="Last Name"
                value={lastNameValue || ''}
                onChange={(evt) => setLastName(evt.target.value)}
              />
            </div>
          </div>
          <div className={` text-gray-700 leading-5 text-left font-medium`}>
            <label className="text-sm font-medium leading-5 text-gray-900">
              NPI
            </label>
            <div className="h-[38px] w-[220px] ">
              <InputField
                placeholder="NPI"
                value={npiValue || ''}
                onChange={(evt) => setNPI(evt.target.value)}
              />
            </div>
          </div>
          <div className={` text-gray-700 leading-5 text-left font-medium`}>
            <label className="text-sm font-medium leading-5 text-gray-900">
              Type
            </label>
            <div className="h-[38px] w-[220px]">
              <SingleSelectDropDown
                placeholder="Type"
                showSearchBar={false}
                disabled={false}
                data={[
                  { id: 1, value: 'Provider' },
                  { id: 2, value: 'Group' },
                ]}
                selectedValue={selectedType}
                onSelect={(value) => {
                  setSelectedType(value);
                }}
              />
            </div>
          </div>
          <div className={`leading-5 font-medium pt-6`}>
            <Button
              buttonType={ButtonType.primary}
              cls={`w-[102px] `}
              onClick={() => {
                onSearchProvider();
              }}
            >
              Search
            </Button>
          </div>
        </div>
        <div className="flex flex-row gap-4 px-6 pt-6">
          <div className={`text-gray-700 leading-5 text-left font-medium`}>
            <label className="text-sm font-medium leading-5 text-gray-900">
              Taxonomy Description
            </label>
            <div className="h-[38px] w-[220px]">
              <InputField
                placeholder="Taxonomy Description"
                value={taxonomyValue || ''}
                onChange={(evt) => setTaxonomyValue(evt.target.value)}
              />
            </div>
          </div>
          <div className={` text-gray-700 leading-5 text-left font-medium`}>
            <label className="text-sm font-medium leading-5 text-gray-900">
              Zip
            </label>
            <div className="h-[38px] w-[220px]">
              <InputField
                placeholder="Zip"
                value={ZipValue || ''}
                maxLength={5}
                onChange={(evt) => setZipValue(evt.target.value)}
              />
            </div>
          </div>
          <div className={` text-gray-700 leading-5 text-left font-medium`}>
            <label className="text-sm font-medium leading-5 text-gray-900">
              State Code
            </label>
            <div className="h-[38px] w-[220px]">
              <InputField
                placeholder="State Code"
                value={stateCodeValue || ''}
                maxLength={2}
                onChange={(evt) => setStateCodeValue(evt.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col p-[24px] px-6">
          <div>
            <label className="flex text-sm font-medium leading-5 text-gray-700">
              Search Result:
            </label>
          </div>
          <div className=" flex flex-col rounded-md border border-gray-300  bg-white ">
            <AppTable
              cls="max-h-[209px] h-[209px]"
              renderHead={
                <AppTableRow>
                  {tableHeader.map((header) => (
                    <>
                      <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-2">
                        {header}
                      </AppTableCell>
                    </>
                  ))}
                </AppTableRow>
              }
              renderBody={
                <>
                  {providerSearchResult && providerSearchResult.length > 0 ? (
                    providerSearchResult?.map((rowData) => (
                      <AppTableRow
                        key={rowData.npi}
                        cls={isRowSelected === rowData.npi ? 'bg-cyan-400' : ''}
                      >
                        <AppTableCell
                          cls={
                            isRowSelected === rowData.npi
                              ? rowClass
                              : defaultClass
                          }
                        >
                          {renderProviderTableCell(rowData.npi, rowData.npi)}
                        </AppTableCell>
                        <AppTableCell
                          cls={
                            isRowSelected === rowData.npi
                              ? rowClass
                              : defaultClass
                          }
                        >
                          {renderProviderTableCell(
                            rowData.providerLastName,
                            rowData.npi
                          )}
                        </AppTableCell>
                        <AppTableCell
                          cls={
                            isRowSelected === rowData.npi
                              ? rowClass
                              : defaultClass
                          }
                        >
                          {renderProviderTableCell(
                            rowData.providerFirstName,
                            rowData.npi
                          )}
                        </AppTableCell>
                        <AppTableCell
                          cls={
                            isRowSelected === rowData.npi
                              ? rowClass
                              : defaultClass
                          }
                        >
                          {renderProviderTableCell(
                            rowData.address1,
                            rowData.npi
                          )}
                        </AppTableCell>
                        <AppTableCell
                          cls={
                            isRowSelected === rowData.npi
                              ? rowClass
                              : defaultClass
                          }
                        >
                          {renderProviderTableCell(rowData.city, rowData.npi)}
                        </AppTableCell>
                        <AppTableCell
                          cls={
                            isRowSelected === rowData.npi
                              ? rowClass
                              : defaultClass
                          }
                        >
                          {renderProviderTableCell(rowData.state, rowData.npi)}
                        </AppTableCell>
                        <AppTableCell
                          cls={
                            isRowSelected === rowData.npi
                              ? rowClass
                              : defaultClass
                          }
                        >
                          {renderProviderTableCell(rowData.zip, rowData.npi)}
                        </AppTableCell>
                        <AppTableCell
                          cls={
                            isRowSelected === rowData.npi
                              ? rowClass
                              : defaultClass
                          }
                        >
                          {renderProviderTableCell(
                            rowData.providerTaxonomyCode,
                            rowData.npi
                          )}
                        </AppTableCell>
                        <AppTableCell
                          cls={
                            isRowSelected === rowData.npi
                              ? rowClass
                              : defaultClass
                          }
                        >
                          {renderProviderTableCell(
                            rowData.providerLicenseNumber,
                            rowData.npi
                          )}
                        </AppTableCell>
                        <AppTableCell
                          cls={
                            isRowSelected === rowData.npi
                              ? rowClass
                              : defaultClass
                          }
                        >
                          {renderProviderTableCell(
                            rowData.providerGenderCode,
                            rowData.npi
                          )}
                        </AppTableCell>
                      </AppTableRow>
                    ))
                  ) : (
                    <div className="mt-2 ml-[-12px] text-sm font-medium leading-tight text-gray-700">
                      No Result Found
                    </div>
                  )}
                </>
              }
            />
          </div>
        </div>
      </div>
      <div className={`h-[120px] bg-gray-200 w-full`}>
        <div className="flex flex-row-reverse gap-4 p-6 ">
          <div>
            <Button buttonType={ButtonType.primary} onClick={selectedRowData}>
              Save Provider
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
export default SearchProvider;
