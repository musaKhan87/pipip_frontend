const mongoose = require("mongoose");

const bikeSchema = new mongoose.Schema(
  {
    // Basic Bike Details
    bike_name: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    cc: { type: Number, required: true, min: [0, "Engine displacement cannot be negative"] },

    // Registration
    number_plate: { type: String, required: true, trim: true, uppercase: true },
    bike_colour: { type: String, trim: true },
    bike_owner: { type: String, trim: true },
    fine_owner: { type: String, trim: true },

    // Pricing (Strictly Non-Negative)
    price_per_hour: {
      type: Number,
      required: true,
      min: [0, "Price per hour cannot be negative"],
    },
    price_per_day: {
      type: Number,
      required: true,
      min: [0, "Price per day cannot be negative"],
    },

    // Bike Status
    status: {
      type: String,
      enum: ["available", "booked", "maintenance"],
      default: "available",
      index: true,
    },

    // Documents
    insurance_end_date: { type: Date },
    puc_end_date: { type: Date },

    // Bike Lifecycle
    bike_end_date: { type: Date },

    // Maintenance & Financials
    last_service_date: { type: Date },
    bike_expenses: {
      type: Number,
      default: 0,
      min: [0, "Bike expenses cannot be negative"],
    },

    // Usage
    total_km_run: {
      type: Number,
      default: 0,
      min: [0, "Total km cannot be negative"],
    },

    // Parts Replacement
    last_battery_changed: { type: Date },
    last_tyre_change: { type: Date },

    // GPS Telematics
    gps_installed_date: { type: Date },

    // Media
    image_url: { type: String },
    extra_images: [{ type: String }],

    area_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
      index: true,
    },

    // Soft Delete Flag (Data Preservation)
    is_deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Pre-save normalization: auto-clean and uppercase registration number
bikeSchema.pre("save", function () {
  if (this.number_plate) {
    this.number_plate = this.number_plate.trim().toUpperCase().replace(/\s+/g, "");
  }
});

// 1. Compound Index for Catalog & Admin filtering + sorting
bikeSchema.index(
  { is_deleted: 1, area_id: 1, status: 1, createdAt: -1 },
  { name: "idx_bikes_active_area_status_sort" }
);

// 2. Compound Index for Investor dashboard bike filtering
bikeSchema.index(
  { is_deleted: 1, bike_owner: 1, createdAt: -1 },
  { name: "idx_bikes_owner_sort" }
);

// 3. Partial Unique Index on active number plates (allows reusing plate if old bike soft-deleted)
bikeSchema.index(
  { number_plate: 1 },
  {
    unique: true,
    partialFilterExpression: { is_deleted: { $ne: true } },
    name: "idx_bikes_unique_active_plate",
  }
);

// 4. Text Index for lightning-fast search on bike name, model & number plate
bikeSchema.index(
  { bike_name: "text", model: "text", number_plate: "text" },
  { name: "idx_bikes_text_search" }
);

module.exports = mongoose.model("Bike", bikeSchema);
