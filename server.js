const express = require('express');
const login = require('./authorizer/resgistoryController');
const app = express();
const auth = require('./authorizer/authorizationController');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const { registerNewUserDB } = require('./database/registerNewUser');
const port = 3000;



app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.post('/signup', login.registerNewUser);

app.post('/login', auth.authorizeUser);

app.get('/', verifyJWT, (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.post('/dbsignup', registerNewUserDB);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});