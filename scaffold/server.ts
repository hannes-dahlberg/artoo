import { Server } from 'artoo';

import api from './api';
import spa from './spa';

let server = new Server({ apps: [api, spa] });
server.start();