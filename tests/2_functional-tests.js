const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  // GET Test: request to /api/stock-prices with a NASDAQ stock symbol
  test('GET /api/stock-prices with stock symbol should return stockData with symbol, price, and likes', function(done) {
    const stockSymbol = 'AAPL';

    chai.request(server)
      .get('/api/stock-prices')
      .query({ symbol: stockSymbol })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body.stockData);

        // stockData Check: 'symbol', 'price', and 'likes'
        assert.property(res.body.stockData, 'symbol');
        assert.isString(res.body.stockData.symbol);

        assert.property(res.body.stockData, 'price');
        assert.isNumber(res.body.stockData.price);

        assert.property(res.body.stockData, 'likes');
        assert.isNumber(res.body.stockData.likes);

        done();
      });
  });

});

