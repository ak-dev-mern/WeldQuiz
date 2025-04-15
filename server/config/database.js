import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const databaseHost = process.env.DB_HOST;
const databaseName = process.env.DB_NAME;
const databaseUserName = process.env.DB_USER_NAME;
const databasePassword = process.env.DB_PASSWORD;
const databasePort = process.env.DB_PORT;
const databaseDialect = process.env.DB_DIALECT;

const sequelize = new Sequelize(
  databaseName,
  databaseUserName,
  databasePassword,
  {
    host: databaseHost,
    dialect: databaseDialect,
    port: databasePort,
    logging: false,
  }
);

export default sequelize;
