const pool = require('../database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const authorizeUser = async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password) return res.status(400).json({ 'message': 'Email and password are required.' });

    try{

        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        if(result.rows.length === 0) return res.status(401).json({ 'message': 'Unauthorized' });
        const userFound = result.rows[0];
        const match = await bcrypt.compare(password, userFound.password_hash);

        if(!match) return res.status(401).json({ 'message': 'Unauthorized' });

        const accessToken = jwt.sign(
            { "user_id": userFound.id, "email": userFound.email },
            process.env.ACCESS_TOKEN,
            { expiresIn: '60s' }
        );
        const refreshToken = jwt.sign(
            { "user_id": userFound.id, "email": userFound.email },
            process.env.REFRESH_TOKEN,
            { expiresIn: '1d' }
        );

        const hashedtoken = await bcrypt.hash(refreshToken, 10);

        const existingToken = await pool.query(
            `
            SELECT * FROM refresh_tokens WHERE user_id = $1
            `,
            [userFound.id]
        );

        if(existingToken.rows.length > 0){
            await pool.query(
                `
                UPDATE refresh_tokens
                SET token_hash = $1,
                    expires_at = NOW() + INTERVAL '1 day',
                    updated_at = NOW()
                WHERE user_id = $2 AND revoked = false
                `,
                [hashedtoken, userFound.id]
                
            );
        }else{
            await pool.query(`
                INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
                VALUES ($1, $2, NOW() + INTERVAL '1 day')
            `, [userFound.id, hashedtoken]);

        }
        res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
        res.json({ accessToken });

    }catch(err){
        return res.status(500).json({ 'message': err.message }); 
    }
}

module.exports = { authorizeUser };