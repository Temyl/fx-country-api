import express, { NextFunction, Request, Response } from 'express';
import { CountryController } from './controller/country.controller';
import { ApplicationError } from './internals/error';
import { StatusCodes } from 'http-status-codes';

const app = express();

app.use(express.json());

const countryController = new CountryController();

app.use('', countryController['route']);

app.use((err: any, req: Request, res: Response, next: NextFunction ) => {
    if (err instanceof ApplicationError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: err.message
        });
    }

    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
            message: 'Internal Server error'
        });
})


const port = process.env.PORT || 8110;
app.listen(port, () => console.log(`Server running on port ${port}`));