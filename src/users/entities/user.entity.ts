import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @ManyToMany(() => Transaction, (transaction) => transaction.users)
  transactions: Transaction[];
}
