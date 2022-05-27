const winston = require("winston");
const express = require("express");
const app = express();
require("dotenv").config()

require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/prod")(app);

const port = process.env.PORT || 3900;

const server = app.listen(port, () =>
  winston.info(`Listening on port ${port}...`)
);

module.exports = { server };
