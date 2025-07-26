// backend/server.js
const app = require('./app'); // assumes you have an app.js that sets up Express
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
