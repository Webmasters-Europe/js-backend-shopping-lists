const express = require('express')

const router = express.Router()
const { validList, validEntryName } = require('../middlewares/index.middleware')

router.get('/', async (req, res, next) => {
    const userId = req.user._id
    const userData = await (await fetch(`http://localhost:3000/api/${userId}`)).json()
    res.render('index', { lists: userData.lists, username: req.user.username })
})

router.get('/addList', (req, res, next) => {
    res.render('addList', { username: req.user.username })
})

router.post('/addList', validList, async (req, res) => {
    const body = JSON.stringify({ userId: req.user._id, ...req.body })
    const options = {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body,
    }

    const result = await (await fetch('http://localhost:3000/api', options)).json()

    res.json(result)
})

router.delete('/:listId', async (req, res) => {
    const { listId } = req.params
    const userId = req.user._id
    const options = {
        headers: { 'Content-Type': 'application/json' },
        method: 'DELETE',
    }

    const result = await (await fetch(`http://localhost:3000/api/${userId}/${listId}`, options)).json()

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
        await fetch(`http://localhost:3000/api/${userId}/${listId}/${entryName}`, options)
    ).json()

    res.json(result)
})

module.exports = router
