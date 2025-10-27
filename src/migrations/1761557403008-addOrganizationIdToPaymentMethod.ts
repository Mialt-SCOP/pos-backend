import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrganizationIdToPaymentMethod1761557403008
  implements MigrationInterface
{
  name = 'AddOrganizationIdToPaymentMethod1761557403008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_method_version" ADD "organizationId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_method_event" ADD "organizationId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_method_event" DROP COLUMN "type"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_method_event_type_enum" AS ENUM('created', 'updated', 'deleted')`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_method_event" ADD "type" "public"."payment_method_event_type_enum" NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6cfb02b753a3ae302f191142b5" ON "payment_method_version" ("organizationId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ee8b31d4a19e56160375656ef5" ON "payment_method_version" ("paymentMethodId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_187aa3266ac371a81fd8688874" ON "payment_method_version" ("version") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5c37d3adc73dcc65ee3f7415ec" ON "payment_method_event" ("organizationId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_438e02ce8f687f1264cf52faa2" ON "payment_method_event" ("aggregateId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_438e02ce8f687f1264cf52faa2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5c37d3adc73dcc65ee3f7415ec"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_187aa3266ac371a81fd8688874"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ee8b31d4a19e56160375656ef5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6cfb02b753a3ae302f191142b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_method_event" DROP COLUMN "type"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."payment_method_event_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_method_event" ADD "type" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_method_event" DROP COLUMN "organizationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_method_version" DROP COLUMN "organizationId"`,
    );
  }
}
