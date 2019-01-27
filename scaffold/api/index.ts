import { ConfigService, container, IApp } from "artos";
import { router } from "./routes";
import { UserModel } from "./models/user.model";

container.set("model.user", UserModel);
const configService: ConfigService = container.getService(ConfigService);

let app: IApp = {
  domain: configService.get("API_HOST", "api.test.test"),
  type: 'api',
  routes: router,
  corsConfig: { origin: new RegExp(`^https?:\\/\\/${configService.get("SPA_HOST", "*.test.test").replace(/\./g, "\\.")}(:\\d+$|$)`) },
};

export default app;