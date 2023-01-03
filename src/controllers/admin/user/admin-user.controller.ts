import { CustomApiResult } from './../../../customTypings/express/index';
import { Request, Response } from 'express';
import dayjs from 'dayjs';
import _ from 'lodash';
import { UserService } from '../../../services/user.services';
import { User } from '../../../entities/user.entity';
import { CustomEntityApiResult } from '../../../customTypings/express';
import { ROLE } from '../../../constants';
import { AppDataSource } from '../../../DataSource';
import process from 'process';

class AdminUserController {
    private userRepo = AppDataSource.getRepository(User);
    private userService = new UserService();

    constructor() {
        this.addPage = this.addPage.bind(this);
        this.contactPage = this.contactPage.bind(this);
        this.sendContact = this.sendContact.bind(this);
        this.createNewUser = this.createNewUser.bind(this);
        this.editPage = this.editPage.bind(this);
        this.update = this.update.bind(this);
        this.listPage = this.listPage.bind(this);
        this.changePassword = this.changePassword.bind(this);
        this.changePasswordPage = this.changePasswordPage.bind(this);
    }
    // GET
    async addPage(req: Request, res: Response) {
        const flashMessage = req.flash('message')[0];
        const dataBack = req.flash('dataBack')[0];
        res.render('admin/users/add', {
            activeTab: 'addUserTab',
            dataBack: dataBack ?? {},
            message: flashMessage
        });
    }
    // GET
    async contactPage(req: Request, res: Response) {
        const flashMessage = req.flash('message')[0];
        const dataBack = req.flash('dataBack')[0];
        res.render('admin/contact/index', {
            activeTab: 'contactTab',
            dataBack: dataBack ?? {},
            message: flashMessage
        });
    }
    // POST
    async sendContact(req: Request, res: Response) {
        const { from, subject, content } = req.body;
        const to = process.env.EMAIL_TO ?? 'yijal81745@cnxcoin.com';
        const sendResult: CustomApiResult = await this.userService.sendEmail({ from, to, subject, content });
        if (sendResult.status === 200) {
            req.flash('message', sendResult.message ?? 'Send email success!');
            req.flash('dataBack', req.body);
            return res.redirect('/admin/users/contact');
        }
        req.flash('message', sendResult.message ?? 'Error when send email!');
        return res.redirect('/admin/users/contact');
    }
    // POST
    async createNewUser(req: Request, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        // get body 
        const { name, username, password, email, role } = req.body;
        const user: User = Object.assign(new User(), {
            name, username, password, email, role
        });
        user.created_by = req.session.user?.username as string;
        try {
            const result: CustomEntityApiResult<User> = await this.userService.insertData(user, null, queryRunner, { wantValidate: true, isPasswordHash: true });
            if (result.status === 400 || result.status === 500) {
                await queryRunner.rollbackTransaction();
                req.flash('message', result.message ?? 'Error when create user!');
                req.flash('dataBack', req.body);
                return res.redirect('/admin/users/addPage');
            }
            await queryRunner.commitTransaction();
            req.flash('message', result.message ?? 'New user created!!');
            return res.redirect('/admin/users/list');
        } catch (error) {
            await queryRunner.rollbackTransaction();
            req.flash('message', error.message ?? 'Error when create user!');
            req.flash('dataBack', req.body);
            return res.redirect('/admin/users/addPage');
        } finally {
            await queryRunner.release();
        }
    }
    // GET
    async editPage(req: Request, res: Response) {
        const { id } = req.params;
        const result: CustomEntityApiResult<User> = await this.userService.getOneData(parseInt(id));
        if (result.status === 200) {
            const flashMessage = req.flash('message')[0];
            res.render('admin/users/edit', {
                activeTab: 'listUserTab',
                dataBack: {},
                message: flashMessage,
                user: result.data
            });
        } else {
            req.flash("message", `Can't find user with id: ${id}`);
            res.redirect('/admin/users/list');
        }
    }
    // POST
    async update(req: Request, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const { id, name, username, email, role } = req.body;
        const user: User = Object.assign(new User(), { id, name, username, email, role });
        user.updated_by = req.session.user?.username as string;
        // if role from req is not user, check if user is admin or manager if neither throw 403
        if (role !== ROLE.USER + '') {
            if (req.session.user?.role !== ROLE.ADMIN && req.session.user?.role !== ROLE.MANAGER) {
                req.flash('message', 'You are not authorized to do this action!');
                return res.redirect(req.originalUrl ?? `/admin/users/edit/${id.trim()}`);
            }
        }
        try {
            const result: CustomEntityApiResult<User> = await this.userService.updateData(user, null, queryRunner, { wantValidate: true });
            if (result.status === 404) {
                req.flash('message', result.message ?? `Can't find user!`);
                res.redirect('/admin/users/list');
            }
            await queryRunner.commitTransaction();
            req.flash('message', result.message ?? 'Update successfully!');
            res.redirect('/admin/users/list');
        } catch (error) {
            await queryRunner.rollbackTransaction();
            req.flash('message', error.message ?? 'Can not update user!');
            res.redirect(req.originalUrl ?? `/admin/users/edit/${id.trim()}`);
        } finally {
            await queryRunner.release();
        }
    }
    // GET
    async listPage(req: Request, res: Response) {
        const flashMessage = req.flash('message')[0];
        res.render('admin/users/list', {
            activeTab: 'listUserTab',
            queryBack: {},
            dayjs: dayjs,
            message: flashMessage,
        });
    }
    // POST
    async changePassword(req: Request, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const { id, password } = req.body;
        const user: User = Object.assign(new User(), { id, password });
        try {
            const result: CustomEntityApiResult<User> = await this.userService.updateData(user, null, queryRunner, { wantValidate: true });
            if (result.status === 404) {
                req.flash('message', result.message ?? `Can't find user!`);
            }
            await queryRunner.commitTransaction();
            req.flash('message', result.message ?? 'Password changed successfully!');
            res.redirect(`/admin/users/edit/${id}`);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            req.flash('message', error.message ?? 'Error when trying to update password! Please try again');
            res.redirect(`/admin/users/edit/${id}`);
        } finally {
            await queryRunner.release();
        }
    }
    // GET
    async changePasswordPage(req: Request, res: Response) {
        const id = req.params.id;
        res.render('admin/users/change-password', { userId: id });
    }
}

export default new AdminUserController();
