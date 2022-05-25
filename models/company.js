import mongoose from "mongoose";
import { positionSchema }from "./position";
import Joi from "joi";

export const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 75
  },
  description: {
    type: String,
    minlength: 0,
    maxlength: 255
  },
  positions: {
    type: [positionSchema]
  }
});

export const Company = mongoose.model("Company", companySchema);

export function validateCompany(company) {
  const schema = Joi.object({
    name: Joi.string()
      .required()
      .min(2)
      .max(75),
    description: Joi.string()
      .min(0)
      .max(255),
    positions: Joi.array()
  });

  return schema.validate(company);
}

