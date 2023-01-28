const User = require('../models/user')

function validUsername(req, res, next) {
    const { username } = req.body
    const regex = new RegExp(/^([\w]+){3,}$/)
    if (!(typeof username === 'string' && regex.test(username.trim()))) {
        res.json({ error: 'Invalid username' })
        return
    }
    req.body.username = username.trim()
    next()
}

async function usernameAvailable(req, res, next) {
    const { username } = req.body
    const existingUser = await User.findOne({ username })
    if (existingUser) {
        res.json({ error: 'Username already taken' })
        return
    }
    next()
}

function validPassword(req, res, next) {
    const { password } = req.body
    const regex = new RegExp(/^(?=.*?[\w]+)(?=.*?[!$_?]+).{8,}$/)
    if (!(typeof password === 'string' && regex.test(password.trim()))) {
        res.json({ error: 'Invalid password' })
        return
    }
    req.body.password = password.trim()
    next()
}

module.exports = {
    validUsername,
    usernameAvailable,
    validPassword,
}
