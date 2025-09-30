import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFullTextSearchOnProduct1759155068373
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_read_model" ADD "document_with_weights" tsvector NULL`,
    );
    await queryRunner.query(`
        UPDATE "product_read_model" 
        SET document_with_weights = setweight(to_tsvector('simple', coalesce("shortName", '')), 'A') ||
                                    setweight(to_tsvector('simple', name), 'B')
    `);
    await queryRunner.query(
      `ALTER TABLE "product_read_model" ALTER COLUMN "document_with_weights" SET NOT NULL`,
    );

    await queryRunner.query(`CREATE INDEX product_read_model_document_weights_idx
            ON "product_read_model"
            USING GIN (document_with_weights)`);

    await queryRunner.query(`CREATE FUNCTION product_read_model_tsvector_trigger() RETURNS trigger AS $$
            begin
                new.document_with_weights :=
                    setweight(to_tsvector('simple', coalesce(new."shortName", '')), 'A')
                    || setweight(to_tsvector('simple', coalesce(new.name, '')), 'B');
                return new;
            end
        $$ LANGUAGE plpgsql`);

    await queryRunner.query(`CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
            ON product_read_model FOR EACH ROW EXECUTE PROCEDURE product_read_model_tsvector_trigger()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TRIGGER tsvectorupdate');
    await queryRunner.query(
      'DROP FUNCTION product_read_model_tsvector_trigger',
    );
    await queryRunner.query(
      'DROP INDEX product_read_model_document_weights_idx',
    );
    await queryRunner.query(
      'ALTER TABLE "product_read_model" DROP COLUMN "document_with_weights"',
    );
  }
}
