const dotenv = require('dotenv'),   
      dotenvExpand = require('dotenv-expand'),
      envFile = process.env.NODE_ENV ? `./.env.${process.env.NODE_ENV}` : '.env';

dotenv.config({ path: envFile })

config = {
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT
}

module.exports = {
    config
}