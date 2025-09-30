import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsernameInUserTable1758303692826 implements MigrationInterface {
  name = 'AddUsernameInUserTable1758303692826';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "accounting_group" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "vatRate" numeric(5,2) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "organizationId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_c4a188aec343de5f9dec95d4178" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "username" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username")`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounting_group" ADD CONSTRAINT "FK_c4fa03a8beefbadaa2264702b3b" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "accounting_group" DROP CONSTRAINT "FK_c4fa03a8beefbadaa2264702b3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "username"`);
    await queryRunner.query(`DROP TABLE "accounting_group"`);
  }
}
