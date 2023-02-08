require('dotenv').config()
const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const mongoose = require('mongoose')

const apiRouter = require('./routes/shoppingLists')
const authRouter = require('./routes/auth')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set')
    process.exit(1)
}

try {
    mongoose.connect(process.env.DATABASE_URL)
} catch (error) {
    console.error(error)
    process.exit(1)
}

const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.error('Database connection successful'))

app.use('/auth', authRouter)
app.use('/api', apiRouter)

app.use((req, res, next) => {
    next(createError(404))
})

app.use((err, req, res, next) => {
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    res.status(err.status || 500)
    res.render('error')
})

module.exports = app
