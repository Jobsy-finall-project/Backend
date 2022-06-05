const { Company } = require("../models/company");
const {validatePosition} = require("../models/position");
const { Position } = require("../models/position");
const {addPositionToCompany} = require("../services/company");
const {User} = require("../models/user");
const mongoose = require("mongoose");




async function createPosition(position, hrId, companyId){
        const { error } = validatePosition(position);
        if (error) return (error.details[0].message);

        const user = await User.findById(hrId);
        let new_position;
        if(user._doc.role.toLowerCase() ==="hr"){
           new_position = new Position({...position, hrId});
        }else{
          new_position = new Position({...position});
        }
        const inserted_position = await new_position.save();
        await addPositionToCompany(companyId, inserted_position._doc._id);

        return inserted_position;
}

async function getAllPositionsByUserId(userId){
        const positions= await Position.find({hrId:userId});
        return positions;
}

async function deletePosition(positionId, hrId){
        const position= await Position.findById(positionId);
        if(position._doc.hrId!==hrId){
                throw new Error("cant delete this position because it wasn't create by you");
        }
        const current_user = await User.findById(hrId);
        const companyId = current_user._doc.company;
        const current_company= await Company.findById(companyId);
        const updated_positions= current_company._doc.positions.filter(cur => String(cur) !== positionId);
        const updated_company = await Company.findByIdAndUpdate(companyId, {positions: updated_positions});
        const deleted_position= await Position.findByIdAndRemove(positionId);
        return deleted_position;
}

async function updatePositionById(newDetailes, positionId){
        const position= await Position.findByIdAndUpdate(positionId,{...newDetailes})
        const updated_position= await Position.findById(position._doc._id);
        return updated_position;

}



module.exports= {createPosition, getAllPositionsByUserId, deletePosition, updatePositionById};