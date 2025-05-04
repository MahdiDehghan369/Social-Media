const express = require('express');
const path = require('path');
const expressFlash = require('express-flash');
const expressSession = require("express-session");
const {setHeaders} = require('./middlewares/headers');
const {errorHandler} = require('./middlewares/errorHandler');
const authRouter = require('./modules/auth.router');

const app = new express()

app.use(setHeaders)

// Express Flash
app.use(expressSession({
    secret: "SERET KEY",
    saveUninitialized: false,
    resave: false
}))
app.use(expressFlash())


// Body-Parser
app.use(express.urlencoded({limit : '50mb' , extended: true}))
app.use(express.json({limit: '50mb'}))

// Static Folders
app.use('/css' , express.static(path.join(__dirname , '..' , 'public/css')))
app.use('/fonts' , express.static(path.join(__dirname , '..' , 'public/fonts')))
app.use('/images' , express.static(path.join(__dirname , '..' , 'public/images')))

// Template Engine 
app.set('view engine' , 'ejs')
app.set('views' , path.join(__dirname , "views"))

// Router
app.get('/' , (req , res) => {
    return res.render('index.ejs')
})

app.use('/auth' , authRouter)


// 404 Handler
app.use((req , res) => {
    return res.status(404).json({
        message: "Page Not Found !!"
    })
})


// Error Handler
errorHandler()


module.exports = app