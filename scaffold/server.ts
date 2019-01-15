import { ConfigService, container, Server } from "artos";

const configService: ConfigService = container.getService(ConfigService);

import api from "./api";
import spa from "./spa";

const server = new Server({ port: parseInt(configService.get("PORT", "1234"), 10), apps: [api, spa] });
server.start();
