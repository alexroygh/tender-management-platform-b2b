import Knex from 'knex';
import knexConfig from '../../knexfile';
import dotenv from 'dotenv';

dotenv.config();

const env = process.env.NODE_ENV || 'development';
const knex = Knex(knexConfig[env]);

export default knex; 