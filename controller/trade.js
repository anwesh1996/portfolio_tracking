var app;
const ObjectId = require('mongoose').Types.ObjectId;
const erroHandler = require('../error-handler');
const Joi = require('@hapi/joi');
const calculations = require('../utils/calculations');
const { resolve } = require('path');
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
            erroHandler.expressHandler.sendSuccessResponse(res, await create(req.body), 'Added new trade succesfully', 201)
        } catch (err) {
            app.logger.methods.error(req.path, __filename, "Error", err, "500")
            erroHandler.expressHandler.sendFailureResponse(res, err, err.message | 'There was a problem in adding new trade!', 500)
        }
    },
    getAll: async (req, res) => {
        try {
            erroHandler.expressHandler.sendSuccessResponse(res, await getAll(req.query), 'List trade succesfully', 200)
        } catch (err) {
            app.logger.methods.error(req.path, __filename, "Error", err, "500")
            erroHandler.expressHandler.sendFailureResponse(res, err, 'There was a problem in Listing  trades!', 500)
        }
    },
    update: async (req, res) => {
        try {
            erroHandler.expressHandler.sendSuccessResponse(res, await update(req.params.ticker, req.query, req.body), 'trade updated succesfully', 200)
        } catch (err) {
            app.logger.methods.error(req.path, __filename, "Error", err, "500")
            erroHandler.expressHandler.sendFailureResponse(res, err, 'There was a problem in Updating trades!', 500)
        }
    },
    _delete: async (req, res) => {
        try {
            erroHandler.expressHandler.sendSuccessResponse(res, await _delete(req.params.id,req.body,req.query), 'trade updated succesfully', 200)
        } catch (err) {
            app.logger.methods.error(req.path, __filename, "Error", err, "500")
            erroHandler.expressHandler.sendFailureResponse(res, err, 'There was a problem in Updating trades!', 500)
        }
    }
}


/*
* Re-usable methods
*/
let create = async (data) => {
    let security = await app.db.models.Security.findOne({ ticker_symbol: data.ticker_symbol }).lean()
    if (security) {
        data.security = security._id
    } else {
        throw new Error('Invalid security,please verify')
    }
    let currentTradeValues = {
        shares: data.shares ? parseInt(data.shares) : 0,
        average_buy_price: data.bought_price ? parseInt(data.bought_price) : 0
    }
    let pastTradeValues = {
        shares: 0,
        average_buy_price: 0
    }
    data.average_buy_price = calculations.calculateAverageBuyPrice(currentTradeValues, pastTradeValues)
    return new Promise(async (resolve, reject) => {
        try {
            data.transactions = [{
                action: 'bought',
                bought_price: parseInt(data.bought_price),
                sold_shares: 0,
                bought_shares: parseInt(data.shares)
            }]
            let trade = await app.db.models.Trade(data).save()
            console.log(trade, 'trade')
            if (trade) {
                let updatedPortfolio = await app.db.models.Portfolio.update({ user: data.user }, { $set: { updated_date: new Date() }, $push: { tradeDetails: trade._id } })
                console.log(updatedPortfolio)
            }
            resolve(trade)
        }
        catch (err) {
            reject(err)
        }
    })

}

let getAll = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let trades = [];
            if (data.pageSize && data.pageNo) {
                let limit = data.pageSize ? Number(data.pageSize) : 30
                let skip = data.pageNo ? parseInt(data.pageNo - 1) * limit : 0
                trades = await app.db.models.trade.find({}).skip(skip).limit(limit).lean()
            } else {
                trades = await app.db.models.trade.find({}).lean()
            }
            resolve(trades)
        }
        catch (err) {
            reject(err)
        }
    })

}

let update = async (ticker, user, data) => {
    let security = await app.db.models.Security.findOne({ ticker_symbol: ticker }).lean()
    let trade = await app.db.models.Trade.findOne({ ticker_symbol: ticker.trim() })
    if (!security) {
        throw new Error('Invalid security,please verify')
    }
    let average_buy_price;
    let transaction;
    if (data.shares > 0) {
        let currentTradeValues = {
            shares: parseInt(data.shares),
            average_buy_price: parseInt(data.bought_price)
        }
        let pastTradeValues = {
            shares: trade.shares,
            average_buy_price: trade.average_buy_price
        }
        console.log(security)
        console.log(currentTradeValues, pastTradeValues)
        average_buy_price = calculations.calculateAverageBuyPrice(currentTradeValues, pastTradeValues)
        transaction = {
            action: 'bought',
            bought_price: parseInt(data.bought_price),
            sold_shares: 0,
            bought_shares: parseInt(data.shares)
        }
    } else if (data.shares < 0) {
        console.log('selling shares')
        if (trade.shares < (data.shares * -1)) {
            throw new Error('Can not sell more than available share')
        }
        transaction = {
            action: 'sold',
            bought_price: 0,
            sold_shares: parseInt(data.shares),
            bought_shares: 0
        }
    } else {
        throw new Error('No modification in shares,incoming 0 share')
    }
    console.log(average_buy_price, 'average')
    return new Promise(async (resolve, reject) => {
        try {
            let updateSet = {
                $set: {
                    updated_date: new Date()
                },
                $inc: { shares: data.shares },
                $push: { transactions: transaction }
            }
            if (average_buy_price) {
                updateSet['$set'].average_buy_price = average_buy_price.toFixed(3)
            }
            await app.db.models.Trade.update({ ticker_symbol: ticker.trim() }, updateSet)
            resolve(true)
        }
        catch (err) {
            reject(err)
        }
    })
}
let _delete = async (id, data, query) => {
    return new Promise(async (resolve, reject) => {
        let trade = await app.db.models.Trade.findOne({ ticker_symbol: query.ticker })
        switch (data.action) {
            case 'bought':
                let deletedTradeValues = {
                    shares: parseInt(data.bought_shares),
                    average_buy_price: parseInt(data.bought_price)
                }
                let pastTradeValues = {
                    shares: trade.shares,
                    average_buy_price: trade.average_buy_price
                }
                console.log(deletedTradeValues,pastTradeValues)
               
                let average_buy_price = calculations.calculatePreviousAverage(pastTradeValues,deletedTradeValues)
               
                await app.db.models.Trade.update({ ticker_symbol: query.ticker },
                    {
                        $inc: { shares: data.bought_shares * -1 },
                        $set: { average_buy_price: average_buy_price },
                        $pull: { 'transactions':{_id:ObjectId(id)} }
                    })
                break;
            case 'sold':
                await app.db.models.Trade.update({ ticker_symbol: query.ticker },
                    {
                        $inc: { shares: data.bought_shares * -1 },
                        $pull: { 'transaction._id': ObjectId(id) }
                    })
                break;
            default:
                break;
        }
        resolve(true)
    })
}

exports.helperMethods = {
    create: create,
    getAll: getAll,
    update: update
}