import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRankOnPaymentMethod1761569000645 implements MigrationInterface {
  name = 'AddRankOnPaymentMethod1761569000645';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_method_version" ADD "rank" character varying NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "payment_method_rank" ON "payment_method_version" ("rank") `,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_method_version" ADD CONSTRAINT "payment_method_version_unique" UNIQUE ("paymentMethodId", "version")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_method_version" DROP CONSTRAINT "payment_method_version_unique"`,
    );
    await queryRunner.query(`DROP INDEX "public"."payment_method_rank"`);
    await queryRunner.query(
      `ALTER TABLE "payment_method_version" DROP COLUMN "rank"`,
    );
  }
}
