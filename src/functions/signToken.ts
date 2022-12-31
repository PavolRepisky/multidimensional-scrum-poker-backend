import jwt from 'jsonwebtoken';
import config from '../config/config';

const signToken = (email: string, userId: string) => {
  return jwt.sign(
    { email: email, userId: userId },
    config.server.token.secret,
    {
      issuer: config.server.token.issuer,
      algorithm: 'HS256',
      expiresIn: config.server.token.expireTime,
    }
  );
};

export default signToken;
