const mockingoose = require("mockingoose");
const { Step } = require("../../../models/step");
const { updateStepById } = require("../../../services/step");

const mockStep = {
  _doc: {
    _id: "507f191e810c19729de860ea"
  }
};
const expectedResulte = "res";

mockingoose(Step).toReturn(mockStep, "findByIdAndUpdate");
mockingoose(Step).toReturn(expectedResulte, "findById");

describe("step", () => {
  describe("updateStepById", () => {
    it("shuld return id ", async () => {
      const res = await updateStepById("bla", "1");
      
      return model.findById({ _id: '507f191e810c19729de860ea' }).then(doc => {
        expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
      });

      expect(res).toBe(expectedResulte);
    });
  });
});
