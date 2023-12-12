const tradingViewUtils = require('./tradingViewClient'); // Adjust path as needed
const googleSheetsUtils = require('./googleSheetsUtils'); // Adjust path as needed
require('dotenv').config();

async function fetch4DTimeframeData(sessionData, market, startTime, endTime) {
    const timeframe = '4D';
    const indicatorName = 'YourIndicatorName'; // Replace with your actual indicator name
    return await tradingViewUtils.getPrivateIndicatorPlots(indicatorName, market, timeframe, sessionData, startTime, endTime);
}

async function expand4DDataToDaily(auth, spreadsheetId, sheetTitle, data4D) {
    const headers = [['time', 'position', 'Close Price']];
    let formattedValues = [];

    data4D.forEach(item => {
        const periodStartUnix = item['$time'];
        for (let i = 0; i < 4; i++) { // 4 days in each period
            let dayUnix = periodStartUnix + i * 86400; // Add i days in seconds
            const time = new Date(dayUnix * 1000).toLocaleString();
            const position = item['position'];
            const closePrice = item['ClosePrice'];

            formattedValues.push([time, position, closePrice]);
        }
    });

    await googleSheetsUtils.appendDataToSheet(auth, spreadsheetId, sheetTitle, headers, formattedValues);
}

async function main() {
    const sessionData = {}; // Populate with your TradingView session data
    const market = 'BINANCE:BTCUSDT';
    const startDate = '2023-01-01'; // Example start date
    const endDate = '2023-04-01'; // Example end date
    const startTime = new Date(startDate).getTime() / 1000;
    const endTime = new Date(endDate).getTime() / 1000;
    const spreadsheetId = 'your_spreadsheet_id_here';
    const sheetTitle = '4D_Expanded_Data';

    try {
        const auth = await googleSheetsUtils.getAuthToken();
        const data4D = await fetch4DTimeframeData(sessionData, market, startTime, endTime);
        await expand4DDataToDaily(auth, spreadsheetId, sheetTitle, data4D);
    } catch (error) {
        console.error('Error in main function:', error.message);
    }
}

main();
