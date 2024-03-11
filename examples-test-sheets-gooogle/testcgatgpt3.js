const TradingView = require('../main');

const id = "whv5betgotone8n4lfwnaco9xq15dl7t"
const certificate = "v1:Bk/ZvaAmuR48QoWNbGrOeTdM9CTL+CUngWzYXUF0jvQ="

const client = new TradingView.Client({
  token: id,
  signature: certificate,
});

// Object to track updates
let updatesReceived = {
    'D': false,
  '2D': false,
  '4D': false
};

// Function to check if all updates are received
function checkAllUpdatesReceived() {
  if (updatesReceived['2D'] && updatesReceived['4D'] && updatesReceived['D']) {
    console.log('All updates received, closing client.');
    client.end(); // Close the client connection
  }
}

// Function to get real-time updates for the indicator
function getRealTimeIndicatorData(timeframe, chart, indicator) {
  const Indicator = new chart.Study(indicator);

  Indicator.onUpdate(() => {
    if (!updatesReceived[timeframe] && Indicator.periods.length > 0) {
      const lastPeriodData = Indicator.periods[0];
      console.log(timeframe, `Last Period Data for ${timeframe}:`, lastPeriodData);
      // Mark this timeframe as updated
      updatesReceived[timeframe] = true;
      checkAllUpdatesReceived();
    }
  });
}
// Fetch and set up chart for 2-day timeframe
const chart = new client.Session.Chart();
chart.setMarket('BINANCE:BTCUSDT', { timeframe: 'D' });
TradingView.getIndicator('USER;fa4099d3a752474a95e79b2d9186b804').then(indic => {
  console.log(`Loading '${indic.description}' indicator for D timeframe...`);
  getRealTimeIndicatorData('D', chart2D, indic);
});

// Fetch and set up chart for 2-day timeframe
const chart2D = new client.Session.Chart();
chart2D.setMarket('BINANCE:BTCUSDT', { timeframe: '2D' });
TradingView.getIndicator('USER;fa4099d3a752474a95e79b2d9186b804').then(indic => {
  console.log(`Loading '${indic.description}' indicator for 2D timeframe...`);
  getRealTimeIndicatorData('2D', chart2D, indic);
});

// Fetch and set up chart for 4-day timeframe
const chart4D = new client.Session.Chart();
chart4D.setMarket('BINANCE:BTCUSDT', { timeframe: '4D' });
TradingView.getIndicator('USER;fa4099d3a752474a95e79b2d9186b804').then(indic => {
  console.log(`Loading '${indic.description}' indicator for 4D timeframe...`);
  getRealTimeIndicatorData('4D', chart4D, indic);
});

// Add error handling, disconnection handling, etc.
