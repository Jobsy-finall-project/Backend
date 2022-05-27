const mongoose = require("mongoose");
const Joi = require("joi");
Joi.ObjectId = require("joi-objectid")(Joi);
const { emailSchema } = require("./email");

const stepSchema = new mongoose.Schema({
  title: {
    type: String,
    minlength: 1,
    maxlength: 75,
    required: true
  },
  description: {
    type: String,
    minlength: 0,
    maxlength: 255
  },
  time: {
    type: Date,
    required: true
  },
  comments: [String]
});
const Step = mongoose.model("Step", stepSchema);

function validateStep(step) {
  const schema = Joi.object({
    title: Joi.string()
      .required()
      .min(1)
      .max(75),
    description: Joi.string()
      .min(0)
      .max(255),
    time: Joi.required(),
    comments: Joi.array()
  });

  return schema.validate(step);
}

module.exports = { Step, stepSchema, validateStep };
