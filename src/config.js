require('babel-polyfill');

const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development'];

module.exports = Object.assign({
  host: process.env.HOST || 'localhost',
  port: process.env.PORT,
  apiHost: '172.31.0.3',
  apiPort: 8761,
  eventServer: 'hb1.codeabovelab.com/ui/stomp',
  mock: false,
  app: {
    title: 'Dockmaster',
    head: {
      titleTemplate: 'Dockmaster: %s',
      meta: [
        {charset: 'utf-8'}
      ]
    }
  }

}, environment);
