const axios = require('axios');

async function getMarketCap() {
    const apiKey = 'fd6113eb-8ae0-4d0e-84bb-6b5a03a95201';
    const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';
    const symbols = 'BTC,ETH'; // Symbols for Bitcoin and Ethereum

    try {
        const response = await axios.get(url, {
            headers: {
                'X-CMC_PRO_API_KEY': apiKey
            },
            params: {
                symbol: symbols
            }
        });

        const btcMarketCap = response.data.data.BTC.quote.USD.market_cap;
        const ethMarketCap = response.data.data.ETH.quote.USD.market_cap;

        console.log(`BTC Market Cap: ${btcMarketCap}`);
        console.log(`ETH Market Cap: ${ethMarketCap}`);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

getMarketCap();
