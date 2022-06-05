const express = require("express");
const Joi = require("joi");
const { User } = require("../models/user");
const bcrypt = require("bcrypt");


const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password");

  const token = user.generateAuthToken();

  res.send(token);
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .min(10)
      .max(255)
      .lowercase()
      .email(),
    password: Joi.string()
      .required()
      .min(4)
      .max(32)
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,}$/
      )
  });

  return schema.validate(req);
}

module.exports = router;
