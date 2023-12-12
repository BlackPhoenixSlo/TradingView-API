require('dotenv').config();

const TradingView = require('../main');

/**
 * This example tests fetching chart data of a number
 * of candles before or after a timestamp
 */

id = "whv5betgotone8n4lfwnaco9xq15dl7t"
certificate = "v1:Bk/ZvaAmuR48QoWNbGrOeTdM9CTL+CUngWzYXUF0jvQ="






  const client = new TradingView.Client({
    token: id,
    signature: certificate,
  });

const chart = new client.Session.Chart();
chart.setMarket('BINANCE:BTCUSDT', {
  timeframe: '4D',
  // range: 1, // Can be positive to get before or negative to get after
  // to: 1701885985,
  range: -1, // Range is negative, so 'to' means 'from'
  to: Math.round(Date.now() / 1000) - 86400 * 12, // Seven days before now
  
});

// This works with indicators

TradingView.getIndicator('USER;fa4099d3a752474a95e79b2d9186b804').then(async (indic) => {
  console.log(`Loading '${indic.description}' study...`);
  const SUPERTREND = new chart.Study(indic);

  SUPERTREND.onUpdate(async () => {
    console.log('Prices periods:', chart.periods);
    console.log('Study periods:', SUPERTREND.periods);

    // Format data as an array of arrays (each inner array is a row)
  let valuesToAppend = SUPERTREND.periods.map(period => {
    return [
      period['$time'], 
      period['Leading_Oscillator'],
      period['Uptrend'],

      // ... add other fields you want to include
    ];
  });

  console.log("valuesToAppend");

    console.log(valuesToAppend[0]);

  try {
    const auth = await getAuthToken();
    await appendSpreadSheetValues(auth, valuesToAppend[0]);
    console.log('Data appended successfully');
  } catch (error) {
    console.error('Error appending data', error.message, error.stack);
  }

  client.end();
});

  });


const {
    getAuthToken,
    getSpreadSheet,
    getSpreadSheetValues
  } = require('./index.js');
  
  const spreadsheetId = process.argv[2];
  const sheetName = process.argv[3];
  const { google } = require('googleapis');

  async function testGetSpreadSheet() {
    try {
      const auth = await getAuthToken();
      const response = await getSpreadSheet({
        spreadsheetId,
        auth
      })
      console.log(1);

      console.log('output for getSpreadSheet', JSON.stringify(response.data, null, 2));
    } catch(error) {
        console.log(2);

      console.log(error.message, error.stack);
    }
  }

  async function appendSpreadSheetValues(auth, values) {
    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1:C1`, // Adjust the range according to your needs
      valueInputOption: 'USER_ENTERED',
      resource: { values: [values] }, // values is an array of arrays
    });
    
  }
  
  async function testGetSpreadSheetValues() {
    try {
      const auth = await getAuthToken();
      const response = await getSpreadSheetValues({
        spreadsheetId,
        sheetName,
        auth
      })
      console.log(3);

      console.log('output for getSpreadSheetValues', JSON.stringify(response.data, null, 2));
    } catch(error) {
        console.log(4);

      console.log(error.message, error.stack);
    }
  }
  
  async function testAppendSpreadSheetValues() {
    try {
      const auth = await getAuthToken();
      // Replace these with dynamic values or inputs as required
      const newValues = ["New Namse", "Nesw Country", "New Asge"];
      await appendSpreadSheetValues(auth, newValues);
      console.log('Data appended successfully');
    } catch (error) {
      console.error('Error appending data', error.message, error.stack);
    }
  }


  function main() {
    console.log(0);

    testGetSpreadSheet();
    testGetSpreadSheetValues();
    console.log(5);

    // New function call to append data
  testAppendSpreadSheetValues();

  }
  
  main()

