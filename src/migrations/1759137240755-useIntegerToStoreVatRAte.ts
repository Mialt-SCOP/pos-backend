import { MigrationInterface, QueryRunner } from 'typeorm';

export class UseIntegerToStoreVatRAte1759137240755
  implements MigrationInterface
{
  name = 'UseIntegerToStoreVatRAte1759137240755';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "accounting_group" DROP COLUMN "vatRate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounting_group" ADD "vatRate" integer NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "accounting_group" DROP COLUMN "vatRate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounting_group" ADD "vatRate" numeric(5,2) NOT NULL`,
    );
  }
}
