import dotenv from 'dotenv';

dotenv.config();

const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
const POSTGRES_PASSWORD =
  process.env.POSTGRES_PASSWORD || 'supersecretpassword';
const POSTGRES_URL =
  process.env.DATABASE_URL || 'postgres://postgres@localhost/postgres';

const DB = {
  username: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  url: POSTGRES_URL,
};

const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
const SERVER_PORT = Number(process.env.SERVER_PORT || 3000);
const SERVER_TOKEN_EXPIRETIME = Number(
  process.env.SERVER_TOKEN_EXPIRETIME || 3600
);
const SERVER_TOKEN_ISSUER = process.env.SERVER_TOKEN_ISSUER || 'defaultIssuer';
const SERVER_TOKEN_SECRET =
  process.env.SERVER_TOKEN_SECRET || 'superencryptedsecret';

const SERVER = {
  hostname: SERVER_HOSTNAME,
  port: SERVER_PORT,
  token: {
    expireTime: SERVER_TOKEN_EXPIRETIME,
    issuer: SERVER_TOKEN_ISSUER,
    secret: SERVER_TOKEN_SECRET,
  },
};

const config = {
  db: DB,
  server: SERVER,
};

export default config;
