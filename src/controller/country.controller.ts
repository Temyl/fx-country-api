import { Request, Response, Router } from "express";
import { CountryApi } from "../internals/apis";
import { ApplicationError } from "../internals/error";
import { StatusCodes } from "http-status-codes";
import { Country } from "../internals/interface";
import { ulid } from "ulid";
import { calculateGDP } from "../utils/gdp-calculator";
import { generateSummaryImage } from "../utils/image-generation";
import { getSummaryImagePath } from "../utils/generate-image-path";
import fs from 'fs'
import { CountryService } from "../service/country.service";

export class CountryController {
    private readonly route: Router;
    private readonly countryApi: CountryApi;
    private readonly countryservice: CountryService;

    constructor() {
        this.route = Router();
        this.countryApi = new CountryApi();
        this.countryservice = new CountryService();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.route.post(
            '/countries/refresh',
            async( 
                req: Request, 
                res: Response
            ) => {

                try {
                    const countries = await this.countryApi.getCountries();
                    const fx_rate = await this.countryApi.getExchangeRates();

                if (!countries || !Array.isArray(countries)) {
                    throw new ApplicationError(
                        StatusCodes.SERVICE_UNAVAILABLE,
                        'External data source unavailable: countries'
                    );
                }

                if (!fx_rate || typeof fx_rate !== "object" || !fx_rate.rates) {
                    throw new ApplicationError(
                        StatusCodes.SERVICE_UNAVAILABLE,
                        'External data source unavailable: exchange rates'
                    );
                }

                

                const Countrypayload: Country[] = countries.map((c: any ) => {
                    let currency_code = c.currencies?.[0]?.code || null;
                    let exchangeRate = currency_code ? fx_rate.rates[currency_code]: null;
                    let estimatedGdp = calculateGDP(c.population, exchangeRate) || null
                    

                    if (c.currencies == null) {
                        currency_code = null,
                        exchangeRate = null,
                        estimatedGdp = 0
                    } else if (!currency_code) {
                        exchangeRate = null,
                        estimatedGdp = 0
                    } 

                    return {
                        id: ulid(),
                        name: c.name,
                        capital: c.capital,
                        region: c.region,
                        population: c.population,
                        currency_code: currency_code,
                        exchange_rate: exchangeRate,
                        estimated_gbp: estimatedGdp,
                        flag_url: c.flag,
                        last_refreshed_at: new Date(),
                    };
                });

                await this.countryservice.bulkInsert(Countrypayload);

                await generateSummaryImage({
                    totalCountries: Countrypayload.length,
                    lastRefreshedAt: new Date(),
                    countries: Countrypayload
                });

                res.status(StatusCodes.OK).json({
                    message: "Countries refreshed successfully",
                    total: Countrypayload.length
                });
            } catch (error) {
                console.error("Error refreshing countries:", error);
                 res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: "Unexpected error refreshing countries",
                    error: (error as Error).message
                }); 
            }    
        });

        this.route.get(
            '/countries',
            async(
                req: Request,
                res: Response,
            ) => {

                try {

                    const {region, currency, sort} = req.query as any;
                    const countries = await this.countryservice.getAll({ region, currency, sort });

                    return res.status(StatusCodes.OK).json(countries)
                } catch (error) {
                    console.error(error);
                    return res.status(500).json({ 
                        error: "Internal server error" 
                    });
                }
        });

        this.route.get(
            '/countries/image',
            async(
                req: Request,
                res: Response
            ) => {

                try {

                    const imgPath = getSummaryImagePath();

                    if(!imgPath || !fs.existsSync(imgPath)) {
                        return res.status(StatusCodes.NOT_FOUND)
                            .json({ 
                                error: "Summary image not found" 
                        });
                    }

                    return res.sendFile(
                        imgPath, 
                        { headers: { "Content-Type": "image/png" }
                    });

                } catch (err) {
                    console.error(err);
                    return res.
                    status(StatusCodes.INTERNAL_SERVER_ERROR)
                        .json({ 
                            error: "Internal server error" 
                    });
                }
            }
        )

        this.route.get(
            '/countries/:name',
            async(
                req: Request,
                res: Response,
            ) => {

                try {
                    const name = req.params.name;

                    const country = await this.countryservice.getByName(name);

                    if (!country) {
                        return res.status(StatusCodes.NOT_FOUND)
                            .json({ 
                                error: "Country not found" 
                            });
                        }
                        return res.json(country);
                } catch (error) {
                    console.error(error);
                    return res.status(StatusCodes.INTERNAL_SERVER_ERROR)
                        .json({ 
                            error: "Internal server error" 
                        });
                }

            });

        

        this.route.delete(
            '/countries/:name',
            async(
                req: Request,
                res: Response
            ) => {

                try {

                    const name = req.params.name;

                    await this.countryservice.delete(name);

                    // if(!country) {
                    //     throw new ApplicationError(
                    //         StatusCodes.NOT_FOUND,
                    //         'Country not found'
                    //     );
                    // }

                    return res.json({
                        success: true
                    });
                } catch (err) {
                    console.error(err)
                    res.status(StatusCodes.INTERNAL_SERVER_ERROR)
                        .json({
                            error: 'internal server error'
                        });
                }
            }
        );

        this.route.get(
            '/status',
            async(
                    req: Request,
                    res: Response
                ) => {

                    try {

                        const total_number = await this.countryservice.countAll();
                        const last_refreshed_at = new Date().toISOString();

                        return res.json({
                            total_countries: total_number,
                            last_refreshed_at: last_refreshed_at
                        })
                    } catch (err) {
                        console.error(err);
                        return res.status(StatusCodes.INTERNAL_SERVER_ERROR)
                            .json({ 
                                error: "Internal server error" 
                        });
                    }
                }
        );

        

        
    }




}