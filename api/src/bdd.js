import { Sequelize } from '@sequelize/core';
import { MySqlDialect } from '@sequelize/mysql';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Connexion à la base de données
 */
export const sequelize = new Sequelize({
  dialect: MySqlDialect,
  database: process.env.MYSQL_NAME,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT),
});
