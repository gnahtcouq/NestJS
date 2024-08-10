/* eslint-disable @typescript-eslint/ban-types */
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import dayjs from 'dayjs';

export function IsAdult(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAdult',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return false;
          const birthDate = dayjs(value);
          const currentDate = dayjs();
          const minDate = dayjs('1970-01-01'); // Minimum allowed date

          // Check if the date is on or after 01/01/1970
          const isAfterMinDate = birthDate.isSameOrAfter(minDate, 'day');
          // Check if the person is at least 18 years old
          const age = currentDate.diff(birthDate, 'year');
          const isAdult = age >= 18;

          return isAfterMinDate && isAdult;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Ngày sinh phải không được sớm hơn 01/01/1970 và phải đủ 18 tuổi trở lên';
        },
      },
    });
  };
}
