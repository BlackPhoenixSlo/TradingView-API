const axios = require("axios");
require('dotenv').config();


const SCORE_TO_EMOJI = {
    [1]: "⬆️",
    [0]: "➡️",
    [-1]: "⬇️"
};
const SCORE_TO_POSITION = {
    [1]: "long",
    [0]: "flat",
    [-1]: "short"
};

const alerts = {};

alerts.discordTPIAlert = async (data) => {    
    var fields = [];

    // data.componentChanges.forEach((component) => {
    //     var updateString = "";

    //     if (SCORE_TO_POSITION[component.previousScore] != null && SCORE_TO_POSITION[component.newScore] != null) {
    //         updateString = `Switched from ${SCORE_TO_POSITION[component.previousScore]} ${SCORE_TO_EMOJI[component.previousScore]} to ${SCORE_TO_POSITION[component.newScore]} ${SCORE_TO_EMOJI[component.newScore]}`
    //     } else {
    //         updateString = `${component.newScore > component.previousScore ? "⬆️ Increased" : "⬇️ Decreased"} from ${component.previousScore} to ${component.newScore}`
    //     }

    //     fields.push({
    //         "name": `(${component.tpiName}) ${component.component}`,
    //         "value": updateString
    //     });
    // })

    fields.push({
        "name": "----------------------",
        "value": "Top TPI scores:"
    });

    data.displayTPIValues.forEach((tpi) => {
        fields.push({
            "name": tpi.displayName,
            "value": `${tpi.score >= 0 ? "📈" : "📉"} ${tpi.score.toFixed(2)}`
        })
    });

    fields.push({
        "name": `See All TPIs`,
        "value": `🔗 [Click Here](http://cryptogrowthbot.com)`
    });

    await axios({
        url: process.env.DISCORD_WEBHOOK,
        method: "POST",
        headers: {
            ["content-type"]: "application/json"
        },
        data: {
            embeds: [
                {
                  "type": "rich",
                  "title": `🔔 TPI Update`,
                  "description": `There has been an update to TPIs! Below is a list of components that were changed:`,
                  "color": 0x00FFFF,
                  "url": "http://cryptogrowthbot.com/",
                  "fields": fields
                }
            ]
        }
    });
};




module.exports = alerts;