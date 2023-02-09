const { Schema, model, SchemaTypes } = require('mongoose')

const shoppingListSchema = new Schema({
    shoppingListId: {
        type: String,
        required: true,
        immutable: true,
        validate: {
            validator: (value) => Number.isInteger(Number(value)) && value.length === 6,
        },
    },
    entries: [
        {
            type: SchemaTypes.ObjectId,
            ref: 'ShoppingListEntry',
        },
    ],
})

shoppingListSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    for (const entry of this.entries) {
        await entry.deleteOne()
    }
    next()
})

shoppingListSchema.pre(['deleteOne', 'remove'], { document: true, query: false }, async function (next) {
    const user = await model('User').findOne({ lists: { $elemMatch: { $eq: this._id } } })
    const newLists = user.lists.filter((objectIdObj) => objectIdObj.toHexString() !== this.id)

    user.lists = newLists
    await user.save()

    next()
})

module.exports = model('ShoppingList', shoppingListSchema)
