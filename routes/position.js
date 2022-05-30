const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const express = require("express");
const Joi = require("joi");
Joi.ObjectId = require("joi-objectid")(Joi);
const { Company } = require("../models/company");
const { Position } = require("../models/position");
const { validatePosition } = require("../models/position");
const { User } = require("../models/user");
const { max, minBy } = require("lodash");
const { createPosition, getAllPositionsByUserId, deletePosition} = require("../services/position");
const { Cv } = require("../models/cv");
const {getAllApplicationsByUserId} = require("../services/application");

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
 *   name: positions
 *   description: Positions in the system
 */




router.post(
    "/:companyId",
    auth,
    asyncMiddleware(async (req, res) => {
        if (!req.user._id) {
            return res.status(404).send("This user is not logged in.");
        }
        let new_position = await createPosition(req.body, req.user._id, req.params.companyId);
        res.send(new_position);
    })
);


router.get(
    "/:positionId",
    auth,
    asyncMiddleware(async (req, res) => {
        const position = await Position.findById(req.params.positionId).populate("template");
       res.json(position);
    })
);

router.get(
    "/",
    auth,
    asyncMiddleware(async (req, res) => {
        const positions = await getAllPositionsByUserId(req.user._id);
        res.json(positions);
    })
);

router.delete(
    "/:positionId",
    auth,
    asyncMiddleware(async (req, res) => {
        const deleted_position= await deletePosition(req.params.positionId, req.user._id);
        res.send(deleted_position);
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

// router.post(
//     "/:companyID",
//     auth,
//     asyncMiddleware(async (req, res) => {
//         if (!req.user._id) {
//             return res.status(404).send("This user is not logged in.");
//         }
//         let new_position = await createPosition(req.body, req.params.companyID);
//         res.send(new_position);
//     })
// );

// router.get(
//     "/:companyId/:positionId",
//     auth,
//     asyncMiddleware(async (req, res) => {
//         let position;
//         const company = await Company.findById(req.params.companyId);
//         if (company && req.params.positionId && company.positions) {
//             position = company.positions.find(
//                 (position) => position._id == req.params.positionId
//             );
//         }
//         return position
//             ? res.send(position)
//             : company && company.positions
//                 ? res.status(404).send("The givan position ID is not found")
//                 : res
//                     .status(404)
//                     .send("This company is not exist or it has no positions");
//     })
// );


// router.get(
//     "/:companyId",
//     auth,
//     asyncMiddleware(async (req, res) => {
//         const company = await Company.findById(req.params.companyId);
//         if (company && company.positions) {
//             return res.send(company.positions);
//         }
//         res.status(404).send(
//             "This company was not exist or it has no positions"
//         );
//     })
// );



router.put(
    "/:companyId/:positionId",
    auth,
    asyncMiddleware(async (req, res) => {
        const company = await Company.findById(req.params.companyId);
        let position;
        if (company) {
            if (company.positions) {
                position = company.positions.find(
                    (position) => position._id == req.params.positionId
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

/**
 * @swagger
 * /positions/suggestions/{companyId}/{positionId}:
 *   get:
 *     summary: return suggested users for the postion
 *     tags: [positions]
 *     parameters:
 *       - in : path
 *         name: companyId
 *         description: id of the company
 *         schema:
 *           type: string
 *         required: true
 *       - in : path
 *         name: positionId
 *         description: id of the position
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: the list of the suggested users for the postion sorted by the matching score
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user:
 *                     $ref: '#/components/schemas/User'
 *                   score:
 *                     type: integer
 *                     required: true
 */

router.get(
    "/suggestions/:companyId/:positionId",
    auth,
    asyncMiddleware(async (req, res) => {
        const company = await Company.findById(req.params.companyId);
        const count = parseInt(req.query.count) ? req.query.count : 10;
        const userId = req.user._id;

        if (company) {
            if (company.positions) {
                const position = company.positions.find(
                    (position) => position._id == req.params.positionId
                );

                if (position) {
                    let suggestedUsers = [];
                    const pageSize = 20;
                    const totalUsers = await User.count();
                    console.log("we have:", totalUsers, "users");
                    for (let page = 0; page * pageSize < totalUsers; page++) {
                        // const users = await User.aggregate([
                        //     {
                        //         $match: {
                        //             _id: {
                        //                 $ne: userId,
                        //             },
                        //             role: "User",
                        //         },
                        //     },
                        //     {
                        //         $skip: page * pageSize,
                        //     },
                        //     {
                        //         $limit: pageSize,
                        //     },
                        //     {
                        //         $project: {
                        //             _id: 1,
                        //             firstName: 1,
                        //             lastName: 1,
                        //             email: 1,
                        //             cvs: 1,
                        //         },
                        //     },
                        //     {
                        //         $lookup: {
                        //             from: "cvs",
                        //             localField: "cvs",
                        //             foreignField: "_id",
                        //             as: "cvs",
                        //         },
                        //     },
                        // ]);

                        const users = User.find().populate("cv")

                        users.forEach((currUser) => {
                            let userScore = 0;
                            currUser.cvs.forEach((currUserCv) => {
                                let cvScore = 0;
                                currUserCv.tags.forEach((currTag) => {
                                    if (
                                        position.tags.some(
                                            (currPosTag) =>
                                                currPosTag.toLowerCase() ===
                                                currTag.toLowerCase()
                                        )
                                    ) {
                                        cvScore++;
                                    }
                                });
                                if (cvScore > userScore) {
                                    userScore = cvScore;
                                }
                            });
                            if (suggestedUsers.length < count) {
                                suggestedUsers.push({
                                    user: currUser,
                                    score: userScore,
                                });
                            } else {
                                const currMin = minBy(
                                    suggestedUsers,
                                    (currUserSuggestion) =>
                                        currUserSuggestion.score
                                );

                                if (currMin.score < userScore) {
                                    const minIndex = suggestedUsers.indexOf(
                                        (curr) => curr.socre === currMin.socre
                                    );
                                    suggestedUsers[minIndex] = {
                                        user: currUser,
                                        score: userScore,
                                    };
                                }
                            }
                        });
                    }
                    suggestedUsers.sort((a, b) => b.score - a.score);
                    res.send(suggestedUsers);
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
