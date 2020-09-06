module.exports = function (app) {
  var controller = require('./controller').init(app);
  app.get('/', function (req, res) {
    console.log('Health check!', req.path, req.headers)
    res.status(200).json({ "Status": "Hey! Welcome to Portfolio tracking" });
  });
// let middlewares=  require('./middlewares')(app)
app.post('/security',controller.security.methods.create)
app.post('/portfolio',controller.portfolio.methods.create)
app.get('/portfolio',controller.portfolio.methods.getOne)
app.post('/trade',controller.trade.methods.create)
app.put('/trade/:ticker',controller.trade.methods.update)
app.delete('/trade/:id',controller.trade.methods._delete)
app.get('/holdings',controller.portfolio.methods.getHoldings)

app.get('/returns',controller.portfolio.methods.getReturns)
};
