import 'react-datepicker/dist/react-datepicker.css';

import moment from 'moment';
import React, { useState } from 'react';
import type { CalendarContainerProps } from 'react-datepicker';
import DatePicker, { CalendarContainer } from 'react-datepicker';
import InputMask from 'react-input-mask';

import Icon from '@/components/Icon';
import classNames from '@/utils/classNames';
import { StringToDatePipe } from '@/utils/dateConversionPipes';

export interface AppDatePickerProps {
  placeholderText?: string;
  selected?: Date | string | null;
  onChange(v: Date | null): void;
  disabled?: boolean;
  cls?: string;
  testId?: string;
}

const MaskedDateInput: React.FC<{
  value: string | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement> | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  cls?: string;
  onClick: () => void;
  dateIsValid: boolean;
}> = ({
  value,
  onChange,
  placeholder,
  disabled,
  cls,
  onClick,
  dateIsValid = true,
}) => (
  <div
    className={classNames(
      'flex items-center justify-between w-full h-[38px] px-2 py-2 bg-white border rounded-md border-gray-300',
      cls || '',
      disabled ? 'bg-gray-100' : '',
      dateIsValid === false ? 'border-red-500' : 'border-gray-300'
    )}
  >
    <div
      className={classNames('flex w-full h-full items-center justify-center')}
    >
      <InputMask
        mask="99/99/9999"
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={classNames(
          'flex w-full h-full text-black focus:outline-none items-center justify-center text-sm leading-5 self-center pr-2 bg-transparent'
        )}
      />
      {/* {isOptional && value && (
        <Button
          buttonType={ButtonType.secondary}
          className="contents"
          onClick={() => {
            if (onDeselectValue) {
              onDeselectValue();
            } else {
              onChange(null);
            }
          }}
        >
          {' '}
          <Icon name={'deselect'} size={8} />
        </Button>
      )} */}
    </div>
    <button
      className="flex h-full items-center justify-center"
      onClick={onClick}
      disabled={disabled}
    >
      <Icon name="calendar" size={18} />
    </button>
  </div>
);

const AppDatePicker: React.FC<AppDatePickerProps> = ({
  placeholderText,
  cls,
  disabled,
  onChange,
  selected,
  testId,
  // isOptional = false,
  // onDeselectValue,
}) => {
  const [dateIsValid, setDateIsValid] = useState<boolean>(true);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const isValidDate = moment(value, 'MM/DD/YYYY', true).isValid();
    setDateIsValid(isValidDate);
    if (isValidDate) {
      // const [day, month, year] = value.split('/');
      // const date = new Date(`${year}-${month}-${day}`);
      let resDate = new Date(value);
      if (resDate) {
        const todayDate = new Date();
        const offset = todayDate.getTimezoneOffset();
        const positiveOffset = Math.max(0, -offset);
        const hours = Math.floor(positiveOffset / 60);
        resDate = new Date(
          resDate.getFullYear(),
          resDate.getMonth(),
          resDate.getDate(),
          hours,
          0,
          0
        );
      }
      // onChange(date);
      onChange(resDate);
    } else {
      onChange(null);
    }
  };
  const getSelectedValue = () => {
    if (typeof selected === 'string') {
      return StringToDatePipe(selected);
    }
    return selected ?? null;
  };
  return (
    <div data-testid={testId}>
      <DatePicker
        selected={getSelectedValue()}
        onChange={onChange}
        calendarContainer={({
          className,
          children,
        }: CalendarContainerProps) => {
          return (
            <CalendarContainer className={className}>
              <div style={{ position: 'relative' }}>{children}</div>
            </CalendarContainer>
          );
        }}
        customInput={
          <MaskedDateInput
            value={
              selected ? new Date(selected).toLocaleDateString('en-GB') : ''
            }
            onChange={(value) => {
              if (value) {
                handleInputChange(value);
              }
            }}
            placeholder={placeholderText}
            disabled={disabled}
            cls={cls}
            dateIsValid={dateIsValid}
            onClick={() => {}}
          />
        }
        dateFormat="MM/dd/yyyy"
        disabled={disabled}
      />
    </div>
  );
};

export default AppDatePicker;
