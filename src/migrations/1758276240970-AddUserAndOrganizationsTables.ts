import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAndOrganizationsTables1758276240970
  implements MigrationInterface
{
  name = 'AddUserAndOrganizationsTables1758276240970';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "displayName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "organization" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_472c1f99a32def1b0abb219cd67" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organization_members_role_enum" AS ENUM('owner', 'admin', 'accountant', 'supply_manager', 'point_of_sale', 'none')`,
    );
    await queryRunner.query(
      `CREATE TABLE "organization_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid NOT NULL, "userId" uuid NOT NULL, "role" "public"."organization_members_role_enum" NOT NULL DEFAULT 'none', CONSTRAINT "PK_c2b39d5d072886a4d9c8105eb9a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organization_member_invitation_role_enum" AS ENUM('owner', 'admin', 'accountant', 'supply_manager', 'point_of_sale', 'none')`,
    );
    await queryRunner.query(
      `CREATE TABLE "organization_member_invitation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid NOT NULL, "role" "public"."organization_member_invitation_role_enum" NOT NULL DEFAULT 'none', "email" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, "used" boolean NOT NULL DEFAULT false, "usedAt" TIMESTAMP, CONSTRAINT "PK_3f0b7f0aaa39ffd2d82058e0d85" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2c12ea0183105b22e4aea49b60" ON "organization_member_invitation" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6eaaf5920f4f151d3bd741e5f1" ON "organization_member_invitation" ("used") `,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" ADD CONSTRAINT "FK_e826222ad017663c6db1a45a4f1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" ADD CONSTRAINT "FK_5652c2c6b066835b6c500d0d83f" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_member_invitation" ADD CONSTRAINT "FK_c1f64969dd242184720ef631213" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_member_invitation" DROP CONSTRAINT "FK_c1f64969dd242184720ef631213"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" DROP CONSTRAINT "FK_5652c2c6b066835b6c500d0d83f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" DROP CONSTRAINT "FK_e826222ad017663c6db1a45a4f1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6eaaf5920f4f151d3bd741e5f1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2c12ea0183105b22e4aea49b60"`,
    );
    await queryRunner.query(`DROP TABLE "organization_member_invitation"`);
    await queryRunner.query(
      `DROP TYPE "public"."organization_member_invitation_role_enum"`,
    );
    await queryRunner.query(`DROP TABLE "organization_members"`);
    await queryRunner.query(
      `DROP TYPE "public"."organization_members_role_enum"`,
    );
    await queryRunner.query(`DROP TABLE "organization"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
