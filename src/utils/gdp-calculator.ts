export function calculateGDP(population: number, exchange_rate: number): number {
    const randomMultiplier = Math.floor(Math.random() * (2000-1000) + 1)

    return (population * randomMultiplier)/ exchange_rate;
}