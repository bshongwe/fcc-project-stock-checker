'use strict';

import fetch from 'node-fetch';

const likesData = {}; // In-memory storage for likes by IP and stock

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(async function (req, res) {
      const stockQuery = req.query.stock;
      const like = req.query.like === 'true'; // Convert to boolean
      const userIP = req.ip; // Get user's IP address

      if (!stockQuery) {
        return res.status(400).json({ error: 'Stock parameter is required' });
      }

      const stocks = Array.isArray(stockQuery) ? stockQuery : [stockQuery];
      const stockDataArray = await Promise.all(
        stocks.map(async (stock) => {
          const stockPrice = await getStockPrice(stock);
          if (!stockPrice) {
            return { stock, error: `Stock ${stock} not found` };
          }

          // Handle likes
          if (!likesData[stock]) likesData[stock] = { likes: 0, ipSet: new Set() };
          if (like && !likesData[stock].ipSet.has(userIP)) {
            likesData[stock].likes += 1;
            likesData[stock].ipSet.add(userIP);
          }

          return {
            stock,
            price: stockPrice,
            likes: likesData[stock].likes,
          };
        })
      );

      if (stocks.length === 2) {
        const rel_likes = stockDataArray.map((data, index) => {
          const otherLikes = stockDataArray[1 - index].likes;
          return {
            stock: data.stock,
            price: data.price,
            rel_likes: data.likes - otherLikes,
          };
        });
        return res.json({ stockData: rel_likes });
      }

      res.json({ stockData: stockDataArray[0] });
    });
};

// Helper function to fetch stock prices
async function getStockPrice(stock) {
  try {
    const apiKey = 'API_KEY'; // Stock API key
    const response = await fetch(`https://api.example.com/stock/${stock}/quote?apikey=${apiKey}`);
    if (!response.ok) {
      console.error(`Error fetching stock: ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    return data.latestPrice; // API used
  } catch (error) {
    console.error('Error fetching stock price:', error);
    return null;
  }
}
