const mongoose = require('mongoose')

// Path Loaction for MongoDB Atlas Server (Online)
// mongodb+srv://priteshsrv:<password>@priteshapi.kwiwdof.mongodb.net/<Databsename>?retryWrites=true&w=majorit
const uri = "mongodb+srv://priteshsrv:Prikha1303@priteshapi.kwiwdof.mongodb.net/PriteshAPI?retryWrites=true&w=majority"

// Path Location for MongoDB Compass (Offline) - mongodb://127.0.0.1:27017/Students_Data 

mongoose.connect('mongodb://127.0.0.1:27017/Students_Data' ,{useNewUrlParser:true, useUnifiedTopology:true})
.then(()=>{ 
    console.log("Connection to Database Successfull")})
.catch((err)=>{ 
    console.log(`Error due to ${err}`)})