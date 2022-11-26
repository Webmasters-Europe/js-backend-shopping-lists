const express = require('express')
const ShoppingList = require('../../Models/shoppingList')
const ShoppingListEntry = require('../../Models/shoppingListEntry')

const router = express.Router()

router.get('/:id', async (req, res) => {
	const { id } = req.params

	const shoppingList = await shoppingListForId(id, true)
	if (shoppingList === null) {
		res.status(404).json({ error: 'The id does not exist.' })
		return
	}

	const shortenedEntries = shortenEntries(shoppingList.entries)

	res.json({ id: shoppingList.userId, entries: shortenedEntries })
})

router.post('/', async (req, res) => {
	const { id, list } = req.body

	let shoppingList = await shoppingListForId(id)
	if (shoppingList !== null) {
		res.status(409).json({ error: 'The id is already taken.' })
		return
	}

	shoppingList = await createShoppingList(id)
	if (shoppingList === null) {
		res.status(400).json({ error: 'An error occurred while creating new shopping list.' })
		return
	}

	const newEntriesIds = await createEntries(list)
	if (newEntriesIds.length === 0) {
		await ShoppingList.deleteOne({ userId: id })
		res.status(400).json({ error: 'The shopping list must contain items.' })
		return
	}

	await addEntreisToShoppingList(newEntriesIds, shoppingList)

	shoppingList = await shoppingListForId(id, true)
	const shortenedEntries = shortenEntries(shoppingList.entries)

	res.json({ id: shoppingList.userId, entries: shortenedEntries })
})

router.patch('/:id', async (req, res) => {
	const { id } = req.params
	const { list } = req.body

	let shoppingList = await shoppingListForId(id, true)
	if (shoppingList === null) {
		res.status(409).json({ error: 'No list fond for the provided id.' })
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

	await addEntreisToShoppingList(newEntriesIds, shoppingList)

	shoppingList = await shoppingListForId(id, true)
	const shortenedEntries = shortenEntries(shoppingList.entries)

	res.json({ id: shoppingList.userId, entries: shortenedEntries })
})

router.delete('/:id', async (req, res) => {
	const { id } = req.params

	const shoppingList = await shoppingListForId(id)
	if (shoppingList === null) {
		res.status(404).json({ error: 'The id does not exist.' })
		return
	}

	await shoppingList.deleteOne({ userId: id })

	res.status(204).json()
})

router.delete('/:id/:entryName', async (req, res) => {
	const { id, entryName } = req.params

	const shoppingList = await shoppingListForId(id, true)
	if (shoppingList === null) {
		res.status(404).json({ error: 'The id does not exist.' })
		return
	}

	const entryId = shoppingList.entries.filter(({ food }) => food === entryName.toLowerCase())[0]?.id

	if (entryId === undefined) {
		res.status(404).json({ error: 'The element does not exist.' })
		return
	}

	const entryToDelete = await ShoppingListEntry.findOne({ _id: entryId })
	await entryToDelete.remove()

	res.status(204).json()
})

async function shoppingListForId(id, withDependancies = false) {
	return withDependancies
		? await ShoppingList.findOne({ userId: id }).populate('entries')
		: await ShoppingList.findOne({ userId: id })
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
		for (const element of list.split(',').map(elem => elem.trim())) {
			const entry = await ShoppingListEntry.create({ food: element })
			entries.push(entry._id)
		}
	} catch ({ message }) {
		console.error(message)
	}

	return entries
}

async function addEntreisToShoppingList(entriyIds, shoppinglist) {
	entriyIds.forEach(entryId => shoppinglist.entries.push(entryId))
	await shoppinglist.save()
}

function shortenEntries(entries) {
	return entries.map(entry => (entry = { food: entry.food, createdAt: entry.createdAt }))
}

async function resetEntriesOfList(shoppingList) {
	const entryIds = []
	shoppingList.entries.forEach(({ id }) => entryIds.push(id))
	shoppingList.entries = []
	await shoppingList.save()
	return entryIds
}

module.exports = router
