import { Server, config } from 'artoo';

import api from './api';
import spa from './spa';

let server = new Server({ port: parseInt(config.get('PORT', '9090')), apps: [api, spa] });
server.start();