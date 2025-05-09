const express = require('express');
const path = require('path');
const expressFlash = require('express-flash');
const expressSession = require("express-session");
const cookieParser = require("cookie-parser")
const {setHeaders} = require('./middlewares/headers');
const {errorHandler} = require('./middlewares/errorHandler');
const authRouter = require('./modules/auth/auth.router');
const postRouter = require('./modules/post/post.router');
const pageRouter = require('./modules/page/page.router');
const { cookie } = require('express/lib/response');

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


// Cookie-Parser
app.use(cookieParser())

// Static Folders
app.use('/css' , express.static(path.join(__dirname , '..' , 'public/css')))
app.use('/fonts' , express.static(path.join(__dirname , '..' , 'public/fonts')))
app.use('/images' , express.static(path.join(__dirname , '..' , 'public/images')))
app.use('/js' , express.static(path.join(__dirname , '..' , 'public/js')))

// Template Engine 
app.set('view engine' , 'ejs')
app.set('views' , path.join(__dirname , "views"))

// Router
app.get('/' , (req , res) => {
    return res.render('index.ejs')
})

app.use('/auth' , authRouter)
app.use("/post", postRouter);
app.use("/page", pageRouter);


// 404 Handler
app.use((req , res) => {
    return res.status(404).json({
        message: "Page Not Found !!"
    })
})


// Error Handler
errorHandler()


module.exports = app