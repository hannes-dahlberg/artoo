import { DTO } from "./dto";
import { IUserDTO, IUserJSON, UserDTO } from "./user.dto";

export interface IAuthResponse<A> {
  token: string;
  user: A;
}

export interface IAuthResponseDTO extends IAuthResponse<IUserDTO> { }
export interface IAuthResponseJSON extends IAuthResponse<IUserJSON> { }

export class AuthResponseDTO extends DTO<IAuthResponseDTO> implements IAuthResponseDTO {

  public static parse(object: IAuthResponseJSON): AuthResponseDTO {
    return new AuthResponseDTO({
      token: object.token,
      user: UserDTO.parse(object.user),
    });
  }
  public token: string;
  public user: UserDTO;

  public serialize(): IAuthResponseJSON {
    return {
      token: this.token,
      user: this.user.serialize(),
    };
  }
}
