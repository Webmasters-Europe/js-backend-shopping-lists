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
	if (shoppingList === null) {
		res.status(400).json({ error: 'An error occurred while creating new shopping list.' })
		return
	}

	let newEntriesIds
	try {
		newEntriesIds = await createEntries(list)
		await addEntriesToShoppingList(newEntriesIds, shoppingList)
	} catch (err) {
		res.status(400).json({ error: err.message })
		return
	}
	let user
	try {
		user = await User.findOne({ id: userId })
		await addShoppingListToUser(shoppingList, user)
		shoppingList = await shoppingListForId(id, true)
	} catch (err) {
		res.status(400).json({ error: err.message })
		return
	}

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

router.delete('/:userId/:listId', checkListId, async (req, res) => {
	const list = req.list

	try {
		await list.deleteOne({ id: list.id })
	} catch (err) {
		res.status(400).json({ error: err.message })
		return
	}

	res.json({ message: 'Deleted list successfully' })
})

router.delete('/:userId/:listId/:entryName', [checkListId, checkEntryName], async (req, res) => {
	const entry = req.entry

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
	entriyIds.forEach(entryId => shoppinglist.entries.push(entryId))
	try {
		await shoppinglist.save()
	} catch (err) {
		throw new Error(err)
	}
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
	let list
	try {
		list = withDependancies
			? await ShoppingList.findOne({ userId: id }).populate('entries')
			: await ShoppingList.findOne({ userId: id })
	} catch (err) {
		throw new Error(err)
	}
	return list
}

module.exports = router
