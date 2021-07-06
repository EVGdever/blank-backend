import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn} from "typeorm";
import {User} from "./User";

@Entity()
export class Profile {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    surname: string;

    @Column()
    full_name: string;

    @Column()
    avatar: string;

    @Column()
    phone: string;

    @Column()
    birthday: string;

    @OneToOne(() => User, {
        cascade: true
    })
    @JoinColumn()
    user: User;
}
