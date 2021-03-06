const jwt = require("jsonwebtoken");
const config = require("config");
const mongoose = require("mongoose");
const { applicationSchema } = require("./application");
const { cvSchema, Cv } = require("./cv");
const Joi = require("joi");

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
    minlength: 4,
    maxlength: 1024
  },
  role: {
    type: String,
    enum: ["Anonymous", "Candidate", "Admin", "HR"],
    default: "Anonymous",
    required: true
  },
  applications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      default: []
    }
  ],
  cvs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cv",
      required: true,
      default: []
    }
  ],
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: false
  }
});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    {
      _id: this._id,
      userName: this.userName,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      email: this.email,
      applications: this.applications,
      cvs: this.cvs,
      company: this.company
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
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
      .min(4)
      .max(32)
      .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,}$/),
    role: Joi.string()
      .required()
      .valid(...Object.values(["Anonymous", "Candidate", "Admin", "HR"])),
    applications: Joi.array(),
    company: Joi.optional()
  });

  return schema.validate(user);
}

module.exports = { User, validateUser };
