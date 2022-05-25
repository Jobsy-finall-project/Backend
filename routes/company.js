import asyncMiddleware from "../middleware/async";
import auth from "../middleware/auth";
import express from "express";
import Joi from "joi";
Joi.ObjectId from "joi-objectid"(Joi;
import { Company } from "../models/company";
import { validateCompany } from "../models/company";

const router = express.Router();
router.use(express.json());

router.post(
  "/",
  auth,
  asyncMiddleware(async (req, res) => {
    if (!req.user._id)
      return res.status(404).send("This user is not logged in.");

    const { error } = validateCompany(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let company = new Company({
      name: req.body.name,
      description: req.body.description,
      positions: req.body.positions
    });

    company = await company.save();

    res.send(company);
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

export default router;
