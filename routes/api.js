'use strict';

const stockService = require('../services/stockService'); // Service for fetching stock data
const likesDatabase = {}; // In-memory storage for likes by stock and IP (for simplicity)

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res) {
      const { symbol, like } = req.query;
      const clientIp = req.ip;

      try {
        if (!symbol) {
          return res.status(400).json({ error: 'Stock symbol is required' });
        }

        const symbols = Array.isArray(symbol) ? symbol : [symbol];
        const response = [];

        for (const stockSymbol of symbols) {
          // Fetch stock price from a stock service
          const stockData = await stockService.getStockPrice(stockSymbol);

          if (!stockData) {
            return res.status(404).json({ error: `Stock symbol ${stockSymbol} not found` });
          }

          // Handle likes
          likesDatabase[stockSymbol] = likesDatabase[stockSymbol] || new Set();
          if (like === 'true') {
            likesDatabase[stockSymbol].add(clientIp);
          }

          response.push({
            stock: stockSymbol,
            price: stockData.price,
            likes: likesDatabase[stockSymbol].size,
          });
        }

        if (response.length === 2) {
          const rel_likes = response[0].likes - response[1].likes;
          response[0].rel_likes = rel_likes;
          response[1].rel_likes = -rel_likes;
        }

        res.json({ stockData: response.length === 1 ? response[0] : response });
      } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
};
