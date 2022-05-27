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
                (position) => position._id == req.params.positionId
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
        res.status(404).send(
            "This company was not exist or it has no positions"
        );
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
                        const users = await User.find(
                            {
                                _id: {
                                    $ne: userId,
                                },
                                role: "User",
                            },
                            {
                                _id: 1,
                                firstName: 1,
                                lastName: 1,
                                email: 1,
                                cvs: 1,
                            }
                        )
                            .skip(page * pageSize)
                            .limit(pageSize);

                        users.forEach((currUser) => {
                            let userScore = 0;
                            currUser.cvs.forEach((currCv) => {
                                let cvScore = 0;
                                currCv.tags.forEach((currTag) => {
                                    if (position.tags.includes(currTag)) {
                                        cvScore++;
                                    }
                                });

                                userScore = max(userScore, cvScore);
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

                                if (currMin < userScore) {
                                    const minIndex = suggestedUsers.indexOf(
                                        (curr) => curr.socre === currMin
                                    );
                                    suggestedUsers[minIndex] = {
                                        user: currUser,
                                        score: userScore,
                                    };
                                }
                            }
                        });
                    }
                    suggestedUsers.sort((a, b) => a.score - b.score);
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
