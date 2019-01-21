import { DTO } from "./dto";

export interface ILogin {
  email: string;
  password: string;
}

export interface ILoginDTO extends ILogin { } // tslint:disable-line:no-empty-interface
export interface ILoginJSON extends ILogin { } // tslint:disable-line:no-empty-interface

export class LoginDTO extends DTO<ILoginDTO> implements ILoginDTO {

  public static parse(object: ILoginJSON): LoginDTO {
    return new LoginDTO({
      email: object.email,
      password: object.password,
    });
  }
  public email: string;
  public password: string;

  public serialize(): ILoginJSON {
    return {
      email: this.email,
      password: this.password,
    };
  }
}
