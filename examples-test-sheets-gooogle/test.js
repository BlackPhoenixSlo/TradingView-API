require('dotenv').config();
const { google } = require('googleapis');
const TradingView = require('../main');

// Function to format the sheet title
function formatSheetTitle(title) {
  return title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
}

const client = new TradingView.Client();
const chart = new client.Session.Chart();
chart.setMarket('BINANCE:BTCUSDT', {
  timeframe: 'D',
  range: -7, 
  to: Math.round(Date.now() / 1000) - 86400 * 8,
});

const {
  getAuthToken,
  getSpreadSheet,
  getSpreadSheetValues
} = require('./index.js');

const spreadsheetId = process.argv[2];

async function appendDataToSheet(sheets, spreadsheetId, sheetTitle, headers, values) {
  try {
    const sheetMeta = await sheets.spreadsheets.get({
      spreadsheetId,
      ranges: [],
      includeGridData: false,
    });

    let sheetExists = sheetMeta.data.sheets.some(sheet => sheet.properties.title === sheetTitle);

    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{ addSheet: { properties: { title: sheetTitle } } }],
        },
      });

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetTitle}!A1`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: headers },
      });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetTitle}!A1`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: values },
    });

    console.log('Data appended successfully to sheet:', sheetTitle);
  } catch (error) {
    console.error('Error in appendDataToSheet', error.message, error.stack);
  }
}


async function appendAllDataFromJson(auth, sheetTitle, jsonData) {
  const sheets = google.sheets({ version: 'v4', auth });
  const headers = [Object.keys(jsonData[0])];
  const formattedValues = jsonData.map(item => 
    Object.values(item).map(value => 
      typeof value === 'string' && value.match(/^[0-9\.]+e\+[0-9]+$/i) ? parseFloat(value) : value
    )
  );

  await appendDataToSheet(sheets, spreadsheetId, sheetTitle, headers, formattedValues);
}

TradingView.getIndicator('USER;fa4099d3a752474a95e79b2d9186b804').then(async (indic) => {
  console.log(`Loading '${indic.description}' study...`);
  const SUPERTREND = new chart.Study(indic);

  SUPERTREND.onUpdate(async () => {
    console.log('Study periods:', SUPERTREND.periods);
    const sheetTitle = formatSheetTitle(indic.description);
    const auth = await getAuthToken();

    await appendAllDataFromJson(auth, sheetTitle, SUPERTREND.periods);

    client.end();
  });
});
