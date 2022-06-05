const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const express = require("express");
const { User } = require("../models/user");
const { Application } = require("../models/application");
const { Step } = require("../models/step");
const { validateStep } = require("../models/step");
const { createStep, createStepAndAddToPosition, createStepAndAddToApplication, getStep, getStepById, updateStepById,
    deleteStepFromApplication, deleteStepFromPosition
} = require("../services/step");
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

router.delete(
    "/application/:applicationId/:stepId",
    auth,
    asyncMiddleware(async (req, res) => {
        if (!req.user._id)
            return res.status(404).send("This user is not logged in.");
        const updated_appalication= await deleteStepFromApplication(req.params.applicationId, req.params.stepId)
        res.send(updated_appalication);
    }));

router.delete(
    "/position/:positionId/:stepId",
    auth,
    asyncMiddleware(async (req, res) => {
        if (!req.user._id)
            return res.status(404).send("This user is not logged in.");
        const updated_appalication= await deleteStepFromPosition(req.params.positionId, req.params.stepId)
        res.send(updated_appalication);
    }));

module.exports = router;
