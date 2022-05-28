const winston = require("winston");
const express = require("express");
const app = express();
require("dotenv").config()
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerDocument = require("./docs");

const specs = swaggerJsDoc(swaggerDocument);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

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
