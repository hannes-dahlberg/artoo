import * as moment from "moment";

export type validation = (value: string) => boolean;

export const Validation = {
  between: (min: number, max: number): validation => (value: string): boolean => {
    return Validation.min(min)(value) && Validation.max(max)(value);
  },
  date: (format: string | null = null): validation => (value: string): boolean => {
    return moment(value, format).isValid();
  },
  email: ((value: string): boolean => {
    return new RegExp(`/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|`
      + `(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z` +
      `\-0-9]+\.)+[a-zA-Z]{2,}))$/`).test(value);
  }) as validation,
  max: (max: number): validation => (value: string): boolean => {
    if (Number(value)) { return Number(value) <= max; }
    return value.length <= max;
  },
  min: (min: number): validation => (value: string): boolean => {
    if (Number(value)) { return Number(value) >= min; }
    return value.length >= min;
  },
  required: ((fewf: string): boolean => {
    return fewf.length > 0;
  }) as validation,
};

export interface IValidationValue { [key: string]: IValidationValue | string; }
export interface IValidationInput { [key: string]: IValidationInput | validation | validation[]; }
export interface Ifap {
  foo: string;
}
export const validate = (
  value: IValidationValue | string,
  validations: IValidationInput | validation | validation[],
): boolean => {
  if (typeof value !== "string" && !(validations instanceof Array) && typeof validations !== "function") {
    return Object.keys(value).findIndex((valueName: string) => {
      return !validate(value[valueName], validations[valueName]);
    }) === -1 ? true : false;
  } else if (typeof value === "string" && validations instanceof Array) {
    return validations.findIndex((v: validation) => !validate(value, v)) === -1 ? true : false;
  } else if (typeof value === "string" && typeof validations === "function") {
    return validations(value);
  }

  throw new Error("Validation failed. Input missmatched");
};

const apa = {
  max: (max: number) => (value: string): boolean => {
    if (Number(value)) { return Number(value) <= max; }
    return value.length <= max;
  },
  min: (min: number) => ((value: string): boolean => {
    if (Number(value)) { return Number(value) >= min; }
    return value.length >= min;
  }) as validation,

};
