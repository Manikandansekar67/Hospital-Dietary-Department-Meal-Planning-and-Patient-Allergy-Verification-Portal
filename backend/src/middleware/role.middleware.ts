import { Request, Response, NextFunction } from 'express';
import { Role, ErrorCode } from '../constants/index.js';
import { sendError } from '../utils/response.js';

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, ErrorCode.UNAUTHORIZED, 'User is not authenticated');
      return;
    }

    const userRole = String(req.user.role).toUpperCase();
    const upperAllowed = allowedRoles.map((r) => String(r).toUpperCase());

    if (!upperAllowed.includes(userRole)) {
      sendError(
        res,
        403,
        ErrorCode.FORBIDDEN,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource`
      );
      return;
    }

    next();
  };
};

export const requirePatientOwner = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    sendError(res, 401, ErrorCode.UNAUTHORIZED, 'User is not authenticated');
    return;
  }

  const userRole = String(req.user.role).toUpperCase();

  // Admins and Doctors have supervisory access
  if (userRole === Role.ADMIN || userRole === Role.DOCTOR) {
    return next();
  }

  const requestedPatientId = req.params.patientId || req.body.patientId || req.query.patientId;
  if (userRole === Role.PATIENT && req.user.patientId && requestedPatientId && req.user.patientId !== requestedPatientId) {
    sendError(res, 403, ErrorCode.FORBIDDEN, 'Patients cannot access data of another patient');
    return;
  }

  next();
};
