const users = {
    user: require('../userCredentials/userdetails.json'),
    setUser: function(data) { this.user = data }
}

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
require('dotenv').config();
const fspromise = require('fs').promises;
const path = require('path');

const authorizeUser = async (req, res) => {
    const { user, password } = req.body;

    if(!user || !password) return res.status(400).json({ 'message': 'Username and password are required.' });

    const userFound = users.user.find(person => person.username === user);
    if(!userFound) return res.status(401).json({ 'message': 'Unauthorized' });

    try{
        const match = await bcrypt.compare(password, userFound.password);

        if(match){
            const accessToken = jwt.sign(
                { "username": userFound.username },
                process.env.ACCESS_TOKEN,
                { expiresIn: '60s' }
            );
            const refreshToken = jwt.sign(
                { "username": userFound.username },
                process.env.REFRESH_TOKEN,
                { expiresIn: '1d' }
            );

            const otherUser = users.user.filter(person => person.username !== userFound.username);
            users.setUser([...otherUser, { ...userFound, refreshToken }]);
            
            await fspromise.writeFile(
                path.join(__dirname, '..', 'userCredentials', 'userdetails.json'), 
                JSON.stringify(users.user)
            );
            res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 2 *60 * 1000 });
            res.json({ accessToken });
        }
        else{
            return res.status(401).json({ 'message': 'Unauthorized' });
        }
    }catch(err){
        return res.status(500).json({ 'message': err.message }); 
    }
}

module.exports = { authorizeUser };