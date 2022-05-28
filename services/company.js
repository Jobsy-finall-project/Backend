const {validateCompany, Company} = require("../models/company");


async function createCompanyWithPositionAddition(company, positionId){
    const { error } = validateCompany(company);
    if (error) return (error.details[0].message);

    let isCompanyExist= await Company.find({name:company.name});
    if(isCompanyExist.length>0){
        isCompanyExist[0]._doc.positions.push(positionId);
        const updated_company= await isCompanyExist[0].save();
        return updated_company;
    }
    else{
        company.positions=positionId;
        let new_company=new Company(company);
        const inserted_company= await new_company.save();
        return inserted_company;
    }
    return;
}

async function createCompany(company){
    const { error } = validateCompany(company);
    if (error) return (error.details[0].message);
    let isCompanyExist= await Company.find({name:company.name});
    if(isCompanyExist){

    }
    let new_company=new Company(company);
    const return_value= await new_company.save();
    return return_value;
}


module.exports= {createCompany, createCompanyWithPositionAddition};