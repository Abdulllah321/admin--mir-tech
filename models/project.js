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
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ["graphic", "website", "application", "marketing"],
      required: true,
    },
    imageUrl: { type: String },
    details: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

projectSchema.pre("save", function (next) {
  const project = this;
  switch (project.category) {
    case "graphic":
      project.details = { graphicDetail: project.details.graphicDetail || "" };
      break;
    case "website":
      project.details = { websiteUrl: project.details.websiteUrl || "" };
      break;
    case "application":
      project.details = { appPlatform: project.details.appPlatform || "" };
      break;
    case "marketing":
      project.details = {
        campaignDetail: project.details.campaignDetail || "",
      };
      break;
    default:
      project.details = {};
  }
  next();
});

module.exports = mongoose.model("Project", projectSchema);
