const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const express = require("express");
const Joi = require("joi");
Joi.ObjectId = require("joi-objectid")(Joi);
const mongoose = require("mongoose");
const { User } = require("../models/user");

const router = express.Router();
router.use(express.json());

router.get(
  "/:userId/:articalId?",
  auth,
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.params.userId);
    if (req.params.articalId && user.savedArticales) {
      const artical = user.savedArticales.find(
        artical => artical._id === req.params.articalId
      );
      if (artical) return res.send(artical);
    }
    if (user && user.savedArticales) return res.send(user.savedArticales);
    res.status(404).send("This user not exist or no has articals");
  })
);

router.post(
  "/",
  auth,
  asyncMiddleware(async (req, res) => {
    const artical = {
      topic: req.body.topic,
      title: req.body.title,
      link: req.body.link,
      image: req.body.image,
      source: req.body.source,
      time: req.body.time,
      related: req.body.related,
      articalAsImages: null
    };

    const { error } = validateArtical(artical);
    if (error) return res.status(400).send(error.details[0].message);

    if (!mongoose.Types.ObjectId.isValid(req.body.userId))
      return res.status(400).send("Invalid userID.");

    const user = await User.findById(req.body.userId);

    user.savedArticales.push(artical);

    await user.save();

    res.send(artical);
  })
);

router.delete(
  "/:userId/:articalId",
  auth,
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.params.userId);
    const artical = user.savedArticales.id(req.params.articalId);
    artical.remove();
    await user.save();
    res.send(artical);
  })
);

router.put(
  "/:userId/:articalId/:newTopic",
  auth,
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.params.userId);
    let artical;
    if (user.savedArticales) {
      const index = user.savedArticales.findIndex(
        artical => artical._id == req.params.articalId
      );
      artical = user.savedArticales[index];
      if (index !== -1) artical.topic = req.params.newTopic;
    }
    await user.save();
    res.send(artical);
  })
);

function validateArtical(artical) {
  const schema = Joi.object({
    topic: Joi.string()
      .required()
      .min(1)
      .max(25),
    title: Joi.string()
      .required()
      .min(1)
      .max(225),
    link: Joi.string().required(),
    image: Joi.string(),
    source: Joi.string()
      .required()
      .min(1)
      .max(225),
    time: Joi.string().required(),
    related: Joi.array(),
    articalAsImages: null
  });

  return schema.validate(artical);
}

module.exports = router;
