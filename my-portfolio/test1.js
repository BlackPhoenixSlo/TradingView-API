require('dotenv').config();


const TradingView = require('../main'); // Adjust the path as needed
const { google } = require('googleapis'); // For later steps

// Replace with your actual TradingView credentials
const id = "whv5betgotone8n4lfwnaco9xq15dl7t";
const certificate = "v1:Bk/ZvaAmuR48QoWNbGrOeTdM9CTL+CUngWzYXUF0jvQ=";

const symbols = ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'BINANCE:ETHBTC'];
const timeframes = ['1D', '2D', '3D', '4D', '6D', '1M'];

async function fetchFSVZOData(symbol, timeframe) {
    // Initialize TradingView client
    const client = new TradingView.Client({ token: id, signature: certificate });
    const chart = new client.Session.Chart();

    chart.setMarket(symbol, {
        timeframe: timeframe,
        range:1,
        // Adjust the range as needed
    });

    // Fetch the FSVZO indicator data
    try {
        const indic = await TradingView.getIndicator('USER;fa4099d3a752474a95e79b2d9186b804'); // Replace with actual FSVZO indicator ID
        const study = new chart.Study(indic);

        return new Promise((resolve, reject) => {
            study.onUpdate(() => {
                resolve(study.periods);
                client.end();
            });
        });
    } catch (error) {
        console.error('Error fetching FSVZO data:', error);
        client.end();
    }
}

async function main() {
    for (const symbol of symbols) {
        for (const timeframe of timeframes) {
            const data = await fetchFSVZOData(symbol, timeframe);
            console.log(`Data for ${symbol} - ${timeframe}:`, data[0]);
        }
    }
}

main();
