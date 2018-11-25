import { server, config } from 'artoo';
import { routes } from './routes';
let app: server.app = {
  domain: config.get('SPA_HOST', 'api.test.test'),
  type: 'api',
  routes: routes,
  corsConfig: config.get('API_HOST', null);
};

export default app;