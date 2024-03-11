require('dotenv').config();

const { google } = require('googleapis');
const TradingView = require('../main'); // Adjust the path as needed
const { appendAllDataFromJson } = require('./main-backtest-googleSheetsUtils');



async function getAuthToken() {
  const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES
  });
  const authToken = await auth.getClient();
  return authToken;
}

async function fetchData(timeframe, ticket,indi_,client,timeframes) {
  const chart = new client.Session.Chart();
  console.log(Math.round((Date.now() - Date.UTC(2018,1,1) )/ 1000 / 60 / 60 / 24*(200/timeframeMapping[timeframes[0]])))
  chart.setMarket(ticket, {
    timeframe: timeframe,
    range:20000,
    to: Math.round((Date.now()  )/ 1000)
  });

  return new Promise((resolve, reject) => {
   TradingView.getIndicator(indi_).then((indic) => { //new
      const study = new chart.Study(indic);
      study.onUpdate(() => {
        resolve(study.periods);
      });
    }).catch(reject);
  });
}



const timeframeMapping = {
  '5': 1,                // Base timeframe
  '15': 3,               // 3 times the base timeframe
  '30': 6,               // 6 times the base timeframe
  '1H': 12,               // 12 times the base timeframe
  '2H': 24,               // 12 times the base timeframe
  '3H': 36,     
  '4H': 48,               // 48 times the base timeframe
  '6H': 72,               // 72 times the base timeframe
  '8H': 96,     
  '12H': 144,             // 144 times the base timeframe
  '16H': 192,     
  '1D': 288,              // 288 times the base timeframe
  '2D': 576,              // 576 times the base timeframe
  '3D': 864,              // 864 times the base timeframe
  '4D': 1152,             // 1152 times the base timeframe
  '5D': 1440,             // 1440 times the base timeframe
  '6D': 1728,             // 1728 times the base timeframe
  'W': 2016,              // 2016 times the base timeframe
  '1M': 8640              // Adjust this number as per your requirement for a month
};



function processDataForTimeframes(timeframes, MoveDown = 0, ...dataArrays) {
  const structuredData = [];
  const initialPositions = {};

  // Create initial arrays filled with zeros for each timeframe
  timeframes.forEach(tf => {
      initialPositions[tf] = new Array(MoveDown).fill(0);
  });

  // Reverse the order of entries in each data array
 //const reversedDataArrays = dataArrays.map(dataArray => dataArray.slice().reverse());

  // Process each timeframe
  dataArrays[0].forEach((entry, index) => {
      let row = {
          'unix': entry.$time,
          'time': new Date(entry.$time * 1000).toLocaleString(),
          'closeprice': entry.ClosePrice,
          'openprice': entry.OpenPrice
      };

      timeframes.forEach((timeframe, i) => {
          const allPositions = initialPositions[timeframe].concat(dataArrays[i].map(d => d.position));
          row[`${timeframe}position`] = allPositions[Math.floor(index / (timeframeMapping[timeframe] / timeframeMapping[timeframes[0]]))] || 0;
      });

      structuredData.push(row);
  });

  return structuredData;
}



// const markets = ['INJ', 'AAVE','AVAX','TRX','DOT','LINK','TON','ICP','LTC','BCH','ATOM','UNI','XLM','NEAR','ARB'];
// const markets = ['BTC', 'ETH'];
// const markets = ['BTC'];

// 
async function start() {
  const indi_ = 'USER;03d7ea932b9044e6aefc5d264f0e214f'
  const id = "ap6ms284ybydcjenei103fdcbbatbysp";
  const certificate = "v2:T9DQ1lPiDe8PqMUvoe8flzV4U1jT03vrCmKi0E94nts=";
  const timeframes = ['4H','12H','1D', '2D', '3D', '4D', '5D', '6D', 'W', '1M'];
  const markets = ['BTC'];
  const client = new TradingView.Client({ token: id, signature: certificate });
  const spreadsheetId = "1NJDfQ9ef5ubG5ixZvT843qPlYiZq7SbG9SUe3VZBtp8";


  for (const coin of markets) {
    const sheetTitle = `${coin}USDTXX3f133`;
    const sheetTitle3 = `${coin}_reverse_SL1_U3foi3`;
    const sheetTitle4 = `${coin}_reverse__USD53f`;



    const ticket = `BYBIT:${coin}USDT.P`;
    console.log(`Processing: ${ticket}`);

    const auth = await getAuthToken();
    let dataArrays = [];
    let dataArrays2 = [];

    for (const tf of timeframes) {
      const data = await fetchData(tf, ticket, indi_,client,timeframes); // corrected
      dataArrays.push(data);
      const data2 = data.slice().reverse();
      dataArrays2.push(data2);
      
    }

    const processedData = processDataForTimeframes(timeframes,0, ...dataArrays);
    await appendAllDataFromJson(auth, spreadsheetId, sheetTitle, processedData);

    const MoveDown = 1;

    const processedData3 = processDataForTimeframes(timeframes,1, ...dataArrays2);
    const processedData4 = processDataForTimeframes(timeframes,0, ...dataArrays2);


    await appendAllDataFromJson(auth, spreadsheetId, sheetTitle3, processedData3);
    await appendAllDataFromJson(auth, spreadsheetId, sheetTitle4, processedData4);


    console.log('Data exported successfully to Google Sheets.');
  }
}

start();