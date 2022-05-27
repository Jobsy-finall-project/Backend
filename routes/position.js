const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const express = require("express");
const Joi = require("joi");
Joi.ObjectId = require("joi-objectid")(Joi);
const { Company } = require("../models/company");
const { Position } = require("../models/position");
const { validatePosition } = require("../models/position");
const {createPosition} = require("../services/position");

const router = express.Router();
router.use(express.json());

router.post(
  "/",
  auth,
  asyncMiddleware(async (req, res) => {
      if (!req.user._id)
          return res.status(404).send("This user is not logged in.");
      let new_position =await createPosition(req.body);
      res.send(new_position);
  })
);



router.get(
  "/:companyId/:positionId",
  auth,
  asyncMiddleware(async (req, res) => {
    let position;
    const company = await Company.findById(req.params.companyId);
    if (company && req.params.positionId && company.positions) {
      position = company.positions.find(
        position => position._id == req.params.positionId
      );
    }
    return position
      ? res.send(position)
      : company && company.positions
      ? res.status(404).send("The givan position ID is not found")
      : res
          .status(404)
          .send("This company is not exist or it has no positions");
  })
);

router.get(
  "/:companyId",
  auth,
  asyncMiddleware(async (req, res) => {
    const company = await Company.findById(req.params.companyId);
    if (company && company.positions) {
      return res.send(company.positions);
    }
    res.status(404).send("This company was not exist or it has no positions");
  })
);

router.delete(
  "/:companyId/:positionId",
  auth,
  asyncMiddleware(async (req, res) => {
    let position;
    const company = await Company.findById(req.params.companyId);
    if (company) {
      position = company.positions.id(req.params.positionId);
    } else {
      res.status(404).send("The givan company ID was not found");
    }
    position.remove();
    await company.save();
    res.send(position);
  })
);

router.put(
  "/:companyId/:positionId",
  auth,
  asyncMiddleware(async (req, res) => {
    const company = await Company.findById(req.params.companyId);
    let position;
    if (company) {
      if (company.positions) {
        position = company.positions.find(
          position => position._id == req.params.positionId
        );
        if (position) {
          position.name = req.body.name;
          position.description = req.body.description;

          await company.save();
          res.send(position);
        } else {
          res.status(404).send("The givan position ID was not found");
        }
      } else {
        res.status(404).send("This company was not have positions");
      }
    } else {
      res.status(404).send("The givan company ID was not found");
    }
  })
);

module.exports = router;
