/*
 * 
 * 
*/
module.exports = function (app, mongoose) {

    let transaction = new mongoose.Schema({
        action:{type :String},
        bought_price:{type:Number},
        sold_shares:{type:Number},
        bought_shares:{type:Number}
    })
    var tradeSchema = new mongoose.Schema({
        'ticker_symbol': { type: String, unique: true },
        'security': { type: mongoose.Schema.Types.ObjectId, ref: 'Security' },
        'average_buy_price': { type: Number },
        'shares': { type: Number },
        "created_date": { type: Date, default: new Date() },
        "updated_date": { type: Date },
        "transactions":[transaction]
    });
    app.db.model('Trade', tradeSchema);
};
