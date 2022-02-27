export class User {
    private useremail:String;
    private username:String;

    constructor(useremail:String,username:string) {
        this.useremail=useremail;
        this.username=username;
    }

    getUseremail():String {
        return this.useremail;
    }

    getUsername():String {
        return this.username;
    }

    setUseremail(useremail:String):void {
        this.useremail=useremail;
    }

    setUsername(name:String):void {
        this.username=name;
    }
}
