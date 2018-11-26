import { server, config } from 'artoo';

let app: server.app = {
  domain: config.get('SPA_HOST', 'www.test.test'),
  type: 'spa',
  staticPath: 'build/spa_web'
};

export default app;