import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { errMsg } from '../../../constants';

const userExpressValidationRule = (hasRetype: boolean) => {
    // task validation: https://redmine.bridevelopment.com/issues/106778
    return [
        body('name')
            .isLength({ max: 100 })
            .not()
            .isEmpty()
            .withMessage(errMsg.ERR001('name'))
            .trim()
            .escape(),
        body('username')
            .isLength({ max: 255 })
            .not()
            .isEmpty()
            .withMessage(errMsg.ERR001('username'))
            .trim()
            .escape(),
        body('password', errMsg.ERR002('password', 6, 20))
            .isLength({ min: 6, max: 20 })
            .not()
            .isEmpty()
            .trim()
            .escape(),
        // body('retype')
        //     .optional({ checkFalsy: true })
        //     .not()
        //     .isEmpty().withMessage(errMsg.ERR001('retype'))
        //     .custom((value, { req }) => value === req.body.password).withMessage(errMsg.ERR004('retype', 'password')),
        body('retype')
            .custom((value, { req }) => {
                return hasRetype ? value === req.body.password : true;
            })
            .withMessage(errMsg.ERR004('retype', 'password')),
        body('email')
            .isLength({ max: 255 })
            .isEmail()
            .withMessage(errMsg.ERR003('email'))
            .trim()
            .escape(),
        body('role')
            .not()
            .isEmpty()
            .withMessage(errMsg.ERR001('role')),
    ];
};

const expressValidateUser = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors: (
        | { [s: string]: unknown }
        | ArrayLike<unknown>
    )[] = [];
    errors.array().forEach(err => {
        extractedErrors.push({ [err.param]: err.msg });
    });
    // return res.status(422).json({ errors: extractedErrors });
    req.flash('message', Object.values(extractedErrors[0]))[0]; // get first value of the first object element in the array
    req.flash('dataBack', req.body); // return req.body data back to front-end
    res.redirect('/admin/users/addPage');
};