type Units = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};
// in miliseconds
const units: Units = {
  year: 24 * 60 * 60 * 1000 * 365,
  month: (24 * 60 * 60 * 1000 * 365) / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
};

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const getRelativeTime = (d1: Date, d2: Date = new Date()) => {
  const elapsed = +d1 - +d2;
  let response = '';

  // "Math.abs" accounts for both "past" & "future" scenarios
  (Object.keys(units) as (keyof Units)[]).forEach((unit: keyof Units): void => {
    if (Math.abs(elapsed) > units[unit] || unit === 'second')
      response = rtf.format(Math.round(elapsed / units[unit]), unit);
  });
  return response;
};

export default getRelativeTime;
