const { Company } = require("../models/company");
const {validatePosition} = require("../models/position");
const { Position } = require("../models/position");



async function createPosition(position, companyID){
        const { error } = validatePosition(position);
        if (error) return (error.details[0].message);
        let company = await Company.findById(companyID);
        company.positions.push(position);
        const return_value = await company.save();
        return return_value;
}


module.exports= {createPosition};