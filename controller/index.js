const portfolio = require("../models/portfolio");

var app;
exports.init= (app_ref) => {
app = app_ref;
let security = require(`./security`);
let portfolio = require(`./portfolio`);
let trade = require(`./trade`);
security.init(app);
portfolio.init(app);
trade.init(app);
return {
    security:security,
    portfolio:portfolio,
    trade:trade
}
}
    
