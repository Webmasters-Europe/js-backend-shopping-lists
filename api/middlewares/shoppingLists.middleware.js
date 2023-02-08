const User = require('../models/user')

async function createIdForList(req, res, next) {
    const { userId } = req.body
    let potentialId
    let idInvalid
    do {
        potentialId = makeSixDigits(randomId())
        try {
            idInvalid = await idExists(potentialId, userId)
        } catch (err) {
            res.status(400).json({ error: err.message })
            return
        }
    } while (idInvalid)
    req.body.id = potentialId
    next()
}

async function checkListId(req, res, next) {
    const { userId, listId } = req.params

    let usersLists
    try {
        usersLists = await completeListsFor(userId)
    } catch (err) {
        res.status(400).json({ error: err.message })
        return
    }

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

    let usersLists
    try {
        usersLists = await completeListsFor(userId)
    } catch (err) {
        res.status(400).json({ error: err.message })
        return
    }

    if (!usersLists || usersLists.length === 0) {
        res.status(404).json({ error: 'No lists found for user' })
        return
    }

    req.lists = usersLists

    next()
}

// --------------------------------- helper ---------------------------------

async function idExists(id, userId) {
    let lists
    try {
        lists = (await User.findOne({ _id: userId })).lists
    } catch (err) {
        throw new Error(err)
    }

    return lists.some((objectId) => objectId.toHexString() === id)
}

function randomId() {
    return String(Math.floor(Math.random() * 1000000))
}

function makeSixDigits(num) {
    if (num.length === 6) return num

    return makeSixDigits(`0${num}`)
}

async function completeListsFor(userId) {
    let usersLists
    try {
        usersLists = (await User.findOne({ _id: userId }).populate('lists')).lists
    } catch (err) {
        throw new Error(err)
    }
    for (const index in usersLists) {
        try {
            usersLists[index] = await usersLists[index]?.populate('entries')
        } catch (err) {
            throw new Error(err)
        }
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
    createIdForList,
    checkListId,
    checkEntryName,
    allLists,
}
