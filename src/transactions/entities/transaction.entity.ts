import { Entity, PrimaryColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Transaction {
  @PrimaryColumn({ name: 'transaction_hash' })
  transactionHash: string;

  @Column({ name: 'transaction_status' })
  transactionStatus: number;

  @Column({ name: 'block_hash' })
  blockHash: string;

  @Column({ name: 'block_number' })
  blockNumber: number;

  @Column()
  from: string;

  @Column({ nullable: true, type: 'varchar' })
  to: string | null;

  @Column({ name: 'contract_address', nullable: true, type: 'varchar' })
  contractAddress: string | null;

  @Column({ name: 'logs_count' })
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
