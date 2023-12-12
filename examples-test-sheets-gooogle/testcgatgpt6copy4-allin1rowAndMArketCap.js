require('dotenv').config();
const { google } = require('googleapis');
const TradingView = require('../main'); // Adjust the path as needed
const { appendAllDataFromJson_big } = require('./googleSheetsUtils');

const spreadsheetId = "1SZwDpZO7rvLrijKq9dtgdOP4tffr-KzhQB1JsPXBj8I";
const id = "whv5betgotone8n4lfwnaco9xq15dl7t";
const certificate = "v1:Bk/ZvaAmuR48QoWNbGrOeTdM9CTL+CUngWzYXUF0jvQ=";
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const markets = ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'BINANCE:ETHBTC'];

async function getAuthToken() {
    const auth = new google.auth.GoogleAuth({ scopes: SCOPES });
    const authToken = await auth.getClient();
    return authToken;
}

async function fetchData(market, timeframe) {
    const client = new TradingView.Client({ token: id, signature: certificate });
    const chart = new client.Session.Chart();
    chart.setMarket(market, {
        timeframe: timeframe,
        range: 1,
        to: Math.round(Date.now() / 1000)
    });

    return new Promise((resolve, reject) => {
        TradingView.getIndicator('USER;fa4099d3a752474a95e79b2d9186b804').then((indic) => {
            const study = new chart.Study(indic);
            study.onUpdate(() => {
                resolve(study.periods);
                client.end();
            });
        }).catch(reject);
    });
}

function processDataForTimeframes(market, data1D, data2D, data3D, data4D, data5D, data6D, dataW, dataM) {
    let alignedData = {};
    let marketName = market.split(':')[1]; // Extracts the part after 'BINANCE:'

    let latestData = data1D[0]; // Assuming the latest data is the first element in the array
    let monthlyPosition = dataM.length > 0 ? dataM[0].position : null; // Assuming the first entry in dataM is the latest

    alignedData[marketName + '_unix'] = latestData.$time;
    alignedData[marketName + '_time'] = new Date(latestData.$time * 1000).toLocaleString();
    alignedData[marketName + '_1Dposition'] = latestData.position;
    alignedData[marketName + '_2Dposition'] = findClosestData(latestData, data2D).position;
    alignedData[marketName + '_3Dposition'] = findClosestData(latestData, data3D).position;
    alignedData[marketName + '_4Dposition'] = findClosestData(latestData, data4D).position;
    alignedData[marketName + '_5Dposition'] = findClosestData(latestData, data5D).position;
    alignedData[marketName + '_6Dposition'] = findClosestData(latestData, data6D).position;
    alignedData[marketName + '_Wposition'] = findClosestData(latestData, dataW).position;
    alignedData[marketName + '_Mposition'] = monthlyPosition;
    alignedData[marketName + '_closeprice'] = latestData.ClosePrice;

    return alignedData;
}

function findClosestData(day, timeframeData) {
  // Assuming timeframeData is sorted by time, find the closest entry to 'day'
  let closest = timeframeData[0];
  let minDiff = Math.abs(day.$time - closest.$time);

  for (let entry of timeframeData) {
    let diff = Math.abs(day.$time - entry.$time);
    if (diff < minDiff) {
      minDiff = diff;
      closest = entry;
    }
  }

  return closest;
}


async function exportAllMarketData() {
  try {
      const auth = await getAuthToken();
      let allProcessedData = {};

      for (let market of markets) {
        const data1D = await fetchData(market, '1D');
        const data2D = await fetchData(market, '2D');
        const data3D = await fetchData(market, '3D');
        const data4D = await fetchData(market, '4D');
        const data5D = await fetchData(market, '5D');
        const data6D = await fetchData(market, '6D');
        const dataW = await fetchData(market, 'W');
        const dataM = await fetchData(market, '1M');
          // ... existing code to fetch and process data ...

          const processedData = processDataForTimeframes(market, data1D, data2D, data3D, data4D, data5D, data6D, dataW, dataM);
          Object.assign(allProcessedData, processedData);
      }

      // Prepare data for Google Sheets
      const headers = Object.keys(allProcessedData);
      const values = Object.values(allProcessedData);

      const sheetData = [headers].concat([values]); // Correct structure: array of arrays

      const sheetTitle = 'CombinedMarketData';
      await appendAllDataFromJson_big(auth, spreadsheetId, sheetTitle, sheetData);

      console.log('Data from all markets exported successfully to Google Sheets with correct headers.');

  } catch (error) {
      console.error('Error in exportAllMarketData:', error);
  }
}

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

        return { BTC: btcMarketCap, ETH: ethMarketCap };
    } catch (error) {
        console.error('Error fetching data:', error);
        return { BTC: null, ETH: null }; // Return null if there is an error
    }
}

// Integration with exportAllMarketDataWithMarketCap
async function exportAllMarketDataWithMarketCap() {
    // ... other required imports and function definitions ...

    try {
        const auth = await getAuthToken();
        let allProcessedData = {};

        
  
        for (let market of markets) {
          const data1D = await fetchData(market, '1D');
          const data2D = await fetchData(market, '2D');
          const data3D = await fetchData(market, '3D');
          const data4D = await fetchData(market, '4D');
          const data5D = await fetchData(market, '5D');
          const data6D = await fetchData(market, '6D');
          const dataW = await fetchData(market, 'W');
          const dataM = await fetchData(market, '1M');
            // ... existing code to fetch and process data ...
  
            const processedData = processDataForTimeframes(market, data1D, data2D, data3D, data4D, data5D, data6D, dataW, dataM);
            Object.assign(allProcessedData, processedData);
        }
  

        // Fetch market cap data for BTC and ETH
        const marketCapData = await getMarketCap();
        allProcessedData['BTC_MarketCap'] = marketCapData.BTC;
        allProcessedData['ETH_MarketCap'] = marketCapData.ETH;

        // Prepare data for Google Sheets
        const headers = Object.keys(allProcessedData);
        const values = Object.values(allProcessedData);

        const sheetData = [headers].concat([values]);

        const sheetTitle = 'CombinedMarketData';
        await appendAllDataFromJson_big(auth, spreadsheetId, sheetTitle, sheetData);

        console.log('Data from all markets along with BTC and ETH market cap exported successfully to Google Sheets.');

    } catch (error) {
        console.error('Error in exportAllMarketDataWithMarketCap:', error);
    }
}

exportAllMarketDataWithMarketCap();
