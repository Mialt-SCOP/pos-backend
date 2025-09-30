import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResetPassword1758291345187 implements MigrationInterface {
  name = 'AddResetPassword1758291345187';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "password_less_temporary_pin" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pin" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL, "usedAt" TIMESTAMP, "user_id" uuid, CONSTRAINT "PK_e0e6b128e3bf6985c2aa3d5e04b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reset_password" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL, "usedAt" TIMESTAMP, "user_id" uuid, CONSTRAINT "PK_82bffbeb85c5b426956d004a8f5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_less_temporary_pin" ADD CONSTRAINT "FK_f5eb3d1fd690a3afb27ff9e2b3d" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reset_password" ADD CONSTRAINT "FK_de65040d842349a5e6428ff21e6" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reset_password" DROP CONSTRAINT "FK_de65040d842349a5e6428ff21e6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_less_temporary_pin" DROP CONSTRAINT "FK_f5eb3d1fd690a3afb27ff9e2b3d"`,
    );
    await queryRunner.query(`DROP TABLE "reset_password"`);
    await queryRunner.query(`DROP TABLE "password_less_temporary_pin"`);
  }
}
