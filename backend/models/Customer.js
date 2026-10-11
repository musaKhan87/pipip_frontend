// // models/Customer.js
// const mongoose = require("mongoose");

// const customerSchema = new mongoose.Schema(
//   {
//     name: String,
//     phone: String,
//     email: String,
//     address: String,
//     id_proof_type: String,
//     id_proof_number: String,
//     aadhaar_image_url: String,
//     license_image_url: String,
//   },
//   { timestamps: true }
// );



// const customerSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     phone: { type: String, required: true, unique: true },
//     email: { type: String, default: null },
//     address: String,
//     id_proof_type: String,
//     id_proof_number: String,
//     aadhaar_image_url: { type: String, required: true },
//     license_image_url: { type: String, required: true },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Customer", customerSchema);


// models/Customer.js
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: null },
    address: String,
    id_proof_type: String,
    id_proof_number: String,
    // Keep these for existing data/logic
    aadhaar_image_url: { type: String }, 
    license_image_url: { type: String },
    // New field for multiple docs
    extra_documents: { type: [String], default: [] },
    area_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
      default: null,
    },
  },
  { timestamps: true },
);

customerSchema.index({ phone: 1 });
customerSchema.index({ name: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ area_id: 1 });
customerSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Customer", customerSchema);