const express = require("express");
const { Cv } = require("../models/cv");
const { User } = require("../models/user");
const auth = require("../middleware/auth");
const asyncMiddleware = require("../middleware/async");
const { validateCv } = require("../models/cv");
const { user } = require("../middleware/role");
const axios = require("axios").default;
const mongoose = require("mongoose");

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
            .post(process.env.anakyzer_url + "/", {
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

/**
 * @swagger
 * /cv/{cvId}:
 *   delete:
 *     description: Deletes a cv
 *     tags: [CVS]
 *     summary: Deletes a cv
 *     parameters:
 *       - in: path
 *         name: cvId
 *         required:  true
 *         description: id of the cv to delete
 *         schema:
 *           type:  string
 *     responses:
 *       200:
 *         description: deleted sccessfully
 */
router.delete(
    "/:cvId",
    auth,
    asyncMiddleware(async (req, res) => {
        console.log("removing cv");
        const idToDelete = req.params.cvId;
        const cvToRemove = await Cv.findByIdAndRemove(idToDelete);
        if (!cvToRemove) {
            throw new Error(
                "cant delete this CV because it wasn't create by you"
            );
        }

        const currUser = await User.findById(req.user._id);
        currUser.cvs = currUser.cvs.filter(
            (currCvId) => currCvId !== idToDelete
        );
        // currUser.save();
        await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { cvs: idToDelete } },
            { safe: true, upsert: true }
        );
        res.send(cvToRemove);
    })
);

router.get(
    "/",
    auth,
    asyncMiddleware(async (req, res) => {
        const cvs = await User.findById(req.user._id, {
            _id: -1,
            cvs: 1,
        }).populate("cvs");
        res.send(cvs);
    })
);

module.exports = router;
