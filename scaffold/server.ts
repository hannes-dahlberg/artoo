import { config, Server } from "artoo";

import api from "./api";
import spa from "./spa";

const server = new Server({ port: parseInt(config.get("PORT", "1234"), 10), apps: [api, spa] });
server.start();
