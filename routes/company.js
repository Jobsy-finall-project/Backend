const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const express = require("express");
const Joi = require("joi");
Joi.ObjectId = require("joi-objectid")(Joi);
const { Company } = require("../models/company");
const {
    createCompany,
    updateCompanyById,
    getCompanyById,
    deleteCompanyById,
} = require("../services/company");
const { User } = require("../models/user");

const router = express.Router();
router.use(express.json());

/**
 * @swagger
 * tags:
 *   name: company
 *   description: the Companys
 */

/**
 * @swagger
 * /company:
 *   post:
 *     summary: create new company
 *     tags: [company]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Company'
 *     responses:
 *       200:
 *         description: the created company
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *
 */
router.post(
    "/",
    auth,
    asyncMiddleware(async (req, res) => {
        if (!req.user._id)
            return res.status(404).send("This user is not logged in.");
        const new_company = await createCompany(req.body);
        if (!new_company) return res.status(404).send("can't create company");
        res.send(new_company);
    })
);


/**
 * @swagger
 * /company:
 *   get:
 *     summary: get the company of the current user
 *     tags: [company]
 *     responses:
 *       200:
 *         description: the company of the current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *                 
 */
router.get(
    "/",
    auth,
    asyncMiddleware(async (req, res) => {
        const user = await User.findById(req.user._id);
        const company = await Company.findById(user._doc.company).populate(
            "positions"
        );
        res.send(company);
    })
);


/**
 * @swagger
 * /company/all:
 *   get:
 *     summary: get all companys in the system
 *     tags: [company]
 *     responses:
 *       200:
 *         description: all the companys
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Company'
 *                 
 */
router.get(
    "/all",
    asyncMiddleware(async (req, res) => {
        const companies = await Company.find({}).populate("positions");
        res.send(companies);
    })
);


/**
 * @swagger
 * /company/{companyId}:
 *   get:
 *     summary: get the company with the requested id 
 *     tags: [company]
 *     parameters:
 *       - in : path
 *         name: companyId
 *         description: id of the company
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: the requested company
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *                 
 */
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


/**
 * @swagger
 * /company/{companyId}:
 *   delete:
 *     summary: delete the company with the requested id 
 *     tags: [company]
 *     parameters:
 *       - in : path
 *         name: companyId
 *         description: id of the company
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: the deleted company
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *                 
 */
router.delete(
    "/:companyId",
    auth,
    asyncMiddleware(async (req, res) => {
        const deleted_company = await deleteCompanyById(req.params.companyId);
        return res.send(deleted_company);
    })
);


/**
 * @swagger
 * /company/{companyId}:
 *   put:
 *     summary: updates the company with the requested id 
 *     tags: [company]
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
 *             $ref: '#/components/schemas/Company'
 *     responses:
 *       200:
 *         description: the deleted company
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *                 
 */
router.put(
    "/:companyId",
    auth,
    asyncMiddleware(async (req, res) => {
        const updated_company = await updateCompanyById(
            req.body,
            req.params.companyId
        );
        res.send(updated_company);
    })
);

module.exports = router;
