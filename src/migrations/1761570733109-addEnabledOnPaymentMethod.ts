import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEnabledOnPaymentMethod1761570733109
  implements MigrationInterface
{
  name = 'AddEnabledOnPaymentMethod1761570733109';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_method_version" ADD "enabled" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5cdbc50b7ceda17999b8bd3916" ON "payment_method_version" ("enabled") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5cdbc50b7ceda17999b8bd3916"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_method_version" DROP COLUMN "enabled"`,
    );
  }
}
