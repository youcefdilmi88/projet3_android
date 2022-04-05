import { Account } from "../class/Account";
import { User } from "../class/User";
import { VISIBILITY } from "../Constants/visibility";
import AccountSchema from "../Entities/AccountSchema";
import UserSchema from "../Entities/UserSchema";
import albumService from "./albumService";
import databaseService from "./databaseService";
import userService from "./userService";


class AccountService {

  constructor() {
    this.loadAllAccount();
  }

  private accounts=new Map<String,Account>(); // all users accounts in database  useremail | account

  async loadAllAccount() {
    this.accounts.clear();
    await databaseService.getAllAccounts().then((accounts)=>{
         accounts.forEach((account)=>{
             let accountObj=new Account(account.useremail,account.password,account.nickname)
             this.accounts.set(account.useremail,accountObj);
         })
    }).catch((e:Error)=>{
        console.log(e);
    });

   }

   async createAccount(email:String,pass:String,nickName:String,avatar:String) {
    let friends:String[]=[];
    const account=new AccountSchema({useremail:email,password:pass,nickname:nickName});
    const user=new UserSchema({useremail:email,nickname:nickName,lastLoggedIn:null,lastLoggedOut:null,friends:friends,avatar:avatar});
    
    await account.save().catch((e:Error)=>{
      console.log(e);
    });
    await user.save().catch((e:Error)=>{
      console.log(e);
    });

    const accountObj=new Account(email,pass,nickName);
    this.accounts.set(email,accountObj);
    
    const userObj=new User(email,nickName,friends,avatar);
    userService.getUsers().push(userObj);
    albumService.albums.forEach(async (v,k)=>{
      if(v.getVisibility()==VISIBILITY.PUBLIC && v.getMembers().indexOf(userObj.getUseremail())==-1) {
        await albumService.addMemberToAlbum(k,userObj.getUseremail());
      }
    })
  }

  getAccounts():Map<String,Account> {
    return this.accounts;
  }

  getAccount(useremail:String) {
    if(this.accounts.has(useremail)) {
      return this.accounts.get(useremail);
    }
    return null;
  }


}

const accountService=new AccountService();
export default accountService;