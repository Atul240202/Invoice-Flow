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
    businessName: {
        type: String
    },
    phone: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/,
        unique: true
    },
    address: {
    type: String
    },
    gstin: { type: String },
    pan: { type: String },
    businessType: { type: String },
    businessAddress: { type: String },
    twoFAEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorCode: String,
    twoFactorExpires: Date,
    defaultShippingFrom: {
       businessName: String,
       address: String,
       city: String,
       state: String,
       country: String,
    },
    defaultBillFrom: {
      country: String,
      businessName: String,
      address: String,
      city: String,
      pincode: String,
      state: String,
      phone: String,
      email: String,
      pan: String,
      gstin: String,
      customFields: [
      {
        label: String,
        value: String
       }
       ]
    },
    gstConfig: {
       taxType: { type: String, enum: ['GST', 'None'], default: 'None' },
       placeOfSupply: { type: String },
       gstType: { type: String, enum: ['CGST+SGST', 'IGST'], default: '' },
       gstin: { type: String },
       pan: { type: String },
    },
    bankDetails: {
  accountHolderName: String,
  accountNumber: String,
  bankName: String,
  accountType: { type: String, enum: ["Saving", "Current", "Savings"] }, 
  currency: String,
},
upiDetails: {
  upiId: String,
},
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