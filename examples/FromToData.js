const TradingView = require('../main');

/**
 * This example tests fetching chart data of a number
 * of candles before or after a timestamp
 */

process.argv[2] = "whv5betgotone8n4lfwnaco9xq15dl7t"
process.argv[3] = "v1:Bk/ZvaAmuR48QoWNbGrOeTdM9CTL+CUngWzYXUF0jvQ="
if (!process.argv[2]) throw Error('Please specify your username/email');
if (!process.argv[3]) throw Error('Please specify your password');





  const client = new TradingView.Client({
    token: process.argv[2],
    signature: process.argv[3],
  });
const chart = new client.Session.Chart();


chart.setMarket('BINANCE:BTCUSDT', {
  timeframe: '86400',
  // range: 1, // Can be positive to get before or negative to get after
  // to: 1701885985,
  range: -7, // Range is negative, so 'to' means 'from'
  to: Math.round(Date.now() / 1000) - 86400 * 7, // Seven days before now
  
});

// This works with indicators

TradingView.getIndicator('USER;fa4099d3a752474a95e79b2d9186b804').then(async (indic) => {
  console.log(`Loading '${indic.description}' study...`);
  const SUPERTREND = new chart.Study(indic);

  SUPERTREND.onUpdate(() => {
    console.log('Prices periods:', chart.periods);
    console.log('Study periods:', SUPERTREND.periods);
    client.end();
  });
});
