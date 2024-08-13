import dayjs from 'dayjs';
import { createCipheriv, randomBytes, createDecipheriv } from 'crypto';

export const nonAccentVietnamese = (str: string) => {
  str = str.replace(/A|Á|À|Ã|Ạ|Â|Ấ|Ầ|Ẫ|Ậ|Ă|Ắ|Ằ|Ẵ|Ặ/g, 'A');
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/E|É|È|Ẽ|Ẹ|Ê|Ế|Ề|Ễ|Ệ/, 'E');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/I|Í|Ì|Ĩ|Ị/g, 'I');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/O|Ó|Ò|Õ|Ọ|Ô|Ố|Ồ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ỡ|Ợ/g, 'O');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/U|Ú|Ù|Ũ|Ụ|Ư|Ứ|Ừ|Ữ|Ự/g, 'U');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/Y|Ý|Ỳ|Ỹ|Ỵ/g, 'Y');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/Đ/g, 'D');
  str = str.replace(/đ/g, 'd');
  // Some system encode vietnamese combining accent as individual utf-8 characters
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // Huyền sắc hỏi ngã nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // Â, Ê, Ă, Ơ, Ư
  return str;
};

export const convertSlug = (str: string) => {
  str = nonAccentVietnamese(str);
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  const from =
    'ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆĞÍÌÎÏİŇÑÓÖÒÔÕØŘŔŠŞŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇğíìîïıňñóöòôõøðřŕšşťúůüùûýÿžþÞĐđßÆa·/_,:;';
  const to =
    'AAAAAACCCDEEEEEEEEGIIIIINNOOOOOORRSSTUUUUUYYZaaaaaacccdeeeeeeeegiiiiinnooooooorrsstuuuuuyyzbBDdBAa------';
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
};

export const encrypt = (
  text: string,
  ivLength: number,
  encryptionKey: Buffer,
): string => {
  const iv = randomBytes(ivLength);
  const cipher = createCipheriv('aes-256-cbc', encryptionKey, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const decrypt = (text: string, encryptionKey: Buffer): string => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = createDecipheriv('aes-256-cbc', encryptionKey, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  })
    .format(value)
    .replace(/\./g, ',');
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /@stu\.edu\.vn$/;
  return emailRegex.test(email);
};

export const isValidDateRange = (datePart, format) => {
  let year, month, day;

  switch (format) {
    case 'yyyymmdd':
      // Regex để kiểm tra định dạng yyyymmdd
      const dateRegex = /^\d{8}$/;
      if (!dateRegex.test(datePart)) {
        return false;
      }
      year = parseInt(datePart.slice(0, 4), 10);
      month = parseInt(datePart.slice(4, 6), 10);
      day = parseInt(datePart.slice(6, 8), 10);
      break;

    case 'categoryyyyymmdd':
      // Regex để kiểm tra định dạng yyyymmdd
      const categoryDateRegex = /^\d{8}$/;
      if (!categoryDateRegex.test(datePart)) {
        return false;
      }
      year = parseInt(datePart.slice(0, 4), 10);
      month = parseInt(datePart.slice(4, 6), 10);
      day = parseInt(datePart.slice(6, 8), 10);
      break;

    case 'dd/mm/yyyy':
      // Regex để kiểm tra định dạng dd/mm/yyyy
      const dayMonthYearRegex =
        /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
      if (!dayMonthYearRegex.test(datePart)) {
        return false;
      }
      [day, month, year] = datePart.split('/').map(Number);
      break;

    default:
      return false;
  }

  // Kiểm tra năm không nhỏ hơn 1970
  if (year < 1970) {
    return false;
  }

  // Tạo đối tượng Date và kiểm tra tính hợp lệ
  const date = new Date(year, month - 1, day);

  // Kiểm tra ngày có hợp lệ không
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false;
  }

  // Kiểm tra ngày không nằm sau ngày hiện tại và không trước ngày 01/01/1970
  const minDate = dayjs('1970-01-01');
  const currentDate = dayjs();
  const isAfterMinDate = dayjs(date).isSameOrAfter(minDate, 'day');
  const isBeforeCurrentDate = dayjs(date).isSameOrBefore(currentDate, 'day');

  return isAfterMinDate && isBeforeCurrentDate;
};

export const isValidDateOfBirth = (birthDate: string): boolean => {
  // Kiểm tra ngày sinh có hợp lệ không
  if (!isValidDateRange(birthDate, 'dd/mm/yyyy')) {
    return false;
  }

  // Chuyển đổi ngày sinh thành đối tượng dayjs
  const birthDateDayjs = dayjs(birthDate, 'DD/MM/YYYY');

  // Ngày hiện tại
  const today = dayjs();

  // Ngày đủ 18 tuổi
  const eighteenYearsAgo = today.subtract(18, 'year');

  // Kiểm tra ngày sinh không nhỏ hơn 01/01/1970 và người đó phải từ 18 tuổi trở lên
  const minDate = dayjs('1970-01-01');
  return (
    birthDateDayjs.isSameOrAfter(minDate, 'day') &&
    birthDateDayjs.isBefore(eighteenYearsAgo, 'day')
  );
};

export const isValidTypeDateRangeId = (id, type, format) => {
  const typeRegex = new RegExp(`^${type}(\\d{8})$`);
  const match = id.match(typeRegex);
  if (!match) return false;

  const datePart = match[1];
  return isValidDateRange(datePart, format);
};

export const convertToISODate = (dateStr: string): string => {
  // Phân tích chuỗi ngày từ định dạng dd/mm/yyyy
  const [day, month, year] = dateStr.split('/').map(Number);

  // Tạo đối tượng ngày với ngày cụ thể và lấy thời gian hiện tại
  const now = new Date();
  const date = new Date(
    year,
    month - 1,
    day,
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds(),
  );

  // Định dạng đối tượng ngày thành ISO 8601
  return date.toISOString();
};

export const convertPhoneNumberToInternationalFormat = (phoneNumber) => {
  // Giả định rằng số điện thoại Việt Nam luôn bắt đầu với 0
  // và cần thêm mã quốc gia (84) ở đầu
  return phoneNumber.startsWith('0')
    ? '84' + phoneNumber.slice(1)
    : phoneNumber;
};
