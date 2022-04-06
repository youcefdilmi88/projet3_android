export class User {
    private useremail:String;
    private nickname:String;
    private lastLoggedIn:Number;
    private lastLoggedOut:Number;
   

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

    getLastLoggedIn():Number {
        return this.lastLoggedIn;
    }


    getLastLoggedOut():Number {
        return this.lastLoggedOut;
    }

    setUseremail(useremail:String):void {
        this.useremail=useremail;
    }

    setUserNickname(name:String):void {
        this.nickname=name;
    }

    setLastLoggedIn(time:Number):void {
        this.lastLoggedIn=time;
    }

    setLastLoggedOut(time:Number):void {
        this.lastLoggedOut=time;
    }

}
