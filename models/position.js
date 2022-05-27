const mongoose = require("mongoose");
const Joi = require("joi");
Joi.ObjectId = require("joi-objectid")(Joi);
const { stepSchema } = require("./step");
const {Step} = require("./step");

const positionSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 75,
    required: true
  },
  description: {
    type: String,
    minlength: 0,
    maxlength: 255
  },
  tags: [String],
  template: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Step",
    required: true
  }],
  hrId:String
});

const Position = mongoose.model("Position", positionSchema);

function validatePosition(position) {
  const schema = Joi.object({
    name: Joi.string()
      .required()
      .min(2)
      .max(75),
    description: Joi.string()
      .min(0)
      .max(255),
    tags: Joi.array(),
    template: Joi.array(),
    hrId: Joi.string()
  });

  return schema.validate(position);
}

module.exports = { Position, positionSchema, validatePosition };
