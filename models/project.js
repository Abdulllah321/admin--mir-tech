const mongoose = require("mongoose");

// Define a sub-schema for category-specific details
const graphicDetailsSchema = new mongoose.Schema({
  graphicDetail: { type: String },
});

const websiteDetailsSchema = new mongoose.Schema({
  websiteUrl: { type: String },
});

const applicationDetailsSchema = new mongoose.Schema({
  appPlatform: { type: String },
});

const marketingDetailsSchema = new mongoose.Schema({
  campaignDetail: { type: String },
});

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
