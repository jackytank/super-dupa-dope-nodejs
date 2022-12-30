import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { blackListWords, errMsg } from '../../../constants';
import { UserRole } from '../../../entities/user.entity';
import DOMPurify from 'isomorphic-dompurify';
/**
 * 
 * @param options if hasRetype is true then retype must be equal to password, if hasPass is true then password must be provided
 * @returns return an array of express-validator rules for user validation
 */
export const userExpressValidationRule = (options: { hasRetype: boolean; hasPass: boolean; }) => {
    // task validation: https://redmine.bridevelopment.com/issues/106778
    const ruleArr = [
        body('name')
            .customSanitizer((value) => {
                return DOMPurify.sanitize(value);
            })
            .custom((value, { req }) => {
                return blackListWords.some((word) => value.includes(word)) ? false : true;
            }).withMessage(errMsg.ERR008('name'))
            .isLength({ max: 100 })
            .not()
            .isEmpty().withMessage(errMsg.ERR001('name'))
            .trim(),
        body('username')
            .customSanitizer((value) => {
                return DOMPurify.sanitize(value);
            })
            .custom((value, { req }) => {
                return blackListWords.some((word) => value.includes(word)) ? false : true;
            }).withMessage(errMsg.ERR008('username'))
            .isLength({ max: 255 })
            .not()
            .isEmpty().withMessage(errMsg.ERR001('username'))
            .trim(),
        body('retype')
            .custom((value, { req }) => {
                return options.hasRetype ? value === req.body.password : true;
            })
            .withMessage(errMsg.ERR004('retype', 'password'))
            .trim(),
        body('email')
            .customSanitizer((value) => {
                return DOMPurify.sanitize(value);
            })
            .isLength({ max: 255 })
            .isEmail().withMessage(errMsg.ERR003('email'))
            .trim()
            .normalizeEmail(), // Ex: @gMaiL.CoM -> @gmail.com, lowercase domain part because it case-insensitive
        body('role')
            .isIn(Object.values(UserRole).concat(Object.values(UserRole).map((n) => n + "")))  // Ex: [1, 2, 3, '1', '2', '3']
            .withMessage(errMsg.ERR003('role')),
    ];

    if (options.hasPass) {
        ruleArr.push(
            body('password', errMsg.ERR002('password', 6, 20))
                .customSanitizer((value) => {
                    return DOMPurify.sanitize(value);
                })
                .custom((value, { req }) => {
                    return blackListWords.some((word) => value.includes(word)) ? false : true;
                }).withMessage(errMsg.ERR008('username'))
                .isLength({ min: 6, max: 20 })
                .not()
                .isEmpty()
                .trim());
    }
    return ruleArr;
};

const extractErrors = (req: Request) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return [];
    }
    const extractedErrors: ({ [s: string]: unknown; } | ArrayLike<unknown>)[] = [];
    errors.array().forEach(err => {
        extractedErrors.push({ [err.param]: err.msg });
    });
    return extractedErrors;
};
/**
 * 
 * @returns if no error then call next() else redirect to the same page with flash message and dataBack
 */
export const expressValidateUser = (req: Request, res: Response, next: NextFunction) => {
    const errorsList = extractErrors(req);
    if (errorsList.length === 0) {
        return next();
    }
    // return res.status(422).json({ errors: extractedErrors });
    req.flash('message', Object.values(errorsList[0]))[0]; // get first value of the first object element in the array
    req.flash('dataBack', req.body); // return req.body data back to front-end
    res.redirect(req.originalUrl);
};

