const {validatePosition} = require("../models/position");
const { Position } = require("../models/position");



async function createPosition(position){
        const { error } = validatePosition(position);
        if (error) return (error.details[0].message);
        let new_position=new Position(position);
        const return_value= await new_position.save();
        return return_value;
}


module.exports= {createPosition};