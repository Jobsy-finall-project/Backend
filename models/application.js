import mongoose from "mongoose";
import { positionSchema } from "./position");
import { cvSchema } from "./cv";
import { emailSchema } from "./email";
import { stepSchema } from "./step";
import Joi from "joi";

export const applicationSchema = new mongoose.Schema({
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

export const Application = mongoose.model("Application", applicationSchema);

export function validateApplication(application) {
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

