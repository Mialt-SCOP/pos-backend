import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductOnScreenTable1759243468374
  implements MigrationInterface
{
  name = 'AddProductOnScreenTable1759243468374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "product_on_screen" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rank" character varying NOT NULL, "active" boolean NOT NULL, "productId" uuid NOT NULL, "screenId" uuid NOT NULL, CONSTRAINT "PK_5b6abf70a6d58c18229a2f80bab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "product_on_screen_rank" ON "product_on_screen" ("rank") `,
    );
    await queryRunner.query(
      `CREATE INDEX "product_on_screen_active" ON "product_on_screen" ("active") `,
    );
    await queryRunner.query(
      `ALTER TABLE "product_on_screen" ADD CONSTRAINT "FK_d4c73cfdda6e0dd4e06ac914097" FOREIGN KEY ("productId") REFERENCES "product_read_model"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_on_screen" ADD CONSTRAINT "FK_6ac785b14dde6471e978b71e6e5" FOREIGN KEY ("screenId") REFERENCES "screen"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_on_screen" DROP CONSTRAINT "FK_6ac785b14dde6471e978b71e6e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_on_screen" DROP CONSTRAINT "FK_d4c73cfdda6e0dd4e06ac914097"`,
    );
    await queryRunner.query(`DROP INDEX "public"."product_on_screen_active"`);
    await queryRunner.query(`DROP INDEX "public"."product_on_screen_rank"`);
    await queryRunner.query(`DROP TABLE "product_on_screen"`);
  }
}
