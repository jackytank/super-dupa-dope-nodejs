import { BaseModel } from './base.model';

export class UserModel extends BaseModel {
    role: number | string;
    username: string;
    name: string;
    password: string;
    email: string;
    // company_id: number | string;
}
