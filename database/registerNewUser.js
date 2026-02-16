const pool = require('./db');
const bcrypt = require('bcrypt');

const registerNewUserDB = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      RETURNING id, email;
    `;

    const result = await pool.query(query, [email, hashedPassword]);

    return res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0]
    });

  } catch (error) {

    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Email already exists'
      });
    }

    console.error(error);

    return res.status(500).json({
      error: 'Internal server error'
    });
  }
};

module.exports = { registerNewUserDB };