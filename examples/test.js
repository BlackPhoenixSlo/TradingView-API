const TradingView = require('../main');

/**
 * This example creates a BTCEUR daily chart
 */

const client = new TradingView.Client(); // Creates a websocket client

const chart = new client.Session.Chart(); // Init a Chart session

chart.setMarket('BINANCE:BTCUSDT', { // Set the market
  timeframe: 'D',
});

chart.onError((...err) => { // Listen for errors (can avoid crash)
  console.error('Chart error:', ...err);
  // Do something...
});

chart.onSymbolLoaded(() => { // When the symbol is successfully loaded
  console.log(`Market "${chart.infos.description}" loaded !`);
});

chart.onUpdate(() => { // When price changes
  if (!chart.periods[0]) return;
  console.log(`[${chart.infos.description}]: ${chart.periods[0].close} ${chart.infos.currency_id}`);
  // Do something...
});

// Wait 5 seconds and set the market to BINANCE:ETHEUR
setTimeout(() => {
  console.log('\nSetting market to BINANCE:BTCUSDT...');
  chart.setMarket('BINANCE:ETHUSDT', {
    timeframe: 'D',
    range: -1, // Range is negative, so 'to' means 'from'
  to: Math.round(Date.now() / 1000) - 86400 * 3, // Seven days before now
  
  });
}, 5000);

TradingView.getIndicator('PUB;1161a39a858a4b76bcaf690637723e51').then(async (indic) => {
    console.log(`Loading '${indic.description}' study...`);
    const SUPERTREND = new chart.Study(indic);
  
    SUPERTREND.onUpdate(() => {
      console.log('Prices periods:', chart.periods);
      console.log('Study periods:', SUPERTREND.periods);
      client.end();
    });
  });

// Wait 10 seconds and set the timeframe to 15 minutes
setTimeout(() => {
  console.log('\nSetting timeframe to 15 minutes...');
  chart.setSeries('15');
}, 10000);

// Wait 15 seconds and set the chart type to "Heikin Ashi"
setTimeout(() => {
  console.log('\nSetting the chart type to "Heikin Ashi"s...');
  chart.setMarket('BINANCE:ETHUSDT', {
    timeframe: 'D',
    type: 'HeikinAshi',
  });
}, 15000);

// Wait 20 seconds and close the chart
setTimeout(() => {
  console.log('\nClosing the chart...');
  chart.delete();
}, 20000);

// Wait 25 seconds and close the client
setTimeout(() => {
  console.log('\nClosing the client...');
  client.end();
}, 25000);
