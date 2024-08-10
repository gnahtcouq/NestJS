import dayjs from 'dayjs';
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

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  })
    .format(value)
    .replace(/\./g, ',');
};

export function isValidDateRange(datePart, format) {
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
}

export function isValidTypeDateRangeId(id, type, format) {
  const typeRegex = new RegExp(`^${type}(\\d{8})$`);
  const match = id.match(typeRegex);
  if (!match) return false;

  const datePart = match[1];
  return isValidDateRange(datePart, format);
}
