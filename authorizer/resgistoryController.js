const pool  = require('../database/db');
const bcrypt = require('bcrypt');

const registerNewUser = async (req, res) => {
    const { email , password } = req.body;
    if(!email || !password) 
        return res.status(400).json({ 'message': 'Email and password are required.' });

    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
            INSERT INTO users (email, password_hash)
            VALUES ($1, $2)
            RETURNING id, email;
        `;
        const result = await pool.query(query, [email, hashedPassword]);
        res.status(201).json({ 'message': 'User registered successfully', 'user': result.rows[0] });
        // console.log(result.rows[0]);
    }catch(err){
        if(err.code === '23505') {
            return res.status(409).json({ 'message': 'Email already exists.' });
        }
        return res.status(500).json({ 'message': err.message });
    }
}

module.exports = { registerNewUser };