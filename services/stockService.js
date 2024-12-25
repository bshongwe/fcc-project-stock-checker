'use strict';

// Predefined stock symbols with their price ranges
const stockPriceRanges = {
  AAPL: { min: 100, max: 2000 },
  MSFT: { min: 100, max: 3000 },
  GOOG: { min: 1000, max: 5000 },
  AMZN: { min: 1000, max: 4000 },
  TSLA: { min: 200, max: 2000 },
};

// Generate random stock price within given range
function generateRandomStockPrice(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

async function getStockPrice(stockSymbol) {
  // Simulate asynchronous operation: mock prices based on predefined ranges
  return new Promise((resolve) => {
    setTimeout(() => {
      if (stockPriceRanges[stockSymbol]) {
        const { min, max } = stockPriceRanges[stockSymbol];
        resolve({ price: generateRandomStockPrice(min, max) });
      } else {
        resolve(null); // Return null for unsupported stock symbols
      }
    }, 100); // Simulating slight delay
  });
}

module.exports = { getStockPrice };
