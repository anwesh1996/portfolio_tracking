module.exports.calculateAverageBuyPrice=(currentTradeValues,pastTradeValues)=>{
    return ((pastTradeValues.average_buy_price*pastTradeValues.shares+currentTradeValues.average_buy_price*currentTradeValues.shares)/(currentTradeValues.shares+pastTradeValues.shares))
}

module.exports.calculatePreviousAverage = (pastTradeValues,deletedTradeValues) => {
    if(pastTradeValues.shares-deletedTradeValues.shares===0){
        return 0;
    }else{
        let a =pastTradeValues.average_buy_price*(pastTradeValues.shares)
        let b =deletedTradeValues.average_buy_price*deletedTradeValues.shares
        return ((a-b)/(pastTradeValues.shares-deletedTradeValues.shares))
    }
    
}