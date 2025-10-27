import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("countries_fx_exchange", (table) => {
    table.uuid("id").primary();
    table.string("name").notNullable();
    table.string("capital");
    table.string("region");
    table.bigInteger("population").notNullable();
    table.string("currency_code");
    table.decimal("exchange_rate");
    table.decimal("estimated_gbp").notNullable();
    table.string("flag_url");
    table.timestamp("last_refreshed_at");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("countries_fx_exchange");
}
