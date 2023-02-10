const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { validUsername, validPassword } = require('../middlewares/index.middleware')

const router = express.Router()

router.get('/login', (req, res, next) => {
    res.render('auth', { register: false })
})

router.post('/login', [validUsername, validPassword], async (req, res) => {
    const { username, password } = req.body
    let user
    try {
        const response = await fetch('http://localhost:3001/auth/username', {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({ username }),
        })
        user = (await response.json())?.user
    } catch (err) {
        res.status(400).json({ error: err.message })
        return
    }

    const correctPassword = await bcrypt.compare(password, user?.password || '')

    if (!correctPassword) {
        res.status(401).json({ error: 'Username or Password is incorrect' })
        return
    }

    createAndSetToken(res, { username: user.username })
    res.redirect('/')
})

router.get('/register', (req, res, next) => {
    res.render('auth', { register: true })
})

router.post('/register', [validUsername, validPassword], async (req, res, next) => {
    const { username, password } = req.body
    const pwHash = await bcrypt.hash(password, 10)

    let user
    try {
        const response = await fetch('http://localhost:3001/auth/register', {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({ username, password: pwHash }),
        })

        user = (await response.json())?.user
    } catch (err) {
        res.status(400).json({ error: err.message })
        return
    }

    if (!user) {
        res.json({ error: 'Username unavailable' })
        return
    }

    createAndSetToken(res, { username: user.username })
    res.redirect('/')
})

router.post('/logout', (req, res, next) => {
    res.clearCookie('bearer').json({ message: 'Logout successfull' })
})

function createAndSetToken(res, data) {
    const token = jwt.sign(data, process.env.JWT_SECRET, {
        expiresIn: 3600,
    })

    res.cookie('bearer', token, { httpOnly: true })
}

module.exports = router
