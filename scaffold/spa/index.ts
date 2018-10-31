import { server } from 'artoo';

let app: server.app = {
  domain: '*.timefly.test',
  type: 'spa',
  staticPath: 'build/spa_web'
};

export default app;