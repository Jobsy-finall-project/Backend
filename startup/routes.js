import express from "express";
import helmet from "helmet";
import application from "../routes/application";
import company from "../routes/company";
import position from "../routes/position";
import step from "../routes/step";
import home from "../routes/home";
import user from "../routes/user";
import auth from "../routes/auth";
import error from "../middleware/error";
import methodOverride from "method-override";
import bodyParser from "body-parser";

module.exports = function(app) {
  app.use(express.json());
  app.use(helmet());
  app.use("/api/user", user);
  app.use("/api/application", application);
  app.use("/api/company", company);
  app.use("/api/position", position);
  app.use("/api/step", step);
  app.use("/api/auth", auth);
  app.use("/", home);
  app.use(error);
  app.use(bodyParser.json());
  app.use(methodOverride("_method"));
};
