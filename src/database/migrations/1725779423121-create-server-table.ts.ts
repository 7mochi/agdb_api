import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServerTable1725779423121 implements MigrationInterface {
  name = 'CreateServerTable1725779423121';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`server\` (\`id\` int NOT NULL AUTO_INCREMENT, \`ipPort\` varchar(255) NOT NULL, \`serverName\` varchar(255) NULL, \`agdbVersion\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`server\``);
  }
}
