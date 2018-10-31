// Libs
import * as Express from "express";

// Controllers
import { Controllers } from './controllers';

let routes: Express.Router = Express.Router();

routes.get('/auth/login', Controllers.Auth.login);
routes.get('/apa', (request: Express.Request, response: Express.Response) => {
  response.json({ foo: 'Hello world' });
})

export { routes };