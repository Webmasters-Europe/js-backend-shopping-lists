require('dotenv').config()
const createError = require('http-errors')
const express = require('express')

const app = express()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const passport = require('passport')
require('./config/passport')(passport)

app.set('httpServer', httpServer)
app.set('socket.io', io)
app.set('username-socketId', {})

const indexRouter = require('./routes/index')
const authRouter = require('./routes/auth')

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(passport.initialize())

io.on('connection', (socket) => {
    console.log(`${socket.id} connected`)

    socket.on('username', (username) => {
        const usernameSocketId = app.get('username-socketId')
        usernameSocketId[username] = socket.id
        app.set('username-socketId', usernameSocketId)
    })
})

app.use('/auth', authRouter)
app.use('/', passport.authenticate('jwt', { session: false, failureRedirect: '/auth/login' }), indexRouter)

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404))
})

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
})

app.locals.root = __dirname

module.exports = app
