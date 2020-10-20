const dotenv = require('dotenv'),   
      dotenvExpand = require('dotenv-expand'),
      envFile = process.env.NODE_ENV ? `./.env.${process.env.NODE_ENV}` : '.env';

dotenv.config({ path: envFile })

config = {
    user: process.env.DBUSER,
    host: process.env.DBHOST,
    database: process.env.DATABASE,
    password: process.env.DBPASSWORD,
    port: process.env.DBPORT
}

module.exports = {
    config
}