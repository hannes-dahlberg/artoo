import { container, HelperService } from "artos";
import { Request, Response } from "express";
import * as moment from "moment";

export type validation = (value: string | number | boolean, request: Request, response: Response) => boolean | Promise<boolean>;
const helperService: HelperService = container.getService(HelperService);

export class Validation {
  public static date = (format: string | null = null): validation => (value: string): boolean => {
    return moment(value, format !== null ? format : undefined).isValid();
  }

  public static email = (value: string): boolean => {
    return (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(value);
  }

  public static max = (max: number): validation => (value: string | number): boolean => {
    if (typeof value === "number" || Number(value)) { return Number(value) <= max; }
    return value.length <= max;
  }

  public static min = (min: number): validation => (value: string | number): boolean => {
    if (typeof value === "number" || Number(value)) { return Number(value) >= min; }
    return value.length >= min;
  }

  public static required = (value: string | number | boolean): boolean => {
    if (typeof value === "string" && value.length < 0) { return false; } else if (value === undefined) { return false; }

    return true;
  }

  public static number = (value: string | number): boolean => {
    return typeof value === "number" || helperService.isDecimal(value);
  }
}

export interface IValidationValue { [key: string]: IValidationValue | string | number | boolean; }
export interface IValidationInput { [key: string]: IValidationInput | validation | validation[]; }

export class ValidationError {
  public validationName: string | null;
  public propertyName: string | null;
  public value: string | number | boolean | null;
  constructor({ validationName = null, propertyName = null, value = null }: {
    validationName?: string | null,
    propertyName?: string | null,
    value?: string | number | boolean | null,
  }) {
    this.validationName = validationName;
    this.propertyName = propertyName;
    this.value = value;
  }
}

export const validate = (value: IValidationValue | string | number | boolean, validation: IValidationInput | validation | validation[], request: Request, response: Response): Promise<boolean | ValidationError> => {
  const isSimple = (value: IValidationValue | string | number | boolean) => {
    return ["string", "number", "boolean"].indexOf(typeof value) !== -1 ? true : false;
  };

  return new Promise((resolve, reject) => {
    if (!isSimple(value) && !(validation instanceof Array) && typeof validation !== "function") {
      Promise.all(
        Object.keys(value).map(
          (valueName: string) => validation[valueName] !== undefined ? new Promise((resolve, reject) => validate((value as IValidationValue)[valueName], validation[valueName], request, response).then((result: boolean | ValidationError) => {
            if (typeof result !== "boolean") {
              result.propertyName = valueName;
              resolve(result);
            } else if (!result) {
              resolve(new ValidationError({ propertyName: valueName }));
            } else {
              resolve(result);
            }
          }).catch((error: any) => reject(error))) : new Promise((resolve) => resolve()),
        )).then((results: Array<boolean | ValidationError>) => {
          const validationError = results.find((result: boolean | ValidationError) => typeof result !== "boolean");
          resolve(validationError !== undefined ? validationError : true);
        }).catch((error: any) => reject(error));
    } else if (isSimple(value) && validation instanceof Array) {
      Promise.all(validation.map((validation: validation) => new Promise((resolve, reject) => validate(value, validation, request, response).then((result: boolean | ValidationError) => {
        if (typeof result !== "boolean") {
          result.validationName = validation.name;
          result.value = value as string | number | boolean;
          resolve(result);
        } else if (!result) {
          resolve(new ValidationError({ validationName: validation.name, value: value as string | number | boolean }));
        } else {
          resolve(result);
        }
      }).catch((error: any) => reject(error))),
      )).then((results: Array<boolean | ValidationError>) => {
        const validationError = results.find((result: boolean | ValidationError) => typeof result !== "boolean");
        resolve(validationError !== undefined ? validationError : true);
      }).catch((error: any) => reject(error));
    } else if (isSimple(value) && typeof validation === "function") {
      const validationResult = validation(value as string | number | boolean, request, response);

      const callback = (result: boolean | ValidationError) => resolve(result);

      if (validationResult instanceof Promise) {
        validationResult.then((result: boolean | ValidationError) => {
          callback(result);
        }).catch((error: any) => reject(error));
      } else {
        callback(validationResult);
      }
    } else {
      reject(new Error("Validation failed"));
    }

  });

};
