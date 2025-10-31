import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEventTable1761916631657 implements MigrationInterface {
  name = 'AddEventTable1761916631657';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "event" ("internalEventId" uuid NOT NULL DEFAULT uuidv7(), "id" uuid NOT NULL, "orderId" uuid, "paymentId" uuid, "type" character varying NOT NULL, "data" text NOT NULL, "prevHash" character varying, "hash" character varying NOT NULL, "signature" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "deviceId" character varying NOT NULL, "organizationId" character varying NOT NULL, CONSTRAINT "UQ_30c2f3bbaf6d34a55f8ae6e4614" UNIQUE ("id"), CONSTRAINT "PK_db580357eff078ddbd554fd6118" PRIMARY KEY ("internalEventId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4b01635c51d1f6f201b4d4600e" ON "event" ("orderId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0e91279864edd726b83210eae9" ON "event" ("paymentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ff644ffdb3cdf2880ce8ef0356" ON "event" ("deviceId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ff644ffdb3cdf2880ce8ef0356"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0e91279864edd726b83210eae9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4b01635c51d1f6f201b4d4600e"`,
    );
    await queryRunner.query(`DROP TABLE "event"`);
  }
}
