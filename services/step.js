
const {Step, validateStep} = require("../models/step");


async function createStep(step){
    step.time=new Date();
    const { error } = validateStep(step);
    if (error) return (error.details[0].message);


    const new_step = new Step ({
        title: step.title,
        description: step.description,
        time: new Date(),
        comments: step.comments
    });

    const inserted_step= await new_step.save();
    return inserted_step;

}

module.exports={createStep}