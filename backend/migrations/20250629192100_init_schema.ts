import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email').notNullable().unique();
    table.string('password_hash').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('companies', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('industry').nullable();
    table.string('description').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('user_company_map', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.integer('company_id').unsigned().references('id').inTable('companies').onDelete('CASCADE');
    table.unique(['user_id', 'company_id']);
  });

  await knex.schema.createTable('goods_and_services', (table) => {
    table.increments('id').primary();
    table.integer('company_id').unsigned().references('id').inTable('companies').onDelete('CASCADE');
    table.string('name').notNullable();
  });

  await knex.schema.createTable('tenders', (table) => {
    table.increments('id').primary();
    table.integer('company_id').unsigned().references('id').inTable('companies').onDelete('CASCADE');
    table.string('title').notNullable();
    table.string('description').nullable();
    table.date('deadline').nullable();
    table.decimal('budget').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('applications', (table) => {
    table.increments('id').primary();
    table.integer('tender_id').unsigned().references('id').inTable('tenders').onDelete('CASCADE');
    table.integer('company_id').unsigned().references('id').inTable('companies').onDelete('CASCADE');
    table.string('proposal').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('applications');
  await knex.schema.dropTableIfExists('tenders');
  await knex.schema.dropTableIfExists('goods_and_services');
  await knex.schema.dropTableIfExists('user_company_map');
  await knex.schema.dropTableIfExists('companies');
  await knex.schema.dropTableIfExists('users');
} 