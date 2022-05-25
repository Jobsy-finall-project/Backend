import validateObjectId from "../middleware/validateObjectId";
import auth from "../middleware/auth";
import { admin } from "../middleware/role";
import _ from "lodash";
import express from "express";
import { User } from "../models/user";
import { validateUser } from "../models/user";
import bcrypt from "bcrypt";
import {UserService} from "../services/user";

const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);
const userService= new UserService();
  let {new_user,token}=await userService.createUser(req.body);
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "firstName", "lastName", "userName", "email"]));
});

router.get("/", [auth, admin], async (req, res) => {
  const users = await User.find();
  res.send(users);
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById({ _id: req.user._id }).select("-password");
  if (user) return res.send(user);
  return res.status(404).send("The user with the given token was not found");
});

router.get("/:id", [validateObjectId, auth, admin], async (req, res) => {
  const user = await User.findById({ _id: req.params.id }).select("-password");
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

  id = await User.findOne({ email: req.body.userName }).select("_id");
  if (id && id !== req.user._id)
    return res.status(409).send("this user name is already exist.");

  if (req.body.fakeEmail !== undefined) {
    id = null;
    id = await User.findOne({ email: req.body.fakeEmail }).select("_id");
    if (id && id !== req.user._id)
      return res.status(409).send("this fake email is already exist.");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
        fakeEmail: req.body.fakeEmail
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

  id = await User.findOne({ email: req.body.userName }).select("_id");
  if (id && id !== req.user._id)
    return res.status(409).send("this user name is already exist.");

  if (req.body.fakeEmail !== undefined) {
    id = null;
    id = await User.findOne({ email: req.body.fakeEmail }).select("_id");
    if (id && id !== req.user._id)
      return res.status(409).send("this fake email is already exist.");
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
        fakeEmail: req.body.fakeEmail,
        role: req.body.role
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

export default router;
