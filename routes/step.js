const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const express = require("express");
const { User } = require("../models/user");
const { Application } = require("../models/application");
const { Step } = require("../models/step");
const { validateStep } = require("../models/step");
const {
  createStep,
  createStepAndAddToPosition,
  createStepAndAddToApplication,
  getStep,
  getStepById,
  updateStepById,
  deleteStepFromApplication,
  deleteStepFromPosition,
} = require("../services/step");
const { Position } = require("../models/position");
const { addComment, deleteComment, getAllSteps } = require("../services/step");
const { updatePositionById } = require("../services/position");

const router = express.Router();
router.use(express.json());

/**
 * @swagger
 * components:
 *   schemas:
 *     Step:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           required: true
 *         title:
 *           type: string
 *           required: true
 *         description:
 *           type: string
 *           required: true
 *         time:
 *           type: string
 *           required: true
 *           format: date-time
 *     Position:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           required: true
 *         name:
 *           type: string
 *           required: true
 *         description:
 *           type: string
 *           required: true
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           required: true
 *         template:
 *           type: string
 *           required: true
 *     Application:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           required: true
 *         isFavorite:
 *           type: boolean
 *           required: true
 *         isActive:
 *           type: boolean
 *           required: true
 *         isMatch:
 *           type: boolean
 *           required: true
 *         position:
 *           type: string
 *           required: true
 *         cvFiles:
 *           type: string
 *           required: true
 *         comments:
 *           type: array
 *           items:
 *             type: string
 *           required: true 
 *         steps:
 *           type: array
 *           items:
 *             type: string
 *           required: true
 *         company:
 *           type: string
 *           required: true
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           required: true
 *         first name:
 *           type: string
 *           required: true
 *         last name:
 *           type: string
 *           required: true
 *         username:
 *           type: string
 *           required: true
 *         cvs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Cv'
 */

/**
 * @swagger
 * tags:
 *   name: step
 *   description: steps in the system
 */

/**
 * @swagger
 * /step:
 *   get:
 *     summary: get all the steps
 *     tags: [step]
 *     responses:
 *       200:
 *         description: the list of all steps
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Step'
 *
 */
router.get(
  "/",
  auth,
  asyncMiddleware(async (req, res) => {
    const steps = await getAllSteps();
  })
);

/**
 * @swagger
 * /step/position/{positionId}:
 *   post:
 *     summary: create new step to position
 *     tags: [step]
 *     parameters:
 *       - in : path
 *         name: positionId
 *         description: id of the position
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Step'
 *     responses:
 *       200:
 *         description: the created step
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Step'
 *
 */
router.post(
  "/position/:positionId",
  auth,
  asyncMiddleware(async (req, res) => {
    const positionId = req.params.positionId;
    if (!req.user._id) res.status(404).send("This user is not logged in.");
    let new_step;
    try {
      new_step = await createStepAndAddToPosition(req.body, positionId);
    } catch (error) {
      res.send(error);
    }
    res.send(new_step);
  })
);

/**
 * @swagger
 * /step/application/{applicationId}:
 *   post:
 *     summary: create new step to applicaiton
 *     tags: [step]
 *     parameters:
 *       - in : path
 *         name: applicationId
 *         description: id of the application
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Step'
 *     responses:
 *       200:
 *         description: the created step
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Step'
 *
 */
router.post(
  "/application/:applicationId",
  auth,
  asyncMiddleware(async (req, res) => {
    const applicationId = req.params.applicationId;
    if (!req.user._id) res.status(404).send("This user is not logged in.");
    let new_step;
    try {
      new_step = await createStepAndAddToApplication(req.body, applicationId);
    } catch (error) {
      res.send(error);
    }
    res.send(new_step);
  })
);

/**
 * @swagger
 * /step/comment/{stepId}:
 *   post:
 *     summary: add new comment to step
 *     tags: [step]
 *     parameters:
 *       - in : path
 *         name: stepId
 *         description: id of the step
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment: 
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         description: the created step
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Step'
 *                 
 */
router.post(
  "/comment/:stepId",
  auth,
  asyncMiddleware(async (req, res) => {
    if (!req.user._id)
      return res.status(404).send("This user is not logged in.");

    const application_with_inserted_comment = await addComment(
      req.body.comment,
      req.params.stepId
    );
    res.send(application_with_inserted_comment);
  })
);

/**
 * @swagger
 * /step/comment/{stepId}/delete:
 *   post:
 *     summary: delete comment from step
 *     tags: [step]
 *     parameters:
 *       - in : path
 *         name: stepId
 *         description: id of the step
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commentIndex: 
 *                 type: integer
 *                 required: true
 *     responses:
 *       200:
 *         description: the updated step
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Step'
 *                 
 */
router.post(
  "/comment/:stepId/delete",
  auth,
  asyncMiddleware(async (req, res) => {
    if (!req.user._id)
      return res.status(404).send("This user is not logged in.");

    const application_with_inserted_comment = await deleteComment(
      req.body.commentIndex,
      req.params.stepId
    );
    res.send(application_with_inserted_comment);
  })
);
/**
 * @swagger
 * /step/{stepId}:
 *   get:
 *     summary: get step by id
 *     tags: [step]
 *     parameters:
 *       - in : path
 *         name: stepId
 *         description: id of the step
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: requested step
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Step'
 *                 
 */
router.get(
  "/:stepId",
  auth,
  asyncMiddleware(async (req, res) => {
    if (!req.user._id)
      return res.status(404).send("This user is not logged in.");
    const cur_step = await getStepById(req.params.stepId);
    res.send(cur_step);
  })
);

/**
 * @swagger
 * /step/{stepId}:
 *   put:
 *     summary: edits the step id
 *     tags: [step]
 *     parameters:
 *       - in : path
 *         name: stepId
 *         description: id of the step
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Step'
 *     responses:
 *       200:
 *         description: the updated step
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Step'
 */

router.put(
  "/:stepId",
  auth,
  asyncMiddleware(async (req, res) => {
    if (!req.user._id)
      return res.status(404).send("This user is not logged in.");
    const updated_step = await updateStepById(req.body, req.params.stepId);
    res.send(updated_step);
  })
);

/**
 * @swagger
 * /step/application/{applicationId}/{stepId}:
 *   delete:
 *     summary: delete step from application
 *     tags: [step]
 *     parameters:
 *       - in : path
 *         name: applicationId
 *         description: id of the application
 *         schema:
 *           type: string
 *         required: true
 *       - in : path
 *         name: stepId
 *         description: id of the step
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: the updated application
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 */
router.delete(
  "/application/:applicationId/:stepId",
  auth,
  asyncMiddleware(async (req, res) => {
    if (!req.user._id)
      return res.status(404).send("This user is not logged in.");
    const updated_appalication = await deleteStepFromApplication(
      req.params.applicationId,
      req.params.stepId
    );
    res.send(updated_appalication);
  })
);


/**
 * @swagger
 * /step/position/{positionId}/{stepId}:
 *   delete:
 *     summary: delete step from position
 *     tags: [step]
 *     parameters:
 *       - in : path
 *         name: positionId
 *         description: id of the position
 *         schema:
 *           type: string
 *         required: true
 *       - in : path
 *         name: stepId
 *         description: id of the step
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: the updated position
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Position'
 */
router.delete(
  "/position/:positionId/:stepId",
  auth,
  asyncMiddleware(async (req, res) => {
    if (!req.user._id)
      return res.status(404).send("This user is not logged in.");
    const updated_appalication = await deleteStepFromPosition(
      req.params.positionId,
      req.params.stepId
    );
    res.send(updated_appalication);
  })
);

module.exports = router;
