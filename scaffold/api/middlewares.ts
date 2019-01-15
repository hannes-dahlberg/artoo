// Libs
import { NextFunction, Request, RequestHandler, Response } from "express";

import { UserModel } from "./models/user.model";
import { IValidationInput, validate, ValidationError } from "./modules/validation";

// Models
import { AuthService, container } from "artos";

// Add User to express request interface
declare global {
    namespace Express {
        interface Request { // tslint:disable-line:interface-name
            user: UserModel;
        }
    }
}

export const middleware = (middlewares: RequestHandler | RequestHandler[]) => (target: any, propertyKey: string, descriptor: PropertyDescriptor): void => {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
        if (!(middlewares instanceof Array)) { middlewares = [middlewares]; }
        return [...middlewares, originalMethod.apply(this, ...args)];
    };
};

container.set<typeof UserModel>("model.user", UserModel);

export class Middlewares {
    constructor(
        private readonly authService: AuthService = container.getService(AuthService, { args: [undefined, undefined, UserModel] }),
        private readonly userModel: typeof UserModel = container.get<typeof UserModel>("model.user", UserModel),
    ) { }

    public auth(): RequestHandler {
        return (request: Request, response: Response, next: NextFunction): void => {
            // Check for authorization header
            if (request.headers.authorization) {
                // Extract token from header
                const token = (request.headers.authorization as string).substr(8, request.headers.authorization.length);
                // Decode token
                this.authService.check(token).then((user: UserModel) => {
                    request.user = user;
                    next();
                }).catch((error: any) => response.sendStatus(401));
            } else {
                response.sendStatus(400);
            }
        };
    }

    public guest(): RequestHandler {
        return (request: Request, response: Response, next: NextFunction): void => {
            if (!request.headers.authorization) {
                next();
            } else {
                response.sendStatus(400);
            }
        };
    }

    public validation(validation: IValidationInput): RequestHandler {
        return (request: Request, response: Response, next: NextFunction): void => {
            const data = request.method === "GET" ? request.query : request.body;
            validate(data, validation, request, response)
                .then((result: boolean | ValidationError) => {
                    if (typeof result === "boolean") {
                        if (result) { next(); } else { response.status(400).json({ message: "Validation failed" }); }
                    } else {
                        response.status(400).json({ validationError: result });
                    }
                }).catch((error: any) => response.sendStatus(500));
        };
    }
}
