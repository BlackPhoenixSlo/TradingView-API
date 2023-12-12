const TradingView = require('../main');

/**
 * This example creates a chart with all user's private indicators
 */

process.argv[2] = "3c4pkjlqa85y6s5f276zndxk2c4l8o87"
process.argv[3] = "v1:3ul89geFcGwrtAyaHIUWU1OPfUQufwazwYdXeGTj5kw="
if (!process.argv[2]) throw Error('Please specify your \'sessionid\' cookie');
if (!process.argv[3]) throw Error('Please specify your \'signature\' cookie');

const client = new TradingView.Client({
  token: process.argv[2],
  signature: process.argv[3],
});

const chart = new client.Session.Chart();
chart.setMarket('BINANCE:BTCEUR', {
  timeframe: 'D',
});

TradingView.getPrivateIndicators(process.argv[2]).then((indicList) => {
  indicList.forEach(async (indic) => {
    const privateIndic = await indic.get();
    console.log('Loading indicator', indic.name, '...');
    console.log('Indicator', indic.name, 'loaded !');
    console.log('Indicator', indic.id, 'id !');
    console.log('Indicator', indic.version, 'version !');
    console.log('Indicator', indic.type, 'type !');
    console.log('Indicator', indic.source, 'source !');

    const indicator = new chart.Study(privateIndic);

    indicator.onReady(() => {
      console.log('Indicator', indic.name, 'loaded !');
      console.log('Indicator', indic.id, 'id !');
      console.log('Indicator', indic.version, 'version !');
      console.log('Indicator', indic.type, 'type !');
      console.log('Indicator', indic.source, 'source !');




    });

    // indicator.onUpdate(() => {
    //   console.log('Plot values', indicator.periods);
    //   console.log('Strategy report', indicator.strategyReport);
    // });
  });
});
