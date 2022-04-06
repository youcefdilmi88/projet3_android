export class User {
    private useremail:String;
    private nickname:String;
    private lastLoggedIn:Number;
    private lastLoggedOut:Number;
    // private avatar:String;
   

    constructor(useremail:String,nickname:String,/*avatar:String*/) {
        this.useremail=useremail;
        this.nickname=nickname;
       // this.avatar=avatar;
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

   /* getAvatar():String {
        return this.avatar;
    }*/

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

   /* setAvatar(avatar:String):void {
        this.avatar=avatar;
    }*/

}
