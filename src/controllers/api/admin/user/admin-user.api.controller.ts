import { Request, Response } from 'express';
import _ from 'lodash';
import * as csv from 'csv-parse';
import {
    getConnection,
    getCustomRepository,
    SelectQueryBuilder,
} from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { stringify } from 'csv-stringify';
import dayjs from 'dayjs';
import { UserRepository } from '../../../../repositories/user.repository';
import {
    CustomApiResult,
    CustomValidateResult,
} from '../../../../customTypings/express';
import { User } from '../../../../entities/user.entity';
import { bench, getRandomPassword } from '../../../../utils/common';
import { UserModel } from '../../../../models/user.model';

interface CsvUserData {
    id: unknown;
    name: unknown;
    username: unknown;
    email: unknown;
    role: unknown;
    deleted: unknown;
}

class AdminUserApiController {
    private userRepo = getCustomRepository(UserRepository);

    constructor() {
        this.getAll = this.getAll.bind(this);
        this.search = this.search.bind(this);
        this.getOne = this.getOne.bind(this);
        this.save = this.save.bind(this);
        this.update = this.update.bind(this);
        this.remove = this.remove.bind(this);
        this.importCsv = this.importCsv.bind(this);
        this.exportCsv = this.exportCsv.bind(this);
    }

