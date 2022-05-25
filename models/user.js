import jwt from "jsonwebtoken";
import config from "config";
import mongoose from "mongoose";
import { applicationSchema } from "./application";
import { cvSchema } from "./cv";

import Joi from "joi";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50
  },
  userName: {
    type: String,
    unique: true,
    required: true,
    minlength: 2,
    maxlength: 50,
    lowercase: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    minlength: 10,
    maxlength: 255,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 1024
  },
  role: {
    type: String,
    enum: ["Anonymous", "User", "Admin", "HR"],
    default: "Anonymous",
    required: true
  },
  applications: {
    type: [applicationSchema],
    required: true
  },
  cvs: {
    type: [cvSchema],
    required: true
  }
});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    { _id: this._id, role: this.role },
    config.get("jwtPrivateKey")
  );
  return token;
};

export const User = mongoose.model("User", userSchema);

export function validateUser(user) {
  const schema = Joi.object({
    firstName: Joi.string()
      .required()
      .min(2)
      .max(50),
    lastName: Joi.string()
      .required()
      .min(2)
      .max(50),
    userName: Joi.string()
      .required()
      .min(2)
      .max(50)
      .lowercase(),
    email: Joi.string()
      .required()
      .min(10)
      .max(255)
      .lowercase()
      .email(),
    password: Joi.string()
      .required()
      .min(8)
      .max(32)
      .regex(
        /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@$%^&{}:;<>,.?~_+-]).{8,32}$/
      ),
    role: Joi.string()
      .required()
      .valid(...Object.values(["Anonymous", "User", "Admin"]))
  });

  return schema.validate(user);
}


