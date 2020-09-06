const logger = require('../utils/logger')
exports.catchErrors = action => (req, res, next) => action(req, res).catch(next)

exports.sendSuccessResponse = (res,data,message,code) =>{

    if(data && data.log_action){
        res.locals.log_action=data.log_action
        delete data.log_action
    }
    res.status(code).json({
        success:true,
        payload:data,
        message:message || undefined
    })
}

exports.sendFailureResponse = (res,err,message,code) =>{
    code = err.code ? err.code : code;
    if(err.name==='MongoError'){
        code=500,
        message=''
        switch(err.code){
            case 11000:
                err.message=`Duplicate key ${JSON.stringify(err.keyValue)} `
            break;
        }
    }
    res.status(code).json({
        success:false,
        payload:err || null,
        message: err && err.message ? err.message : message
    })
}