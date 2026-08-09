require('dotenv').config();
const app = require('../server/src/app');
const connectDB = require('../server/src/config/db');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
};
