const TradingView = require('../main');

/**
 * This example tests custom timeframes like 1 second
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

chart.setTimezone('Europe/Paris');

chart.setMarket('BTCUSDT', {
  timeframe: '2880',
  range: -10,
  to: 1600000000
});

chart.onSymbolLoaded(() => {
  console.log(chart.infos.name, 'loaded !');
});

chart.onUpdate(() => {
  console.log('OK', chart.periods);
});

TradingView.getIndicator('USER;fa4099d3a752474a95e79b2d9186b804').then(async (indic) => {
  console.log(`Loading '${indic.description}' study...`);
  const SUPERTREND = new chart.Study(indic);

  SUPERTREND.onUpdate(() => {
    console.log('Prices periods:', chart.periods);
    console.log('Study periods:', SUPERTREND.periods);
    client.end();
  });
});
