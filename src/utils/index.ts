type TargetContext = '_self' | '_parent' | '_blank' | '_top';

export const openWindow = (
  url: string,
  opts?: { target?: TargetContext; [key: string]: any }
) => {
  const { target = '_blank', ...others } = opts || {};
  window.open(
    url,
    target,
    Object.entries(others)
      .reduce((preValue: string[], curValue) => {
        const [key, value] = curValue;
        return [...preValue, `${key}=${value}`];
      }, [])
      .join(',')
  );
};

export const regexUrl = new RegExp(
  '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$',
  'i'
);

export const stringColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    /* eslint no-bitwise: 0 */
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';
  for (let i = 0; i < 3; i += 1) {
    /* eslint no-bitwise: 0 */
    const value = (hash >> (i * 8)) & 0xff;
    const str = `00${value.toString(16)}`.slice(-2);
    color = `${color}${str}`;
  }
  return color;
};

// 编辑器语言判断
export const getCommand = (currentCommand: string) => {
  if (currentCommand.includes('bash')) {
    return 'sh';
  }
  if (currentCommand.includes('python')) {
    return 'python';
  }
  if (currentCommand.includes('powershell')) {
    return 'powershell';
  }
  return 'sh';
};

export default null;
