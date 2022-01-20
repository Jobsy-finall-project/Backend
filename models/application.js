const mongoose = require("mongoose");
const { positionSchema } = require("./position");

const applicationSchema = new mongoose.Schema({
  isFavorite: Boolean,
  type: Boolean,
  currentStepId: mongoose.Schema.Types.ObjectId,
  position: positionSchema,
  cvFiles: [String],
  reletedEmails: [String],
  comments: [String]
});

const Application = mongoose.model("Application", applicationSchema);

module.exports = { Application, applicationSchema };
