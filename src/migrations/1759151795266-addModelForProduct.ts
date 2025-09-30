import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddModelForProduct1759151795266 implements MigrationInterface {
  name = 'AddModelForProduct1759151795266';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "product_read_model" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "shortName" character varying, "purchasePrice" integer NOT NULL, "sellPrice" integer NOT NULL, "openPricing" boolean NOT NULL DEFAULT false, "accountingGroupId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "organizationId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_5832babad662d672d82df2ff7e7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "productId" character varying NOT NULL, "organizationId" uuid NOT NULL, "payload" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_e96757f72afe00f2ed8b4ecc770" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7f75dbee1d01e934c4c73fb720" ON "product_event" ("productId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_511dc0ae5a9492b3e370d07f7d" ON "product_event" ("createdAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ADD "currency" character(3) NOT NULL DEFAULT 'EUR'`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_read_model" ADD CONSTRAINT "FK_f10057b593e3a067e03b47ba26f" FOREIGN KEY ("accountingGroupId") REFERENCES "accounting_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_read_model" ADD CONSTRAINT "FK_dad4deb7400020d4f5fa5567ed2" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_event" ADD CONSTRAINT "FK_20366f0f328ddbfa7e3fc3924eb" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_event" DROP CONSTRAINT "FK_20366f0f328ddbfa7e3fc3924eb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_read_model" DROP CONSTRAINT "FK_dad4deb7400020d4f5fa5567ed2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_read_model" DROP CONSTRAINT "FK_f10057b593e3a067e03b47ba26f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN "currency"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_511dc0ae5a9492b3e370d07f7d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7f75dbee1d01e934c4c73fb720"`,
    );
    await queryRunner.query(`DROP TABLE "product_event"`);
    await queryRunner.query(`DROP TABLE "product_read_model"`);
  }
}
