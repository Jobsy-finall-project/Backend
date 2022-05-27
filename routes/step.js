const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const express = require("express");
const { User } = require("../models/user");
const { Application } = require("../models/application");
const { Step } = require("../models/step");
const { validateStep } = require("../models/step");
const { createStep } = require("../services/step");
const {Position} = require("../models/position");


const router = express.Router();
router.use(express.json());

//add step to position
router.post(
    "/:positionId",
    auth,
    asyncMiddleware(async (req, res) => {
        const positionId=req.params.positionId;
        if (!req.user._id)
            res.status(404).send("This user is not logged in.");
        const position= await Position.findById(positionId);
        if(!position)
            res.status(404).send("The position not found");
        const new_step= await createStep(req.body);

        position._doc.template.push(new_step._doc._id);
        position.save();

        res.send(position.populate("template"));
    }));

// router.post(
//   "/:applicationId",
//   auth,
//   asyncMiddleware(async (req, res) => {
//     if (!req.user._id)
//       return res.status(404).send("This user is not logged in.");
//
//     const new_step= await createStep(req.body);
//     let length;
//     let application;
//
//     const user = await User.findById(req.user._id);
//
//     if (req.params.applicationId) {
//       application = user.applications.find(
//         application => application._id == req.params.applicationId
//       );
//
//       if (application) {
//         length = application.track.push(step);
//
//         await user.save();
//       } else {
//         return res.status(404).send("The given application ID was not found.");
//       }
//     } else {
//       return res.status(400).send("Application ID is required.");
//     }
//
//     step = application.track[length - 1];
//
//     res.send(step);
//   })
// );

router.get(
  "/:applicationId/:stepId",
  auth,
  asyncMiddleware(async (req, res) => {
    if (!req.user._id)
      return res.status(404).send("This user is not logged in.");

    let step;

    const user = await User.findById(req.user._id);

    if (user && req.params.stepId && user.applications) {
      application = user.applications.find(
        application => application._id == req.params.applicationId
      );
      step = application.track.find(step => step._id == req.params.stepId);
    }
    return step
      ? res.send(step)
      : application && application.track
      ? res.status(404).send("The givan step ID was not found")
      : res
          .status(404)
          .send("This application is not exist or it has no track");
  })
);

router.get(
  "/:applicationId",
  auth,
  asyncMiddleware(async (req, res) => {
    if (!req.user._id)
      return res.status(404).send("This user is not logged in.");

    const user = await User.findById(req.user._id);
    let application;

    if (user && user.applications) {
      application = user.applications.find(
        application => application._id == req.params.applicationId
      );
    }
    return application
      ? application.track
        ? res.send(application.track)
        : res.status(404).send("The givan application ID was not found")
      : res.status(404).send("This application has no track");
  })
);

router.delete(
  "/:applicationId/:stepId",
  auth,
  asyncMiddleware(async (req, res) => {
    let step;
    let application;
    const user = await User.findById(req.user._id);
    if (user) {
      application = user.applications.id(req.params.applicationId);
      if (application) {
        step = application.track.id(req.params.stepId);
        step.remove();
        await user.save();
        res.send(step);
      } else {
        res.status(404).send("The givan company ID was not found");
      }
    }
  })
);

router.put(
  "/:applicationId/:stepId",
  auth,
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.user._id);
    let application;
    let step;
    if (user) {
      if (user.applications) {
        application = user.applications.find(
          application => application._id == req.params.applicationId
        );
        if (application) {
          step = application.track.find(step => step._id == req.params.stepId);
          if (step) {
            step.title = req.body.title;
            step.description = req.body.description;
            step.relatedEmails = req.params.relatedEmails;
            step.comments = req.params.comments;

            await user.save();
            res.send(step);
          } else {
            res.status(404).send("The givan step ID was not found");
          }
        } else {
          res.status(404).send("The givan application ID was not found");
        }
      } else {
        res.status(404).send("This user was not have applications");
      }
    } else {
      res.status(404).send("The givan user ID was not found");
    }
  })
);

module.exports = router;
