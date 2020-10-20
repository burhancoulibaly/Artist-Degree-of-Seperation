const dotenv = require('dotenv'),   
      dotenvExpand = require('dotenv-expand'),
      envFile = process.env.NODE_ENV ? `./.env.${process.env.NODE_ENV}` : '.env';

dotenv.config({ path: envFile })

config = {}

module.exports = {
    config
}