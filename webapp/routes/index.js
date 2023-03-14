const express = require('express')
const { validList, validEntryName, checkShareWith } = require('../middlewares/index.middleware')

const router = express.Router()

router.get('/', async (req, res, next) => {
    const userId = req.user?._id

    let userData
    try {
        const response = await fetch(`http://localhost:3001/api/${userId}`)
        userData = await response.json()
    } catch (err) {
        res.status(400).json({ error: err.message })
        return
    }

    res.render('index', { lists: userData.lists, username: req.user.username })
})

router.get('/addList', (req, res, next) => {
    res.render('addList', { username: req.user.username })
})

router.post('/addList', [checkShareWith, validList], async (req, res) => {
    let result
    try {
        const response = await fetch('http://localhost:3001/api', {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({ userId: req.user?._id, ...req.body }),
        })
        result = await response.json()
    } catch (err) {
        res.status(400).json({ error: err.message })
        return
    }
    console.log(result)

    const responseObject = { id: result.id, listName: result.listName, entries: result.entries }
    if (result.shareWith) {
        const io = req.app.get('socket.io')
        const usernameSocketId = req.app.get('username-socketId')

        for (const username of req.body.shareWith) {
            io.to(usernameSocketId[username]).emit('receiveList', responseObject)
        }
    }

    res.json(responseObject)
})

router.delete('/:listId', async (req, res) => {
    const { listId } = req.params
    const userId = req.user?._id

    let result
    try {
        const response = await fetch(`http://localhost:3001/api/${userId}/${listId}`, {
            headers: { 'Content-Type': 'application/json' },
            method: 'DELETE',
        })
        result = await response.json()
    } catch (err) {
        res.status(400).json({ error: err.message })
        return
    }

    if (result.sharedUsernames.length > 0) {
        const io = req.app.get('socket.io')
        const usernameSocketId = req.app.get('username-socketId')

        for (const username of result.sharedUsernames) {
            io.to(usernameSocketId[username]).emit('shoppingList:deleteList', listId)
        }
    }

    res.json(result)
})

router.delete('/:listId/:entryName', validEntryName, async (req, res) => {
    const { listId, entryName } = req.params
    const userId = req.user?._id
    let result
    try {
        const response = await fetch(`http://localhost:3001/api/${userId}/${listId}/${entryName}`, {
            headers: { 'Content-Type': 'application/json' },
            method: 'DELETE',
        })
        result = await response.json()
    } catch (err) {
        res.status(400).json({ error: err.message })
        return
    }

    if (result.sharedUsernames.length > 0) {
        const io = req.app.get('socket.io')
        const usernameSocketId = req.app.get('username-socketId')
        const response = { listId, entryName }

        for (const username of result.sharedUsernames) {
            result.entrysListDeleted
                ? io.to(usernameSocketId[username]).emit('shoppingList:deleteList', listId)
                : io.to(usernameSocketId[username]).emit('shoppingList:deleteListEntry', response)
        }
    }

    res.json(result)
})

module.exports = router
