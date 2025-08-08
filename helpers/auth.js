// helpers/auth.js

import jwt from 'jsonwebtoken';
import { serialize, parse } from 'cookie';

// Use environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const TOKEN_EXPIRY_SECONDS = 60 * 60 * 24 * 30; // 30 days


export function createToken({ userId, username, userName }) {
  return jwt.sign(
    { userId, username, userName },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY_SECONDS }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null; // token invalid or expired
  }
}

export function setTokenCookie(res, token) {
  const cookie = serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TOKEN_EXPIRY_SECONDS,
  });
  res.setHeader('Set-Cookie', cookie);
}

export function getTokenFromRequest(req) {
  if (!req.cookies) {
    req.cookies = parse(req.headers.cookie || '');
  }
  return req.cookies.token || null;
}


export function allowed(req) {
  const token = getTokenFromRequest(req);
  const user = verifyToken(token);
  if (user) {
    req.user = user;
    return true;
  }
  return false;
}