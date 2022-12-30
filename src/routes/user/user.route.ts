import express from 'express';
import AdminUserController from '../../controllers/admin/user/admin-user.controller';
import { defaultAllow, allowParams, allowBody, allowBoth } from '../../middlewares/screenPermission';
import { expressValidateUser, userExpressValidationRule } from '../../middlewares/validator/user/user.validator';
const adminUserRouter = express.Router();

// check permission for all routes
adminUserRouter.use('/addPage', defaultAllow({ resAsApi: false }));
adminUserRouter.use('/edit/:id', allowBoth({ resAsApi: false }));

// base path: /admin/users/
adminUserRouter.get('/addPage', AdminUserController.addPage);
adminUserRouter.post('/addPage', userExpressValidationRule({ hasRetype: true, hasPass: true }), expressValidateUser, AdminUserController.createNewUser); // add middleware for validate req.body and is exist username, email
adminUserRouter.get('/edit/:id', AdminUserController.editPage);
adminUserRouter.post('/edit/:id', userExpressValidationRule({ hasRetype: false, hasPass: false }), expressValidateUser, AdminUserController.update);
adminUserRouter.get('/list', AdminUserController.listPage);
adminUserRouter.get('/change-password/:id', allowParams({ resAsApi: false }), AdminUserController.changePasswordPage);
adminUserRouter.post('/change-password', allowBody({ resAsApi: false }), AdminUserController.changePassword);

export default adminUserRouter;