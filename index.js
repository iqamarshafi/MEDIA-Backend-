const express = require('express');
const dbConnect = require('./dbConnect');
const morgan = require('morgan');
const cloudinary = require('cloudinary').v2;


const authRouter = require('./routers/authRouter');
const postsRouter = require('./routers/postRouter');
const userRouter = require('./routers/userRouter');


const cookieParser = require('cookie-parser');
const cors = require('cors');

const dotenv = require('dotenv');
dotenv.config({path: './.env'});


  

                                                                                                                                        
const port = process.env.PORT;

const app = express();

  cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

//middlewares

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('common'));
app.use(cookieParser());
// app.use(cors({
//     credentials: true,
//     origin: process.env.CLIENT_ORIGIN
// }))
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_ORIGIN
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // 🔥 Handle preflight request
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use('/auth',authRouter);
app.use('/posts',postsRouter);
app.use('/user',userRouter);

app.get('/',(req,res)=>{            
    res.status(200).send('OK FROM SERVER');
});


dbConnect();
app.listen(port,()=>{
    console.log('listening at port:', port)
});