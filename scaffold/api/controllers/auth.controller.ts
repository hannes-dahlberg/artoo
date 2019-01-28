// Libs
import { AuthService, container } from "artos";
import { Request, RequestHandler, Response } from "express";
import { IAuthResponseJSON, ILoginJSON, UserDTO } from "../../shared/dto";
import { middleware, Middlewares } from "../middlewares";
import { Validation } from "../modules/validation";

// Middleware service
const middlewares: Middlewares = container.getService(Middlewares);

// Models
import { UserModel } from "../models/user.model";

export class AuthController {
  constructor(
    private readonly authService: AuthService = container.getService(AuthService),
  ) { }

  // Protect controller with validation middleware. Validating email and password
  @middleware(middlewares.validation({ email: [Validation.required, Validation.email], password: Validation.required }))
  /**
   * Login controller. Attemps login using the authservice, providing email and password from request body
   */
  public login(): RequestHandler {
    return (request: Request, response: Response): void => {
      const data: ILoginJSON = request.body;
      this.authService.attempt(data.email, data.password).then((result: { user: UserModel, token: string }) => {
        response.json({
          token: result.token,
          user: UserDTO.parse({ id: result.user.id, email: result.user.email }).serialize(),
        } as IAuthResponseJSON);
      }).catch((error: any) => response.sendStatus(401));
    };
  }
}
