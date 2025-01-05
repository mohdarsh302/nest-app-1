import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Roles } from "../../utils/enums/roles.enum"


@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password:string;

    @Column({ type: 'enum', enum: Roles, default: Roles.USER }) // Role with default as USER
    role: Roles;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ nullable: true }) // Allow null initially if the token is not required immediately
    token: string;
}
