const pool = require('../database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt)
        return res.status(401).json({ message: "Unauthorized" });

    const refreshToken = cookies.jwt;

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN
        );

        const userId = decoded.user_id;

        const result = await pool.query(
            `
            SELECT * FROM refresh_tokens
            WHERE user_id = $1
            AND revoked = false
            AND expires_at > NOW()
            `,
            [userId]
        );

        if (result.rows.length === 0)
            return res.sendStatus(403);

        let validToken = null;

        for (const tokenRow of result.rows) {
            const isMatch = await bcrypt.compare(
                refreshToken,
                tokenRow.token_hash
            );

            if (isMatch) {
                validToken = tokenRow;
                break;
            }
        }

        if (!validToken)
            return res.sendStatus(403);

        const accessToken = jwt.sign(
            { user_id: decoded.user_id, email: decoded.email },
            process.env.ACCESS_TOKEN,
            { expiresIn: '60s' }
        );

        return res.json({ accessToken });

    } catch (err) {
        return res.sendStatus(403);
    }
};

module.exports = { handleRefreshToken };
