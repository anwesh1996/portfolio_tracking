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
            erroHandler.expressHandler.sendSuccessResponse(res, await create(req.body), 'Added new security succesfully', 201)
        } catch (err) {
            app.logger.methods.error(req.path, __filename, "Error", err, "500")
            erroHandler.expressHandler.sendFailureResponse(res, err, 'There was a problem in adding new security!', 500)
        }
    },
    getAll: async (req, res) => {
        try {
            erroHandler.expressHandler.sendSuccessResponse(res, await getAll(req.query), 'List security succesfully', 200)
        } catch (err) {
            app.logger.methods.error(req.path, __filename, "Error", err, "500")
            erroHandler.expressHandler.sendFailureResponse(res, err, 'There was a problem in Listing  securitys!', 500)
        }
    }
}


/*
* Re-usable methods
*/
let create = async (data) => {
    console.log(data)
    return new Promise(async (resolve, reject) => {
        try {
                let security = await app.db.models.Security(data).save()
                resolve(security)
        }
        catch (err) {
            reject(err)
        }
    })

}

let getAll = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let securities=[];
            if(data.pageSize && data.pageNo){
                let limit=data.pageSize ? Number(data.pageSize) :30
                let skip = data.pageNo ? parseInt(data.pageNo-1)*limit:0
                securities = await app.db.models.Security.find({}).skip(skip).limit(limit).lean()
            }else{
                securities = await app.db.models.Security.find({}).lean()
            } 
            resolve(securities)
        }
        catch (err) {
            reject(err)
        }
    })

}

exports.helperMethods = {
    create: create,
    getAll: getAll
}