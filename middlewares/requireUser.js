const jwt = require('jsonwebtoken');
const { error } = require('../utils/responseWrapper');
const UserModel = require('../models/UserModel');


module.exports = async (req, res, next)=>{
    if(!req.headers || !req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")){
        // return res.status(401).send('authorization header is requierd')
        return res.send(error(401,"authorization header is required"));
    }
    const accessToken = req.headers.authorization.split(' ')[1];
    console.log(`access token : ${accessToken}`);
    
    try {
        const decode = jwt.verify(accessToken,process.env.Access_Token_Private_Key);

        req.id = decode.id;

        const user = await UserModel.findById(decode.id);
        if(!user){
            return res.send(error(404,'user not found'));
        }
        next();

    } catch (err) {
        console.log(err);
        // return res.status(401).send('Invalid access token')
        return res.send(error(401,'Invalid access token'));
    }
    
}