import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST || 'localhost',
  port: Number(process.env.PG_PORT || 5432),
  username: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  database: process.env.PG_DATABASE || 'carehr_dev',
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: [],
});
