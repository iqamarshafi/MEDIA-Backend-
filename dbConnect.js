const mongoose = require('mongoose');


module.exports = async ()=>{
   const uri = "mongodb+srv://iqamarshafi:MongoDB%40124@cluster0.y6uqydb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    mongoose.connect(uri).then((conn)=> console.log(`mongoose connect ${conn.connection.host}`)).catch((err)=>{
        console.log(err);
        process.exit(1);
    })
}