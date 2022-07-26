const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const express = require("express");
const Joi = require("joi");
Joi.ObjectId = require("joi-objectid")(Joi);
const { User } = require("../models/user");
const { validateApplication, Application } = require("../models/application");
const { Position, validatePosition } = require("../models/position");
const { Cv } = require("../models/cv");
const { createPosition } = require("../services/position");
const {
  createApplication,
  createMatch,
  getAllApplicationsByUserId,
  getApplicationById,
  deleteApplicationById,
  addComment,
  deleteComment,
} = require("../services/application");

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
 *   name: application
 *   description: applications in the system
 */

/**
 * @swagger
 * /applications/{companyId}:
 *   post:
 *     summary: create new application to company
 *     tags: [application]
 *     parameters:
 *       - in : path
 *         name: companyId
 *         description: id of the company
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Application'
 *     responses:
 *       200:
 *         description: the created company
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *
 */

router.post(
  "/:companyId",
  auth,
  asyncMiddleware(async (req, res) => {
    if (!req.user._id) {
      return res.status(404).send("This user is not logged in.");
    }
    const inserted_application = await createApplication(
      req.body,
      req.user._id,
      req.params.companyId
    );

    res.send(inserted_application);
  })
);

/**
 * @swagger
 * /applications/matches/{companyId}:
 *   post:
 *     summary: create new match to application
 *     tags: [application]
 *     parameters:
 *       - in : path
 *         name: companyId
 *         description: id of the company
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Application'
 *     responses:
 *       200:
 *         description: the created company
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *
 */

router.post(
  "/matches/:companyId",
  auth,
  asyncMiddleware(async (req, res) => {
    if (!req.user._id) {
      return res.status(404).send("This user is not logged in.");
    }
    const userIds = req.body.users;
    const promises = userIds.map((currUserId) => {
      return createMatch(
        req.body.application,
        currUserId,
        req.params.companyId,
        req.user._id
      );
    });
    const applications = await Promise.all(promises);
    res.send(applications);
  })
);

/**
 * @swagger
 * /applications/comment/{applicationId}:
 *   post:
 *     summary: add new comment to application
 *     tags: [application]
 *     parameters:
 *       - in : path
 *         name: applicationId
 *         description: id of the company
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: string
 *     responses:
 *       200:
 *         description: the created company
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *
 */

router.post(
  "/comment/:applicationId",
  auth,
  asyncMiddleware(async (req, res) => {
    if (!req.user._id)
      return res.status(404).send("This user is not logged in.");

    const application_with_inserted_comment = await addComment(
      req.body.comment,
      req.params.applicationId
    );
    res.send(application_with_inserted_comment);
  })
);

/**
 * @swagger
 * /applications/comment/{applicationId}/delete:
 *   post:
 *     summary: delete comment from application
 *     tags: [application]
 *     parameters:
 *       - in : path
 *         name: applicationId
 *         description: id of the company
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: string
 *     responses:
 *       200:
 *         description: the created company
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *
 */
router.post(
  "/comment/:applicationId/delete",
  auth,
  asyncMiddleware(async (req, res) => {
    if (!req.user._id)
      return res.status(404).send("This user is not logged in.");

    const application_with_inserted_comment = await deleteComment(
      req.body.commentIndex,
      req.params.applicationId
    );
    res.send(application_with_inserted_comment);
  })
);
/**
 * @swagger
 * /application/{applicationId}:
 *   get:
 *     summary: get application by id
 *     tags: [application]
 *     parameters:
 *       - in : path
 *         name: applicationId
 *         description: id of the application
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: requested application
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *
 */
router.get(
  "/:applicationId",
  auth,
  asyncMiddleware(async (req, res) => {
    const application = await getApplicationById(req.params.applicationId);
    res.send(application);
  })
);

/**
 * @swagger
 * /application/user/all:
 *   get:
 *     summary: get all applications of user
 *     tags: [application]
 *     responses:
 *       200:
 *         description: requested application
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Application'
 *
 */
router.get(
  "/user/all",
  auth,
  asyncMiddleware(async (req, res) => {
    const applications = await getAllApplicationsByUserId(req.user._id);
    res.send(applications);
  })
);

/**
 * @swagger
 * /applications/{applicationId}:
 *   delete:
 *     summary: delete the application by id
 *     tags: [application]
 *     parameters:
 *       - in : path
 *         name: applicationId
 *         description: id of the application
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: the deleted application
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 */
router.delete(
  "/:applicationId",
  auth,
  asyncMiddleware(async (req, res) => {
    const application = await deleteApplicationById(
      req.params.applicationId,
      req.user._id
    );
    res.send(application);
  })
);

/**
 * @swagger
 * /applications/{applicationId}:
 *   post:
 *     summary: edit application
 *     tags: [application]
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
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 required: true
 *               isMatch:
 *                 type: boolean
 *                 required: true
 *               isFavorite:
 *                 type: boolean
 *                 required: true
 *     responses:
 *       200:
 *         description: the created company
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *
 */
router.put(
  "/:applicationId",
  auth,
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user.applications.includes(req.params.applicationId)) {
      const application = await Application.findById(req.params.applicationId);

      if (req.body.hasOwnProperty("isFavorite")) {
        application.isFavorite = req.body.isFavorite;
      }
      if (req.body.isActive) {
        application.isActive = req.body.isActive;
      }
      if (req.body.isMatch) {
        application.isMatch = req.body.isMatch;
      }
      await application.save();
      res.send(application);
    } else {
      res.status(404).send("application not found");
    }
  })
);

/**
 * @swagger
 * /application/all/{posotionId}:
 *   get:
 *     summary: all applications of position
 *     tags: [application]
 *     parameters:
 *       - in : path
 *         name: positionId
 *         description: id of the position
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: requested applications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Application'
 *
 */
router.get(
  "/all/:positionId",
  auth,
  asyncMiddleware(async (req, res) => {
    const applications = await Application.find({
      position: req.params.positionId,
    });
    const appsIds = applications.map((curr) => curr._id);
    const usersPromises = [];

    appsIds.forEach((currAppId) => {
      usersPromises.push(
        User.find({
          applications: currAppId,
        }).populate({
          path: "applications",
          populate: [
            {
              path: "position",
              model: "Position",
            },
            {
              path: "company",
              model: "Company",
            },
          ],
        })
      );
    });
    const users = (await Promise.all(usersPromises)).map(
      (currUser) => currUser[0]._doc
    );
    const resultBody = [];
    users.forEach((currUser) => {
      if (
        !resultBody.find(
          (curr) => curr._id.toString() === currUser._id.toString()
        )
      ) {
        resultBody.push({
          ...currUser,
          applications: currUser.applications.filter((currUserApp) => {
            return (
              currUserApp.position._id.toString() === req.params.positionId
            );
          }),
        });
      }
    });

    res.send(resultBody);
  })
);

module.exports = router;
