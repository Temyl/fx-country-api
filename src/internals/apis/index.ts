import axios, { AxiosInstance } from "axios";
import { DURATION } from "../enums";

export class CountryApi {

    private readonly countryApi: AxiosInstance;
    private readonly exchangeApi: AxiosInstance;

    constructor() {
        this.countryApi = axios.create({
            baseURL: "https://restcountries.com/v2",
            timeout: 10 * DURATION.SECONDS,
        });

        this.exchangeApi = axios.create({
            baseURL: "https://open.er-api.com/v6/latest",
            timeout: 10 * DURATION.SECONDS,
        });
    }

    public async getCountries(): Promise<any[]> {
        try {
            const response = await this.countryApi.get(
                "/all?fields=name,capital,region,population,flag,currencies"
        );
        return response.data;
        } catch (error) {
            console.error(
                "Failed to fetch countries:", 
                error
            );
            throw new Error(
                "Could not fetch data from RESTCountries API"
            );
        }
    }

    public async getExchangeRates(): Promise<Record<string, number>> {
        try {
            const response = await this.exchangeApi.get("/USD");
            const data = response.data;

            // console.log("Exchange API raw response:", data)

            if (data?.result !== "success") {
                throw new Error("Exchange rate API did not return success");
            }

            return {rates: data.rates}; 
        } catch (error) {
            console.error(
                "Failed to fetch exchange rates:",
                error
            );
            throw new Error(
                "Could not fetch data from Exchange Rate API"
            );
        }
    }
}
