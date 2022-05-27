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

router.post(
    "/",
    auth,
    asyncMiddleware(async (req, res) => {
        const { error } = validateCv(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        let cv = {
            title: req.body.title,
            cvFile: req.body.cvFile,
            tags: [],
        };

        axios
            .post("http://localhost:5000/", {
                name: cv.title,
                file: cv.cvFile,
            })
            .then(async (axiosRes) => {
                if (axiosRes.status === 200) {
                    console.log(axiosRes.data);
                    cv.tags = axiosRes.data;

                    let user = await User.findOne({
                        _id: req.user._id,
                    });
                    console.log(user);
                    len = user.cvs.push(cv);
                    await user.save();
                }
                res.send(cv)
            });
    })
);

module.exports = router;
