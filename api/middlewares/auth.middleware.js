const User = require('../models/user')

async function userForUsername(req, res, next) {
    const { username } = req.body

    let user
    try {
        user = await User.findOne({ username })
    } catch (err) {
        res.status(400).json({ error: err.message })
        return
    }

    if (!user) {
        res.status(404).json({ error: 'User not found' })
        return
    }

    req.body.user = user

    next()
}

async function usernameAvailable(req, res, next) {
    const { username } = req.body
    let existingUser
    try {
        existingUser = await User.findOne({ username })
    } catch (err) {
        res.status(400).json({ error: err.message })
        return
    }

    if (existingUser) {
        res.status(400).json({ error: 'Username already taken' })
        return
    }
    next()
}

module.exports = {
    userForUsername,
    usernameAvailable,
}
