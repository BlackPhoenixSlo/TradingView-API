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
  chart.setMarket('BINANCE:ETHUSDT', {
    timeframe: timeframe,
    range: Math.round((Date.now() - Date.UTC(2018,1,1) )/ 1000 / 60 / 60 / 24) + 1 ,
    to: Math.round((Date.now()  )/ 1000)
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

function processDataForTimeframes(data1D, data2D, data3D, data4D, data5D, data6D, dataW) {
  const structuredData = [];

  data1D.forEach((entry1D, index) => {
    const position2D = index % 2 === 0 ? data2D[Math.floor(index / 2)].position : structuredData[index - 1]['2Dposition'];
    const position3D = index % 3 === 0 ? data3D[Math.floor(index / 3)].position : structuredData[index - 1]['3Dposition'];
    const position4D = index % 4 === 0 ? data4D[Math.floor(index / 4)].position : structuredData[index - 1]['4Dposition'];
    const position5D = index % 5 === 0 ? data5D[Math.floor(index / 5)].position : structuredData[index - 1]['5Dposition'];
    const position6D = index % 6 === 0 ? data6D[Math.floor(index / 6)].position : structuredData[index - 1]['6Dposition'];
    const positionW = index % 7 === 0 ? dataW[Math.floor(index / 7)].position : structuredData[index - 1]['Wposition'];

    structuredData.push({
      'unix' : entry1D.$time,
      'time': new Date(entry1D.$time * 1000).toLocaleString(),
      '1Dposition': entry1D.position,
      '2Dposition': position2D,
      '3Dposition': position3D,
      '4Dposition': position4D,
      '5Dposition': position5D,
      '6Dposition': position6D,
      'Wposition': positionW,
      'closeprice': entry1D.ClosePrice
    });
  });

  return structuredData;
}

async function exportIndicatorData() {
  try {
    const auth = await getAuthToken(); 

    const data1D = await fetchData('1D');
    const data2D = await fetchData('2D');
    const data3D = await fetchData('3D'); // Fetch data for 3D
    const data4D = await fetchData('4D');
    const data5D = await fetchData('5D'); // Fetch data for 5D
    const data6D = await fetchData('6D'); // Fetch data for 6D
    const dataW = await fetchData('W');
    const dataM = await fetchData('M');


    const processedData = processDataForTimeframes(data1D, data2D, data3D, data4D, data5D, data6D, dataW);
    console.log(processedData);

    const sheetTitle = 'MultiTimeframeDataW';
    await appendAllDataFromJson(auth, spreadsheetId, sheetTitle, processedData);

    console.log('Data exported successfully to Google Sheets.');

  } catch (error) {
    console.error('Error in exportIndicatorData:', error);
  }
}


exportIndicatorData();