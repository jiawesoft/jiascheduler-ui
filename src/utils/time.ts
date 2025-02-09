import dayjs from 'dayjs';

export const genVersionFromTime = () => {
  const now = dayjs();
  return now.format('VYYYYMMDDHHmmss');
};

export const getTimestamp = () => {};
