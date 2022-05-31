
const {Step, validateStep} = require("../models/step");
const {Position} = require("../models/position");
const {Application} = require("../models/application");


async function createStepAndAddToPosition(step, positionId){
    const position = await Position.findById(positionId);
    if(!position)
        throw new Error("The position not found");
    const inserted_step = await createStep(step);
    position._doc.template.push(inserted_step._doc._id);
    await position.save();
    return inserted_step;

}

async function createStepAndAddToApplication(step, applicationId){
    const application = await Application.findById(applicationId);
    if(!application)
        throw new Error("The application not found");
    const inserted_step = await createStep(step);
    application._doc.steps.push(inserted_step._doc._id);
    await application.save();
    return inserted_step;
}

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

async function getStepById(stepId){
    const step = await Step.findById(stepId);
    return step;
}

async function addComment(comment, stepId){
    const step= await Step.findById(stepId);
    step._doc.comments?step._doc.comments.push(comment):step._doc.comments=[comment];
    return await step.save();
}

module.exports={createStepAndAddToPosition, createStepAndAddToApplication, getStepById, addComment}