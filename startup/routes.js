const express = require("express");
const helmet = require("helmet");
const application = require("../routes/application");
const company = require("../routes/company");
const position = require("../routes/position");
const step = require("../routes/step");
const home = require("../routes/home");
const user = require("../routes/user");
const cv = require("../routes/cv");
const auth = require("../routes/auth");
const error = require("../middleware/error");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");

module.exports = function (app) {
  app.use(express.json({ limit: "50mb" }));
  app.use(helmet());
  app.use("/api/user", user);
  app.use("/api/application", application);
  app.use("/api/company", company);
  app.use("/api/position", position);
  app.use("/api/step", step);
  app.use("/api/auth", auth);
  app.use("/api/cv", cv);
  app.use("/", home);
  app.use(error);
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(methodOverride("_method"));
};
