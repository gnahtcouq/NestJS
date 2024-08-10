/* eslint-disable @typescript-eslint/ban-types */
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'; // Add this line
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore); // Add this line

export function IsValidDateRange(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidDateRange',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return true; // Skip validation if value is not provided
          const date = dayjs(value);
          const minDate = dayjs('1970-01-01');
          const currentDate = dayjs();
          return (
            date.isSameOrAfter(minDate, 'day') &&
            date.isSameOrBefore(currentDate, 'day')
          );
        },
        defaultMessage(args: ValidationArguments) {
          return 'Ngày phải nằm trong khoảng từ 01/01/1970 đến ngày hiện tại';
        },
      },
    });
  };
}
