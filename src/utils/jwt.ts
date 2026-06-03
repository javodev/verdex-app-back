import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET = process.env.JWT_SECRET || 'default_secret_change_this';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export const generateToken = (userId: number, email: string, role: string): string => {
  const payload: TokenPayload = { userId, email, role };
  
  // Forzar el tipo para evitar el error de TypeScript
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN } as any);
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};