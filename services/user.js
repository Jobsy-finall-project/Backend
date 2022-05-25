import { User } from "../models/user";
import {UserProvider} from "../providers/user";

export class UserService{

UserService(){

}

async createUser(user){
   let new_user;
        try{
            new_user= await UserProvider.createUser(user);
            const token = new_user.generateAuthToken();
        }catch(err){
            console.log(error);
        }
        
        return {new_user, token};    
    }
}
