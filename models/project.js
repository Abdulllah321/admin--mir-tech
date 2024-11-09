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

// Main Project schema
const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["graphic", "website", "application", "marketing"],
      required: true,
    },
    imageUrl: { type: String },
    details: {
      type: mongoose.Schema.Types.Mixed, // Use Mixed type for flexible data structure
      required: true,
      validate: {
        validator: function (value) {
          // Validation to ensure correct sub-schema for each category
          if (this.category === "graphic" && !value.graphicDetail) {
            return false;
          }
          if (this.category === "website" && !value.websiteUrl) {
            return false;
          }
          if (this.category === "application" && !value.appPlatform) {
            return false;
          }
          if (this.category === "marketing" && !value.campaignDetail) {
            return false;
          }
          return true;
        },
        message: "Details are missing or invalid for the selected category",
      },
    },
  },
  { timestamps: true }
);

// Apply sub-schemas as per the category
projectSchema.virtual("graphicDetails", {
  ref: "GraphicDetail",
  localField: "details",
  foreignField: "_id",
  justOne: true,
});

projectSchema.virtual("websiteDetails", {
  ref: "WebsiteDetail",
  localField: "details",
  foreignField: "_id",
  justOne: true,
});

projectSchema.virtual("applicationDetails", {
  ref: "ApplicationDetail",
  localField: "details",
  foreignField: "_id",
  justOne: true,
});

projectSchema.virtual("marketingDetails", {
  ref: "MarketingDetail",
  localField: "details",
  foreignField: "_id",
  justOne: true,
});

// Create model for each type of details
const GraphicDetail = mongoose.model("GraphicDetail", graphicDetailsSchema);
const WebsiteDetail = mongoose.model("WebsiteDetail", websiteDetailsSchema);
const ApplicationDetail = mongoose.model(
  "ApplicationDetail",
  applicationDetailsSchema
);
const MarketingDetail = mongoose.model(
  "MarketingDetail",
  marketingDetailsSchema
);

module.exports = {
  Project: mongoose.model("Project", projectSchema),
  GraphicDetail,
  WebsiteDetail,
  ApplicationDetail,
  MarketingDetail,
};
