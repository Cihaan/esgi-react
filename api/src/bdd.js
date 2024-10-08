import { Sequelize } from "@sequelize/core";
import { MySqlDialect } from "@sequelize/mysql";
import dotenv from "dotenv";

dotenv.config();

/**
 * Connexion à la base de données
 */
export const sequelize = new Sequelize({
  dialect: MySqlDialect,
  database: "db",
  user: "root",
  password: "password",
  host: "localhost",
  port: 3306,
});
