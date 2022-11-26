var express = require('express')
var router = express.Router()
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
const { validList, validEntryName } = require('../middlewares/index.middleware')

var router = express.Router()

router.get('/', async function (req, res, next) {
	const userId = req.user._id
	const userData = await (await fetch(`http://localhost:3001/api/${userId}`)).json()
	res.render('index', { lists: userData.lists, username: req.user.username })
})

router.get('/addList', function (req, res, next) {
	res.render('addList', { username: req.user.username })
})

router.post('/addList', validList, async (req, res) => {
	const body = JSON.stringify({ userId: req.user._id, ...req.body })
	const options = {
		headers: { 'Content-Type': 'application/json' },
		method: 'POST',
		body: body,
	}

	const result = await (await fetch('http://localhost:3001/api', options)).json()

	res.json(result)
})

router.delete('/:listId', async (req, res) => {
	const { listId } = req.params
	const userId = req.user._id
	const options = {
		headers: { 'Content-Type': 'application/json' },
		method: 'DELETE',
	}

	const result = await (await fetch(`http://localhost:3001/api/${userId}/${listId}`, options)).json()

	res.json(result)
})

router.delete('/:listId/:entryName', validEntryName, async (req, res) => {
	const { listId, entryName } = req.params
	const userId = req.user._id
	const options = {
		headers: { 'Content-Type': 'application/json' },
		method: 'DELETE',
	}

	const result = await (
		await fetch(`http://localhost:3001/api/${userId}/${listId}/${entryName}`, options)
	).json()

	res.json(result)
})

module.exports = router
