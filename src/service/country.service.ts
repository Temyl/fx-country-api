import { Knex } from "knex";
import { Country } from "../internals/interface";
import { createDBConnection } from "../config/knex";
import { ulid } from "ulid";

export class CountryService {
    private readonly db: Knex;

    constructor() {
        this.db = createDBConnection();
    }

    public async getAll(filters?: {
        region?: string;
        currency?: string;
        sort?: string;
    }): Promise<Country[]> {
        const query = this.db('countries_fx_exchange').select('*');

        if (filters?.region) {
            query.whereILike('region', `%${filters.region}%`);
        }

        if (filters?.currency) {
            query.where('currency_code', filters.currency);
        }

        if (filters?.sort) {
            query.orderBy('estimated_gbp', 'desc');
        }

        return await query;
    }

    async countAll() {
        const result = await this.db('countries_fx_exchange').count('id as total');
        return Number(result[0].total);
    }




    public async getByName(name: string): Promise<Country> {
        const country = await this.db('countries_fx_exchange')
        .where({name})
        .first()

        return country;
    }

    public async create(data: Country): Promise<Country> {
        const [inserted] = await this.db('countries_fx_exchange')
            .insert(data)
            .returning('*')
        
        return inserted;
    }

    public async delete(name: string): Promise<void> {
        await this.db('countries_fx_exchange')
            .where({ name})
            .delete();
    }

    public async upsert(data: Country): Promise<Country> {
    const [upserted] = await this.db('countries_fx_exchange')
        .insert(data)
        .onConflict('currency_code')
        .merge()
        .returning('*');

    return upserted;
    }

    public async bulkInsert(countries: Country[]): Promise<void> {
        if (!countries.length) return;

        const id = countries.map((c) => ({
            id: c.id || ulid(),
            ...c,
        }));

        try {
            await this.db('countries_fx_exchange')
                .insert(countries)
                .onConflict('id')
                .merge([
                    'name',
                    'capital',
                    'region',
                    'population',
                    'currency_code',
                    'exchange_rate',
                    'estimated_gbp',
                    'flag_url'
                ]);
        } catch (error) {
            console.error('Bulk upsert failed', error)
            throw new Error('Database error during bulk upsert')
        }
    }

}