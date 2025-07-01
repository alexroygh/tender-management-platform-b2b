import type { Knex } from "knex";
import dotenv from 'dotenv';
dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgres://kibou:kiboupass@localhost:5432/kibou',
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
  },

  staging: {
    client: "pg",
    connection: process.env.DATABASE_URL, // Use env var here too
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
  },

  production: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // required by Neon
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
  },
};

export default config;
