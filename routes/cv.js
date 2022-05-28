const express = require("express");
const { Cv } = require("../models/cv");
const { User } = require("../models/user");
const auth = require("../middleware/auth");
const asyncMiddleware = require("../middleware/async");
const { validateCv } = require("../models/cv");
const { user } = require("../middleware/role");
const axios = require("axios").default;

const router = express.Router();
router.use(express.json());
/**
 * @swagger
 * components:
 *   schemas:
 *     Cv:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           required: true
 *         file:
 *           type: string
 *           required: true
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Ruby"]
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
 *   name: CVS
 *   description: the User's CV
 */

/**
 * @swagger
 * /cv/:
 *   post:
 *     summary: Upload a new cv to the current user
 *     tags: [CVS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cv'
 *     responses:
 *       200:
 *         description: the list of the suggested users for the postion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cv'
 */

router.post(
    "/",
    auth,
    asyncMiddleware(async (req, res) => {
        const { error } = validateCv(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        let cv = new Cv({
            title: req.body.title,
            cvFile: req.body.cvFile,
            tags: [],
        });

        axios
            .post("http://localhost:5000/", {
                name: cv.title,
                file: cv.cvFile,
            })
            .then(async (axiosRes) => {
                if (axiosRes.status === 200) {
                    cv.tags = axiosRes.data;
                    const savedCv = await cv.save();
                    let user = await User.findById(req.user._id);
                    if (user) {
                        if (user.cvs) {
                            user.cvs.push(savedCv._id);
                        } else {
                            user.cvs = [savedCv._id];
                        }
                    }
                    await user.save();
                }
                res.send(cv);
            })
            .catch(async (error) => {
                const savedCv = await cv.save();
                let user = await User.findById(req.user._id);
                if (user) {
                    if (user.cvs) {
                        user.cvs.push(savedCv._id);
                    } else {
                        user.cvs = [savedCv._id];
                    }
                }
                await user.save();
                res.send(cv);
            });
    })
);

module.exports = router;
