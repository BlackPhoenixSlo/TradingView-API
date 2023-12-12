require('dotenv').config();
const { processTradingViewIndicator } = require('./tradingViewClient');

const { google } = require('googleapis');
const TradingView = require('../main'); // Adjust the path as needed

const { appendAllDataFromJson, appendTimeAndPositionData } = require('./googleSheetsUtils');

const spreadsheetId = "1SZwDpZO7rvLrijKq9dtgdOP4tffr-KzhQB1JsPXBj8I"

const id = "whv5betgotone8n4lfwnaco9xq15dl7t";
const certificate = "v1:Bk/ZvaAmuR48QoWNbGrOeTdM9CTL+CUngWzYXUF0jvQ=";

const sheets = google.sheets('v4');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getAuthToken() {
  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES
  });
  const authToken = await auth.getClient();
  return authToken;
}

async function fetchData(timeframe) {
  const client = new TradingView.Client({ token: id, signature: certificate });
  const chart = new client.Session.Chart();
console.log(Math.round((Date.now() - Date.UTC(2018,1,1) )/ 1000 / 60 / 60 / 24))
  chart.setMarket('BINANCE:BTCUSDT', {
    timeframe: timeframe,
    range: Math.round((Date.now() - Date.UTC(2018,1,1) )/ 1000 / 60 / 60 / 24),
    to: Math.round((Date.now()  )/ 1000)
  });

  return new Promise((resolve, reject) => {
    TradingView.getIndicator('USER;f9b81406eb3c49edbcef448de000ddc2').then((indic) => {
      const study = new chart.Study(indic);
      study.onUpdate(() => {
        resolve(study.periods);
        client.end();
      });
    }).catch(reject);
  });
}

function processDataForTimeframes(data1D, data2D, data4D, dataW) {
  const structuredData = [];

  data1D.forEach((entry1D, index) => {
    const position2D = index % 2 === 0 ? data2D[Math.floor(index / 2)].position : structuredData[index - 1]['2Dposition'];
    const position4D = index % 4 === 0 ? data4D[Math.floor(index / 4)].position : structuredData[index - 1]['4Dposition'];
    const positionW = index % 7 === 0 ? dataW[Math.floor(index / 7)].position : structuredData[index - 1]['Wposition'];

    structuredData.push({
      'unix' : entry1D.$time,
      'time': new Date(entry1D.$time * 1000).toLocaleString(),
      '1Dposition': entry1D.position,
      '2Dposition': position2D,
      '4Dposition': position4D,
      'Wposition': positionW,  // Adjusted key here
      'closeprice': entry1D.ClosePrice
    });
  });

  console.log(structuredData)
  return structuredData;
}

async function exportIndicatorData() {

  try {
    const auth = await getAuthToken(); 

    const data1D = await fetchData('1D');
    const data2D = await fetchData('2D');
    const data4D = await fetchData('4D');
    const dataW = await fetchData('W');

    const processedData = processDataForTimeframes(data1D, data2D, data4D, dataW);
    console.log(processedData);
    // Further processing or appending to Google Sheets can go here

    const sheetTitle = 'MultiTimeframeData'; // Title of the sheet to append data
    await appendAllDataFromJson(auth, spreadsheetId, sheetTitle, processedData);

    console.log('Data exported successfully to Google Sheets.');

  } catch (error) {
    console.error('Error in exportIndicatorData:', error);
  }
}

exportIndicatorData();