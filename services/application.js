const {validateApplication, Application} = require("../models/application");


async function createApplication(application){
    const { error } = validateApplication(application);
    if (error) return (error.details[0].message);
    let new_application=new Application(application);
    const return_value= await new_application.save();
    return return_value;
}


module.exports= {createApplication};