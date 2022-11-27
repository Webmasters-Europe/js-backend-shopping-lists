const { Schema, model } = require('mongoose')

const shoppingListEntrySchema = Schema({
    food: {
        type: String,
        lowercase: true,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true,
    },
})

shoppingListEntrySchema.pre('remove', { document: true, query: false }, async function (next) {
    const list = await model('ShoppingList').findOne({ entries: { $elemMatch: { $eq: this._id } } })
    const newEntries = list.entries.filter((objectIdObj) => objectIdObj.toHexString() !== this.id)

    if (newEntries.length <= 0) {
        await list.remove()
        next()
        return
    }

    list.entries = newEntries
    await list.save()

    next()
})

module.exports = model('ShoppingListEntry', shoppingListEntrySchema)
