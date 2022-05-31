const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const express = require("express");
const Joi = require("joi");
Joi.ObjectId = require("joi-objectid")(Joi);
const { Company } = require("../models/company");
const {createCompany, updateCompanyById, getCompanyById, deleteCompanyById} = require("../services/company");
const {User} = require("../models/user");

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
  "/",
  auth,
  asyncMiddleware(async (req, res) => {
      const user= await User.findById(req.user._id);
      const company = await Company.findById(user._doc.company).populate("positions");
    res.send(company);
  })
);

router.get(
    "/all",
    auth,
    asyncMiddleware(async (req, res) => {
        const companies= await Company.find({});
            res.send(companies);
    })
);

router.get(
    "/:companyId",
    auth,
    asyncMiddleware(async (req, res) => {
        if (!req.user._id)
            return res.status(404).send("This user is not logged in.");

        const company = await getCompanyById(req.params.companyId);
        res.send(company);

    })
);

router.delete(
  "/:companyId",
  auth,
  asyncMiddleware(async (req, res) => {
    const deleted_company= await deleteCompanyById(req.params.companyId)
    return res.send(deleted_company);
  })
);

router.put(
  "/:companyId",
  auth,
  asyncMiddleware(async (req, res) => {
  const updated_company= await updateCompanyById(req.body, req.params.companyId);
    res.send(updated_company);
  })
);

module.exports = router;
