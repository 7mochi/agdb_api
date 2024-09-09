import { DataSourceOptions, DataSource } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

export const dataSourceOptions: DataSourceOptions = {
  type: 'mariadb',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database:
    process.env.NODE_ENV === 'test'
      ? process.env.DB_TEST_DATABASE
      : process.env.DB_DATABASE,
  dropSchema: process.env.NODE_ENV === 'test',
  synchronize:
    process.env.NODE_ENV === 'test'
      ? true
      : Boolean(process.env.DB_SYNCHRONIZE),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
