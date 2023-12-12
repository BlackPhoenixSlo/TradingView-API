const TradingView = require('../main');

/**
 * This example tests the searching functions such
 * as 'searchMarket' and 'searchIndicator'
 */

TradingView.searchMarket('BINANCE:').then((rs) => {
  console.log('Found Markets:', rs);
});

TradingView.searchIndicator('FSVZO').then((rs) => {
  console.log('Found Indicators:', rs);
});
