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
const {createApplication, createMatch, getAllApplicationsByUserId, getApplicationById, deleteApplicationById, addComment, deleteComment} = require("../services/application");


const router = express.Router();
router.use(express.json());

router.post(
  "/:companyId",
  auth,
  asyncMiddleware(async (req, res) => {
      if (!req.user._id){
          return res.status(404).send("This user is not logged in.");
      }
      const inserted_application = await createApplication(req.body,req.user._id,req.params.companyId );

    res.send(inserted_application);
  })
);

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

router.post(
    "/comment/:applicationId",
    auth,
    asyncMiddleware(async (req, res) => {
        if (!req.user._id)
            return res.status(404).send("This user is not logged in.");

        const application_with_inserted_comment= await addComment(req.body.comment,req.params.applicationId);
        res.send(application_with_inserted_comment);
    })
);

router.post(
    "/comment/:applicationId/delete",
    auth,
    asyncMiddleware(async (req, res) => {
        if (!req.user._id)
            return res.status(404).send("This user is not logged in.");

        const application_with_inserted_comment= await deleteComment(req.body.commentIndex,req.params.applicationId);
        res.send(application_with_inserted_comment);
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
  "/user/all",
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
        if (user.applications.includes(req.params.applicationId)) {
            const application = await Application.findById(
                req.params.applicationId
            );

            if (req.body.hasOwnProperty('isFavorite')) {
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
          res.status(404).send("application not found")
        }
    })
);


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
                }).populate("applications")
            );
        });
        const users = (await Promise.all(usersPromises)).map(
            (currUser) => currUser[0]._doc
        );
        const resultBody = [];
        users.forEach((currUser) => {
            // console.log({ currUser });
            // console.log({ applications: currUser.applications });
            if (!resultBody.find((curr) => curr._id.toString() === currUser._id.toString())) {
                resultBody.push({
                    ...currUser,
                    applications: currUser.applications.filter(
                        (currUserApp) => {
                            return (
                                currUserApp.position.toString() ===
                                req.params.positionId
                            );
                        }
                    ),
                });
            }
        });

        // console.log({ resultBody });
        res.send(resultBody);
    })
);

module.exports = router;
