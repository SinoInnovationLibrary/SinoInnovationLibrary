const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');
const removeAccents = require('remove-accents');

const userSchema = new Schema({
    _id: { type: String, default: uuidv4, required: true },
    username: {
        type: String,
        trim: true,
        minlength: 5,
        maxlength: 50,
        required: true,
    },
    slug: {
        type: String,
        unique: true,
        index: true,
    },

    email: {
        type: String,
        default: null,
        sparse: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: { type: String, default: null },
    authType: {
        type: String,
        enum: ['email', 'google'],
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    isActive: { type: Boolean, default: true },
    lastLoginIP: { type: String },
    lastLoginAt: { type: Date },
}, {
    timestamps: true,
    versionKey: false,
});

userSchema.pre('save', function (next) {
    if (this.isModified('username')) {
        const noAccentName = removeAccents(this.username);
        this.slug = slugify(noAccentName, { lower: true, strict: true });
    }
    next();
});

module.exports = mongoose.model('user', userSchema, 'users');
