const { Client } = require('../main');
const TradingView = require('../main');


/**
 * This example tests the fake replay mode which
 * works in intraday even with free plan
 */

console.log('----- Testing FakeReplayMode: -----');

const client = new Client();
const chart = new client.Session.Chart();

chart.setMarket('BINANCE:BTCEUR', {
  timeframe: '86400',
  range: -1, // Range is negative, so 'to' means 'from'
  // to: Math.round(Date.now() / 1000) - 86400 * 7, // Seven days before now
  to: 1600000000,
});

let interval = NaN;

TradingView.getIndicator('USER;fa4099d3a752474a95e79b2d9186b804').then(async (indic) => {
  console.log(`Loading '${indic.description}' study...`);
  const SUPERTREND = new chart.Study(indic);

  SUPERTREND.onUpdate(() => {
    console.log('Prices periods:', chart.periods);
    console.log('Study periods:', SUPERTREND.periods);
    client.end();
  });
});

// chart.onUpdate(async () => {
//   const times = chart.periods.map((p) => p.time);

//   const intrval = times[0] - times[1];
//   if (Number.isNaN(interval) && times.length >= 2) interval = intrval;

//   if (!Number.isNaN(interval) && interval !== intrval) {
//     throw new Error(`Wrong interval: ${intrval} (should be ${interval})`);
//   }

//   console.log('Next ->', times[0]);

//   if ((times[0] + 86400) * 1000 > Date.now()) {
//     await client.end();
//     console.log('Done !', times.length);
//   }

//   chart.fetchMore(-1);
// });
