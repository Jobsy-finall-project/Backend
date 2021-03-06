const { User, validateUser } = require("../models/user");
const { Cv } = require("../models/cv");
const bcrypt = require("bcrypt");
const { createCompany } = require("./company");
const mongoose = require("mongoose");
const { Position } = require("../models/position");

async function createUser(user) {
  const { error } = validateUser(user);
  if (error) throw new Error(error.details[0].message);

  let new_user = null;
  new_user = await User.findOne({ email: user.email });
  if (new_user) throw new Error("this email is already exist.");

  new_user = await User.findOne({ userName: user.userName });
  if (new_user) throw new Error("this user name is already exist.");

  new_user = new User({
    firstName: user.firstName,
    lastName: user.lastName,
    userName: user.userName,
    email: user.email,
    password: user.password,
    role: user.role,
    applications: [],
    cvs: []
  });
  if (user.role.toLowerCase() === "hr") {
    try {
      const inserted_company = await createCompany(user.company);
      new_user.company = inserted_company._doc._id;
    } catch (err) {
      throw new Error("cant insert company");
    }
  }

  const salt = await bcrypt.genSalt(10);
  new_user.password = await bcrypt.hash(new_user.password, salt);

  inserted_user = await new_user.save();
  const token = inserted_user.generateAuthToken();
  return { token, inserted_user };
}

function performIntersection(arr1, arr2) {
  const intersectionResult = arr1.filter(x => arr2.indexOf(x) !== -1);
  return intersectionResult;
}

async function intersectionTags(userId, positionId, cvId) {
  //const curUser = await User.findById(userId).populate("cvs");
  const cv = await Cv.findById(cvId);
  const userTags = cv.tags;
  const curPosition = await Position.findById(positionId);
  const positionTags = curPosition._doc.tags;
  const result = performIntersection(userTags, positionTags);
  return result;
}

module.exports = { createUser, intersectionTags };
