import { Base } from './base';
import { Entity, Column } from "typeorm";
import { IsEmail, IsNotEmpty, MaxLength, MinLength, IsOptional, IsNotIn, IsIn } from "class-validator";
import { errMsg } from '../constants';

export enum UserRole {
  USER = 1,
  ADMIN = 2,
  MANAGER = 3
}

/**
 * Model definition
 */
@Entity({
  name: 'users',
  synchronize: false,
  orderBy: {
    id: 'DESC',
  },
})
export class User extends Base {
  @Column({ type: "int", name: "company_id" })
  companyId!: number;

  @Column({ type: "nvarchar", length: 100 })
  @IsNotEmpty({
    message: errMsg.ERR001('name')
  })
  @MaxLength(100, {
    message: errMsg.ERR006('name', 100)
  })
  name!: string;

  @Column({ type: "nvarchar", length: 255 })
  @IsNotEmpty({
    message: errMsg.ERR001('username')
  })
  @MaxLength(255, {
    message: errMsg.ERR006('username', 255)
  })
  username!: string;

  @Column({ type: "nvarchar", length: 255 })
  @IsOptional()
  @MinLength(6, { message: errMsg.ERR005('password', 6) })
  @MaxLength(20, { message: errMsg.ERR006('password', 20) })
  password!: string;

  @Column({ type: "nvarchar", length: 255 })
  @IsEmail({}, { message: errMsg.ERR003('email') })
  email!: string;

  @Column({
    type: 'tinyint',
    // enum: UserRole,
  })
  // Ex: [1, 2, 3, '1', '2', '3']
  @IsIn(Object.values(UserRole).concat(Object.values(UserRole).map((n) => n + "")),
    { message: errMsg.ERR003('role') }
  )
  role!: number;
}