    //for routing control purposes - START
    async getAll(req: Request, res: Response) {
        const { take, limit, companyId } = req.query;
        let result: CustomApiResult<User>;
        if (companyId) {
            result = await this.userRepo.getAllDataWithExtraPersonalInfo(
                req.query,
            );
        } else {
            result = await this.userRepo.getAllData(
                take as string,
                limit as string,
            );
        }
        return res.status(result.status as number).json(result);
    }
    async search(req: Request, res: Response) {
        // save req.query to session for export csv based on search query
        req.session.searchQuery = req.query;
        return res.status(200).json(await this.userRepo.searchData(req.query));
    }
    async getOne(req: Request, res: Response) {
        const result = await this.userRepo.getOneData(parseInt(req.params.id));
        return res.status(result.status as number).json(result);
    }
    async save(req: Request, res: Response) {
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const { name, username, password, email, role } = req.body;
        const user: User = Object.assign(new User(), {
            name,
            username,
            password,
            email,
            role,
        });
        const result = await this.userRepo.insertData(user, null, queryRunner, {
            wantValidate: false,
            isPasswordHash: true,
        });
        return res.status(200).json(result);
    }
    async update(req: Request, res: Response) {
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const { name, username, password, email, role } = req.body;
        const id = req.params.id;
        const user: User = Object.assign(new User(), {
            id,
            name,
            username,
            password,
            email,
            role,
        });
        const result = await this.userRepo.updateData(user, null, queryRunner, {
            wantValidate: false,
        });
        return res.status(result.status as number).json(result);
    }
    async remove(req: Request, res: Response) {
        const id = parseInt(req.params.id);
        const result = await this.userRepo.removeData(id);
        return res.status(result.status as number).json(result);
    }
    async importCsv(req: Request, res: Response) {
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const msgObj: CustomApiResult<User> = { messages: [], status: 500 };
        try {
            if (req.file == undefined || req.file.mimetype !== 'text/csv') {
                return res
                    .status(400)
                    .json({ message: 'Please upload a CSV file' });
            }
            // if (req.file.size > (_1mb * 2)) {
            //     return res.status(400).json({ message: 'File size cannot be larger than 2MB' });
            // }
            const parser = csv.parse({
                delimiter: ',', // phân cách giữa các cell trong mỗi row
                trim: true, // bỏ các khoảng trắng ở đầu và cuối của mỗi cell
                skip_empty_lines: true, // bỏ qua các dòng trống
                columns: true, // gán header cho từng column trong row
            });
            const records: unknown[] = await this.userRepo.readCsvData(
                req.file.path,
                parser,
            );
            const idRecords = records
                .filter((record: CsvUserData) => record['id'] !== '')
                .map((record: CsvUserData) => record['id']);
            const usernameRecords = records
                .filter((record: CsvUserData) => record['username'] !== '')
                .map((record: CsvUserData) => record['username']);
            const nameRecords = records
                .filter((record: CsvUserData) => record['name'] !== '')
                .map((record: CsvUserData) => record['name']);
            const deleteArr: User[] = []; // array of users to delete
            const insertArr: User[] = []; // array of users to insert
            const updateArr: User[] = []; // array of users to update
            // query data from db first then pass it around to prevent multiple query to db
            const builder = this.userRepo
                .createQueryBuilder('user')
                .select(['user.id', 'user.username', 'user.email']);
            if (idRecords.length > 0) {
                builder.orWhere('user.id IN (:ids)', { ids: idRecords });
            }
            if (usernameRecords.length > 0) {
                builder.orWhere('user.username IN (:usernames)', {
                    usernames: usernameRecords,
                });
            }
            if (nameRecords.length > 0) {
                builder.orWhere('user.name IN (:names)', {
                    names: nameRecords,
                });
            }
            const dbData = await builder.getMany();
            // iterate csv records data and check row
            const { start, end } = bench();
            start();
            const startValidateFunc = async () => {
                for (let i = 0; i < records.length; i++) {
                    const row: CsvUserData = records[i] as CsvUserData;
                    const user: User = Object.assign(new User(), {
                        id:
                            row['id'] === ''
                                ? null
                                : _.isString(row['id'])
                                ? parseInt(row['id'])
                                : row['id'],
                        name: row['name'] === '' ? null : row['name'],
                        username:
                            row['username'] === '' ? null : row['username'],
                        email: row['email'] === '' ? null : row['email'],
                        role: _.isString(row['role'])
                            ? parseInt(row['role'])
                            : row['role'],
                    });
                    // validate entity User using 'class-validator'
                    const errors: ValidationError[] = await validate(user);
                    if (errors.length > 0) {
                        const errMsgStr = errors
                            .map(error =>
                                Object.values(
                                    error.constraints as {
                                        [type: string]: string;
                                    },
                                ),
                            )
                            .join(', ');
                        msgObj.messages?.push(`Row ${i + 1} : ${errMsgStr}`);
                        continue;
                    }
                    console.log('Reading csv row: ', i);
                    // + Trường hợp id rỗng => thêm mới user
                    if (_.isNil(row['id']) || row['id'] === '') {
                        if (row['deleted'] === 'y') {
                            // deleted="y" và colum id không có nhập thì không làm gì hết, ngược lại sẽ xóa row theo id tương ứng dưới DB trong bảng user
                            continue;
                        }
                        const result: CustomValidateResult<User> = await this.userRepo.checkUsernameEmailUnique(
                            user,
                            dbData,
                        );
                        if (result.isValid === false) {
                            msgObj.messages?.push(
                                `Row ${i + 1} : ${result.message}`,
                            );
                            continue;
                        }
                        user.password = getRandomPassword();
                        dbData.push(user); // push to dbData to check unique later
                        insertArr.push(user); // push to map to insert later
                    } else {
                        // Trường hợp id có trong db (chứ ko phải trong transaction) => chỉnh sửa user nếu deleted != 'y'
                        const findUser = _.find(dbData, { id: user.id });
                        if (findUser) {
                            if (row['deleted'] === 'y') {
                                dbData.splice(dbData.indexOf(findUser), 1); // remove from dbData to check unique later
                                deleteArr.push(findUser); // push to map to delete later
                            } else {
                                const result: CustomValidateResult<User> = await this.userRepo.checkUsernameEmailUnique(
                                    user,
                                    dbData,
                                );
                                if (result.isValid === false) {
                                    msgObj.messages?.push(
                                        `Row ${i + 1} : ${result.message}`,
                                    );
                                    continue;
                                }
                                dbData.splice(
                                    dbData.indexOf(result.data as User),
                                    1,
                                    result.data as User,
                                ); // update dbData to check unique later
                                updateArr.push(user); // push to map to update later
                            }
                        } else {
                            // Trường hợp id không có trong db => hiển thị lỗi "id not exist"
                            msgObj.messages?.push(
                                `Row ${i + 1} : Id not exist`,
                            );
                        }
                    }
                }
            };
            // wait for startValidateFunc to finish
            await Promise.all([startValidateFunc()]);

            // delete, update, insert - START
            await Promise.all(
                deleteArr.map(async user => {
                    await queryRunner.manager.remove<User>(user);
                }),
            );
            await Promise.all(
                updateArr.map(async user => {
                    await this.userRepo.updateData(user, dbData, queryRunner, {
                        wantValidate: false,
                    });
                }),
            );
            await Promise.all(
                insertArr.map(async user => {
                    await this.userRepo.insertData(user, dbData, queryRunner, {
                        wantValidate: false,
                        isPasswordHash: false,
                    });
                }),
            );
            // delete, update, insert - END

            // check if msgObj is not empty => meaning has errors => return 500
            if (msgObj?.messages && msgObj.messages?.length > 0) {
                end();
                msgObj.status = 400;
                await queryRunner.rollbackTransaction();
                return res
                    .status(msgObj.status ?? 500)
                    .json({ messages: msgObj.messages, status: msgObj.status });
            } else {
                end();
                await queryRunner.commitTransaction();
                return res.status(200).json({
                    message: 'Import csv file successfully!',
                    status: 200,
                    data: records,
                });
            }
        } catch (error) {
            return res
                .status(500)
                .json({ messages: ['Internal Server Error'], status: 500 });
        } finally {
            await queryRunner.release();
        }
    }
    async exportCsv(req: Request, res: Response) {
        const { start, end } = bench();
        const searchQuery = req.session.searchQuery;
        let builder: SelectQueryBuilder<User>;
        let userList: User[];
        if (searchQuery) {
            builder = await this.userRepo.getSearchQueryBuilder(
                searchQuery,
                false,
            ); // set false to turn off offset,limit search criteria
            userList = await builder.getMany();
        } else {
            userList = await this.userRepo.find();
        }
        start(); // begin count time start
        // format date, transform role number to string (Ex: '1' => 'User')
        userList.map((user: UserModel) => {
            user['createdAt'] = dayjs(user['createdAt']).format('YYYY/MM/DD');
            user['updatedAt'] = dayjs(user['updatedAt']).format('YYYY/MM/DD');
            user['role'] =
                user['role'] === 1
                    ? 'user'
                    : user['role'] === 2
                    ? 'admin'
                    : 'manager';
        });
        const filename = `${dayjs(Date.now()).format(
            'DD-MM-YYYY-HH-mm-ss',
        )}-users.csv`;
        const columns = Object.keys(userList[0]);
        const columns_string = columns.toString().replace(/,/g, ',');
        stringify(
            userList,
            {
                // header: true,
                columns: columns,
                delimiter: ',',
                quoted: true,
                quoted_empty: true,
            },
            function(err, data) {
                if (err) {
                    res.status(500).json({
                        message: 'Internal Server Error\nFailed to export csv',
                        status: 500,
                    });
                }
                data = columns_string + '\n' + data;
                end(); // end count time and log to console
                res.status(200).json({
                    data: data,
                    status: 200,
                    message: `Export to CSV success!, \nTotal records: ${userList.length}`,
                    filename: filename,
                });
            },
        );
    }
    //for routing control purposes - END
}

export default new AdminUserApiController();