const users = {
    user: require('../userCredentials/userdetails.json'),
    setUser: function(data) { this.user = data }
}

const handleRefreshToken = async (req, res) => {
    const cookies  = req.cookies;
    if(!cookies?.jwt) return res.status(401).json({ 'message': 'Unauthorized' });
    console.log(cookies.jwt);
    const refreshToken = cookies.jwt;

    const foundUser = users.user.find(person => person.refreshToken === refreshToken);
    if(!foundUser) return res.sendStatus(403); //Forbidden
    
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if(err || foundUser.username !== decoded.username) return res.sendStatus(403);
            const accessToken = jwt.sign(
                { "username": decoded.username },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '30s' }
            );
            res.json({ accessToken });
        }
    )
}

module.exports = { handleRefreshToken };