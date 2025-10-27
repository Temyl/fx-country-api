import knex, { Knex } from "knex";
import dotenv from "dotenv";

dotenv.config();

export function createDBConnection(): Knex {
  const {
    DB_HOST,
    DB_PORT,
    DB_DATABASE,
    DB_USER,
    DB_PASSWORD,
  } = process.env;

  const db = knex({
    client: "mysql2",
    connection: {
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_DATABASE,
      ssl: {
        rejectUnauthorized: false
      }
    },
    pool: { min: 0, max: 10 },
  });

   db.raw("SELECT 1")
    .then(() => console.log(" Database connected successfully"))
    .catch((err) => {
      console.error(" Database connection failed:", err.message);
      process.exit(1);
    });

  return db;
}
