const { Company } = require("../models/company");
const {validatePosition} = require("../models/position");
const { Position } = require("../models/position");



async function createPosition(position){
        const { error } = validatePosition(position);
        if (error) return (error.details[0].message);
        let new_position= new Position(position);
        const return_value= await new_position.save();
        // let company = await Company.findById(companyID);
        // if(company?.positions) {
        //   company.positions.push(position);
        // }
        // const return_value = await company.save();
        return return_value;
}


module.exports= {createPosition};