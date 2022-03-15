import { Account } from "../class/Account";
import { User } from "../class/User";
import AccountSchema from "../Entities/AccountSchema";
import UserSchema from "../Entities/UserSchema";
import databaseService from "./databaseService";
import roomService from "./roomService";
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

   async createAccount(email:String,pass:String,nickName:String) {
    const account=new AccountSchema({useremail:email,password:pass,nickname:nickName});
    const user=new UserSchema({useremail:email,nickname:nickName,currentRoom:roomService.getDefaultRoom().getRoomName()});

    await account.save().catch((e:Error)=>{
      console.log(e);
    });
    await user.save().catch((e:Error)=>{
      console.log(e);
    });

    const accountObj=new Account(email,pass,nickName);
    this.accounts.set(email,accountObj);
    const userObj=new User(email,nickName);
    userService.getUsers().push(userObj);
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