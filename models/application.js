const mongoose = require("mongoose");
const { positionSchema } = require("./position");
const { stepSchema } = require("./step");
const Joi = require("joi");

const applicationSchema = new mongoose.Schema({
  isFavorite: Boolean,
  isActive: Boolean,
  position: {
    type: positionSchema,
    required: true
  },
  cvFiles: [String],
  reletedEmails: [String],
  comments: [String],
  track: [stepSchema]
});

const Application = mongoose.model("Application", applicationSchema);

function validateApplication(application) {
  const schema = Joi.object({
    isFavorite: Joi.boolean().default(false),
    isActive: Joi.boolean().default(true),
    position: Joi.required(),
    cvFiles: Joi.array(),
    reletedEmails: Joi.array(),
    comments: Joi.array(),
    track: Joi.array()
  });

  return schema.validate(application);
}

module.exports = { Application, applicationSchema, validateApplication };
