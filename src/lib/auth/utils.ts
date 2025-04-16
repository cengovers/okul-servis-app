"use server";

import { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createToken(userId: number, userName: string, isAdmin: boolean): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
  
  const token = await new SignJWT({ 
    userId, 
    userName,
    isAdmin 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(secret);
  
  return token;
}

export async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getTokenData(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] || '';
  if (!token) return null;
  
  return verifyToken(token);
}