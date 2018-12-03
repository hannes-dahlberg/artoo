// Libs
import * as Express from "express";
import { Validation } from 'artoo';

// Controllers
import { Controllers } from './controllers';

// Middlewares
import * as middlewares from './middlewares';

let routes: Express.Router = Express.Router();

routes.post('/auth/login', middlewares.guest, middlewares.validation({ email: Validation.email, password: Validation.required }), Controllers.Auth.login);
routes.get('/protected', middlewares.auth, (request: Express.Request, response: Express.Response) => {

});
routes.get('/test', (request: Express.Request, response: Express.Response) => {
  response.json({ foo: 'Hello world' });
})

export { routes };