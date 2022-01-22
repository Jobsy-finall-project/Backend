const mongoose = require("mongoose");
const { positionSchema } = require("./position");
const Joi = require("joi");

const companySchema = new mongoose.Schema({
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

const Company = mongoose.model("Company", companySchema);

function validateCompany(company) {
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

module.exports = { Company, companySchema, validateCompany };
