// Libs
import { Request, Response, NextFunction } from 'express';

// Models
import { Services } from 'artoo';
import { User } from './models/user';

// Add User to express request interface
declare global {
  namespace Express {
    interface Request {
      user: User
    }
  }
}

export const auth = (request: Request, response: Response, next: NextFunction): void => {
    //Check for authorization header
    if(request.headers.authorization) {
        //Extract token from header
        let token = (request.headers.authorization as string).substr(7, request.headers.authorization.length);
        //Decode token
        Services.auth.check(token).then((user: User) => {
            request.user = user;
            next();
        }).catch((error: any) => response.sendStatus(401));
    } else {
        response.sendStatus(400);
    }
}