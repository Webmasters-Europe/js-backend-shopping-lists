const { Schema, model, SchemaTypes } = require('mongoose')

const shoppingListSchema = new Schema({
    userId: {
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
    await model('ShoppingListEntry').deleteMany({ shoppingListSchema: this._id })
    next()
})

module.exports = model('ShoppingList', shoppingListSchema)
