const express = require('express')
const User = require('../models/user')
const ShoppingList = require('../models/shoppingList')
const ShoppingListEntry = require('../models/shoppingListEntry')
const {
    createIdForList,
    checkListId,
    checkEntryName,
    allLists,
} = require('../middlewares/shoppingLists.middleware')

const router = express.Router()

router.get('/:userId', allLists, async (req, res) => {
    const { lists } = req

    const shortenedLists = shortenedUsersLists(lists)

    res.json({ lists: shortenedLists })
})

router.post('/', createIdForList, async (req, res) => {
    const { userId, id, list } = req.body

    let shoppingList
    try {
        shoppingList = await createShoppingList(id)
    } catch (err) {
        res.status(400).json({ error: err.message })
        return
    }
    if (!shoppingList) {
        res.status(400).json({ error: 'An error occurred while creating new shopping list.' })
        return
    }

    try {
        const newEntriesIds = await createEntries(list)
        await addEntriesToShoppingList(newEntriesIds, shoppingList)
    } catch (err) {
        res.status(400).json({ error: err.message })
        return
    }
    try {
        const user = await User.findOne({ _id: userId })
        await addShoppingListToUser(shoppingList, user)
        shoppingList = await shoppingListForId(id, true)
    } catch (err) {
        res.status(400).json({ error: err.message })
        return
    }

    const shortenedEntries = shortenEntries(shoppingList.entries)

    res.json({ id: shoppingList?.userId, entries: shortenedEntries })
})

router.delete('/:userId/:listId', checkListId, async (req, res) => {
    const { list } = req

    try {
        await list.deleteOne({ _id: list.id })
    } catch (err) {
        res.status(400).json({ error: err.message })
        return
    }

    res.json({ message: 'Deleted list successfully' })
})

router.delete('/:userId/:listId/:entryName', [checkListId, checkEntryName], async (req, res) => {
    const { entry } = req

    try {
        await entry.remove()
    } catch (err) {
        res.status(400).json({ error: err.message })
        return
    }

    res.json({ message: `Deleted ${entry.food} successfully` })
})

async function createShoppingList(id) {
    try {
        return await ShoppingList.create({ shoppingListId: id, entries: [] })
    } catch (error) {
        throw new Error(error.message)
    }
}

async function createEntries(list) {
    const entries = []

    try {
        for (const element of list) {
            const entry = await ShoppingListEntry.create({ food: element })
            entries.push(entry._id)
        }
    } catch (err) {
        throw new Error(err)
    }

    return entries
}

async function addEntriesToShoppingList(entriyIds, shoppinglist) {
    entriyIds.forEach((entryId) => shoppinglist.entries.push(entryId))
    try {
        await shoppinglist.save()
    } catch (err) {
        throw new Error(err)
    }
}

function shortenEntries(entries) {
    return entries.map((entry) => (entry = { food: entry.food, createdAt: entry.createdAt }))
}

async function addShoppingListToUser(shoppingList, user) {
    user.lists.push(shoppingList)
    try {
        await user.save()
    } catch (err) {
        throw new Error(err)
    }
}

function shortenedUsersLists(usersLists) {
    const shortenedLists = []
    usersLists.forEach((list) => {
        const data = {}
        data[list.shoppingListId] = shortenEntries(list.entries)
        shortenedLists.push(data)
    })
    return shortenedLists
}

async function shoppingListForId(id, withDependancies = false) {
    let shoppingList = null

    try {
        shoppingList = await ShoppingList.findOne({ userId: id })

        if (shoppingList && withDependancies) {
            shoppingList = await shoppingList.populate('entries')
        }
    } catch (error) {
        throw new Error(error)
    }

    return shoppingList
}

module.exports = router
