const express = require('express');
const app = express();

app.get('/test', (req, res) => {
  res.json({ status: 'ok', message: 'Simple test server working' });
});

const port = 4001;
app.listen(port, () => {
  console.log(`Test server running on http://localhost:${port}`);
});