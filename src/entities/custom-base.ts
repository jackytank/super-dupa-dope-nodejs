import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    UpdateDateColumn,
    PrimaryColumn,
    Generated,
} from 'typeorm';

@Entity()
export class CustomBase {
    @PrimaryColumn()
    @Generated("uuid")
    id: number;

    @Column({ name: "created_at", nullable: true })
    createdAt: Date;

    @Column({ type: "nvarchar", length: 255, nullable: true })
    createdBy: string;

    @Column({ name: "updated_at", nullable: true })
    updatedAt: Date;

    @Column({ type: "nvarchar", length: 255, nullable: true })
    updatedBy: string;

    @Column({ name: "deleted_at", nullable: true })
    deletedAt: Date;
}