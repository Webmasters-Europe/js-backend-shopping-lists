require('dotenv').config()
const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const mongoose = require('mongoose')
const passport = require('passport')
require('./config/passport')(passport)

const indexRouter = require('./routes/index')
const authRouter = require('./routes/auth')
const apiRouter = require('./routes/api/shoppingLists')
const apiAuthRouter = require('./routes/api/auth')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(passport.initialize())

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.error('Database connection successful'))

app.use('/api/auth', apiAuthRouter)
app.use('/api', apiRouter)
app.use('/auth', authRouter)
app.use('/', passport.authenticate('jwt', { session: false, failureRedirect: '/auth/login' }), indexRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}

	// render the error page
	res.status(err.status || 500)
	res.render('error')
})

app.locals.root = __dirname

module.exports = app
