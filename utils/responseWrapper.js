const success = (statusCode,result)=>{
    return{
        status: 'ok',
        statusCode,
        result
    }
}

const error = (statusCode,errMsg)=>{
    return{
        status: 'error',
        statusCode,
        errMsg
    }
}

module.exports ={
    success, error
}