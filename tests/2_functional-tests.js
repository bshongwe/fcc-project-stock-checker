const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  // Test 1: Send a GET request with a NASDAQ stock symbol
  test('GET /api/stock-prices with 1 stock symbol', function(done) {
    const stockSymbol = 'GOOG';

    chai.request(server)
      .get('/api/stock-prices')
      .query({ symbol: stockSymbol })
      .end(function(err, res) {
        if (err) return done(err);

        assert.equal(res.status, 200);
        assert.isObject(res.body.stockData);
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        assert.isString(res.body.stockData.stock);
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);

        done();
      });
  }).timeout(5000);

  // Test 2: Send a GET request with 2 stock symbols and compare rel_likes
  test('GET /api/stock-prices with 2 stock symbols', function(done) {
    const stockSymbols = ['GOOG', 'MSFT'];

    chai.request(server)
      .get('/api/stock-prices')
      .query({ symbol: stockSymbols })
      .end(function(err, res) {
        if (err) return done(err);

        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 2);

        res.body.stockData.forEach(stock => {
          assert.property(stock, 'stock');
          assert.property(stock, 'price');
          assert.property(stock, 'rel_likes');
          assert.isString(stock.stock);
          assert.isNumber(stock.price);
          assert.isNumber(stock.rel_likes);
        });

        done();
      });
  }).timeout(5000);

  // Test 3: Send a GET request with a stock symbol and like=true
  test('GET /api/stock-prices with like=true should add a like', function(done) {
    const stockSymbol = 'GOOG';

    chai.request(server)
      .get('/api/stock-prices')
      .query({ symbol: stockSymbol, like: true })
      .end(function(err, res) {
        if (err) return done(err);

        assert.equal(res.status, 200);
        assert.isObject(res.body.stockData);
        assert.property(res.body.stockData, 'likes');
        assert.isNumber(res.body.stockData.likes);

        // Likes count check (ensures increment)
        assert.isAtLeast(res.body.stockData.likes, 1);

        done();
      });
  }).timeout(5000);

  // Test 4: Ensure no more than 1 like per IP
  test('GET /api/stock-prices should not allow more than 1 like per IP', function(done) {
    const stockSymbol = 'GOOG';

    // First like request
    chai.request(server)
      .get('/api/stock-prices')
      .query({ symbol: stockSymbol, like: true })
      .end(function(err, res1) {
        if (err) return done(err);

        assert.equal(res1.status, 200);
        assert.isObject(res1.body.stockData);
        assert.property(res1.body.stockData, 'likes');
        assert.isNumber(res1.body.stockData.likes);

        const initialLikes = res1.body.stockData.likes;

        // Second like request from the same IP
        chai.request(server)
          .get('/api/stock-prices')
          .query({ symbol: stockSymbol, like: true })
          .end(function(err, res2) {
            if (err) return done(err);

            assert.equal(res2.status, 200);
            assert.isObject(res2.body.stockData);
            assert.property(res2.body.stockData, 'likes');
            assert.equal(res2.body.stockData.likes, initialLikes);

            done();
          });
      });
  }).timeout(5000);

});
