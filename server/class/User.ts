export class User {
    private useremail:String;
    private nickname:String;
    private currentRoom:String;

    constructor(useremail:String,username:String,currentRoom:String) {
        this.useremail=useremail;
        this.nickname=username;
        this.currentRoom=currentRoom;
    }

    getUseremail():String {
        return this.useremail;
    }

    getUserNickname():String {
        return this.nickname;
    }

    getCurrentRoom():String {
        return this.currentRoom;
    }

    setUseremail(useremail:String):void {
        this.useremail=useremail;
    }

    setUserNickname(name:String):void {
        this.nickname=name;
    }

    setCurrentRoom(roomName:String) {
        this.currentRoom=roomName;
    }
}
