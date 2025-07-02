const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (token) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  return {
    email: payload.email,
    fullName: payload.name,
    picture: payload.picture,
    googleId: payload.sub,
  };
};

module.exports = verifyGoogleToken;