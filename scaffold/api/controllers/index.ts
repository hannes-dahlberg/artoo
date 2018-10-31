import * as authController from './auth_controller';

export namespace Controllers {
  export namespace Auth {
    export import login = authController.login;
  }
}