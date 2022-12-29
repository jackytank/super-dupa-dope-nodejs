import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Entity,
    Column,
    PrimaryColumn,
    Generated,
} from 'typeorm';

@Entity()
export class CustomBase {
    @PrimaryColumn()
    @Generated("uuid")
    id: number;

    @Column({ name: "created_at", nullable: true })
    @CreateDateColumn()
    created_at: Date;

    @Column({ type: "nvarchar", length: 255, nullable: true })
    created_by: string;

    @Column({ name: "updated_at", nullable: true })
    @UpdateDateColumn()
    updated_at: Date;

    @Column({ type: "nvarchar", length: 255, nullable: true })
    updated_by: string;

    @Column({ name: "deleted_at", nullable: true })
    deleted_at: Date;
}
