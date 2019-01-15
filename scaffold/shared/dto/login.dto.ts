import { DTO } from "./dto";

export interface ILogin {
  email: string;
  password: string;
}

export interface ILoginDTO extends ILogin { }
export interface ILoginJSON extends ILogin { }

export class LoginDTO extends DTO<ILoginDTO> implements ILoginDTO {
  public email: string;
  public password: string;

  public serialize(): ILoginJSON {
    return {
      email: this.email,
      password: this.password,
    }
  }

  public static parse(object: ILoginJSON): LoginDTO {
    return new LoginDTO({
      email: object.email,
      password: object.password
    });
  }
}