const axios = require("axios");
require('dotenv').config();
const  {weightedaverage,MultipleWeightedAverage } = require('./main-bot--CalculateWaightedSignals'); // Adjust the path as needed


const alerts = {};

alerts.discordTPIAlertDynamic = async (marketsTpis, webhookUrl) => {    
    let fields = [];

    fields.push({
        "name": "----------------------",
        "value": "TPI Update:"
    });

    marketsTpis.forEach(marketTpi => {
        fields.push({
            "name": marketTpi.marketName,
            "value": `${marketTpi.tpi >= 0 ? "📈" : "📉"} ${marketTpi.tpi}`
        });
    });

    fields.push({
        "name": `See All TPIs`,
        "value": `🔗 [Click Here](https://docs.google.com/spreadsheets/d/1SZwDpZO7rvLrijKq9dtgdOP4tffr-KzhQB1JsPXBj8I/edit#gid=0)`
    });

    fields.push({
        "name": `Make your own bot`,
        "value": `🔗 [Click Here](https:/algoalert.net)`
    });

    await axios({
        url: webhookUrl,
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        data: {
            embeds: [
                {
                    "type": "rich",
                    "title": `🔔 TPI Update`,
                    "description": `There has been an update to the Trading Performance Indicators (TPIs)!`,
                    "color": 0x00FFFF,
                    "url": "http://algoalert.com/",
                    "fields": fields
                }
            ]
        }
    }).catch(err => {
        console.error("Failed to send alert:", err);
    });
};




async function MakeAlerts(markets, weights, client, type_mybe_provisional, timeframes,webhookUrl){

    let marketsTpis = [];

    for (let i = 0; i < markets.length; i++) {
        const market = markets[i];
        const tpiValue = await weightedaverage(market, weights, client, type_mybe_provisional, timeframes,0);
        const tpiValue_previous = await weightedaverage(market, weights, client, type_mybe_provisional, timeframes,1);

        if (tpiValue_previous !=tpiValue ){
            marketsTpis.push({
                marketName: market.split(':')[1], // Extracting just the market name, adjust as needed
                tpi: tpiValue
            });
        }
    }




    alerts.discordTPIAlertDynamic(marketsTpis, webhookUrl).then(() => {
        console.log("Alert sent successfully!");
    }).catch(err => {
        console.error("Failed to send alert:", err);
    });
}


async function MakeAlertsFast(markets, weightsSets, client, type_mybe_provisional, timeframes, webhookUrl){

   

    // This makes alerts fast but just for 1 day not previous

    let marketTpiPromises = markets.map(market => {
        return MultipleWeightedAverage(market, weightsSets, client, type_mybe_provisional, timeframes,0)
            .then(tpi => {
                return {
                    marketName: market.split(':')[1], // Extracting just the market name
                    tpi: tpi
                };
            });
    });
    let marketsTpis;

    try {
        marketsTpis = await Promise.all(marketTpiPromises);
    } catch (error) {
        console.error('Error calculating TPIs:', error);
    }



    alerts.discordTPIAlertDynamic(marketsTpis, webhookUrl).then(() => {
        console.log("Alert sent successfully!");
    }).catch(err => {
        console.error("Failed to send alert:", err);
    });
}



async function MakeAlertsBinance(displayTPIValues, webhookUrl){

   

    alerts.discordTPIAlert(displayTPIValues, webhookUrl).then(() => {
        console.log("Alert sent successfully!");
    }).catch(err => {
        console.error("Failed to send alert:", err);
    });
}



alerts.discordTPIAlert = async (data, webhookUrl) => {
    //console.log("Received data:", data); // Debugging

    // Check if data is an array and not empty
    if (!Array.isArray(data) || data.length === 0) {
        console.error('displayTPIValues is undefined or empty');
        return;
    }

    let fields = []; // Ensure fields is declared in the correct scope
    data.forEach((tpi) => {
        fields.push({
            "name": tpi.displayName,
            "value": `${tpi.score > 0 ? "📈" : tpi.score < 0 ? "📉" : "➡️"} ${tpi.score}`
        });
    });



    await axios({
        url: webhookUrl,
        method: "POST",
        headers: {
            ["content-type"]: "application/json"
        },
        data: {
            embeds: [
                {
                  "type": "rich",
                  "title": `🔔 BYBIT Balance Update`,
                  "description": `There has been an update to BYBIT Balance! `,
                  "color": 0x00FFFF,
                  "url": "http://algoalert.net",
                  "fields": fields
                }
            ]
        }
    });
};


module.exports = {alerts, MakeAlerts ,MakeAlertsFast, MakeAlertsBinance};
