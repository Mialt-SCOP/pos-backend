import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScreenTable1759237143628 implements MigrationInterface {
  name = 'AddScreenTable1759237143628';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "screen" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "rank" character varying NOT NULL, "color" character varying, "isActive" boolean NOT NULL DEFAULT true, "organizationId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_7d30806a7556636b84d24e75f4d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "screen_rank" ON "screen" ("rank") `);
    await queryRunner.query(
      `ALTER TABLE "screen" ADD CONSTRAINT "FK_79018fc9589fe8cd5613d30f6b7" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "screen" DROP CONSTRAINT "FK_79018fc9589fe8cd5613d30f6b7"`,
    );
    await queryRunner.query(`DROP INDEX "public"."screen_rank"`);
    await queryRunner.query(`DROP TABLE "screen"`);
  }
}
