/*
 * 
 * 
*/
module.exports = function (app, mongoose) {

  let dateSchema = new mongoose.Schema({
    day: { type: String },
    month: { type: String },
    year: { type: String }
  }, { _id: false })

  var SecuritySchema = new mongoose.Schema({
    "name": { type: String, trim: true},
    'ticker_symbol': {type:String,unique:true},
    "created_date": { type: Date, default: new Date() },
    "published_on": dateSchema,
    "current_price": { type: Number,default:100 }
  });
  app.db.model('Security', SecuritySchema);
};
