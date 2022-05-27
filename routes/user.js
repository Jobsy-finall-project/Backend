const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const { admin } = require("../middleware/role");
const _ = require("lodash");
const express = require("express");
const { User } = require("../models/user");
const { validateUser } = require("../models/user");
const bcrypt = require("bcrypt");
const {createUser} = require("../services/user");

const router = express.Router();

router.post("/", async (req, res) => {
try {
  const {token, inserted_user} = await createUser(req.body);
  res
      .header("x-auth-token", token)
      .send(_.pick(inserted_user, ["_id", "firstName", "lastName", "userName", "email"]));
}catch (error){
  res.status(400).send(error.message);
}

});

router.get("/", [auth, admin], async (req, res) => {
  const users = await User.find().populate("applications").populate("cvs");
  res.send(users);
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById({ _id: req.user._id }).select("-password");
  if (user) return res.send(user);
  return res.status(404).send("The user with the given token was not found");
});

router.get("/:id", [validateObjectId, auth, admin], async (req, res) => {
  const user = await User.findById({ _id: req.params.id }).select("-password").populate("applications");
  if (user) return res.send(user);
  return res.status(404).send("The user with the given ID was not found");
});

router.put("/", auth, async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let id = await User.findOne({ email: req.body.email }).select("_id");
  if (id && id !== req.user._id)
    return res.status(409).send("this email is already exist.");

  id = null;

  id = await User.findOne({ userName: req.body.userName }).select("_id");
  if (id && id !== req.user._id)
    return res.status(409).send("this user name is already exist.");

  //cv insert to db
  //get cv
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password
        //cvs: [...getCvs, newcv ]
      }
    },
    { new: true }
  ).select("-password");
  res.send(user);
});

router.put("/:id", [validateObjectId, auth, admin], async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let id = await User.findOne({ email: req.body.email }).select("_id");
  if (id && id !== req.params.id)
    return res.status(409).send("this email is already exist.");

  id = null;

  id = await User.findOne({ userName: req.body.userName }).select("_id");
  if (id && id !== req.user._id)
    return res.status(409).send("this user name is already exist.");

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        applications:[],
        cvs:[]
      }
    },
    { new: true }
  ).select("-password");

  if (!user)
    return res.status(404).send("The user with the given ID was not found");

  res.send(user);
});

router.delete("/:id", [validateObjectId, auth, admin], async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.id, { new: true });

  if (!user)
    return res.status(404).send("The user with the given ID was not found");

  return res.send(user);
});

module.exports = router;
