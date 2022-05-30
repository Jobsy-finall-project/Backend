const {validateApplication, Application} = require("../models/application");
const {User} = require("../models/user");
const {createPosition} = require("./position");
const {createCompanyWithPositionAddition, addPositionToCompany} = require("./company");


async function createApplication(application, userId, companyId){
    const { error } = validateApplication(application);
    if (error) return (error.details[0].message);

    const user = await User.findById(userId);
    const inserted_position= await createPosition(application.position, userId, companyId);

    let inserted_cv=null;
    if(application.cvFile){
        inserted_cv = await createCv(application.cvFile);
    }

    let new_application=new Application({
        cvFile:inserted_cv?._doc?._id,
        comments:[],
        isFavorite:false,
        isActive:true,
        position:inserted_position._doc._id,
        steps:[],
        company:companyId,
        isMatch:false
    });
    const inserted_application= await new_application.save();
    user._doc.applications? user._doc.applications.push(inserted_application._doc._id):user._doc.applications=[inserted_application._doc._id];
    await user.save();
    return inserted_application;
}

async function getAllApplicationsByUserId(userId){
    const user = await User.findById(userId).populate({
        path:"applications",
        populate:{
            path:"position",
            model:"Position"
        },
    });
    return user._doc.applications;
}

async function getApplicationById(applicationId){
    const application = await Application.findById(applicationId).populate("position");
    return application._doc;
}

async function deleteApplicationById(applicationId, userId){
    const user= await User.findById(userId);
    //need to fix- dont delete from user
    user._doc.applications=user._doc.applications.filter(cur=>String(cur)!=applicationId);
    await user.save();
    const removed_application= await Application.findByIdAndRemove(applicationId);
    return removed_application;
}


module.exports= {createApplication,getAllApplicationsByUserId,getApplicationById,deleteApplicationById};