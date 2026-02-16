const { Pool } = require('pg');
require('dotenv').config();

// db.js
const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: process.env.DBPASSWORD,
  database: 'jwt_users',
  port: 5432,
});

module.exports = pool;