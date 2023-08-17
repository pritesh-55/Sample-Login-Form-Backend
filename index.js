require('dotenv').config()

// Requiring Express modules 
const express = require('express')
const server = express()

const port = process.env.PORT || 8000  // To generate port no by hosting servivce

const bcrypt = require('bcryptjs')   // Paqckage to secure password by hashing

const jwt = require('jsonwebtoken')   // Package to create Json web Tokens for User verification 

const cookieParser = require('cookie-parser')  // Package for cookie parser middleware functionality


const nodemail = require('nodemailer')  // Package to send email from Node JS Application

const mailgen = require('mailgen')  // Package that generates clean, responsive HTML e-mails for sending transactional mail.


require("./connection.js")     // Importing connection file (Mongoose connection b/w express app and MongoDB database)

const profile = require("./database.js")    // Importing databse file which gives control to use profile (Model/Collection) 

// Setting up template engines (hbs) and partials 
const hbs = require('hbs')
const path = require('path')
server.set('view engine','hbs')
const partial = path.join(__dirname,"/partials")
hbs.registerPartials(partial)



server.use(express.json())    // Middleware to identify json and form data coming from client side to server 
server.use(express.urlencoded({extended:false})) // Middleware function that is used to parse incoming HTTP request bodies containing URL-encoded data. This middleware is essential when handling form submissions or other data sent through HTML form elements.
server.use(cookieParser())  // Middleware function which extracts the cookies data and parses it into JS Object


// Function defined to generated Random 4 digits number for OTP
function get_random_num(min,max){
    min = Math.ceil(min)
    max = Math.ceil(max)
    return Math.floor(Math.random()*(max-min)+min)
}


//---------------------------------------GET Requests---------------------------------------------------------------------------

server.get("/", (req,res)=>{
    res.render("home")
})

server.get("/register", (req,res)=>{
    res.render("register")
})

server.get("/login", async (req,res)=>{
    try{
        // If user ne pehle already login kiya hua tha then uska token cookies mei store hoga, here we will verify cookie token to user token(saved in databse), if matches then we will show the authorized page of user
        // First checking if any token exists in cookies or not then verify
        if(req.cookies.webtoken){
            const verify = await jwt.verify(req.cookies.webtoken,'secretkeyof32charactersfortokengeneration')
            if(verify){
                const user = await profile.findOne({token:req.cookies.webtoken})
                res.render("secret")
            }
        } 
        
        else{
            res.render('login')  // Token exist nhi krega in browser cookies then back to login page
        }
    }
    catch{     
        res.render('login')   // JWT verification failed ho gya then error show krne ki jagah we will show login page
    }
    
})

server.get("/logout", async (req,res)=>{  
    const user = await profile.findOne({token:req.cookies.webtoken})  // First request body mei se unique token se databse mei user ko find kr lenge

    // user.token= undefined // Databse se token ko delete kr denge
    // await user.save()
    res.clearCookie('webtoken')  // Browser se token cookie ko delete kr denge
    
    res.render("login")
})

server.get('/forgot', (req,res)=>{
    res.render('forgot')
})

server.get('/api', async (req,res)=>{
    const data = await profile.find(req.query)  // req.query = jo bhi query parameters user ne daale honge wo search krega

    res.json(data)  // json method to show data as a json format
})




// -------------------------------------------------POST Requests-----------------------------------------------------------------

// Sending the registration form data to database 
server.post("/register", async (req,res)=>{
    try{
        const pass = req.body.Pass
        const cpass = req.body.CPass

        // First Validating if Entered Pass and Condirm Pass is matched then moving forward
        if(pass === cpass){
            // Part-1 ---- Creating a new record by storing client information 
            const student = new profile({
                name :req.body.Name,                   // Left side variables are Schema value and right side notations are form name values
                password : req.body.Pass,
                confirmpassword : req.body.CPass,
                email : req.body.Email,
                gender : req.body.may,
                phone : req.body.phone
            })

            // Part-2 ---- Creating Web Token for authentication
            const token = await student.generatetoken()


            // Part-3 ---- Store JWT tokens in HTTP only Cookie in browser
            res.cookie('webtoken', token, {
                expires: new Date(Date.now()+300000),
                httpOnly:true
            })

            // Part-4 ---- In the databse.js file (for secure password)


            // Part-5 ---- Saving the created record in our database 
            const data = await student.save()
            res.status(201).send("<h1>The Form sent successfully to Backend database</h1>")
        }
        else res.send("Password does not matched")
    }
    catch(e){
        res.status(400).send(e)
    }
})


