var app = require('express')(),
    path = require('path'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    figlet = require('figlet'),
    chalk = require('chalk'),
    helmet = require('helmet'),
    config = require('./config');

figlet(`Portfolio tracking Service`, function (err, data) {
    if (err) {
        console.log('Something went wrong...', err);
        return;
    }
    console.log(chalk.blue(data));
});
app.logger = require('./utils/logger');
app.config = config;
//connect mongoose
app.db = mongoose.createConnection(config.mongo_db_uri, {useNewUrlParser:true,useUnifiedTopology: true});

app.use(require('serve-static')(path.join(__dirname, 'client')));
app.db.on('error', function (err) {
    app.logger.methods.log("Mongo DB Connection Error", ' DB: Error', err);
    process.exit(1);
})
app.db.once('open', function () {
    app.logger.methods.log("Mongo DB Connected Successfully");
    //load data models
    require('./models')(app, mongoose);
    //http headers
    app.use(helmet());
    app.use(helmet.noSniff());
    app.use(helmet.frameguard());
    app.use(helmet.xssFilter());
    app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
    app.disable('x-powered-by');
    app.use(bodyParser.json({ limit: '16mb' }));
    app.use(bodyParser.urlencoded({ limit: '16mb', extended: true }));
    app.all('/*', function (request, response, next) {
        console.log('req')
        response.header('Access-Control-Allow-Origin', '*');
        response.header('Access-Control-Allow-Headers', '*');
        response.header('Access-Control-Expose-Headers', '*');
        response.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, HEAD');
        response.header('Access-Control-Allow-Credentials', 'true');
        next();
    });
  require('./routes')(app)
 app.listen(app.config.port, function () {
        app.logger.methods.log(' Server is running on port ' + ' ' + config.port, "");
    });
});


process.on('uncaughtException', (err, origin) => {
    app.logger.methods.log('unCaughtException', err, origin)
})
process.on('unhandledRejection', (reason, promise) => {
    app.logger.methods.log('unhandledRejection', reason, promise)
})
app.use(function (err, req, res, next) {
    //Catch json error
    app.logger.methods.log("err", err);
    return res.json({ "err": "invalid req JSON " });
});
module.exports=app;

