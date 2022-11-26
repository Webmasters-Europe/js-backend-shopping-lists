const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
const { validUsername, validPassword } = require('../middlewares/index.middleware')

router.get('/login', function (req, res, next) {
	res.render('auth', { register: false })
})

router.post('/login', [validUsername, validPassword], async function (req, res) {
	const { username, password } = req.body
	const body = JSON.stringify({ username: username })
	const options = {
		headers: { 'Content-Type': 'application/json' },
		method: 'POST',
		body: body,
	}
	let user
	try {
		user = (await (await fetch(`http://localhost:3000/api/auth/username`, options)).json()).user
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

router.get('/register', function (req, res, next) {
	res.render('auth', { register: true })
})

router.post('/register', [validUsername, validPassword], async function (req, res, next) {
	const { username, password } = req.body
	const pwHash = await bcrypt.hash(password, 10)
	const body = JSON.stringify({ username: username, password: pwHash })
	const options = {
		headers: { 'Content-Type': 'application/json' },
		method: 'POST',
		body: body,
	}

	let user
	try {
		user = (await (await fetch(`http://localhost:3000/api/auth/register`, options)).json()).user
	} catch (err) {
		res.status(400).json({ error: err.message })
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
