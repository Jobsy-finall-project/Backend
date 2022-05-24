const mongoose = require("mongoose");
const Joi = require("joi");

const emailSchema = new mongoose.Schema({
  title: String,
  from: String,
  body: String,
});

const Email = mongoose.model("Email", emailSchema);

function validateEmail(email) {
  const schema = Joi.object({
    title: Joi.string(),
    from: Joi.string(),
    body: Joi.string(),
  });

  return schema.validate(email);
}

module.exports = { Email, emailSchema, validateEmail };