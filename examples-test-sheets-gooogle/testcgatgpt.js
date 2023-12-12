const TradingView = require('../main');

// Initialize the TradingView client
const client = new TradingView.Client({
    // Your credentials or configuration here
});

// Create a Chart session
const chart_W = new client.Session.Chart();
const chart = new client.Session.Chart();


// Set the market and timeframe
chart.setMarket('BINANCE:BTCUSDT', { // Replace 'YOUR_MARKET_SYMBOL' with the actual symbol
    timeframe: 'D',
    
});

chart_W.setMarket('BINANCE:BTCUSDT', { // Replace 'YOUR_MARKET_SYMBOL' with the actual symbol
    timeframe: 'D',
    
});

// Function to get real-time updates for the indicator
function getRealTimeIndicatorData(indicator) {
    const Indicator = new chart.Study(indicator);
    const Indicator_w = new chart_W.Study(indicator);


    Indicator.onUpdate(() => {
        // Handle real-time updates here
        if (Indicator.periods.length > 0) {
            const lastDayData = Indicator.periods[0];
            console.log('Last Day Data:', lastDayData);
            // Process the last day data as needed
            console.log('Indicato Mr');

        }
        // You can process the data as needed
    });
    Indicator_w.onUpdate(() => {
        // Handle real-time updates here
        if (Indicator.periods.length > 0) {
            const lastDayData = Indicator.periods[0];
            console.log('Last Day Data:', lastDayData);
            console.log('Indicator_w');

            // Process the last day data as needed
        }
        // You can process the data as needed
    });



}

// Fetch the indicator
// Replace 'INDICATOR_ID' with your specific indicator ID
TradingView.getIndicator('USER;fa4099d3a752474a95e79b2d9186b804').then(indic => {
    console.log(`Loading '${indic.description}' indicator...`);
    getRealTimeIndicatorData(indic);
});

// Don't forget to handle disconnection or errors
// Add relevant code for client.end(), error handling, etc.
