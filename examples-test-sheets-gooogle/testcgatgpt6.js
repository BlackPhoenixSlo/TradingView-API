require('dotenv').config();
const { google } = require('googleapis');
const TradingView = require('../main'); // Adjust the path as needed
const { appendAllDataFromJson } = require('./googleSheetsUtils');

const spreadsheetId = "1SZwDpZO7rvLrijKq9dtgdOP4tffr-KzhQB1JsPXBj8I";
const id = "whv5betgotone8n4lfwnaco9xq15dl7t";
const certificate = "v1:Bk/ZvaAmuR48QoWNbGrOeTdM9CTL+CUngWzYXUF0jvQ=";
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const exchange_market = 'BINANCE:ETHBTC'
async function getAuthToken() {
  const auth = new google.auth.GoogleAuth({ scopes: SCOPES });
  const authToken = await auth.getClient();
  return authToken;
}

async function fetchData(timeframe) {
  const client = new TradingView.Client({ token: id, signature: certificate });
  const chart = new client.Session.Chart();
  chart.setMarket(exchange_market, {
    timeframe: timeframe,
    range: Math.round((Date.now() - Date.UTC(2018, 1, 1)) / 1000 / 60 / 60 / 24) ,
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

function processDataForTimeframes(data1D, data2D, data3D, data4D, data5D, data6D, dataW, dataM) {
  let alignedData = [];
  let monthIndex = 0;

  data1D.forEach(day => {
    let monthlyPosition = null;
    if (isNewMonth(day, monthIndex, dataM)) {
      monthlyPosition = dataM[monthIndex].position;
      monthIndex++;
    } else {
      monthlyPosition = monthIndex > 0 ? dataM[monthIndex - 1].position : null;
    }

    alignedData.push({
      'unix': day.$time,
      'time': new Date(day.$time * 1000).toLocaleString(),
      '1Dposition': day.position,
      '2Dposition': findClosestData(day, data2D).position,
      '3Dposition': findClosestData(day, data3D).position,
      '4Dposition': findClosestData(day, data4D).position,
      '5Dposition': findClosestData(day, data5D).position,
      '6Dposition': findClosestData(day, data6D).position,

      'Wposition': findClosestData(day, dataW).position,
      'Mposition': monthlyPosition,
      'closeprice': day.ClosePrice

    });
  });

  return alignedData;
}

function isNewMonth(day, monthIndex, monthlyData) {
  let dayDate = new Date(day.$time * 1000);
  let monthDate = monthIndex < monthlyData.length ? new Date(monthlyData[monthIndex].$time * 1000) : null;

  return monthDate && dayDate.getMonth() === monthDate.getMonth() && dayDate.getFullYear() === monthDate.getFullYear();
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

async function exportIndicatorData() {
  try {
    const auth = await getAuthToken();
    const data1D = await fetchData('1D');
    const data2D = await fetchData('2D');
    const data3D = await fetchData('3D');
    const data4D = await fetchData('4D');
    const data5D = await fetchData('5D');
    const data6D = await fetchData('6D');
    const dataW = await fetchData('W');
    const dataM = await fetchData('1M');

    const processedData = processDataForTimeframes(data1D, data2D, data3D, data4D, data5D, data6D, dataW, dataM);
    console.log(processedData);

    const sheetTitle = 'MultiTimeframeDataM';
    await appendAllDataFromJson(auth, spreadsheetId, sheetTitle, processedData);

    console.log('Data exported successfully to Google Sheets.');

  } catch (error) {
    console.error('Error in exportIndicatorData:', error);
  }
}

exportIndicatorData();
