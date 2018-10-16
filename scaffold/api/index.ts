import { server } from 'artoo';
import { routes } from './routes';
let app: server.app = {
  domain: 'api.mydomain.test',
  type: 'api',
  routes: routes
};

export default app;