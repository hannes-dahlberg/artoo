import { container, HelperService } from 'artoo';
import moment = require('moment');

export class DateTimeModel {
  private _moment: moment.Moment;
  constructor(date: Date)
  constructor(date: string, format?: string)
  constructor(year: number, month: number, day: number, hour?: number, minute?: number, second?: number)
  constructor(year: Date | string | number, month?: number | string, day?: number, hour: number = 0, minute: number = 0, second: number = 0) {
    if (year instanceof Date) {
      this._moment = moment(year);
    } else if (typeof year == 'string') {
      this._moment = moment(year, typeof month === "string" ? month : undefined);
    } else {
      this._moment = moment(`${year}${month}${day}${hour}${minute}${second}`, 'YYYYMDHms')
    }
  }

  public get isValid(): boolean { return this._moment.isValid(); }

  public get year(): number { return this._moment.year(); }
  public set year(value: number) { this._moment.year(value); }

  public get month(): number { return this._moment.month(); }
  public set month(value: number) { this._moment.month(value); }

  public get day(): number { return this._moment.day(); }
  public set day(value: number) { this._moment.day(value); }

  public get hour(): number { return this._moment.hour(); }
  public set hour(value: number) { this._moment.hour(value); }

  public get minute(): number { return this._moment.minute(); }
  public set minute(value: number) { this._moment.minute(value); }

  public get second(): number { return this._moment.second(); }
  public set second(value: number) { this._moment.second(value); }

  public toDate(): Date {
    return this._moment.toDate();
  }

  public toMoment(): moment.Moment {
    return this._moment;
  }

  public format(format: string): string {
    return this._moment.format(format);
  }

  public parse(date: string, format?: string): DateTimeModel {
    this._moment = moment(date, format);
    return this;
  }

  public toDateString(): string {
    return this._moment.format('YYYY-MM-DD');
  }

  public toTimeString(): string {
    return this._moment.format('HH:mm:ss');
  }

  public toString(): string {
    return `${this.toDateString()} ${this.toTimeString()}`;
  }

  public static create(value: string | DateTimeModel): DateTimeModel {
    if (typeof value === "string") { return new DateTimeModel(value); }
    return value;
  }
}