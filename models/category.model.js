const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');
const removeAccents = require('remove-accents');

const categorySchema = new Schema({
    _id: { type: String, default: uuidv4, required: true },

    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },

    description: { type: String, default: null, trim: true },

    isPublic: { type: Boolean, default: true },

}, {
    versionKey: false,
    timestamps: true
});

categorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        const noAccentName = removeAccents(this.name);
        this.slug = slugify(noAccentName, { lower: true, strict: true });
    }
    next();
});

module.exports = mongoose.model('category', categorySchema, 'categories');
