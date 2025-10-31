import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeviceTable1761907988097 implements MigrationInterface {
  name = 'AddDeviceTable1761907988097';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "device" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deviceId" character varying NOT NULL, "publicKeyBase64" text NOT NULL, "meta" jsonb, "organizationId" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_2dc10972aa4e27c01378dad2c72" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_6fe2df6e1c34fc6c18c786ca26" ON "device" ("deviceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_86614a6c7219d1181b2f879b24" ON "device" ("createdAt") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_86614a6c7219d1181b2f879b24"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6fe2df6e1c34fc6c18c786ca26"`,
    );
    await queryRunner.query(`DROP TABLE "device"`);
  }
}
