const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const express = require("express");
const Joi = require("joi");
Joi.ObjectId = require("joi-objectid")(Joi);
const { Company } = require("../models/company");
const {createCompany} = require("../services/company");

const router = express.Router();
router.use(express.json());

router.post(
  "/",
  auth,
  asyncMiddleware(async (req, res) => {
    if (!req.user._id)
      return res.status(404).send("This user is not logged in.");
      const new_company= await createCompany(req.body);
      if(!new_company) return res.status(404).send("can't create company");
      res.send(new_company);

  })
);

router.get(
  "/:companyId",
  auth,
  asyncMiddleware(async (req, res) => {
    if (!req.user._id)
      return res.status(404).send("This user is not logged in.");

    const company = await Company.findById(req.params.companyId);

    return company
      ? res.send(company)
      : res.status(404).send("The givan company ID is not found");
  })
);

router.get(
  "/",
  auth,
  asyncMiddleware(async (req, res) => {
    const companies = await Company.find();
    res.send(companies);
  })
);

router.delete(
  "/:companyId",
  auth,
  asyncMiddleware(async (req, res) => {
    const company = await Company.findByIdAndRemove(req.params.companyId, {
      new: true
    });

    if (!company)
      return res
        .status(404)
        .send("The company with the given ID was not found");

    return res.send(company);
  })
);

router.put(
  "/:companyId",
  auth,
  asyncMiddleware(async (req, res) => {
    const company = await Company.findById(req.params.companyId);
    if (company) {
      company.name = req.body.name;
      company.description = req.body.description;
    }

    await company.save();
    res.send(company);
  })
);

module.exports = router;
