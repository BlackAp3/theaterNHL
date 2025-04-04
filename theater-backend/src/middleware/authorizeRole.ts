import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export function authorizeRoles(...allowedRoles: Array<'admin' | 'manager' | 'nurse' | 'viewer'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Access denied: insufficient permissions' });
      return;
    }
    next();
  };
}
