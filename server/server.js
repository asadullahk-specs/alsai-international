require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

// Reuse DB connection across warm serverless invocations
let isConnected = false;

const handler = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
};

// Export for Vercel serverless
module.exports = handler;

// Local development — only runs when this file is executed directly (not imported by Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`AL SA'I API server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
  });

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
    process.exit(1);
  });
}
