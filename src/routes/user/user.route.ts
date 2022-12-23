import express from 'express';
const adminUserRouter = express.Router();

// check permission for all routes
adminUserRouter.use('/addPage', defaultAllow);
adminUserRouter.use('/edit/:id', allowParams);
adminUserRouter.use('/update', allowBody);

// base path: /admin/users/
adminUserRouter.get('/addPage', AdminUserController.addPage);
adminUserRouter.post('/addPage', userExpressValidationRule(true), expressValidateUser, AdminUserController.createNewUser); // add middleware for validate req.body and is exist username, email
adminUserRouter.get('/edit/:id', AdminUserController.editPage);
adminUserRouter.post('/update', AdminUserController.update);
adminUserRouter.get('/list', AdminUserController.listPage);
adminUserRouter.get('/change-password/:id', allowParams, AdminUserController.changePasswordPage);
adminUserRouter.post('/change-password', allowBody, AdminUserController.changePassword);

export default adminUserRouter;