const fsPromise = require('fs').promises;
const path = require('path');

const users = {
    user: require('../userCredentials/userdetails.json'),
    setUser: function(data) { this.user = data }
}

const bcrypt = require('bcrypt');

const registerNewUser = async (req, res) => {
    const { user , password } = req.body;
    if(!user || !password) 
        return res.status(400).json({ 'message': 'Username and password are required.' });

    const duplicate = users.user.find(person => person.username === user);
    if(duplicate)
        return res.status(409).json({ 'message': 'username already exists.' });

    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {username: user, password: hashedPassword};

        users.setUser([...users.user, newUser]);
        console.log(users.user);
        const isSuccess = await fsPromise
        .writeFile(
            path.join(__dirname, '../userCredentials/userdetails.json'), 
            JSON.stringify(users.user)
        );

    }catch(err){
        return res.status(500).json({ 'message': err.message });
    }
    res.status(201).json({ 'success': `New user ${user} created!` });

}

module.exports = { registerNewUser };