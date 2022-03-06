export class User {
    private useremail:String;
    private nickname:String;
   

    constructor(useremail:String,nickname:String) {
        this.useremail=useremail;
        this.nickname=nickname;
    }

    getUseremail():String {
        return this.useremail;
    }

    getUserNickname():String {
        return this.nickname;
    }


    setUseremail(useremail:String):void {
        this.useremail=useremail;
    }

    setUserNickname(name:String):void {
        this.nickname=name;
    }

}
