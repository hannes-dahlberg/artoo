// Libs
import { Request, Response, NextFunction } from 'express';

// Models
import { Services, Validation, validate, } from 'artoo';
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
    if (request.headers.authorization) {
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

export const guest = (request: Request, response: Response, next: NextFunction): void => {
    if (!request.headers.authorization) {
        next();
    } else {
        response.sendStatus(400);
    }
}

export const validation = (validation: Validation.input) => (request: Request, response: Response, next: NextFunction): void => {
    //Check if request body is empty
    if (validate(request.body, validation)) {
        next();
    } else {
        response.status(400).send('Validation failed');
    }
}