/* eslint-disable @typescript-eslint/ban-types */
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidYear', async: false })
export class IsValidYearConstraint implements ValidatorConstraintInterface {
  validate(year: string): boolean {
    const yearNumber = parseInt(year, 10);
    const currentYear = new Date().getFullYear();
    return yearNumber >= 1970 && yearNumber <= currentYear;
  }

  defaultMessage(): string {
    return 'Năm phải không nhỏ hơn 1970 và không lớn hơn năm hiện tại';
  }
}

export function IsValidYear(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidYearConstraint,
    });
  };
}
