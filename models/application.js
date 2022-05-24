const mongoose = require("mongoose");
const { positionSchema } = require("./position");
const { cvSchema } = require("./cv");
const { emailSchema } = require("./email");
const { stepSchema } = require("./step");
const Joi = require("joi");

const applicationSchema = new mongoose.Schema({
  isFavorite: Boolean,
  isActive: Boolean,
  isMatch:Boolean,
  position: {
    type: positionSchema,
    required: true
  },
  cvFiles: {
    type: [cvSchema],
    required: true
  },
  reletedEmails: {
    type: [emailSchema],
    required: true
  },
  comments: [String],
  steps: [stepSchema],
  companyName: String
});

const Application = mongoose.model("Application", applicationSchema);

function validateApplication(application) {
  const schema = Joi.object({
    isFavorite: Joi.boolean().default(false),
    isActive: Joi.boolean().default(true),
    isMatch: Joi.boolean().default(false),
    position: Joi.required(),
    cvFiles: Joi.array(),
    reletedEmails: Joi.array(),
    comments: Joi.array(),
    steps: Joi.array(),
    companyName: Joi.string()
  });

  return schema.validate(application);
}

module.exports = { Application, applicationSchema, validateApplication };
