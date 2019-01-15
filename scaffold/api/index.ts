import { ConfigService, container, IApp } from "artos";
import { router } from "./routes";
import { UserModel } from "./models/user.model";

container.set("model.user", UserModel);
const configService: ConfigService = container.getService(ConfigService);

let app: IApp = {
  domain: configService.get("API_HOST", "api.test.test"),
  type: 'api',
  routes: router,
  corsConfig: `http://${configService.get("SPA_HOST", "*.test.test")}:${configService.get("PORT", "1234")}`,
};

export default app;