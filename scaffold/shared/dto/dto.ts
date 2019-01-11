export interface IJSON {
  [key: string]: string | number | Boolean | null | IJSON | IJSON[]
}
export interface IDTO {
  [key: string]: any
}
export class DTO<T extends { [key: string]: any }> {
  public constructor(properties: T) {
    Object.keys(properties).forEach((key: string) => {
      (this as any)[key] = properties[key];
    });
  }
}