'use strict';

const stockService = require('../services/stockService'); // Service for fetching stock data
const likesDatabase = {}; // In-memory storage for likes by stock and IP (for simplicity)

module.exports = function (app) {
  app.route('/api/stock-prices').get(async function (req, res) {
    const { stock, like } = req.query; // Handle 'stock' as the query parameter
    const clientIp = req.ip;

    try {
      if (!stock) {
        return res.status(400).json({ error: 'Stock symbol is required' });
      }

      const stocks = Array.isArray(stock) ? stock : [stock]; // Support both single and multiple stocks
      const response = [];

      const isLike = like === 'true'; // Convert 'like' to a boolean

      for (const stockSymbol of stocks) {
        const stockData = await stockService.getStockPrice(stockSymbol);

        if (!stockData || typeof stockData.price !== 'number') {
          return res.status(404).json({ error: `Stock symbol ${stockSymbol} not found` });
        }

        likesDatabase[stockSymbol] = likesDatabase[stockSymbol] || new Set();
        if (isLike) {
          likesDatabase[stockSymbol].add(clientIp);
        }

        response.push({
          stock: stockSymbol,
          price: stockData.price,
          likes: likesDatabase[stockSymbol].size || 0,
        });
      }

      if (response.length === 2) {
        const [stock1, stock2] = response;
        stock1.rel_likes = stock1.likes - stock2.likes;
        stock2.rel_likes = stock2.likes - stock1.likes;

        delete stock1.likes;
        delete stock2.likes;
      }

      return res.status(200).json({
        stockData: response.length === 1 ? response[0] : response,
      });
    } catch (err) {
      console.error('Error handling request:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
};
