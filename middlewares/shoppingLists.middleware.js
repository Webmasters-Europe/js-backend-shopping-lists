const User = require('../models/user')

async function usernameAvailable(req, res, next) {
    const { username } = req.body
    const existingUser = await User.findOne({ username })
    if (existingUser) {
        res.json({ error: 'Username already taken' })
        return
    }
    next()
}

async function createIdForList(req, res, next) {
    const { userId } = req.body
    let potentialId
    let idInvalid
    do {
        potentialId = makeSixDigits(randomId())
        idInvalid = await idExists(potentialId, userId)
    } while (idInvalid)
    req.body.id = potentialId
    next()
}

async function checkListId(req, res, next) {
    const { userId, listId } = req.params

    const usersLists = await completeListsFor(userId)
    if (!usersLists || usersLists.length === 0) {
        res.status(404).json({ error: 'No lists found for user' })
        return
    }

    const targetList = usersListForId(listId, usersLists)
    if (!targetList || targetList.length === 0) {
        res.status(404).json({ error: 'Selected list not found' })
        return
    }

    req.list = targetList

    next()
}

async function checkEntryName(req, res, next) {
    const { entryName } = req.params
    const { list } = req

    const targetEntry = entryWithName(entryName, list)
    if (!targetEntry) {
        res.status(404).json({ error: 'Selected entry not found' })
        return
    }

    req.entry = targetEntry

    next()
}

async function allLists(req, res, next) {
    const { userId } = req.params

    const usersLists = await completeListsFor(userId)
    if (!usersLists || usersLists.length === 0) {
        res.status(404).json({ error: 'No lists found for user' })
        return
    }

    req.lists = usersLists

    next()
}

// --------------------------------- helper ---------------------------------

async function idExists(id, userId) {
    const { lists } = await User.findOne({ _id: userId })
    return lists.some((objectId) => {
        objectId.toHexString() === id
    })
}

function randomId() {
    return String(Math.floor(Math.random() * 1000000))
}

function makeSixDigits(num) {
    if (num.length === 6) return num

    return makeSixDigits(`0${num}`)
}

async function completeListsFor(userId) {
    const usersLists = (await User.findOne({ _id: userId }).populate('lists')).lists
    for (const index in usersLists) {
        usersLists[index] = await usersLists[index].populate('entries')
    }
    return usersLists
}

function usersListForId(listId, usersLists) {
    return usersLists.filter((list) => list.shoppingListId === listId)[0]
}

function entryWithName(entryName, targetList) {
    return targetList.entries.filter((entry) => entry.food === entryName)[0]
}

module.exports = {
    usernameAvailable,
    createIdForList,
    checkListId,
    checkEntryName,
    allLists,
}
