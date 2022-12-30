import { sanitizeSearchQuery } from './../../middlewares/validator/search.validator';
import express from 'express';
import AdminUserApiController from '../../controllers/api/admin/user/admin-user.api.controller';
import { allowParams, defaultAllow } from '../../middlewares/screenPermission';
import { uploadFile } from '../../middlewares/uploadCsv';
const adminUserApiRouter = express.Router();

// base path: /api/admin/users/
adminUserApiRouter.get('/', AdminUserApiController.getAll);
adminUserApiRouter.get('/search', sanitizeSearchQuery, AdminUserApiController.search);
adminUserApiRouter.get('/:id', AdminUserApiController.getOne);
adminUserApiRouter.post('/', defaultAllow({ resAsApi: true }), AdminUserApiController.save);
adminUserApiRouter.put('/:id', allowParams({ resAsApi: true }), AdminUserApiController.update);
adminUserApiRouter.delete('/:id', allowParams({ resAsApi: true }), AdminUserApiController.remove);
adminUserApiRouter.post('/csv/import', defaultAllow({ resAsApi: true }), uploadFile.single('file'), AdminUserApiController.importCsv);
adminUserApiRouter.get('/csv/export', defaultAllow({ resAsApi: true }), AdminUserApiController.exportCsv);
adminUserApiRouter.post('/csv/export', defaultAllow({ resAsApi: true }), AdminUserApiController.exportCsv);

export default adminUserApiRouter;
