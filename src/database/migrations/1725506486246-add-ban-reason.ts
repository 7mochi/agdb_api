import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBanReason1725506486246 implements MigrationInterface {
  name = 'AddBanReason1725506486246';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`player\` ADD \`banReason\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`player\` DROP COLUMN \`banReason\``);
  }
}