// Sending login deatils (Login form) and Response given according to deatails 
server.post("/login", async (req,res)=>{
    try{

            const email = req.body.Email
            const user = await profile.findOne({email})   // Got the user data from databse by email
            if(user){

            // Secure login 
                const isMatch = await bcrypt.compare(req.body.Pass,user.password)

                if(isMatch){
                    const token = await user.generatetoken()

                    // Storing Token in Cookie, first argument is webtoken is token name and 2nd argument is token value from databse
                    res.cookie('webtoken', token, {
                        expires: new Date(Date.now()+300000),
                        httpOnly:true
                    })

                    res.render("secret")
                }
                else res.send('Invalid Password')
            }
            else res.send('Invalid Email ID')
        
        
    }
    catch(e){
        res.status(400).send(e)
    }
})


server.post('/otpgen', async (req,res)=>{

    // Jis Email ke liye Forget Password kara gya hai usko request body se get kar lenge then dtabase mein find krenge
    const email = req.body.Email  
    const user = await profile.findOne({email})

    
    const otp = get_random_num(1000,9999)  // Random 4 digits number OTP generation

    if(user){
        user.otp = otp
        user.save()
    }
    // User ka email cookie mei store kara rahe hai jisse OTP validation ke time databse ko find krne ke liye unique field rahe
    res.cookie('userval', email, {
        expires: new Date(Date.now()+60000),
        httpOnly:true
    })

    // Connect with gmail
    const transporter = nodemail.createTransport({
        service: 'gmail',
        auth: {
            user: 'priteshsrivastava502@gmail.com',
            pass: 'wsutqlzkggbixedt'   // Setup App-Password in Google Account to get this
        }
    })

    // mailgen for creating templates of mail
        // Header Section
    let mailGenerator = new mailgen({
        theme: 'default',
        product: {
            // Appears in header & footer of e-mails
            name: 'PRITESH Music Player',
            link: 'https://mailgen.js/'
            // Optional product logo
            // logo: 'https://mailgen.js/img/logo.png'
        }
    })

    // Body Section of our mail setup in mail gen
    let Response = {
        body:{
            name: `${user.name}`,   // Jisko send kr rahe hai uska name database se get kr liya
            intro:`OTP for Pritesh Music Player Login is ${otp}`,
            table:{
                data:[
                    {
                        Validity: 'This OTP will expire after 60 seconds'
                    }
                ]
            }
        },
        outro:'Do not share this OTP to anyone'
    }
    // Complete mail with header and body generated
    let mail = mailGenerator.generate(Response)

    // Collecting all the email data in one and prepare to send
    const mailOptions = {
        from: 'PRITESH <priteshsrivastava502@gmail.com>',
        to: `${email}`,
        subject: 'OTP for Password Recovery',
        html: mail
    }

    // Mail Sent
    const sentmail = await transporter.sendMail(mailOptions, ()=>{
        console.log(`The mail is sent to ${email}`);
        res.render('otpgen') 
    })
    
    
})

server.post('/otpval', async (req,res)=>{
    const email = req.cookies.userval
    const user = await profile.findOne({email})
    if(user.otp == req.body.otpval){
        res.render('otpval')
    }
    else{
        res.send('<h1>Invalid OTP</h1>')
    }
})

server.post('/updated', async (req,res)=>{
    const email = req.cookies.userval
    const user = await profile.findOne({email})

    if(req.body.npass == req.body.cpass){
        user.password = req.body.npass
        user.confirmpassword = req.body.cpass
        await user.save()
        res.send('<h1>Password Updated Succeessfully. Go back to login Page </h1>')
    }
    
    else{
        res.send('<h1>Confirm Password did not matched</h1>')
    }
})





server.listen(port, ()=>{
    console.log(`The Express Server is listening at port no. ${port}`)
})











// Generating Email with testing account with ethereal for testing purposes

/*
server.post('/otp', async (req,res)=>{

    const email = req.body.Email
    const otp = get_random_num(1000,9999)

    const account = await nodemail.createTestAccount()

    // Connect with smtp of ethereal 
    const transporter = nodemail.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'dandre.ebert@ethereal.email',
            pass: 'qDk4PubwjayJCfW27U'
        }
    })

    const mailOptions = {
        from: 'dandre.ebert@ethereal.email',
        to: `${email}`,
        subject: 'OTP for Password Recovery',
        text: `${otp}`
    }

    const sentmail = await transporter.sendMail(mailOptions, ()=>{
        console.log(`The mail is sent`); 
    })
    res.json(sentmail) 
    
})
*/