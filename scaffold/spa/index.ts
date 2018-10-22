import { server } from 'artoo';

let app: server.app = {
  domain: '*.mydomain.test',
  type: 'spa',
  staticPath: 'build/spa_web'
};

export default app;