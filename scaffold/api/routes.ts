// Libs
import * as Express from "express";

// Controllers
import { Controllers } from './controllers';

// Middlewares
import * as middlewares from './middlewares';

let routes: Express.Router = Express.Router();

routes.get('/auth/login', Controllers.Auth.login);
routes.get('/protected', middlewares.auth, (request: Express.Request, response: Express.Response) => {
routes.get('/test', (request: Express.Request, response: Express.Response) => {
  response.json({ foo: 'Hello world' });
})

export { routes };