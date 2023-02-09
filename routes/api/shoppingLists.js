const express = require('express')
const ShoppingList = require('../../models/shoppingList')
const ShoppingListEntry = require('../../models/shoppingListEntry')
const {
    validId,
    validList,
    idFree,
    idTaken,
    entryExists,
} = require('../../middlewares/shoppingLists.middleware')

const router = express.Router()

router.get('/:id', async (req, res) => {
    const { id } = req.params

    const shoppingList = await shoppingListForId(id, true)

    if (!shoppingList) {
        res.status(404).json({ error: 'The id does not exist.' })
        return
    }

    const shortenedEntries = shortenEntries(shoppingList.entries)

    res.json({ id: shoppingList.userId, entries: shortenedEntries })
})

router.post('/', [validId, validList, idFree], async (req, res) => {
    const { id, list } = req.body

    let shoppingList = await createShoppingList(id)

    if (!shoppingList) {
        res.status(400).json({ error: 'An error occurred while creating new shopping list.' })
        return
    }

    const newEntriesIds = await createEntries(list)

    await addEntriesToShoppingList(newEntriesIds, shoppingList)

    shoppingList = await shoppingListForId(id, true)
    const shortenedEntries = shortenEntries(shoppingList.entries)

    res.json({ id: shoppingList.userId, entries: shortenedEntries })
})

router.patch('/:id', async (req, res) => {
    const { id } = req.params
    const { list } = req.body

    let shoppingList = await shoppingListForId(id, true)
    if (!shoppingList) {
        res.status(404).json({ error: 'No list found for the provided id.' })
        return
    }

    const newEntriesIds = await createEntries(list)
    if (newEntriesIds.length === 0) {
        await ShoppingList.deleteOne({ userId: id })
        res.status(400).json({ error: 'The shopping list must contain items.' })
        return
    }

    const entryIds = await resetEntriesOfList(shoppingList)
    await ShoppingListEntry.deleteMany({ _id: entryIds })

    await addEntriesToShoppingList(newEntriesIds, shoppingList)

    shoppingList = await shoppingListForId(id, true)
    const shortenedEntries = shortenEntries(shoppingList.entries)

    res.json({ id: shoppingList.userId, entries: shortenedEntries })
})

router.delete('/:id', idTaken, async (req, res) => {
    const { id } = req.params

    const shoppingList = await shoppingListForId(id)
    await shoppingList.deleteOne({ userId: id })

    res.status(204).send()
})

router.delete('/:id/:entryName', [idTaken, entryExists], async (req, res) => {
    const { id, entryName } = req.params

    const shoppingList = await shoppingListForId(id, true)

    if (!shoppingList) {
        res.status(404).json({ error: 'The id does not exist.' })
        return
    }

    const entryId = shoppingList.entries.filter(({ food }) => food === entryName.toLowerCase())[0]?.id

    const entryToDelete = await ShoppingListEntry.findOne({ _id: entryId })
    await entryToDelete.remove()

    res.status(204).send()
})

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

async function createShoppingList(id) {
    try {
        return await ShoppingList.create({ userId: id, entries: [] })
    } catch (error) {
        console.log(error)
        return null
    }
}

async function createEntries(list) {
    const entries = []

    try {
        for (const element of list) {
            const entry = await ShoppingListEntry.create({ food: element })
            entries.push(entry._id)
        }
    } catch ({ message }) {
        console.error(message)
    }

    return entries
}

async function addEntriesToShoppingList(entriyIds, shoppinglist) {
    entriyIds.forEach((entryId) => shoppinglist.entries.push(entryId))
    await shoppinglist.save()
}

function shortenEntries(entries) {
    return entries.map((entry) => (entry = { food: entry.food, createdAt: entry.createdAt }))
}

async function resetEntriesOfList(shoppingList) {
    const entryIds = []
    shoppingList.entries.forEach(({ id }) => entryIds.push(id))
    shoppingList.entries = []
    await shoppingList.save()
    return entryIds
}

module.exports = router
