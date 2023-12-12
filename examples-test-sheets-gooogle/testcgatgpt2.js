const TradingView = require('../main');



id = "whv5betgotone8n4lfwnaco9xq15dl7t"
certificate = "v1:Bk/ZvaAmuR48QoWNbGrOeTdM9CTL+CUngWzYXUF0jvQ="






  const client = new TradingView.Client({
    token: id,
    signature: certificate,
  });

    // Function to get real-time updates for the indicator
    function getRealTimeIndicatorData(chart, indicator) {
        const Indicator = new chart.Study(indicator);

        Indicator.onUpdate(() => {
            if (Indicator.periods.length > 0) {
                const lastPeriodData = Indicator.periods[0];
                console.log(chart.timeframe,`Last Period Data for ${chart.timeframe}:`, lastPeriodData);
                // Process the data as needed
            }
        });
    }

    // Fetch and set up chart for 2-day timeframe
    const chart2D = new client.Session.Chart();
    chart2D.setMarket('BINANCE:BTCUSDT', { timeframe: '2D' });
    TradingView.getIndicator('USER;fa4099d3a752474a95e79b2d9186b804').then(indic => {
        console.log(`Loading '${indic.description}' indicator for 2D timeframe...`);
        getRealTimeIndicatorData(chart2D, indic);
    });

    // Fetch and set up chart for 4-day timeframe
    const chart4D = new client.Session.Chart();
    chart4D.setMarket('BINANCE:BTCUSDT', { timeframe: '4D' });
    TradingView.getIndicator('USER;fa4099d3a752474a95e79b2d9186b804').then(indic => {
        console.log(`Loading '${indic.description}' indicator for 4D timeframe...`);
        getRealTimeIndicatorData(chart4D, indic);
    });

    // Add error handling, disconnection handling, etc.

