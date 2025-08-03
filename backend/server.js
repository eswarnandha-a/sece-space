// backend/server.js
const app = require('./app');
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

console.log('Starting server...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', PORT);
console.log('Host:', HOST);

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT}`);
  console.log(`✅ Health check: http://${HOST}:${PORT}/health`);
  console.log(`✅ API base: http://${HOST}:${PORT}/api`);
});
