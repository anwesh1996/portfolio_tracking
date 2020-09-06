const dotenv = require('dotenv');
// config() will read your .env file, parse the contents, assign it to process.env.
dotenv.config();

module.exports={
  port: process.env.PORT,
  mongo_db_uri:process.env.MONGO_DB_URI,
  server_ip:process.env.SERVER_IP
}
