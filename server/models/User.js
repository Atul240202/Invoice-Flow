const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Invalid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    buisnessName: {
        type: String
    },
    phone: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/,
        unique: true
    },
    twoFAEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorCode: String,
    twoFactorExpires: Date,
}, {timestamps: true });

userSchema.pre('save', async function (next){
    if(!this.isModified('password')){
        return next();
    }
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);