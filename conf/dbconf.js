var conf = {};
console.log(process.env.MONGO_PWD);
conf = { user : 'dev',
          pwd : process.env.MONGO_PWD,
          url : 'ds039058.mongolab.com',
          port: '39058',
          db: 'dev-food-transport' };

conf.mongoUrl = conf.user + ':' + conf.pwd +
  '@' + conf.url + ':' + conf.port + '/' + conf.db;

module.exports = conf;
