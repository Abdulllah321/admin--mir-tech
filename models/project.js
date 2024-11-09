const mongoose = require("mongoose");


const projectSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    category: {
      type: String,
      enum: ["graphic", "website", "application", "marketing"],
      required: true,
    },
    imageUrl: { type: String },
    details: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
