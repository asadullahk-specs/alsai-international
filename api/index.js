require('dotenv').config();
const app = require('../server/src/app');
const connectDB = require('../server/src/config/db');

let isConnected = false;

module.exports = async (req, res) => {
  try {
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }
  } catch (err) {
    console.error('Vercel serverless DB connection error:', err);
  }
  return app(req, res);
};
