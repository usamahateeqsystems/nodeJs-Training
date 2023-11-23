const jwt = require('jsonwebtoken');

require('dotenv').config();

const authentication = {
    getAccessToken: function (userObject){
      const vals = jwt.sign(
        { email: userObject.email }, 
        process.env.TOKEN_SECRET, 
        { expiresIn: process.env.TOKEN_EXPIRY }
        );
      return vals;
      },
      authenticate : function (req, res, next){
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
      
        if (token == null) return res.sendStatus(403);
      
        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
          if (err)
          {
            console.log(err);
            return res.sendStatus(403);
          }
          req.user = user;
          next()
        })
      
      }
    
}

module.exports = authentication