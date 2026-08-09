require('dotenv').config();
const app = require('../src/app');
const connectDB = require('../src/config/db');

let isConnected = false;

module.exports = async (req, res) => {
  try {
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }
  } catch (err) {
    console.error('Serverless DB connection error:', err);
  }
  return app(req, res);
};
