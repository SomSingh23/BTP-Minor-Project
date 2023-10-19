let Redis = require("ioredis");
let client = new Redis({
  host: process.env.HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});
module.exports = client;
