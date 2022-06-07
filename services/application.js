const { validateApplication, Application } = require("../models/application");
const { User } = require("../models/user");
const { Cv } = require("../models/cv");
const { createPosition, updatePositionById } = require("./position");
const {
  createCompanyWithPositionAddition,
  addPositionToCompany
} = require("./company");

async function createApplication(application, userId, companyId) {
  console.log("BEFORE", application);
  const { error } = validateApplication(application);
  if (error) return error.details[0].message;

  const user = await User.findById(userId);
  console.log({ user });
  let cvId;

  if (user._doc.role.toLowerCase() === "candidate") {
    console.log(11111, application.cvFiles);
    const cv = await Cv.findById(application.cvFiles);

    cvId = cv._doc._id;
    application.position.tags = cv._doc.tags;
    console.log({ application });
  }

  const inserted_position = await createPosition(
    application.position,
    userId,
    companyId
  );

  console.log({ inserted_position });

  let new_application = new Application({
    cvFiles: cvId,
    comments: [],
    isFavorite: false,
    isActive: true,
    position: inserted_position._doc._id,
    steps: [],
    company: companyId,
    isMatch: true
  });
  console.log({ new_application });

  const inserted_application = await new_application.save();
  user._doc.applications
    ? user._doc.applications.push(inserted_application._doc._id)
    : (user._doc.applications = [inserted_application._doc._id]);
  await user.save();
  const returned_appliaction = await Application.findById(
    inserted_application._doc._id
  ).populate("position");
  return returned_appliaction;
}

async function createMatch(application, userId, companyId, hrId) {
  const { error } = validateApplication(application);
  if (error) return error.details[0].message;

  const user = await User.findById(userId);
  const inserted_position = await updatePositionById(
    application.position,
    application.position._id
  );
  console.log(inserted_position);
  let inserted_cv = null;
  if (application.cvFile) {
    inserted_cv = await createCv(application.cvFile);
  }

  let new_application = new Application({
    cvFiles: inserted_cv?._doc?._id,
    comments: [],
    isFavorite: false,
    isActive: true,
    position: inserted_position._doc._id,
    steps: inserted_position._doc.template,
    company: companyId,
    isMatch: false
  });
  console.log({});
  const inserted_application = await new_application.save();
  user._doc.applications
    ? user._doc.applications.push(inserted_application._doc._id)
    : (user._doc.applications = [inserted_application._doc._id]);
  await user.save();
  const returned_appliaction = await Application.findById(
    inserted_application._doc._id
  ).populate("position");
  return returned_appliaction;
}

async function getAllApplicationsByUserId(userId) {
  const user = await User.findById(userId).populate({
    path: "applications",
    populate: [
      {
        path: "position",
        model: "Position"
      },
      {
        path: "company",
        model: "Company"
      }
    ]
  });
  return user._doc.applications;
}

async function getApplicationById(applicationId) {
  const application = await Application.findById(applicationId)
    .populate("position")
    .populate("steps");
  return application._doc;
}

async function deleteApplicationById(applicationId, userId) {
  const user = await User.findById(userId);
  const updated_applications = user._doc.applications.filter(
    cur => String(cur) != applicationId
  );
  await User.findByIdAndUpdate(userId, { applications: updated_applications });
  const removed_application = await Application.findByIdAndRemove(
    applicationId
  );
  return removed_application;
}

async function addComment(comment, applicationId) {
  const application = await Application.findById(applicationId);
  application._doc.comments
    ? application._doc.comments.push(comment)
    : (application._doc.comments = [comment]);
  return await application.save();
}

module.exports = {
  createApplication,
  getAllApplicationsByUserId,
  getApplicationById,
  deleteApplicationById,
  addComment,
  createMatch
};
