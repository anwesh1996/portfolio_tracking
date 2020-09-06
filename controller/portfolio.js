var app;
const ObjectId = require('mongoose').Types.ObjectId;
const erroHandler = require('../error-handler');
const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
exports.init = (app_ref) => {
    app = app_ref;
}

/*
*Main-methods
*/

exports.methods = {

    create: async (req, res) => {
        try {
            erroHandler.expressHandler.sendSuccessResponse(res, await create(req.body), 'Added new profile succesfully', 201)
        } catch (err) {
            app.logger.methods.error(req.path, __filename, "Error", err, "500")
            erroHandler.expressHandler.sendFailureResponse(res, err, 'There was a problem in adding new profile!', 500)
        }
    },
    getOne: async (req, res) => {
        try {
            erroHandler.expressHandler.sendSuccessResponse(res, await getOne(req.query), 'List profile succesfully', 200)
        } catch (err) {
            app.logger.methods.error(req.path, __filename, "Error", err, "500")
            erroHandler.expressHandler.sendFailureResponse(res, err, 'There was a problem in Listing  profile!', 500)
        }
    },
    getHoldings: async (req, res) => {
        try {
            erroHandler.expressHandler.sendSuccessResponse(res, await getHoldings(req.query), 'List profile succesfully', 200)
        } catch (err) {
            app.logger.methods.error(req.path, __filename, "Error", err, "500")
            erroHandler.expressHandler.sendFailureResponse(res, err, 'There was a problem in Listing  profile!', 500)
        }
    },
    getReturns: async (req, res) => {
        try {
            erroHandler.expressHandler.sendSuccessResponse(res, await getReturns(), 'Calculated returns succesfully', 200)
        } catch (err) {
            app.logger.methods.error(req.path, __filename, "Error", err, "500")
            erroHandler.expressHandler.sendFailureResponse(res, err, 'There was a problem in calculating returns!', 500)
        }
    },
    update: async (req, res) => {
        try {
            erroHandler.expressHandler.sendSuccessResponse(res, await update(req.params.id, req.body), 'profile updated succesfully', 200)
        } catch (err) {
            app.logger.methods.error(req.path, __filename, "Error", err, "500")
            erroHandler.expressHandler.sendFailureResponse(res, err, 'There was a problem in Updating profile!', 500)
        }
    }
}


/*
* Re-usable methods
*/
let create = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
                let portfolio = await app.db.models.Portfolio(data).save()
                resolve(portfolio)
        }
        catch (err) {
            reject(err)
        }
    })

}

let getOne = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let portfolio=[];
            portfolio = await app.db.models.Portfolio.find({user:data.user.trim()}).populate('tradeDetails').lean()
            resolve(portfolio)
        }
        catch (err) {
            reject(err)
        }
    })

}

let getHoldings =async(data)=>{
    return new Promise(async(resolve,reject)=>{
        let holdings = await app.db.models.Portfolio.find({user:data.user.trim()}).populate({path:'tradeDetails',populate:{path:'security'}}).lean()
        resolve(holdings)
    })
}

let getReturns =async(data)=>{
    return new Promise(async(resolve,reject)=>{
        let trades = await app.db.models.Trade.find({}).lean()
        let returns = trades.reduce((sum,current)=>sum+((100-current.average_buy_price)*current.shares),0)
        resolve(returns)
    })
}




exports.helperMethods = {
    create: create,
    getOne: getOne
}