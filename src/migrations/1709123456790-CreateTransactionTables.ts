import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransactionTables1709123456790
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "transaction" (
        "transaction_hash" VARCHAR(255) PRIMARY KEY,
        "transaction_status" INTEGER NOT NULL,
        "block_hash" VARCHAR(255) NOT NULL,
        "block_number" INTEGER NOT NULL,
        "from" VARCHAR(255) NOT NULL,
        "to" VARCHAR(255),
        "contract_address" VARCHAR(255),
        "logs_count" INTEGER NOT NULL,
        "input" TEXT NOT NULL,
        "value" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_transactions" (
        "user_id" INTEGER NOT NULL,
        "transaction_hash" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        PRIMARY KEY ("user_id", "transaction_hash"),
        FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE,
        FOREIGN KEY ("transaction_hash") REFERENCES "transaction"("transaction_hash") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_transactions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "transaction"`);
  }
}
