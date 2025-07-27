import dayjs from 'dayjs';

export const genVersionFromTime = () => {
  const now = dayjs();
  return now.format('VYYYYMMDDHHmmss');
};

export const getFormatTimeVersion = () => {
  const now = dayjs();
  return now.format('VYYYY-MM-DD-HH-mm-ss');
};

export const getTimestamp = () => {};
