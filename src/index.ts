require('dotenv').config();
const express = require('express');
import { Express } from 'express';
import { connect } from './db/conn';
import bodyParser = require('body-parser');
import {
  getRefreshToken,
  login,
  signup,
  verifyJWT,
} from './services/auth.service';

const app: Express = express();
const PORT = 8000;

app.use(bodyParser.json());

app.get('/verify', verifyJWT);
app.get('/refresh/:refreshToken', getRefreshToken);
app.post('/signup', signup);
app.post('/login', login);

connect((err) => {
  if (err) {
    console.error(err);
    process.exit();
  }

  app.listen(PORT, () => {
    console.log(`auth server listening on ${PORT}`);
  });
});
