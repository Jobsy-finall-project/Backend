const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const express = require("express");
const Joi = require("joi");
Joi.ObjectId = require("joi-objectid")(Joi);
const { User } = require("../models/user");
const { validateApplication, Application } = require("../models/application");
const {Position, validatePosition} = require("../models/position");
const {Cv} = require("../models/cv");


const router = express.Router();
router.use(express.json());

router.post(
  "/",
  auth,
  asyncMiddleware(async (req, res) => {
      if (!req.user._id)
          return res.status(404).send("This user is not logged in.");



      const position =new Position({
          name:req.body.position.name,
          description:req.body.position.description,
          tags:req.body.position.tags
      });
      //validate
      let added_position= await position.save();
      if(!added_position) return res.status(404).send("can't add this attached position");

      const attached_cvs=req.body.cvFiles;
      let inserted_cvs=[];
      for(let currFile of attached_cvs){
          let cv= new Cv({
              title: currFile.title,
              cvFile: currFile.cvFile,
              tags: currFile.tags,
          });
          //validate
          let added_cv=await cv.save();
          if(!added_cv) return res.status(404).send("can't add this attached cv");
          inserted_cvs.push(added_cv);
      }



    let application = {
      isFavorite: req.body.isFavorite,
      isActive: req.body.isActive,
      isMatch: req.body.isMatch,
      position: added_position,
      cvFiles: req.body.cvFiles,
      reletedEmails: req.body.reletedEmails,
      comments: req.body.comments,
      steps: req.body.steps
    };

    const { error } = validateApplication(application);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findById(req.user._id);

    const added_application= await Application.save();
    if(!added_application) return res.status(404).send("can't add this attached application");

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

router.post(
    "/",
    auth,
    asyncMiddleware(async (req, res) => {
        if (!req.user._id)
            return res.status(404).send("This user is not logged in.");

        const position =new Position({
            name:req.body.position.name,
            description:req.body.position.description,
            tags:req.body.position.tags
        });
        //validate
        let added_position= await position.save();
        if(!added_position) return res.status(404).send("can't add this attached position");

        const attached_cvs=req.body.cvFiles;
        let inserted_cvs=[];
        for(let currFile of attached_cvs){
            let cv= new Cv({
                title: currFile.title,
                cvFile: currFile.cvFile,
                tags: currFile.tags,
            });
            //validate
            let added_cv=await cv.save();
            if(!added_cv) return res.status(404).send("can't add this attached cv");
            inserted_cvs.push(added_cv);
        }



        let application = {
            isFavorite: req.body.isFavorite,
            isActive: req.body.isActive,
            isMatch: req.body.isMatch,
            position: added_position,
            cvFiles: req.body.cvFiles,
            reletedEmails: req.body.reletedEmails,
            comments: req.body.comments,
            steps: req.body.steps
        };

        const { error } = validateApplication(application);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.user._id);

        const added_application= await Application.save();
        if(!added_application) return res.status(404).send("can't add this attached application");

        const length = user.applications.push(application);

        await user.save();

        application = user.applications[length - 1];

        res.send(application);
    })
);

module.exports = router;
