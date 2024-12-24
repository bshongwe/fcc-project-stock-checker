const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  // GET Test: request to /api/stock-prices - NASDAQ stock symbol & like param
  test('GET /api/stock-prices with like=true should add a like and return stockData', function(done) {
    const stockSymbol = 'AAPL';

    chai.request(server)
      .get('/api/stock-prices')
      .query({ symbol: stockSymbol, like: true })
      .end(function(err, res) {
        if (err) return done(err);
        assert.equal(res.status, 200);
        assert.isObject(res.body.stockData);
        assert.property(res.body.stockData, 'likes');

        // Likes count check: should be 1 initially
        assert.isNumber(res.body.stockData.likes);
        assert.equal(res.body.stockData.likes, 1);

        done();
      });
  }).timeout(5000);

  // GET Test: request to /api/stock-prices with like=true (multiple requests from the same IP)
  test('GET /api/stock-prices should not allow more than 1 like per IP', function(done) {
    const stockSymbol = 'AAPL';

    // 1st like request
    chai.request(server)
      .get('/api/stock-prices')
      .query({ symbol: stockSymbol, like: true })
      .end(function(err, res) {
        if (err) return done(err);
        assert.equal(res.status, 200);
        assert.isObject(res.body.stockData);
        assert.property(res.body.stockData, 'likes');
        assert.equal(res.body.stockData.likes, 1);

        // 2nd like request from the same "IP" (simulated in the test)
        chai.request(server)
          .get('/api/stock-prices')
          .query({ symbol: stockSymbol, like: true })
          .end(function(err, res) {
            if (err) return done(err);
            assert.equal(res.status, 200);
            assert.isObject(res.body.stockData);
            assert.property(res.body.stockData, 'likes');
            assert.equal(res.body.stockData.likes, 1);

            done();
          });
      });
  }).timeout(5000);

});
