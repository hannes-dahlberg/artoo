import { DTO } from "./dto";

export interface IUSer {
  id: number;
  email: string;
}
export interface IUserDTO extends IUSer { }
export interface IUserJSON extends IUSer { }

export class UserDTO extends DTO<IUserDTO> implements IUserDTO {

  public static parse(object: IUserJSON): UserDTO {
    return new UserDTO({
      id: object.id,
      email: object.email,
    });
  }
  public id: number;
  public email: string;

  public serialize(): IUserJSON {
    return {
      id: this.id,
      email: this.email,
    };
  }
}
