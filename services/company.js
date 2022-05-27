const {validateCompany, Company} = require("../models/company");


async function createCompany(company){
    const { error } = validateCompany(company);
    if (error) return (error.details[0].message);
    let new_company=new Company(company);
    const return_value= await new_company.save();
    return return_value;
}


module.exports= {createCompany};