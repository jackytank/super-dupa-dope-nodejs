import express from 'express';
import AdminUserApiController from '../../controllers/api/admin/user/admin-user.api.controller';
import { allowParams, defaultAllow } from '../../middlewares/screenPermission';
import { uploadFile } from '../../middlewares/uploadCsv';
const adminUserApiRouter = express.Router();

// base path: /api/admin/users/
adminUserApiRouter.get('/', AdminUserApiController.getAll);
adminUserApiRouter.get('/search', AdminUserApiController.search);
adminUserApiRouter.get('/:id', AdminUserApiController.getOne);
adminUserApiRouter.post('/', defaultAllow, AdminUserApiController.save);
adminUserApiRouter.put('/:id', allowParams, AdminUserApiController.update);
adminUserApiRouter.delete('/:id', allowParams, AdminUserApiController.remove);
adminUserApiRouter.post('/csv/import', uploadFile.single('file'), AdminUserApiController.importCsv);
adminUserApiRouter.get('/csv/export', defaultAllow, AdminUserApiController.exportCsv);
adminUserApiRouter.post('/csv/export', defaultAllow, AdminUserApiController.exportCsv);

export default adminUserApiRouter;
