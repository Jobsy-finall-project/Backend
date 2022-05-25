import { User } from "../models/user";
import bcrypt from "bcrypt";


export class UserProvider {

async createUser(user){
    let new_user = await User.findOne({ email: user.email });
    if (new_user) return res.status(409).send("this email is already exist.");
    new_user = null;
    new_user = await User.findOne({ userName: user.userName });
    if (new_user) return res.status(409).send("this user name is already exist.");
  
    new_user = new User({
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email,
        password: user.password,
        role: user.role,
        apllications: [],
        cvs: []
      });
    
      const salt = await bcrypt.genSalt(10);
      new_user.password = await bcrypt.hash(new_user.password, salt);
      new_user = await new_user.save();
      return new_user;
}


}
