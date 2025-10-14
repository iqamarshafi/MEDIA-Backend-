const user = require('../models/UserModel');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { error, success } = require('../utils/responseWrapper');


const signupController = async (req, res)=>{
    try{
        const {email,password,name} = req.body;
        
        if(!email || !password || !name){
           return res.send(error(400,'all fields are required'));
        }

        const oldUser = await user.findOne({email});
        if(oldUser){
           return  res.send(error(409,"user already exist"))
        };

        const hashPassword = await bcrypt.hash(password,10);
        const User = await user.create({
            name,
            email,
            password: hashPassword
        })

        // const newUser =  await user.findById(User._id);

        return res.send(success(201,'user Created Successfully'));

        
        
    }catch(err){
       res.send(error(500,err.message))
        
    }
}

const loginController = async (req, res)=>{
    try{
        const {email,password} = req.body;
        
        if(!email || !password){
        
              return res.send(error(400,"All fields are required"))
        }

        const User = await user.findOne({email}).select('+password');
        if(!User){
      
                return res.send(error(404,"user is not registered"));
        };

        const matched = await bcrypt.compare(password,User.password);
        if(!matched){
            
               return res.send(error(403,"incorrect password"))
        }
        const accessToken = generateAccessToken({id: User.id});
        
        const refreshToken = generateRefreshToken({id: User.id});

         res.cookie('jwt',refreshToken,{
            httpOnly: true,
            secure: true
         })

         return res.send(success(201,{accessToken}));
    }catch(err){
       res.send(error(500,err.message))
        
    }
}

const refreshAccessTokenController= async (req,res)=>{
    const cookies = req.cookies;
    if(!cookies.jwt){
        
        return  res.send(error(401,"refresh token is required"));
    }
    const refreshToken = cookies.jwt;
   
    try {
            const verify = jwt.verify(refreshToken,process.env.Refresh_Token_Private_Key);
            const id = verify.id;
            const accessToken = generateAccessToken({id});
            return res.send(success(201,{accessToken}));
    
        } catch (error) {
            console.log(error);
            
            return res.send(error(401,"Invalid refresh token"));
        }
}

const logOutController = async (req,res)=>{
    try {                                                               
        res.clearCookie('jwt',{
            httpOnly: true,
            secure: true
        })

       return  res.send(success(200,'you are successfully logout'));
    } catch (err) {
        return res.send(error(500,err.message));
    }
}

const generateAccessToken = (data)=>{
    const token = jwt.sign(data,process.env.Access_Token_Private_Key,{expiresIn: '1d'});
    return token;
}
const generateRefreshToken = (data)=>{
    const token = jwt.sign(data,process.env.Refresh_Token_Private_Key,{expiresIn: '1y'});
    return token;
}
module.exports = {
    loginController,signupController,refreshAccessTokenController,logOutController
};