import { server } from 'artoo';

let app: server.app = {
  domain: 'www.mydomain.test',
  type: 'spa',
  staticPath: 'build/spa_web'
};

export default app;