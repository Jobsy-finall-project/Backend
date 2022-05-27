const mongoose = require("mongoose");
const Joi = require("joi");

const cvSchema = new mongoose.Schema({
  title: String,
  cvFile: String,
  tags: [String],
});

const Cv = mongoose.model("Cv", cvSchema);

function validateCv(cv) {
  const schema = Joi.object({
    title: Joi.string(),
    cvFile: Joi.string(),
    tags: Joi.array().optional(),
  });

  return schema.validate(cv);
}

module.exports = { Cv, cvSchema, validateCv };
