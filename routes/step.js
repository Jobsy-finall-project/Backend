const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const express = require("express");
const { User } = require("../models/user");
const { Application } = require("../models/application");
const { Step } = require("../models/step");
const { validateStep } = require("../models/step");
const { createStep, createStepAndAddToPosition, createStepAndAddToApplication, getStep, getStepById, updateStepById} = require("../services/step");
const {Position} = require("../models/position");
const {addComment} = require("../services/step");
const {updatePositionById} = require("../services/position");


const router = express.Router();
router.use(express.json());


router.post(
    "/position/:positionId",
    auth,
    asyncMiddleware(async (req, res) => {
        const positionId=req.params.positionId;
        if (!req.user._id)
            res.status(404).send("This user is not logged in.");
        let new_step;
       try {
           new_step = await createStepAndAddToPosition(req.body, positionId);
       }catch (error){
           res.send(error);
       }
        res.send(new_step);
    }));

router.post(
  "/application/:applicationId",
  auth,
  asyncMiddleware(async (req, res) => {
      const applicationId = req.params.applicationId;
      if (!req.user._id)
          res.status(404).send("This user is not logged in.");
      let new_step;
      try {
          new_step = await createStepAndAddToApplication(req.body, applicationId);
      } catch (error) {
          res.send(error);
      }
      res.send(new_step);
  }));

router.post(
    "/comment/:stepId",
    auth,
    asyncMiddleware(async (req, res) => {
        if (!req.user._id)
            return res.status(404).send("This user is not logged in.");

        const step_with_inserted_comment= await addComment(req.body.comment,req.params.stepId);
        res.send(step_with_inserted_comment);

    }));

router.get(
  "/:stepId",
  auth,
  asyncMiddleware(async (req, res) => {
      if (!req.user._id)
          return res.status(404).send("This user is not logged in.");
      const cur_step = await getStepById(req.params.stepId);
      res.send(cur_step);

  }));

router.put(
    "/:stepId",
    auth,
    asyncMiddleware(async (req, res) => {
        if (!req.user._id)
            return res.status(404).send("This user is not logged in.");
        const updated_step= await updateStepById(req.body, req.params.stepId)
        res.send(updated_step);

    }));



// router.get(
//   "/:applicationId",
//   auth,
//   asyncMiddleware(async (req, res) => {
//     if (!req.user._id)
//       return res.status(404).send("This user is not logged in.");
//
//     const user = await User.findById(req.user._id);
//     let application;
//
//     if (user && user.applications) {
//       application = user.applications.find(
//         application => application._id == req.params.applicationId
//       );
//     }
//     return application
//       ? application.track
//         ? res.send(application.track)
//         : res.status(404).send("The givan application ID was not found")
//       : res.status(404).send("This application has no track");
//   })
// );
//
// router.delete(
//   "/:applicationId/:stepId",
//   auth,
//   asyncMiddleware(async (req, res) => {
//     let step;
//     let application;
//     const user = await User.findById(req.user._id);
//     if (user) {
//       application = user.applications.id(req.params.applicationId);
//       if (application) {
//         step = application.track.id(req.params.stepId);
//         step.remove();
//         await user.save();
//         res.send(step);
//       } else {
//         res.status(404).send("The givan company ID was not found");
//       }
//     }
//   })
// );
//
// router.put(
//   "/:applicationId/:stepId",
//   auth,
//   asyncMiddleware(async (req, res) => {
//     const user = await User.findById(req.user._id);
//     let application;
//     let step;
//     if (user) {
//       if (user.applications) {
//         application = user.applications.find(
//           application => application._id == req.params.applicationId
//         );
//         if (application) {
//           step = application.track.find(step => step._id == req.params.stepId);
//           if (step) {
//             step.title = req.body.title;
//             step.description = req.body.description;
//             step.relatedEmails = req.params.relatedEmails;
//             step.comments = req.params.comments;
//
//             await user.save();
//             res.send(step);
//           } else {
//             res.status(404).send("The givan step ID was not found");
//           }
//         } else {
//           res.status(404).send("The givan application ID was not found");
//         }
//       } else {
//         res.status(404).send("This user was not have applications");
//       }
//     } else {
//       res.status(404).send("The givan user ID was not found");
//     }
//   })
// );

module.exports = router;
