// @ts-nocheck
/**
 * Login controller
 */
import * as logger from '../utils/logger';
import { Request, Response } from 'express';
import { UserService } from '../services/user.services';

/**
 * GET login
 */
export const login = (req: Request, res: Response) => {
    const flashMessage = req.flash('message')[0];
    res.render('login/index', {
        layout: 'layout/loginLayout',
        message: flashMessage ?? '',
        username: '',
    });
};

/**
 * POST login
 */
export const auth = async (req: Request, res: Response) => {
    const { redirect } = req.query;
    const { username, password } = req.body;
    try {
        // get a User repository to perform operations with User
        const userService = new UserService();
        // load a post by a given post id
        const user = await userService.verifyCredentials(username, password);
        if (!user) {
            // write log
            logger.logInfo(req, `Failed login attempt: username(${username || ''}, password(${password || ''})`,
            );
            res.render('login/index', {
                layout: 'layout/loginLayout',
                username: username,
                message: 'Username or password is incorrect',
            });
        }
        if (user) {
            // save user info into session
            (req.session as Express.Session).user = { ...user, };
            req.user.isAuthorized = true;
            // write log
            logger.logInfo(req, `User id(${user!.id}) logged in successfully.`);
            // If [ログイン] clicked, then redirect to TOP page
            if (redirect !== undefined && redirect.length! > 0 && redirect !== '/') {
                res.redirect(decodeURIComponent(redirect!.toString()));
            } else {
                res.redirect('/');
            }
        }
    } catch (err) {
        // write log
        logger.logInfo(req, `Failed login attempt: name(${username || ''})`);
        res.render('login/index', {
            layout: 'layout/loginLayout',
            username: username,
            message: 'Error when login!',
        });
    }
};
/**
 * GET logout
 */
export const logout = async (req: Request, res: Response) => {
    req.user.destroy();
    req.session.destroy();
    const { redirect } = req.query;
    // write log
    logger.logInfo(req, 'User logged out successfully.');
    let redirectURL = '/login';
    if (redirect !== undefined) {
        redirectURL += `?redirect=${encodeURIComponent(redirect!.toString())}`;
    }
    res.redirect(redirectURL);
};
