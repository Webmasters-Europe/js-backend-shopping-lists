const express = require('express')
const User = require('../models/user')
const { userForUsername, usernameAvailable } = require('../middlewares/auth.middleware')

const router = express.Router()

router.post('/username', userForUsername, (req, res) => {
    const { user } = req.body
    res.json({ user })
})

router.post('/register', usernameAvailable, async (req, res) => {
    const { username, password } = req.body

    let user
    try {
        user = await User.create({ username, password })
        if (!user) {
            throw new Error('Could not create user')
        }
    } catch (err) {
        res.status(400).json({ err })
        return
    }

    res.json({ user })
})

module.exports = router
