import { formatCurrency } from './utils';
/* eslint-disable @typescript-eslint/ban-types */
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsAmountInRange(
  min: number,
  max: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAmountInRange',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return false; // Skip validation if value is not provided
          const amount = parseFloat(value);
          return !isNaN(amount) && amount >= min && amount <= max;
        },
        defaultMessage(args: ValidationArguments) {
          return `Số tiền phải nằm trong khoảng từ ${formatCurrency(
            min,
          )} đến ${formatCurrency(max)}`;
        },
      },
    });
  };
}
