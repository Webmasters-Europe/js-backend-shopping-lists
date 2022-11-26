const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { validUsername, usernameAvailable, validPassword } = require('../middlewares/index.middleware')

router.get('/login', function (req, res, next) {
	res.render('auth', { register: false })
})

router.post('/login', [validUsername, validPassword], async function (req, res) {
	const { username, password } = req.body

	const user = await User.findOne({ username: username })
	const correctPassword = await bcrypt.compare(password, user?.password || '')

	if (!correctPassword) {
		res.status(401).json({ error: 'Username or Password is incorrect' })
		return
	}

	createAndSetToken(res, { username: user.username })
	res.redirect('/')
})

router.get('/register', function (req, res, next) {
	res.render('auth', { register: true })
})

router.post('/register', [validUsername, usernameAvailable, validPassword], async function (req, res, next) {
	const { username, password } = req.body
	const pwHash = await bcrypt.hash(password, 10)
	let user
	try {
		user = await User.create({ username: username, password: pwHash })
	} catch (error) {
		console.log(error)
		res.status(400).json({ error: 'An error occurred while creating the user' })
		return
	}

	createAndSetToken(res, { username: user.username })
	res.redirect('/')
})

router.post('/logout', function (req, res, next) {
	res.clearCookie('bearer').json({ message: 'Logout successfull' })
})

function createAndSetToken(res, data) {
	const token = jwt.sign(data, process.env.JWT_SECRET, {
		expiresIn: 3600,
	})

	res.cookie('bearer', token, { httpOnly: true })
}

module.exports = router
