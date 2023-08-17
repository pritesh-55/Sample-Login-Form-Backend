const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Defining Schema 
const college_schema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    confirmpassword:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    gender:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true,
        unique:true
    },
    otp:{
        type:Number
    },
    token:{
        type:String,
        unique:true
    }
})


// Part-2 ---- Creating Web Token for authentication
        // Miidleware Functionality ------ .methods are used while dealing with instances/documents (run time pe jo document create hua) ans .static are used on Models/Collections (jo statically present hote hai)
college_schema.methods.generatetoken = async function(){
    try {
        // this representing current document jo user ne abhi register/login kiya, this keyword does not work with fat arrow function ()=>
        // Token generate krene ke kiye we need 2 things 1) a unique data 2) a secret key
        const token = await jwt.sign({_id: this._id.toString()}, 'secretkeyof32charactersfortokengeneration')
        this.token = token 
        await this.save()   // Registration krte time save functionality hai but not on login time that's why yhi save kr rahe hain
        return token
    } 
    catch (error) {
        console.log(error);
    }
}




// Part-4  -- Applied after getting data from user (Part-1) and before saving to database (Part-3)
college_schema.pre('save', async function(next){
    if(this.isModified('password'))
    {
        this.password = await bcrypt.hash(this.password,10)
        this.confirmpassword = this.password
    }
    next()
})
// pre = a middleware function which is telling that save event se pehle kya task karna hain 
// isModified is used in case agar data update ho rha hai then if condition apply only when passowrd is changing not for other entities
// this represnting the current document, jo user ne abhi register kiya hain 
// In hash function 1st Argument is the inserted password by user, 2nd Arg- is how many rounds of hashing algo
// Confirm pass is only used for validation, there is no need of it in database that's why it marked as undefined
// next() - another middlelayer functionality. Save event se pehle ka work sb ho gya now jab tak next() call nhi krenge tab tk aage proceed nhi hoga. page will just load infinte


// Create new collection 
const profile = new mongoose.model("College Profile",college_schema)

// Exporting our model/collection to indexe.js file 
module.exports = profile