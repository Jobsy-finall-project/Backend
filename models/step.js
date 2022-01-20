const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema({
  title: {
    type: String,
    minlength: 1,
    maxlength: 255,
    required: true
  },
  description: {
    type: String,
    minlength: 1,
    maxlength: 255
  },
  time: {
    type: String,
    required: true
  },
  relatedEmails: [String],
  comments: [String]
});
const Step = mongoose.model("Step", stepSchema);
module.exports = { Step, stepSchema };
