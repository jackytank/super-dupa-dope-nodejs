import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { comparePassword } from '../utils/bcrypt';

class IndexController {
    private userRepo = getCustomRepository(UserRepository);

    constructor() {
        this.indexPage = this.indexPage.bind(this);
        this.loginPage = this.loginPage.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
    }

    async indexPage(req: Request, res: Response) {
        res.render('index');
    }

    async loginPage(req: Request, res: Response) {
        const flashMessage = req.flash('message')[0];
        res.render('security/login', { message: flashMessage });
    }

    async login(req: Request, res: Response) {
        const { username, password: rawPassword } = req.body;
        const { redirect } = req.query;
        const returnUrl: string = decodeURIComponent(redirect as string);
        let isLoginValid = false;
        if (!username || !rawPassword) {
            req.flash('message', 'Please enter both username and password');
            res.redirect('/login');
        }
        const findUser: User | undefined = await this.userRepo.findOne({
            username: username,
        });
        if (findUser) {
            const isPassMatch = await comparePassword(
                rawPassword,
                findUser.password,
            );
            if (isPassMatch) {
                req.session.user = findUser;
                req.session.loggedin = true;
                req.session.authority = findUser.role;
                req.session.userId = findUser.id;
                isLoginValid = true;
            }
        }
        if (isLoginValid) {
            res.redirect(redirect ? returnUrl : '/');
        } else {
            req.flash('message', 'Username or password is incorrect');
            res.redirect('/login');
        }
    }

    async logout(req: Request, res: Response) {
        req.session.user = null;
        req.session.authority = null;
        req.session.loggedin = false;
        res.redirect('/');
    }
}

export default new IndexController();
