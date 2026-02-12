const users = {
    user: require('../userCredentials/userdetails.json'),
    setUser: function(data) { this.user = data }
}

const bcrypt = require('bcrypt');

const authorizeUser = async (req, res) => {
    const { user, password } = req.body;

    if(!user || !password) return res.status(400).json({ 'message': 'Username and password are required.' });

    const userFound = users.user.find(person => person.username === user);
    if(!userFound) return res.status(401).json({ 'message': 'Unauthorized' });

    try{
        const match = await bcrypt.compare(password, userFound.password);

        if(match) 
            return res.status(200).json({ 'message': 'Authorized' });
        else 
            return res.status(401).json({ 'message': 'Unauthorized' });
    }catch(err){
        return res.status(500).json({ 'message': err.message }); 
    }
}

module.exports = { authorizeUser };