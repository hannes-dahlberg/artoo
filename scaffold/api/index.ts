import { server, config } from 'artoo';
import { routes } from './routes';
let app: server.app = {
  domain: config.get('API_HOST', 'api.test.test'),
  type: 'api',
  routes: routes,
  corsConfig: `http://${config.get('SPA_HOST', '*.test.test')}:${config.get('PORT', '1234')}`
};

export default app;