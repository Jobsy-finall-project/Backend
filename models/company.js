const mongoose = require("mongoose");
const { positionSchema } = require("./position");
const Joi = require("joi");

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 75,
    unique: true
  },
  description: {
    type: String,
    minlength: 0,
    maxlength: 255
  },
  positions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Position",
    required: true
  }]
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
    positions: Joi.array().optional()
  });

  return schema.validate(company);
}

module.exports = { Company, companySchema, validateCompany };
