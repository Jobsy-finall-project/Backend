const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const express = require("express");
const Joi = require("joi");
Joi.ObjectId = require("joi-objectid")(Joi);
const { Company } = require("../models/company");
const {createCompany} = require("../services/company");
const {User} = require("../models/user");

const router = express.Router();
router.use(express.json());

// router.post(
//     "/",
//     auth,
//     asyncMiddleware(async (req, res) => {
//         if (!req.user._id)
//             return res.status(404).send("This user is not logged in.");
//         const new_company= await createCompany(req.body);
//         if(!new_company) return res.status(404).send("can't create company");
//         res.send(new_company);
//
//     })
// );


module.exports = router;
