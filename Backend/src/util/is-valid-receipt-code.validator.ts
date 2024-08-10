/* eslint-disable @typescript-eslint/ban-types */
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import dayjs from 'dayjs';

export function IsValidReceiptCode(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidReceiptCode',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return false; // Skip validation if value is not provided

          // Check if the value matches the pattern PTYYYYMMDD
          const regex = /^PT\d{8}$/;
          if (!regex.test(value)) return false;

          // Extract the date part and validate the date
          const datePart = value.substring(2); // Get YYYYMMDD part
          const date = dayjs(datePart, 'YYYYMMDD', true);

          // Define the minimum valid date
          const minDate = dayjs('1970-01-01');
          const today = dayjs();

          // Ensure the date is valid, within the range, and not after the current date
          const isValidDate = date.isValid();
          const isAfterOrEqualMinDate = date.isSameOrAfter(minDate, 'day');
          const isBeforeOrEqualToday = date.isSameOrBefore(today, 'day');

          return isValidDate && isAfterOrEqualMinDate && isBeforeOrEqualToday;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Mã phiếu thu phải có định dạng PTYYYYMMDD với YYYYMMDD là một ngày hợp lệ, không vượt quá ngày hiện tại, và phải lớn hơn hoặc bằng ngày 01/01/1970';
        },
      },
    });
  };
}
