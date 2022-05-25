import mongoose from "mongoose";
import Joi from "joi";

export const emailSchema = new mongoose.Schema({
  title: String,
  from: String,
  body: String,
});

export const Email = mongoose.model("Email", emailSchema);

export function validateEmail(email) {
  const schema = Joi.object({
    title: Joi.string(),
    from: Joi.string(),
    body: Joi.string(),
  });

  return schema.validate(email);
}
