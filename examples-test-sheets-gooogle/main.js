require('dotenv').config();
const { processTradingViewIndicator } = require('./tradingViewClient');

const spreadsheetId = "1SZwDpZO7rvLrijKq9dtgdOP4tffr-KzhQB1JsPXBj8I"

processTradingViewIndicator(spreadsheetId);
