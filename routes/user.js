const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const { admin, hr, user } = require("../middleware/role");
const _ = require("lodash");
const express = require("express");
const { User } = require("../models/user");
const { validateUser } = require("../models/user");
const bcrypt = require("bcrypt");
const { createUser, intersectionTags } = require("../services/user");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: user
 *   description: the Users
 */

/**
 * @swagger
 * /user:
 *   post:
 *     summary: create new user
 *     tags: [user]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: the created user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Position'
 *
 */
router.post("/", async (req, res) => {
    try {
        const { token, inserted_user } = await createUser(req.body);
        res.header("x-auth-token", token).send(
            _.pick(inserted_user, [
                "_id",
                "firstName",
                "lastName",
                "userName",
                "email",
            ])
        );
    } catch (error) {
        res.status(400).send(error.message);
    }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: get all users
 *     tags: [user]
 *     responses:
 *       200:
 *         description: the list of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *
 */
router.get("/", [auth, admin], async (req, res) => {
    const users = await User.find().populate("applications").populate("cvs");
    res.send(users);
});

/**
 * @swagger
 * /users/tags/{userId}/{positionId}/{cvId}:
 *   get:
 *     summary: returns tags that exists in both the Cv and the position
 *     tags: [user]
 *     parameters:
 *       - in : path
 *         name: userId
 *         description: id of the user
 *         schema:
 *           type: string
 *           required: true
 *       - in : path
 *         name: positionId
 *         description: id of the position
 *         schema:
 *           type: string
 *           required: true
 *       - in : path
 *         name: cvId
 *         description: id of the cv
 *         schema:
 *           type: string
 *           required: true
 *     responses:
 *       200:
 *         description: tags that exists in both the Cv and the position
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get("/tags/:userId/:positionId/:cvId", auth, async (req, res) => {
    const tags = await intersectionTags(
        req.params.userId,
        req.params.positionId,
        req.params.cvId
    );
    res.send(tags);
});

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: current user
 *     tags: [user]
 *     responses:
 *       200:
 *         description: the current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *
 */
router.get("/me", auth, async (req, res) => {
    const user = await User.findById({ _id: req.user._id })
        .populate("applications")
        .populate({
            path: "company",
            populate: {
                path: "positions",
                model: "Position",
            },
        })
        .select("-password");
    if (user) return res.send(user);
    return res.status(404).send("The user with the given token was not found");
});

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: current user
 *     tags: [user]
 *     responses:
 *       200:
 *         description: the current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *
 */
router.get("/me", auth, async (req, res) => {
    const user = await User.findById({ _id: req.user._id })
        .populate({
            path: "company",
            populate: {
                path: "positions",
                model: "Position",
            },
        })
        .select("-password");
    if (user) return res.send(user);
    return res.status(404).send("The user with the given token was not found");
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: user by id
 *     tags: [user]
 *     parameters:
 *       - in : path
 *         name: id
 *         description: id of the user
 *         schema:
 *           type: string
 *           required: true
 *     responses:
 *       200:
 *         description: the requseted user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *
 */
router.get("/:id", async (req, res) => {
    const user = await User.findById({ _id: req.params.id })
        .select("-password")
        .populate("applications");
    if (user) return res.send(user);
    return res.status(404).send("The user with the given ID was not found");
});

/**
 * @swagger
 * /user:
 *   put:
 *     summary: update user details
 *     tags: [user]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: the updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Position'
 *
 */
router.put("/", auth, async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let id = await User.findOne({ email: req.body.email }).select("_id");
    if (id && id !== req.user._id) {
        return res.status(409).send("this email is already exist.");
    }

    id = null;

    id = await User.findOne({ userName: req.body.userName }).select("_id");
    if (id && id !== req.user._id)
        return res.status(409).send("this user name is already exist.");

    //cv insert to db
    //get cv
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                userName: req.body.userName,
                email: req.body.email,
                password: req.body.password,
                //cvs: [...getCvs, newcv ]
            },
        },
        { new: true }
    ).select("-password");
    res.send(user);
});

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: update user details
 *     tags: [user]
 *     parameters:
 *       - in : path
 *         name: id
 *         description: id of the user
 *         schema:
 *           type: string
 *           required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: the updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Position'
 */
router.put("/:id", [validateObjectId, auth, admin], async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let id = await User.findOne({ email: req.body.email }).select("_id");
    if (id && id !== req.params.id)
        return res.status(409).send("this email is already exist.");

    id = null;

    id = await User.findOne({ userName: req.body.userName }).select("_id");
    if (id && id !== req.user._id)
        return res.status(409).send("this user name is already exist.");

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            $set: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                userName: req.body.userName,
                email: req.body.email,
                password: req.body.password,
                role: req.body.role,
                applications: [],
                cvs: [],
            },
        },
        { new: true }
    ).select("-password");

    if (!user)
        return res.status(404).send("The user with the given ID was not found");

    res.send(user);
});


/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     description: Deletes a user
 *     tags: [user]
 *     summary: Deletes a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required:  true
 *         description: id of the user to delete
 *         schema:
 *           type:  string
 *     responses:
 *       200:
 *         description: the deleted user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Position'
 */
router.delete("/:id", [validateObjectId, auth, admin], async (req, res) => {
    const user = await User.findByIdAndRemove(req.params.id, { new: true });

    if (!user)
        return res.status(404).send("The user with the given ID was not found");

    return res.send(user);
});

module.exports = router;
