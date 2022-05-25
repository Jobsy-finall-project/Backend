import mongoose from "mongoose";
import Joi from "joi";
Joi.ObjectId = require("joi-objectid")(Joi);
import emailSchema from "./email";

export const stepSchema = new mongoose.Schema({
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
    type: String,
    required: true
  },
  relatedEmails: {
    type: [emailSchema],
    required: true
  },
  comments: [String]
});
export const Step = mongoose.model("Step", stepSchema);

export function validateStep(position) {
  const schema = Joi.object({
    title: Joi.string()
      .required()
      .min(1)
      .max(75),
    description: Joi.string()
      .min(0)
      .max(255),
    time: Joi.required(),
    relatedEmails: Joi.array(),
    comments: Joi.array()
  });

  return schema.validate(position);
}

