// Libs
import { Request, Response } from 'express';
import { Services, helpers } from 'artoo';

// Models
import { User } from '../models/user';

export const login = (request: Request, response: Response): void => {
  /*Check request body for email and password. Sends 500 error with
  message if any is missing*/
  if(!request.body.email || request.body.pasword) {
      response.status(500).send('email and/or password was missing from request data');
      return;
  }

  Services.auth.attempt(request.body.email, request.body.password).then((result: { user: User, token: string}) => {
    response.json({
        token: result.token,
        user: result.user.serialize()
    })
  });
}