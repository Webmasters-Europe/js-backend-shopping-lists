const { readFileSync, writeFileSync } = require('fs')

function saveShoppingListFor(userId, list, database = 'database.json') {
    let databaseObject = loadDataObject(database)

    databaseObject = addToList(userId, list, databaseObject)

    saveDataObject(databaseObject, database)
}

function readShoppingListOf(userId, database = 'database.json') {
    return loadDataObject(database)[userId] || ''
}

function removeShoppingListEntryFor(userId, entry = '', database = 'database.json') {
    let databaseObject = loadDataObject(database)

    databaseObject = removeFromList(userId, entry, databaseObject)

    saveDataObject(databaseObject, database)
}

function updateShopingListFor(userId, list = '', database = 'database.json') {
    let databaseObject = loadDataObject(database)

    databaseObject = removeFromList(userId, '', databaseObject)
    if (list) databaseObject = addToList(userId, list, databaseObject)

    saveDataObject(databaseObject, database)
}

function loadDataObject(database) {
    const data = readFileSync(database)

    const FALLBACK_VALUE = '{}'

    return JSON.parse(data.byteLength > 0 ? data : FALLBACK_VALUE)
}

function addToList(userId, list, databaseObject) {
    databaseObject[userId] = databaseObject[userId] ? databaseObject[userId].concat(`, ${list}`) : list
    return databaseObject
}

function saveDataObject(dataObject, database) {
    writeFileSync(database, JSON.stringify(dataObject))
}

function removeFromList(userId, entry, databaseObject) {
    if (!databaseObject[userId] || !databaseObject[userId].includes(entry)) return databaseObject

    if (entry) {
        databaseObject[userId] = databaseObject[userId]
            .split(', ')
            .filter((elem) => elem !== entry)
            .join(', ')
    } else {
        delete databaseObject[userId]
    }

    return databaseObject
}

module.exports = {
    saveShoppingListFor,
    readShoppingListOf,
    updateShopingListFor,
    removeShoppingListEntryFor,
}
