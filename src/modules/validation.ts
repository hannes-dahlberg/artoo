import * as moment from 'moment';

export type validation = (value: string) => boolean;

export namespace Validation {

  export const required: validation = (value: string): boolean => {
    return value.length > 0;
  }
  export const max = (max: number): validation => (value: string): boolean => {
    if (Number(value)) { return Number(value) <= max; }
    return value.length <= max;
  }
  export const min = (min: number): validation => (value: string): boolean => {
    if (Number(value)) { return Number(value) >= min; }
    return value.length >= min;
  }
  export const email: validation = (value: string): boolean => {
    return (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(value);
  }
  export const date = (format: string | null = null): validation => (value: string): boolean => {
    return moment(value, format).isValid();
  }

  export type value = { [key: string]: value | string };
  export type input = { [key: string]: input | validation | validation[] };
}


export const validate = (value: Validation.value | string, validation: Validation.input | validation | validation[]): boolean {
  if (typeof value !== 'string' && !(validation instanceof Array) && typeof validation !== 'function') {
    return Object.keys(value).findIndex((valueName: string) => {
      return !validate(value[valueName], validation[valueName]);
    }) == -1 ? true : false;
  } else if (typeof value === 'string' && validation instanceof Array) {
    return validation.findIndex((validation: validation) => !validate(value, validation)) == -1 ? true : false;
  } else if (typeof value === 'string' && typeof validation === 'function') {
    return validation(value);
  }

  throw new Error('Validation failed. Input missmatched');
}