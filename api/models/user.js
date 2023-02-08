const { Schema, model, SchemaTypes } = require('mongoose')

const userSchema = new Schema({
    username: {
        index: { unique: true },
        type: String,
        required: true,
        immutable: true,
    },
    password: {
        type: String,
        required: true,
    },
    lists: {
        type: [SchemaTypes.ObjectId],
        required: true,
        ref: 'ShoppingList',
        default: [],
    },
})

module.exports = model('User', userSchema)
