const express = require('express');
const login = require('./authorizer/resgistoryController');
const app = express();
const auth = require('./authorizer/authorizationController');
const port = 3000;

app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/signup', login.registerNewUser);

app.post('/login', auth.authorizeUser);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});