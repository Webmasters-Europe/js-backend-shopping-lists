const ShoppingList = require('../models/shoppingList')

function validId(req, res, next) {
	const id = req.body?.id || req.params?.id
	if (!(typeof id === 'string' && id.trim().length === 6 && !Number.isNaN(Number(id)))) {
		res.status(422).json({ error: 'Invalid UserID' })
		return
	}
	next()
}

function validList(req, res, next) {
	let list = req.body?.list|| req.params?.list
	list = list
		.split(',')
		.map(elem => String(elem).trim())
		.filter(elem => elem !== '')
	if (list.length <= 0) {
		res.status(422).json({ error: 'List does not contain valid items' })
		return
	}
	req.body.list ? (req.body.list = list) : (req.params.list = list)
	next()
}

async function idFree(req, res, next) {
	const id = req.body?.id || req.params?.id
	if (await idExists(id)) {
		res.status(409).json({ error: 'The id is already taken.' })
		return
	}
	next()
}

async function idTaken(req, res, next) {
	const id = req.body?.id || req.params?.id
	if (!(await idExists(id))) {
		res.status(404).json({ error: 'The id does not exist.' })
		return
	}
	next()
}

async function entryExists(req, res, next) {
	const id = req.body?.id || req.params?.id
	const { entryName } = req.params

	const shoppingList = await shoppingListForId(id, true)
	const entryId = shoppingList.entries.filter(({ food }) => food === entryName.toLowerCase())[0]?.id

	if (entryId === undefined) {
		res.status(404).json({ error: 'The element does not exist.' })
		return
	}

	next()
}

// --------------------------------- helper ---------------------------------
async function shoppingListForId(id, withDependancies = false) {
    let shoppingList = await ShoppingList.findOne({ userId: id })

    if (withDependancies) {
        shoppingList = shoppingList.populate('entries')
    }

    return shoppingList
}

async function idExists(id) {
	let shoppingList = await shoppingListForId(id)
	return shoppingList !== null
}

module.exports = {
	validId,
	validList,
	idFree,
	idTaken,
	entryExists,
}
