/*
 * 
 * 
*/
module.exports = function (app, mongoose) {
    var portfolioSchema = new mongoose.Schema({
        "user": { type: String, trim: true },
        "tradeDetails": [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trade' }],
        "created_date": { type: Date, default: new Date() },
        "updated_date": { type: Date },
    });
    app.db.model('Portfolio', portfolioSchema);
};
