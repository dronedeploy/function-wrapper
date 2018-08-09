const express = require('express');
const app = express();
handler = require('./examples/basic');
app.get('/', (req, res) => {
  console.log(res);
  handler(req, res);
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));
