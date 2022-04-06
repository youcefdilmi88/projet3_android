export class User {
    private useremail:String;
    private nickname:String;
    private lastLoggedIn:Number;
    private lastLoggedOut:Number;
    private friends:String[]=[];
    private avatar:String;
   

    constructor(useremail:String,nickname:String,friends:String[],avatar:String) {
        this.useremail=useremail;
        this.nickname=nickname;
        this.friends=friends;
        this.avatar=avatar;
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

    getFriends():String[] {
        return this.friends;
    }

    getAvatar():String {
        return this.avatar;
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

    setFriends(friends:String[]):void {
        this.friends=friends;
    }

    setAvatar(avatar:String):void {
        this.avatar=avatar;
    }

    addFriend(friend:String) {
        this.friends.push(friend);
    }

    removeFriend(friend:String) {
        const index = this.friends.indexOf(friend);
        
        if (index > -1) {
            this.friends.splice(index, 1); 
        }
    }

}
