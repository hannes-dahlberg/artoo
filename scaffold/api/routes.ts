import * as Express from "express";

let routes: Express.Router = Express.Router();

routes.get('/apa', (request: Express.Request, response: Express.Response) => {
  response.json({ foo: 'Hello world' });
})

export { routes };