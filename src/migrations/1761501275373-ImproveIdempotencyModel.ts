import { MigrationInterface, QueryRunner } from 'typeorm';

export class ImproveIdempotencyModel1761501275373
  implements MigrationInterface
{
  name = 'ImproveIdempotencyModel1761501275373';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "processed_command" ADD "responseError" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "processed_command" DROP COLUMN "responseData"`,
    );
    await queryRunner.query(
      `ALTER TABLE "processed_command" ADD "responseData" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "processed_command" DROP COLUMN "responseData"`,
    );
    await queryRunner.query(
      `ALTER TABLE "processed_command" ADD "responseData" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "processed_command" DROP COLUMN "responseError"`,
    );
  }
}
