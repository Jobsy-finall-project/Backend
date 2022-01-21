const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const express = require("express");
const Joi = require("joi");
Joi.ObjectId = require("joi-objectid")(Joi);
const { User } = require("../models/user");
const { validateApplication } = require("../models/application");

const router = express.Router();
router.use(express.json());

router.post(
  "/",
  auth,
  asyncMiddleware(async (req, res) => {
    let application = {
      isFavorite: req.body.isFavorite,
      isActive: req.body.isActive,
      position: req.body.position,
      cvFiles: req.body.cvFiles,
      reletedEmails: req.body.reletedEmails,
      comments: req.body.comments,
      track: req.body.treck
    };

    const { error } = validateApplication(application);
    if (error) return res.status(400).send(error.details[0].message);

    if (!req.user._id)
      return res.status(404).send("This user is not logged in.");

    const user = await User.findById(req.user._id);

    const length = user.applications.push(application);

    await user.save();

    application = user.applications[length - 1];

    res.send(application);
  })
);

router.get(
  "/:applicationId",
  auth,
  asyncMiddleware(async (req, res) => {
    let application;
    const user = await User.findById(req.user._id);
    if (user && req.params.applicationId && user.applications) {
      application = user.applications.find(
        application => application._id == req.params.applicationId
      );
    }
    return application
      ? res.send(application)
      : user && user.applications
      ? res.status(404).send("The givan application ID is not found")
      : res.status(404).send("This user not exist or no has applications");
  })
);

router.get(
  "/",
  auth,
  asyncMiddleware(async (req, res) => {
    let application;
    const user = await User.findById(req.user._id);
    if (user && user.applications) {
      return res.send(user.applications);
    }
    res.status(404).send("This user not exist or no has applications");
  })
);

router.delete(
  "/:applicationId",
  auth,
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.user._id);
    const application = user.applications.id(req.params.applicationId);
    application.remove();
    await user.save();
    res.send(application);
  })
);

router.put(
  "/:applicationId",
  auth,
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.user._id);
    let application;
    if (user.applications) {
      application = user.applications.find(
        application => application._id == req.params.applicationId
      );
      if (application) {
        application.isFavorite = req.body.isFavorite;
        application.isActive = req.body.isActive;
      }
    }
    await user.save();
    res.send(application);
  })
);

module.exports = router;
