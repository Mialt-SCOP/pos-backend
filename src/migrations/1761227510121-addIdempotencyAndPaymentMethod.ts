import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIdempotencyAndPaymentMethod1761227510121
  implements MigrationInterface
{
  name = 'AddIdempotencyAndPaymentMethod1761227510121';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "payment_custom_fields" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "label" character varying(100) NOT NULL, "type" character varying(20) NOT NULL DEFAULT 'string', "required" boolean NOT NULL DEFAULT false, "helperText" character varying(255), "paymentMethodId" uuid, CONSTRAINT "PK_01d11a2901cb93b638c8538586b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_methods_type_enum" AS ENUM('cash', 'card', 'check', 'meal_voucher', 'custom')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payment_methods" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."payment_methods_type_enum" NOT NULL, "name" character varying(100) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "metadata" jsonb, CONSTRAINT "PK_34f9b8c6dfb4ac3559f7e2820d1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "payment_method_event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "aggregateId" character varying NOT NULL, "type" character varying NOT NULL, "payload" jsonb NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, CONSTRAINT "PK_f0fc5e5f0bb1cee471a4e3e1556" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "payment_method_version" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "paymentMethodId" character varying NOT NULL, "version" integer NOT NULL, "name" character varying NOT NULL, "type" character varying NOT NULL, "customFields" jsonb, "active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_19d34730dcd91a017789418a368" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."processed_command_status_enum" AS ENUM('pending', 'success', 'error')`,
    );
    await queryRunner.query(
      `CREATE TABLE "processed_command" ("commandId" character varying NOT NULL, "correlationId" character varying, "responseData" jsonb, "responseStatus" integer, "status" "public"."processed_command_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "processedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_38455da2468f1754518eaaf5b67" PRIMARY KEY ("commandId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_custom_fields" ADD CONSTRAINT "FK_72ef97c00ebf15f27f14d610be3" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_methods"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_custom_fields" DROP CONSTRAINT "FK_72ef97c00ebf15f27f14d610be3"`,
    );
    await queryRunner.query(`DROP TABLE "processed_command"`);
    await queryRunner.query(
      `DROP TYPE "public"."processed_command_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "payment_method_version"`);
    await queryRunner.query(`DROP TABLE "payment_method_event"`);
    await queryRunner.query(`DROP TABLE "payment_methods"`);
    await queryRunner.query(`DROP TYPE "public"."payment_methods_type_enum"`);
    await queryRunner.query(`DROP TABLE "payment_custom_fields"`);
  }
}
