import AccountSchema from "../Entities/AccountSchema";
import { Account } from "../Interface/Account";
import databaseService from "./databaseService";


class AccountService {

  constructor() {
    this.loadAllAccount();
  }

  private accounts=new Map<String,Account>(); // all users accounts in database

  async loadAllAccount(){
    this.accounts.clear();
    await databaseService.getAllAccounts().then((accounts)=>{
         accounts.forEach((account)=>{
             this.accounts.set(account.useremail,account);
         })
    }).catch((e:any)=>{
        console.log(e);
    });

   }

   async createAccount(email:String,pass:String,nickName:String) {
    const account=new AccountSchema({useremail:email,password:pass,nickname:nickName});
    console.log(account.password);
    await account.save().catch((e:any)=>{
      console.log(e);
    });
    this.loadAllAccount();
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