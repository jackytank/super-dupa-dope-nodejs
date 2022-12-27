import {
    InsertResult, QueryRunner, SelectQueryBuilder, UpdateResult,
} from 'typeorm';
import _ from 'lodash';
import * as fs from 'fs';
import * as csv from 'csv-parse';
import { User } from '../entities/user.entity';
import { comparePassword, hashPassword } from '../utils/bcrypt';
import { CustomApiResult, CustomDataTableResult, CustomValidateResult } from '../customTypings/express';
import { Company } from '../entities/company.entity';
import { UserProfile } from '../entities/user-profile.entity';
import { isValidDate } from '../utils/common';
import { AppDataSource } from '../DataSource';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class UserService {
    private userRepo = AppDataSource.getRepository(User);

    async verifyCredentials(username: string, password: string) {
        const foundUser = await this.userRepo.findOne({
            where: { username: username },
        });

        if (!foundUser) {
            return null;
        }

        // validate password
        const passwordMatched = await comparePassword(password, foundUser!.password);

        if (!passwordMatched) {
            return null;
        }

        // update last_login
        // foundUser.lastLogin = getCurrentSystemDatetime();
        foundUser.updatedBy = foundUser.name;

        await this.userRepo.update(foundUser.id, foundUser);

        return foundUser;
    }

    async readCsvData(filePath: string, parser: csv.Parser): Promise<unknown[]> {
        const result: unknown[] = [];
        return await new Promise((resolve, reject) =>
            fs
                .createReadStream(filePath)
                .pipe(parser)
                .on('data', row => {
                    result.push(row);
                })
                .on('error', err => {
                    reject(err);
                })
                .on('end', () => {
                    // xóa file csv sau khi đã đọc xong
                    fs.unlink(filePath, err => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                    });
                    resolve(result);
                }),
        );
    }
    async getAllData(take?: string, limit?: string): Promise<CustomApiResult<User>> {
        const builder = this.userRepo.createQueryBuilder('user').select('user');
        let users: User[];
        try {
            // check if limit query is exist to prevent: typeorm RDBMS does not support OFFSET without LIMIT in SELECT statements
            let hasLimit = false;
            if (!_.isNil(limit) && !_.isEmpty(limit)) {
                const _limit = parseInt(limit);
                if (_.isFinite(_limit)) {
                    hasLimit = true;
                    builder.limit(_limit);
                }
            }
            if (!_.isNil(take) && !_.isEmpty(take) && hasLimit) {
                const _take = parseInt(take);
                if (_.isFinite(_take)) {
                    builder.offset(_take);
                }
            }
            users = await builder.getMany();
        } catch (error) {
            users = await this.userRepo.find();
            console.log(error.message);
        }
        // users = await this.find();
        return { data: users, status: 200 };
    }
    async getAllDataWithExtraPersonalInfo(query: Record<string, unknown>): Promise<CustomApiResult<User>> {
        const { companyId } = query;
        const b = this.userRepo.createQueryBuilder('u');
        let users: User[];
        try {
            if (companyId) {
                b.select([
                    'u.id AS `id`',
                    'u.role AS `role`',
                    'u.username AS `username`',
                    'c.id AS `companyId`',
                    'c.name AS `companyName`',
                    'p.phone AS `phone`',
                    'p.address AS `address`',
                    "CONCAT(p.lastname,' ', p.firstname) AS `fullname`",
                ]);
                b.innerJoin(Company, 'c', 'u.company_id = c.id');
                b.innerJoin(UserProfile, 'p', 'u.id = p.user_id');
                b.where('c.id = :companyId', { companyId: companyId });
                users = await b.getRawMany();
            } else {
                users = await b.getMany();
            }
            return { data: users, status: 200 };
        } catch {
            return { message: `Error`, status: 500 };
        }
    }
    async getOneData(id: number): Promise<CustomApiResult<User>> {
        const findUser: User | null = await this.userRepo.findOne({
            where: { id: id },
        });
        if (!findUser) {
            return { message: `User ID ${id} Not Found!`, status: 404 };
        }
        return {
            message: `Found user with id ${id}`,
            data: findUser,
            status: 200,
        };
    }
    async checkUsernameEmailUnique(user: User, dbData?: User[] | null): Promise<CustomValidateResult<User>> {
        const b: SelectQueryBuilder<User> = this.userRepo.createQueryBuilder('user').where('');
        let result = {
            message: '',
            isValid: false,
            datas: null as User[] | null,
        };
        let findUsers: User[] = [];
        if (user.username) {
            if (!dbData) {
                if (user.id) {
                    b.orWhere('user.username = :username AND user.id <> :id', {
                        username: `${user.username}`,
                        id: user.id,
                    });
                } else {
                    b.orWhere('user.username = :username', {
                        username: `${user.username}`,
                    });
                }
                findUsers = await b.getMany();
            } else {
                if (user.id) {
                    findUsers = dbData.filter(data => data.username === user.username && data.id !== user.id);
                } else {
                    findUsers = dbData.filter(data => data.username === user.username);
                }
            }
            if (findUsers.length > 0) {
                result = Object.assign(
                    {},
                    {
                        message: 'Username is already exist!',
                        isValid: false,
                        datas: findUsers as User[] | null,
                    },
                );
                return result;
            }
        }
        if (user.email) {
            if (!dbData) {
                if (user.id) {
                    b.orWhere('user.email = :email AND user.id <> :id', {
                        email: `${user.email}`,
                        id: user.id,
                    });
                } else {
                    b.orWhere('user.email = :email', {
                        email: `${user.email}`,
                    });
                }
            } else {
                if (user.id) {
                    findUsers = dbData.filter(data => data.email === user.email && data.id !== user.id);
                } else {
                    findUsers = dbData.filter(data => data.email === user.email);
                }
            }
            if (findUsers.length > 0) {
                result = Object.assign(
                    {},
                    {
                        message: 'Email is already exist!',
                        isValid: false,
                        datas: findUsers,
                    },
                );
                return result;
            }
        }
        return {
            message: 'Email and username is unique!',
            isValid: true,
            datas: findUsers,
        };
    }
    async insertData(user: User, dbData: User[] | null, queryRunner: QueryRunner, options: { wantValidate?: boolean; isPasswordHash?: boolean; },): Promise<CustomApiResult<User>> {
        if (options.wantValidate) {
            const validateUser = await this.checkUsernameEmailUnique(user, dbData);
            if (!validateUser.isValid) {
                return { message: validateUser.message, status: 400 };
            }
        }
        user.createdAt = new Date();
        // hash pass if isPasswordHash is true, incase of insert data from csv file (already had pass)
        if (options.isPasswordHash) {
            const hashed = await hashPassword(user.password);
            user.password = hashed;
        }
        try {
            let insertedUser: User | InsertResult;
            if (!user.companyId) {
                user.companyId = 100001;
            }
            if (dbData) {
                insertedUser = await queryRunner.manager.save(User, user);
            } else {
                insertedUser = await queryRunner.manager.save(User, user);
            }
            if (dbData) {
                dbData.push(insertedUser as User);
            }
            // const newUser: User | null = await queryRunner.manager.findOneBy(User, { id: insertRes.identifiers[0].id });
            return {
                message: 'User created successfully!',
                data: insertedUser as User,
                status: 200,
            };
        } catch (error) {
            return { message: 'Error when inserting user!', status: 500 };
        }
    }
    async updateData(user: User, dbData: User[] | null, queryRunner: QueryRunner, options: { wantValidate?: boolean; }): Promise<CustomApiResult<User>> {
        let validateUser = null;
        if (options.wantValidate) {
            validateUser = await this.checkUsernameEmailUnique(user, dbData);
            if (!validateUser.isValid) {
                const arr: number[] | undefined = validateUser.datas?.map(u => u.id);
                if (!arr?.includes(user.id)) {
                    return { message: validateUser.message, status: 400 };
                }
            }
        }
        user.updatedAt = new Date();
        if (!_.isNil(user.password)) {
            const hashed = await hashPassword(user.password);
            user.password = hashed;
        }
        // check if user exist by id
        const findUser: User | null = await queryRunner.manager.findOneBy(User, {
            id: user.id,
        });
        if (!findUser) {
            return { message: `User ${user.id} not found`, status: 404 };
        }
        try {
            let updatedUser: User | UpdateResult;
            if (dbData) {
                updatedUser = await queryRunner.manager.save(User, user);
            } else {
                updatedUser = await queryRunner.manager.update(User, { id: user.id }, user);
            }
            if (dbData) {
                dbData.push(updatedUser as User);
            }
            return {
                message: `Update user successfully!`,
                data: updatedUser as User,
                status: 200,
            };
        } catch (error) {
            return { message: `Error when updating user!`, status: 500 };
        }
    }
    async removeData(id: number): Promise<CustomApiResult<User>> {
        const userToRemove: User | null = await this.userRepo.findOneBy({ id });
        if (!userToRemove) {
            return { message: `User ID ${id} Not Found`, status: 404 };
        }
        await this.userRepo.remove(userToRemove);
        return { message: `User removed successfully`, status: 200 };
    }
    async searchData(query: Record<string, unknown>): Promise<CustomDataTableResult> {
        const builder = await this.getSearchQueryBuilder(query, true);
        let data: string | User[];
        const recordsTotal: number = await this.userRepo.createQueryBuilder('user')
            .select('user')
            .getCount(); // get total records count
        const recordsFiltered: number = recordsTotal; // get filterd records count
        try {
            data = await builder.getMany(); //get data
        } catch (error) {
            // if error then find all
            console.log(error);
            data = await this.userRepo.find();
        }
        const returnData = {
            draw: query.draw as number,
            recordsTotal: recordsTotal,
            recordsFiltered: recordsFiltered,
            data: data,
        };
        return returnData;
    }
    async getSearchQueryBuilder(query: Record<string, unknown>, hasAnyLimitOrOffset: boolean): Promise<SelectQueryBuilder<User>> {
        const { length, start, name, username, email, role, createdDateFrom, createdDateTo } = query;
        const builder = this.userRepo.createQueryBuilder('user').where('');
        // let isFromAndToDateEqual = false;
        // check if queries exist then concat them with sql query
        if (hasAnyLimitOrOffset) {
            if (!_.isNil(length)) {
                builder.limit(parseInt(length as string));
            }
            // check both start end length for error: typeorm RDBMS does not support OFFSET without LIMIT in SELECT statements
            if (!_.isNil(start) && !_.isNil(length)) {
                builder.offset(parseInt(start as string));
            }
        }
        if (!_.isNil(createdDateFrom) && isValidDate(new Date(createdDateFrom as string))) {
            builder.andWhere('Date(user.created_at) >= :fromDate', {
                fromDate: `${createdDateFrom}`,
            });
        }
        if (!_.isNil(createdDateTo) && isValidDate(new Date(createdDateTo as string))) {
            builder.andWhere('Date(user.created_at) <= :toDate', {
                toDate: `${createdDateTo}`,
            });
        }
        if (!_.isNil(name)) {
            builder.andWhere('user.name LIKE :name', { name: `%${name}%` });
        }
        if (!_.isNil(username)) {
            builder.andWhere('user.username LIKE :username', {
                username: `%${username}%`,
            });
        }
        if (!_.isNil(email)) {
            builder.andWhere('user.email LIKE :email', { email: `%${email}%` });
        }
        if (!_.isNil(role)) {
            builder.andWhere('user.role IN (:role)', { role: role });
        }
        return builder;
    }
}
