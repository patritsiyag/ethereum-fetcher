import { Entity, PrimaryColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Transaction {
  @PrimaryColumn()
  transactionHash: string;

  @Column()
  transactionStatus: number;

  @Column()
  blockHash: string;

  @Column()
  blockNumber: number;

  @Column()
  from: string;

  @Column({ nullable: true, type: 'varchar' })
  to: string | null;

  @Column({ nullable: true, type: 'varchar' })
  contractAddress: string | null;

  @Column()
  logsCount: number;

  @Column()
  input: string;

  @Column()
  value: string;

  @ManyToMany(() => User, (user) => user.transactions)
  @JoinTable({
    name: 'user_transactions',
    joinColumn: {
      name: 'transaction_hash',
      referencedColumnName: 'transactionHash',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  users: User[];
}
