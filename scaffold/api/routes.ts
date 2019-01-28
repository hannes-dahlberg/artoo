// Libs
import { container } from "artos";
import { Request, RequestHandler, Response, Router } from "express";

// Controllers
import { AuthController } from "./controllers";

// Middlewares
import { Middlewares } from "./middlewares";

const middlewares: Middlewares = container.getService(Middlewares);
const authController: AuthController = container.getService(AuthController);

const router: Router = Router();

router.post("/auth/login", middlewares.guest(), authController.login());

export { router };
