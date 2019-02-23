export class LoadingService {
  private static _instance: LoadingService;
  static get instance(): LoadingService {
    if (this._instance === undefined) { this._instance = new LoadingService(); }
    return this._instance;
  }

  private loadings: string[] = [];

  public isOn(name: string | string[]): boolean {
    if (typeof name === "string") { name = [name]; }
    return name.every((name: string) => this.loadings.indexOf(name) !== -1);
  }

  public isOff(name: string | string[]): boolean {
    if (typeof name === "string") { name = [name]; }
    return name.every((name: string) => this.loadings.indexOf(name) === -1);
  }

  public isAnyOn(name: string | string[]): boolean {
    if (typeof name === "string") { name = [name]; }
    return name.some((name: string) => this.loadings.indexOf(name) !== -1);
  }

  public isAnyOff(name: string | string[]): boolean {
    if (typeof name === "string") { name = [name]; }
    return name.some((name: string) => this.loadings.indexOf(name) === -1);
  }

  public start(name: string | string[]): void {
    if (typeof name === "string") { name = [name]; }
    this.loadings = [...this.loadings, ...name];
  }

  public end(name: string | string[]): void {
    if (typeof name === "string") { name = [name]; }
    this.loadings = this.loadings.filter((loadingName: string) => name.indexOf(loadingName) === -1);
  }
}

const loadingService: LoadingService = LoadingService.instance;
export default loadingService;
