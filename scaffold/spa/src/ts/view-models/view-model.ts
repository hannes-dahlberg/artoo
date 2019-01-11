export class ViewModel<T extends { [key: string]: any }> {
  public constructor(properties: T) {
    Object.keys(properties).forEach((key: string) => {
      this[key] = properties[key];
    });
  }
}