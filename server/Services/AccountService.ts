import { Account } from "../class/Account";
import AccountSchema from "../Entities/AccountSchema";
import UserSchema from "../Entities/UserSchema";
import databaseService from "./databaseService";
import userService from "./userService";


class AccountService {

  constructor() {
    this.loadAllAccount();
  }

  private accounts=new Map<String,Account>(); // all users accounts in database

  async loadAllAccount() {
    this.accounts.clear();
    await databaseService.getAllAccounts().then((accounts)=>{
         accounts.forEach((account)=>{
             let accountObj=new Account(account.useremail,account.password,account.nickname)
             this.accounts.set(account.useremail,accountObj);
         })
    }).catch((e:any)=>{
        console.log(e);
    });

   }

   async createAccount(email:String,pass:String,nickName:String) {
    const account=new AccountSchema({useremail:email,password:pass,nickname:nickName});
    const user=new UserSchema({useremail:email,nickname:nickName});

    await account.save().catch((e:any)=>{
      console.log(e);
    });
    await user.save().catch((e:any)=>{
      console.log(e);
    });

    this.loadAllAccount();
    userService.loadAllUsers();
  }

  getAccounts():Map<String,Account> {
    return this.accounts;
  }

  getAccount(useremail:String) {
    if(this.accounts.has(useremail)) {
      console.log(this.accounts.get(useremail));
      return this.accounts.get(useremail);
    }
    return null;
  }


}

const accountService=new AccountService();
export default accountService;