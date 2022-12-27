import { Request, Response, NextFunction } from 'express';
import { titleMessageError, messages, ROLE } from '../constants';
import * as logger from '../utils/logger';

/**
 * List of roles to be able to access to the screen
 * @param roles
 */
// export const permission = (roles: number[]) => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         if (!roles.includes((req.user.role as number) || 0)) {
//             logger.logWarning(req, `権限エラー`);

//             res.render('errors/index', {
//                 title: titleMessageError.FORBIDDEN,
//                 content: messages.FORBIDDEN,
//             });

//             return;
//         }
//         next();
//     };
// };

function allow(options: {
    roles: number[];
    permitIf?: {
        userSessionPropEqualPropFrom?: {
            params?: {
                whichProp: string;
            };
            body?: {
                whichProp: string;
            };
        };
    };
}) {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.session.user?.role;
        if (options.permitIf && options.permitIf.userSessionPropEqualPropFrom) {
            if (req.params && options.permitIf.userSessionPropEqualPropFrom.params) {
                const { whichProp } = options.permitIf.userSessionPropEqualPropFrom.params;
                const userSession = req.session === undefined ? undefined : req.session.user;
                const prop = userSession?.[whichProp as keyof typeof userSession];
                if (req.params[whichProp].trim() === (typeof prop === 'string' ? prop === 'string' : prop?.toString())) {
                    next();
                    return;
                }
            }
            if (req.body && options.permitIf.userSessionPropEqualPropFrom.body) {
                const { whichProp } = options.permitIf.userSessionPropEqualPropFrom.body;
                const userSession = req.session === undefined ? undefined : req.session.user;
                const prop = userSession?.[whichProp as keyof typeof userSession];
                if (req.body[whichProp].trim() === (typeof prop === 'string' ? prop : prop?.toString())) {
                    next();
                    return;
                }
            }
        }
        if (userRole && options.roles.includes(userRole)) {
            next(); // role is allowed, so continue on the next middleware
            return;
        } else {
            logger.logWarning(req, messages.FORBIDDEN);
            res.render('errors/index', {
                title: titleMessageError.FORBIDDEN,
                content: messages.FORBIDDEN,
            });
            return;
            // res.status(403).json({ status: 403, message: 'Forbidden' });
        }
    };
}

export const defaultAllow = allow({ roles: [ROLE.ADMIN, ROLE.MANAGER] });
export const allowParams = allow({ roles: [ROLE.ADMIN, ROLE.MANAGER], permitIf: { userSessionPropEqualPropFrom: { params: { whichProp: 'id' } } } });
export const allowBody = allow({ roles: [ROLE.ADMIN, ROLE.MANAGER], permitIf: { userSessionPropEqualPropFrom: { body: { whichProp: 'id' } } } });
export const allowBoth = allow({ roles: [ROLE.ADMIN, ROLE.MANAGER], permitIf: { userSessionPropEqualPropFrom: { params: { whichProp: 'id' }, body: { whichProp: 'id' } } } });
