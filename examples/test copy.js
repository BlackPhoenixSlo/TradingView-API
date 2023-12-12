const time = {};

// Pauses execution for given milliseconds
time.delay = (ms) => {
    return new Promise((res) => {
        setTimeout(res, ms)
    });
};

time.getTodaysUTCStartTimestamp = () => {
    // Create a new Date object for the current time
    const now = new Date();

    // Convert to a UTC date string, then to a Date object to reset hours, minutes, and seconds to 0
    const startOfUtcDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    return Math.floor(startOfUtcDay.getTime() / 1000);
};

// Returns the amount of milliseconds left until the next UTC day
time.getMillisecondsUntilNextUTCDay = () => {
    const dateNow = new Date();
    const millisecondsToday = (dateNow.getUTCHours() * 3600000) + (dateNow.getUTCMinutes() * 60000) + (dateNow.getUTCSeconds() * 1000) + dateNow.getUTCMilliseconds();
    
    return 86400000 - millisecondsToday;
};

// Converts days into milliseconds
time.daysToMilliseconds = (days) => {
    return days * 24 * 60 * 60 * 1000;
};

// Returns the time a certain number of days ago
time.getTimeDaysAgo = (days) => {
    return new Date().getTime() - time.daysToMilliseconds(days);
};

// Converts milliseconds into a string that shows hours, minutes, and seconds
time.convertMsToTimeString = (milliseconds) => {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;

    return `${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
};

// Converts a chart timeframe to seconds
time.timeframeToSeconds = (timeframe) => {
    const timeMapping = {
        's': 1,
        'm': 60,
        'h': 3600,
        'D': 86400,
        'W': 604800,
        'M': 2592000 // Using 'M' for month as per your requirement
    };

    // Regular expression to split the input string into number and time unit
    const match = timeframe.match(/^(\d+)([smhDWM])$/);
    
    if (!match) {
        throw new Error('Invalid timeframe format');
    }

    const [, quantity, unit] = match;

    return parseInt(quantity, 10) * timeMapping[unit];
};

// Function to calculate the range of time frame periods between two timestamps
time.calculateTimeframeRange = (startTime, endTime, timeframe) => {
    const timeframeInSeconds = time.timeframeToSeconds(timeframe);

    return Math.floor((endTime - startTime) / timeframeInSeconds);
};

module.exports = time;

tradingViewUtils.getPrivateIndicator = async (indicatorName, sessionData) => {
  const indicators = await tradingView.getPrivateIndicators(sessionData.sessionId)

  for (var i = 0; i < indicators.length; i++) {
      const indicator = indicators[i];

      if (indicator.name == indicatorName) {
          return await indicator.get();
      }
  }
}

tradingViewUtils.getPrivateIndicatorPlots = async (indicatorName, market, timeframe, sessionData, startTime, endTime) => {
  const cachedPeriodsId = JSON.stringify({
      indicatorName: indicatorName,
      market: market,
      timeframe: timeframe,
      sessionData: sessionData,
      startTime: startTime,
      endTime: endTime
  });
  const cachedPeriods = cache.getCachedData(cachedPeriodsId);

  if (cachedPeriods) {
      return cachedPeriods;
  }

  const client = new tradingView.Client({
      token: sessionData.sessionId,
      signature: sessionData.signature,
  });
  
  const chart = new client.Session.Chart();

  if (startTime && endTime) {
      const range = time.calculateTimeframeRange(startTime, endTime, timeframe);

      chart.setMarket(market, {
          timeframe: timeframe,
          range: range,
          to: endTime,
      });
  } else {
      chart.setMarket(market, {
          timeframe: timeframe,
      });
  }

  const indicator = await tradingViewUtils.getPrivateIndicator(indicatorName, sessionData);
  
  if (indicator === undefined) {
      throw new Error(`${indicatorName} is not a valid indicator`);
  }

  const indicatorStudy = new chart.Study(indicator);

  await new Promise((resolve) => {
      indicatorStudy.onUpdate(() => {
          resolve();
      });
  })

  const periods = indicatorStudy.periods;

  cache.cacheData(cachedPeriodsId, periods, time.timeframeToSeconds(timeframe) * 0.5);

  indicatorStudy.remove();
  chart.delete();
  client.end();

  return periods;
}

tradingViewUtils.getCandlesticks = async (market, timeframe, startTime, endTime) => {
  const cachedPeriodsId = JSON.stringify({
      market: market,
      timeframe: timeframe,
      startTime: startTime,
      endTime: endTime
  });
  const cachedPeriods = cache.getCachedData(cachedPeriodsId);

  if (cachedPeriods) {
      return cachedPeriods;
  }

  const client = new tradingView.Client();
  const chart = new client.Session.Chart();

  if (startTime && endTime) {
      const range = time.calculateTimeframeRange(startTime, endTime, timeframe) + 1;

      chart.setMarket(market, {
          timeframe: timeframe,
          range: range,
          to: endTime,
      });
  } else {
      chart.setMarket(market, {
          timeframe: timeframe,
      });
  }

  await new Promise((resolve) => {
      chart.onUpdate(() => {
          resolve();
      });
  })

  const periods = chart.periods;

  cache.cacheData(cachedPeriodsId, periods, time.timeframeToSeconds(timeframe) * 0.5);

  chart.delete();
  client.end();

  return periods;
}

module.exports = tradingViewUtils;