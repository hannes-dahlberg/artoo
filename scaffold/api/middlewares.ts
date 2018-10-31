// Libs
import { Request, Response, NextFunction } from 'express';

// Models
import { helpers, config } from 'artoo';
import { User } from './models/user';

// Add User to express request interface
declare global {
  namespace Express {
    interface Request {
      user: User
    }
  }
}

export let auth = (request: Request, response: Response, next: NextFunction): void => {
    //Check for authorization header
    if(request.headers.authorization) {
        //Extract token from header
        let token = (request.headers.authorization as string).substr(7, request.headers.authorization.length);
        //Decode token
        let decoded = helpers.decodeJwt(token, config.get('KEY'));
        //Check for user ID value in decoded token
        if(decoded.userId) {
            //Check for user in DB
            User.find(decoded.userId).then((user: User) => {
                //User found
                if(user) {
                    //Attach user to request
                    request.user = user;
                    //Continue request
                    next();
                } else {
                    //User not found, send 401
                    response.sendStatus(401);
                }
            //Something went wrong, send 500
          }).catch(() => response.sendStatus(500));
        } else {
            //Lacking user ID from token, send 401
            response.sendStatus(401);
        }
    } else {
        //authorization token was missing, send 401
        response.sendStatus(401);
    }
}