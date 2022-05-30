const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const express = require("express");
const Joi = require("joi");
Joi.ObjectId = require("joi-objectid")(Joi);
const { User } = require("../models/user");
const { validateApplication, Application } = require("../models/application");
const {Position, validatePosition} = require("../models/position");
const {Cv} = require("../models/cv");
const {createPosition} = require("../services/position");
const {createCompany} = require("../services/company");
const {createApplication, getAllApplicationsByUserId, getApplicationById, deleteApplicationById} = require("../services/application");


const router = express.Router();
router.use(express.json());

router.post(
  "/:companyId",
  auth,
  asyncMiddleware(async (req, res) => {
      if (!req.user._id)
          return res.status(404).send("This user is not logged in.");

      const inserted_application= await createApplication(req.body,req.user._id,req.params.companyId );

    res.send(inserted_application);
  })
);

router.get(
  "/:applicationId",
  auth,
  asyncMiddleware(async (req, res) => {
    const application = await getApplicationById(req.params.applicationId);
    res.send(application);

  }));

router.get(
  "/",
  auth,
  asyncMiddleware(async (req, res) => {
    const applications= await getAllApplicationsByUserId(req.user._id);
    res.send(applications);
  })
);

router.delete(
  "/:applicationId",
  auth,
  asyncMiddleware(async (req, res) => {
    const application = await deleteApplicationById(req.params.applicationId,req.user._id);
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
