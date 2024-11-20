import store from '@/store';

const { DateTime } = require('luxon');

export const StringToDatePipe = (dateString: string) => {
  if (dateString) {
    let dateparts: string[] = [];
    if (dateString.includes('T') || dateString.includes('-')) {
      const newDateString = dateString.split('T')[0] || '';
      dateparts = newDateString.split('-');
      return new Date(
        Number(dateparts[0]),
        Number(dateparts[1]) - 1,
        Number(dateparts[2])
      );
    }
    if (dateString.includes('/')) {
      dateparts = dateString.split('/');
      return new Date(
        Number(dateparts[2]),
        Number(dateparts[0]) - 1,
        Number(dateparts[1])
      );
    }
  }
  return null;
};

export const DateToStringPipe = (
  dateValue: Date | string | null | undefined,
  type: number
) => {
  // Formats a Date object based on the given type
  // type === 1: YYYY-MM-DD                  (2023-05-04)
  // type === 2: MM/DD/YYYY                  (05/04/2023)
  // type === 3: MMM DD, YYYY                (May 04, 2023)
  // type === 4: h:mm a                      (5:21 am)
  // type === 5: MMM DD, YYYY at h:mm a EST  (May 04, 2023 at 5:21 am EST)
  // type === 6: MM/DD/YYYY, h:mm a          (05/04/2023, 05:09 PM)
  // type === 7: h:mm a                      (5:21 am (EST))
  // type === 8: h:mm a EST                  (5:21 am EST)
  let dateString = '';
  const { user } = store.getState().login;
  let date = dateValue;
  if (!dateValue) {
    return dateString;
  }
  if (typeof date === 'string') {
    // const isValid = moment(date, undefined, true).isValid();
    const luxonDateTime = DateTime.fromISO(date);
    if (luxonDateTime.isValid) {
      if (type === 4 || type === 5 || type === 6 || type === 7 || type === 8) {
        const receivedCSTDateTime = DateTime.fromISO(date, {
          zone: 'America/Chicago',
        });
        const userLocalDateTime = receivedCSTDateTime.setZone(
          user?.userTimeZone
        );
        const formattedUserLocalDateTime = userLocalDateTime.toISO();

        date = new Date(formattedUserLocalDateTime);
      } else {
        date = StringToDatePipe(date);
      }
    }
  }
  if (date && date instanceof Date) {
    if ([1, 2].includes(type)) {
      const y = date.getFullYear();
      const m = `0${date.getMonth() + 1}`.slice(-2);
      const d = `0${date.getDate()}`.slice(-2);
      dateString = type === 1 ? `${y}-${m}-${d}` : `${m}/${d}/${y}`;
    } else if ([3, 4, 5, 7, 8].includes(type)) {
      const formattedTime = date
        .toLocaleTimeString('en-US', {
          timeZone: user?.userTimeZone,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
        .toLowerCase();
      const monthString = date.toLocaleDateString('en-US', {
        month: 'short',
      });
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear().toString();
      if (type === 3) {
        dateString = `${monthString} ${day}, ${year}`;
      }
      if (type === 4) {
        dateString = `${formattedTime}`;
      }
      if (type === 7) {
        dateString = `${formattedTime} ${user?.userTimeZoneCode}`;
      }
      if (type === 8) {
        dateString = `${formattedTime} ${user?.userTimeZoneCode}`;
      }
      if (type === 5) {
        return `${monthString} ${day}, ${year} at ${formattedTime} ${user?.userTimeZoneCode}`;
      }
    } else if (type === 6) {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: user?.userTimeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    }
  }
  return dateString;
};

export const getServerDateTimeString = () => {
  // Create a new Date object with the input dateTime
  const date = new Date();

  // Use toLocaleString() with timeZone option to convert to Central Time
  const ctTime = date.toLocaleString('en-US', { timeZone: 'America/Chicago' });

  return ctTime;
};
