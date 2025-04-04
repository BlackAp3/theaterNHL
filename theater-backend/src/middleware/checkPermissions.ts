import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export function checkPermission(requiredAction: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user || !user.permissions || !Array.isArray(user.permissions.actions)) {
      res.status(403).json({ error: 'Access denied: permissions not set' });
      return;
    }

    if (!user.permissions.actions.includes(requiredAction)) {
      res.status(403).json({ error: `Access denied: missing '${requiredAction}' permission` });
      return;
    }

    next(); // ✅ make sure this is always called if checks pass
  };
}
