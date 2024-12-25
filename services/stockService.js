'use strict';

// Mock service for fetching stock prices
const stockPrices = {
  AAPL: 150.0,
  MSFT: 300.0,
  GOOGL: 2800.0,
  AMZN: 3500.0,
  TSLA: 750.0,
};

async function getStockPrice(stockSymbol) {
  // Simulate asynchronous operation
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (stockPrices[stockSymbol]) {
        resolve({ price: stockPrices[stockSymbol] });
      } else {
        reject(new Error('Stock not found'));
      }
    }, 100);
  });
}

module.exports = { getStockPrice };
