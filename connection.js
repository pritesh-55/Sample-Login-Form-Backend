const mongoose = require('mongoose')

// Path Loaction for MongoDB Atlas Server (Online)
// mongodb+srv://priteshsrv:<password>@priteshapi.kwiwdof.mongodb.net/<Databsename>?retryWrites=true&w=majorit
const uri = process.env.MONGODB_URL

// Path Location for Local MongoDB database storage
const compass = process.env.MONGOCOMPASS_PATH


mongoose.connect(`${uri}` ,{useNewUrlParser:true, useUnifiedTopology:true})
.then(()=>{ 
    console.log("Connection to Database Successfull")})
.catch((err)=>{ 
    console.log(`Error due to ${err}`)})