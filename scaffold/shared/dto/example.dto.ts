import { DTO } from "./dto";

export interface IExample<A, B> {
  id: number;
  foo?: A;
  bar?: B[];
}

export interface IExampleDTO extends IExample<IExampleDTO, IExampleDTO> { }
export interface IExampleJSON extends IExample<IExampleJSON, IExampleJSON> { }

export class ExampleDTO extends DTO<IExampleDTO> implements IExampleDTO {

  public static parse(object: IExampleJSON): ExampleDTO {
    return new ExampleDTO({
      id: object.id,
      ...(object.foo ? { foo: ExampleDTO.parse(object.foo) } : null),
      ...(object.bar ? { projects: object.bar.map((bar: IExampleJSON) => ExampleDTO.parse(bar)) } : null),
    });
  }
  public id: number;
  public foo?: ExampleDTO;
  public bar?: ExampleDTO[];

  public serialize(): IExampleJSON {
    return {
      id: this.id,
      ...(this.foo ? { foo: this.foo.serialize() } : null),
      ...(this.bar ? { bar: this.bar.map((foo: ExampleDTO) => foo.serialize()) } : null),
    };
  }
}
