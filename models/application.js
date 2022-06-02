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
    type: mongoose.Schema.Types.ObjectId,
    ref:"Position",
    required: true
  },
  cvFiles: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"Cv",
    required: false
  },
  comments: [String],
  steps: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Step",
    required: true
  }],
  company:  {
    type: mongoose.Schema.Types.ObjectId,
    ref:"Company",
    required: false
  },
});

const Application = mongoose.model("Application", applicationSchema);

function validateApplication(application) {
  const schema = Joi.object({
    isFavorite: Joi.boolean().default(false),
    isActive: Joi.boolean().default(true),
    isMatch: Joi.boolean().default(false),
    position: Joi.required(),
    cvFiles: Joi.optional(),
    comments: Joi.array(),
    steps: Joi.array(),
    company: Joi.optional()
  });

  return schema.validate(application);
}

module.exports = { Application, applicationSchema, validateApplication };
