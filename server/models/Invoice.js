const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  item: String,
  gstRate: Number,
  quantity: Number,
  rate: Number,
  amount: {
    type: Number,
    default: 0,
  },
  cgst: Number,
  sgst: Number,
  igst: Number,
  total: Number
});

const reqIfNotClient = function(){
  return !this.billToDetail;
}

const invoiceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    invoiceNumber: {
        type: String,
        required: true
    },
    invoiceDate: Date,
    dueDate: Date,
    businessLogo: String,
    billFrom: {
        country: String, businessName: String, phone: String,
        gstin: String, address: String, city: String, pincode: String,
        state: String, email: String, pan: String,
        customFields: [
      {
        label: String,
        value: String
      }
    ]
    },
    billTo: {
      country: { 
        type: String, required: reqIfNotClient 
      },
      businessName: { 
        type: String, required: reqIfNotClient 
      },
      phone: { 
        type: String, required: reqIfNotClient 
      },
      gstin:{ 
        type: String 
      },           
     address: { 
      type: String, required: reqIfNotClient 
    },
    city:{
       type: String, required: reqIfNotClient 
    },
    pincode:{ 
      type: String, required: reqIfNotClient 
    },
    state:{ 
      type: String, required: reqIfNotClient
    },
    email:{
       type: String, required: reqIfNotClient 
    },
    pan:{ 
      type: String 
    },
    customFields: [
    { label: String, value: String }
    ]
    },
    billToDetail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: false
    },
    shipping: {
        shippedFrom: {
            businessName: String, country: String, address: String,
            city: String, state: String
        },
        shippedTo: {
            businessName: String, country: String, address: String,
            city: String, state: String
        }
    },
    gstConfig: {
        taxType: String,
        placeOfSupply: String,
        gstType: String
    },
    currency: String,
    items: [itemSchema],
    summary: {
        subtotal: Number,
        cgst: Number,
        sgst: Number,
        discount: Number,
        totalAmount: Number
    },
    additionalOptions: {
        signature: String,
        terms: String,
        notes: String,
        attachments: [String],
        contactDetails: String,
        qrImage: String,
        additionalInfo: String
    },
    status: {
        type: String,
        default: "draft"
    },
    bankDetails: {
       country: String,
       bankName: String,
       accountNumber: String,
       accountHolderName: String,
       accountType: { 
        type: String, enum: ["Saving", "Current"] 
       },
       currency: String,
    },
    upiDetails: {
       upiId: String
    },
  createdAt: { type: Date, default: Date.now }
}, {timestamps: true})

const Invoice = mongoose.model("Invoice", invoiceSchema); 

module.exports = Invoice;