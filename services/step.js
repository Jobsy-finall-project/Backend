
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
    const { error } = validateStep(step);
    if (error) return (error.details[0].message);


    const new_step = new Step ({
        title: step.title,
        description: step.description,
        time: step.time,
        comments: step.comments
    });
    const inserted_step= await new_step.save();
    return inserted_step;
}

async function getStepById(stepId){
    const step = await Step.findById(stepId);
    return step;
}

async function getAllSteps(stepId){
    const step = await Step.find({})
    return step;
}

async function addComment(comment, stepId) {
    const step= await Step.findById(stepId);
    step._doc.comments ? step._doc.comments.push(comment) : step._doc.comments = [comment];
    return await step.save();
}

async function deleteComment(commentIndex, stepId) {
    const step = await Step.findById(stepId);
    step._doc.comments.splice(commentIndex,1)
    return await step.save();
}

async function updateStepById(newDetailes, stepId){
    const step= await Step.findByIdAndUpdate(stepId,{...newDetailes})
    const updated_step= await Step.findById(step._doc._id);
    return updated_step;

}

async function deleteStepFromApplication(applicationId, stepId){
    const current_application = await Application.findById(applicationId);
    const updated_steps = current_application._doc.steps.filter(cur => String(cur) !== stepId);
    await Application.findByIdAndUpdate(applicationId, {steps:updated_steps});
    const returned_application = await Application.findById(applicationId).populate("steps");
    await Step.findByIdAndRemove(stepId);
    return returned_application;
}

async function deleteStepFromPosition(positionId, stepId){
    const current_position = await Position.findById(positionId);
    const updated_template = current_position._doc.template.filter(cur => String(cur) !== stepId);
    await Position.findByIdAndUpdate(positionId, {template:updated_template});
    const returned_position = await Position.findById(positionId).populate("template");
    await Step.findByIdAndRemove(stepId);
    return returned_position;
}

module.exports={createStepAndAddToPosition, createStepAndAddToApplication,
    getStepById, addComment, deleteComment, updateStepById, deleteStepFromApplication, deleteStepFromPosition, getAllSteps}