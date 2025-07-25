const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign(
        {id: userId},
        process.env.JWT_SECRET,{
            expiresIn: '7d',
        }
    )
}

const generateResetToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m', 
    }
  );
};

module.exports = {
    generateToken, generateResetToken
};