import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";

export function AtLeastOneField(
  fields: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: "atLeastOneField",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [fields],
      validator: {
        validate(_: any, args: ValidationArguments) {
          const object = args.object as Record<string, any>;
          const [fields] = args.constraints;

          return fields.some((field: string) => object[field] !== undefined);
        },
        defaultMessage(args: ValidationArguments) {
          const [fields] = args.constraints;
          return `At least one of the following fields must be provided: ${fields.join(", ")}`;
        },
      },
    });
  };
}
