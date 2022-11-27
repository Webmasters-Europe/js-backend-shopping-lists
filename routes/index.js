const express = require('express')

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

const router = express.Router()

router.get('/', async (req, res, next) => {
    const userData = await (await fetch('http://localhost:3000/api/909090')).json()
    res.render('index', { list: userData.entries })
})

router.get('/addList', (req, res, next) => {
    res.render('addList')
})

module.exports = router
