const mongoose = require("mongoose");
const { stepSchema } = require("./step");

const positionSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 1,
    maxlength: 25
    //required: true
  },
  description: {
    type: String,
    minlength: 1,
    maxlength: 255
  },
  companyId: {
    type: String
  },
  track: [stepSchema]
});

const Position = mongoose.model("Position", positionSchema);

module.exports = { Position, positionSchema };
