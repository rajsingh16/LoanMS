import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const BCRYPT_ROUNDS = 10;

export function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function createAccessToken(userId, secret) {
  return jwt.sign({ sub: userId }, secret, { expiresIn: '7d' });
}

export function verifyAccessToken(token, secret) {
  return jwt.verify(token, secret);
}
