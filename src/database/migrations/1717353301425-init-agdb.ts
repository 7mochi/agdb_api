import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitAgdb1717353301425 implements MigrationInterface {
  name = 'InitAgdb1717353301425';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`history\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nickname\` varchar(255) NOT NULL, \`ip\` varchar(255) NOT NULL, \`playerId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`player\` (\`id\` int NOT NULL AUTO_INCREMENT, \`steamID\` varchar(255) NOT NULL, \`isBanned\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`auth\` (\`id\` int NOT NULL AUTO_INCREMENT, \`serverIPPort\` varchar(255) NOT NULL, \`apiKey\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history\` ADD CONSTRAINT \`FK_0599a722547ce46134dc368b372\` FOREIGN KEY (\`playerId\`) REFERENCES \`player\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`history\` DROP FOREIGN KEY \`FK_0599a722547ce46134dc368b372\``,
    );
    await queryRunner.query(`DROP TABLE \`auth\``);
    await queryRunner.query(`DROP TABLE \`player\``);
    await queryRunner.query(`DROP TABLE \`history\``);
  }
}
