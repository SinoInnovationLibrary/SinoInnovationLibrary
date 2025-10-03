const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');
const removeAccents = require('remove-accents');

const bookSchema = new Schema({
    _id: { type: String, default: uuidv4, required: true },

    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },

    author: { type: String, default: 'Chưa xác định', trim: true },
    publishedDate: { type: Date, default: null },

    coverImage: { type: String, default: null }, // ảnh bìa sách
    description: { type: String, default: null, trim: true }, // mô tả ngắn về sách
    review: { type: String, default: null }, // cảm nhận cá nhân

    categoryId: { type: String, ref: 'category', required: true },

    isPublic: { type: Boolean, default: true },

}, {
    versionKey: false,
    timestamps: true
});

bookSchema.pre('save', function (next) {
    if (this.isModified('title')) {
        const noAccentTitle = removeAccents(this.title);
        this.slug = slugify(noAccentTitle, { lower: true, strict: true });
    }
    next();
});

module.exports = mongoose.model('book', bookSchema, 'books');
