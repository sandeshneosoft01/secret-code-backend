import { RequestHandler, Request } from 'express';
import { verifyToken } from '@utils/auth';

interface JwtPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

interface AuthenticatedRequest extends Request {
  user: any;
}

const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const authHeader = authReq.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    const payload = verifyToken(token) as JwtPayload | null;

    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return res.status(401).json({ error: 'Token expired' });
    }

    req.user = payload as any;

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      details: error instanceof Error ? error.message : error,
    });
  }
};

export default authMiddleware;
