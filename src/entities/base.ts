import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity()
export class Base {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'created_at', nullable: true })
    created_at: Date;

    @Column({ name: 'created_by', type: 'nvarchar', length: 255, nullable: true })
    created_by: string;

    @Column({ name: 'updated_at', nullable: true })
    updated_at: Date;

    @Column({ name: 'updated_by', type: 'nvarchar', length: 255, nullable: true })
    updated_by: string;

    @Column({ name: 'deleted_at', nullable: true })
    deleted_at: Date;
}
