### Country Currency & Exchange API

A RESTful API that fetches country data, caches it in a MySQL database, calculates estimated GDP, and provides CRUD operations along with summary image generation.

## Features
- Fetch country data from REST Countries API
- Fetch exchange rates from Open Exchange Rates API
- Compute estimated_gdp = population × random(1000–2000) ÷ exchange_rate
- Store or update data in MySQL
- CRUD operations for countries
- Serve a summary image showing total countries, top 5 GDP countries, and last refresh timestamp
- Support filtering and sorting by region, currency, and GDP

## Tech Stack
- Node.js
- Express.js
- MySQL
- Axios (for external API requests)
- Canvas / Sharp (for image generation)
- dotenv (for environment configuration)
- TypeScript