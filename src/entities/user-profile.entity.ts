import { Entity, Column } from "typeorm";
import { CustomBase } from './custom-base';


/**
 * Model definition
 */
@Entity({
    name: 'user_profiles',
    synchronize: false,
    orderBy: {
        id: 'DESC',
    },
})
export class UserProfile extends CustomBase {
    @Column({ type: "int", name: "user_id" })
    user_id!: number;

    @Column({ type: "nvarchar", length: 255, nullable: true })
    lastname!: string;

    @Column({ type: "nvarchar", length: 255, nullable: true })
    firstname!: string;

    @Column({ type: "nvarchar", length: 20, nullable: true })
    phone!: string;

    @Column({ type: "nvarchar", length: 255, nullable: true })
    address!: string;
}
