import { Base } from './base';
import { Entity, Column } from "typeorm";
import { IsNotEmpty, MaxLength } from "class-validator";
import { errMsg } from '../constants';


/**
 * Model definition
 */
@Entity({
    name: 'companies',
    synchronize: false,
    orderBy: {
        id: 'DESC',
    },
})
export class Company extends Base {
    @Column({ type: "nvarchar", length: 100 })
    @IsNotEmpty({
        message: errMsg.ERR001('name')
    })
    @MaxLength(255, {
        message: errMsg.ERR006('name', 255)
    })
    name!: string;
}
