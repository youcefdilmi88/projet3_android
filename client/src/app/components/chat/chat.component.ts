import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SocketService } from '@app/services/socket/socket.service';
//import { catchError } from 'rxjs/operators';
//import { RoomsComponent } from '../rooms/rooms.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { URL } from '../../../../constants';
import { French, English } from '@app/interfaces/Langues';
import { LightGrey, DarkGrey, DeepPurple, LightBlue, LightPink } from '@app/interfaces/Themes';
import { Logout2Component } from '../logout2/logout2.component';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent implements AfterViewInit {
  @ViewChild('chatinput') input: any;
  @ViewChild('message-icon') chatzone: HTMLElement;
  private readonly BASE_URL: string = URL;

  public message = new Array<string>();
  public others = new Array<string>();
  public time = new Array<string>();

  public chatTitle: string;
  public roomChange: string;

  public source: string;
  public source2: string;
  // chatTitle: "Clavardage",
  // changeRoom: "Changer de salle",


  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    private socketService: SocketService,
    private router: Router,
    ) { 
    }

  ngAfterViewInit(): void {  
    this.playAudio("ui2.wav")
    if(this.router.url == "/clavardage") {
      document.getElementById("principal")!.style.width = "100%";
    }
    else if(this.router.url == "/sidenav") {
      document.getElementById("principal")!.style.width = "500px";
    }

    if(this.socketService.language == "french") {
      this.chatTitle =  French.chatTitle;
      this.roomChange = French.changeRoom;
     }
     else {
       this.chatTitle =  English.chatTitle;
       this.roomChange = English.changeRoom;
     }
     if(this.socketService.theme == "light grey"){
      document.getElementById("title9")!.style.backgroundColor = LightGrey.main;
      document.getElementById("title9")!.style.color = LightGrey.text;
    }
    else if(this.socketService.theme == "dark grey"){
      document.getElementById("title9")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("title9")!.style.color = DarkGrey.text;
    }
    else if(this.socketService.theme == "deep purple") {       
      document.getElementById("title9")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("title9")!.style.color = DeepPurple.text;
    }
    else if(this.socketService.theme == "light blue") { 
      document.getElementById("title9")!.style.backgroundColor = LightBlue.main;
      document.getElementById("title9")!.style.color = LightBlue.text;
    }
    else if(this.socketService.theme == "light pink") {  
      document.getElementById("title9")!.style.backgroundColor = LightPink.main;
      document.getElementById("title9")!.style.color = LightPink.text;
    }

    let link=this.BASE_URL+"message/getRoomMessages/" + `${this.socketService.currentRoom}`;  
    console.log("CHECK MOI HEHE:" + this.socketService.currentRoom);
    this.http.get<any>(link).subscribe((data: any) => {

      let length = Object.keys(data).length;
   
      for(var i = 0; i <= length; i++) {
        const datepipe: DatePipe = new DatePipe('en-CA');
        let formattedDate = datepipe.transform(data[i].time, 'dd-MM-yyyy HH:mm:ss') as string;

        if (this.socketService.nickname == data[i].nickname) {
          var html = '<div class="message-icon">' + '<img src= "avatar0.png" alt="Italian Trulli">' + '</div>' +
          '<div class="message-icon">' + '<img src= "avatar0.png" alt="Italian Trulli">' + '</div>'
          document.getElementById("message-icon")!.innerHTML += `${html}`;

          console.log(this.source);
          this.others.push(formattedDate + '\n' + data[i].nickname + '\n' + data[i].message.replace(/(\r\n|\n|\r)/gm, " ") + '\n');
          //this.others.push(data[i].nickname);
          //this.others.push(data[i].message.replace(/(\r\n|\n|\r)/gm, " "));
          //this.others.push("\n");
          this.message.push('\n\n\n');
          //this.message.push("");
          //this.message.push("");
          //this.message.push("\n");
          //this.message.push("\n");

        }

        if (this.socketService.nickname != data[i].nickname) {
          let html;
          switch(data[i].avatar) {
            case "1": {
              html = '<div class="message-icon">' + '<img src= "avatar1.png" alt="Italian Trulli">' + '</div>' +
              '<div class="message-icon">' + '<img src= "avatar0.png" alt="Italian Trulli">' + '</div>';
              break;
            }
            case "2": {
              html = '<div class="message-icon">' + '<img src= "avatar2.png" alt="Italian Trulli">' + '</div>' +
              '<div class="message-icon">' + '<img src= "avatar0.png" alt="Italian Trulli">' + '</div>';
              break;
            }
            case "3": {
              html = '<div class="message-icon">' + '<img src= "avatar3.png" alt="Italian Trulli">' + '</div>' +
              '<div class="message-icon">' + '<img src= "avatar0.png" alt="Italian Trulli">' + '</div>';
              break;
            }
            case "4": {
              html = '<div class="message-icon">' + '<img src= "avatar4.png" alt="Italian Trulli">' + '</div>' +
              '<div class="message-icon">' + '<img src= "avatar0.png" alt="Italian Trulli">' + '</div>';
              break;
            }
            case "5": {
              console.log("case 5");
              html = '<div class="message-icon">' + '<img src= "avatar5.png" alt="Italian Trulli">' + '</div>' +
              '<div class="message-icon">' + '<img src= "avatar0.png" alt="Italian Trulli">' + '</div>';
              break;
            }
          }
          document.getElementById("message-icon")!.innerHTML += `${html}`;

          this.message.push(formattedDate + '\n' + data[i].nickname + '\n' + data[i].message.replace(/(\r\n|\n|\r)/gm, " ")+ '\n');
          //this.message.push(data[i].nickname);
          //this.message.push(data[i].message.replace(/(\r\n|\n|\r)/gm, " "));
          //this.message.push("\n");
          this.others.push('\n\n\n');
          //this.others.push("");
          //this.others.push("");
          //this.others.push("\n");
        }
      }
    });

    this.socketService.getSocket().on("MSG", (data)=>{
      data = JSON.parse(data);
      this.playAudio("cell_notif.wav");
      console.log("socket room " + this.socketService.currentRoom.trim());
      console.log("data room " + data.roomName);
      console.log("avatar", data.msg.avatar);
      if (data.roomName == this.socketService.currentRoom.trim()) {
        let html;
        console.log("get in bruh");
        switch(data.msg.avatar) {
          case "1": {
            console.log("case 1");
            html = '<div class="message-icon">' + '<img src= "avatar1.png" alt="Italian Trulli">' + '</div>' +
            '<div class="message-icon">' + '<img src= "avatar0.png" alt="Italian Trulli">' + '</div>';
            break;
          }
          case "2": {
            console.log("case 2");
            html = '<div class="message-icon">' + '<img src= "avatar2.png" alt="Italian Trulli">' + '</div>' +
            '<div class="message-icon">' + '<img src= "avatar0.png" alt="Italian Trulli">' + '</div>';
            break;
          }
          case "3": {
            console.log("case 3");
            html = '<div class="message-icon">' + '<img src= "avatar3.png" alt="Italian Trulli">' + '</div>' +
            '<div class="message-icon">' + '<img src= "avatar0.png" alt="Italian Trulli">' + '</div>';
            break;
          }
          case "4": {
            console.log("case 4");
            html = '<div class="message-icon">' + '<img src= "avatar4.png" alt="Italian Trulli">' + '</div>' +
            '<div class="message-icon">' + '<img src= "avatar0.png" alt="Italian Trulli">' + '</div>';
            break;
          }
          case "5": {
            console.log("case 5");
            html = '<div class="message-icon">' + '<img src= "avatar5.png" alt="Italian Trulli">' + '</div>' +
            '<div class="message-icon">' + '<img src= "avatar0.png" alt="Italian Trulli">' + '</div>';
            break;
          }
        }

        //var html = '<div class="message-icon">' + '<img src= "avatar2.png" alt="Italian Trulli">' + '</div>' +
        //'<div class="message-icon">' + '<img src= "avatar0.png" alt="Italian Trulli">' + '</div>'
        document.getElementById("message-icon")!.innerHTML += `${html}`;
        const datepipe: DatePipe = new DatePipe('en-CA');
        let formattedDate = datepipe.transform(data.msg.time, 'dd-MM-yyyy HH:mm:ss') as string;

        this.message.push(formattedDate + '\n' + data.msg.nickname + '\n' + data.msg.message.replace(/(\r\n|\n|\r)/gm, " ")+ '\n');
        //this.message.push(data.msg.nickname);
        //this.message.push(data.msg.message.replace(/(\r\n|\n|\r)/gm, " "));
        //this.message.push("\n");
        this.others.push('\n\n\n');
        //this.others.push("");
        //this.others.push("");
        //this.others.push("\n");
      }
      else if (data.roomName == this.socketService.currentRoom.trim()) {
        const datepipe: DatePipe = new DatePipe('en-CA');
        let formattedDate = datepipe.transform(data.msg.time, 'dd-MM-yyyy HH:mm:ss') as string;
        this.message.push(formattedDate + '\n' + data.msg.nickname + '\n' + data.msg.message.replace(/(\r\n|\n|\r)/gm, " ") + '\n');
        //this.message.push(data.msg.nickname);
        //this.message.push(data.msg.message.replace(/(\r\n|\n|\r)/gm, " "));
        //this.message.push("\n");
        this.others.push('\n\n\n');
        //this.others.push("");
        //this.others.push("");
        //this.others.push("\n");
      }
    });
  }

  ngAfterInit() {
    console.log("chat page !");
  }

  playAudio(title: string) {
    if (this.socketService.mute == false) {
      let audio = new Audio();
      audio.src = "../../../assets/" + title;
      audio.load();
      audio.play();
    }
  }

  leaveDrawing() {
    console.log("current", this.socketService.currentRoom);
    // this.socketService.currentRoom = "randomSHIT";
    let link = this.BASE_URL + "drawing/leaveDrawing";

    if(this.router.url == "/sidenav") {
      this.http.post<any>(link,{ useremail: this.socketService.email}).subscribe((data: any) => {
        console.log("response", data);
        if(data.message == "success") {
          console.log("EXITED DRAWING" + data.useremail);
          this.playAudio("ui2.wav");
        }
      });
      // this.router.navigate(['/', 'dessins']);
    }
  }

  changeRoom(): void {
    //this.dialog.open(RoomsComponent, { disableClose: true });
    this.router.navigate(['/', 'rooms']);
    this.playAudio("ui2.wav");
    console.log("bing me there");
    // if(this.router.url == "/sidenav") {
    //   this.socketService.drawingName = this.socketService.currentRoom;
    // }

    this.leaveDrawing();
  }

  sendchatinput(text:String) {
    const currentTime = Date.now();

    if (text.trim() != '') {
      console.log("avatar", this.socketService.avatarNumber);
      const msg = { time: currentTime, nickname: this.socketService.nickname, message: text.trim(), avatar: this.socketService.avatarNumber };
      //const mesg = { roomName: this.socketService.currentRoom, msg: { time: currentTime, nickname: this.socketService.nickname, message: text.trim() }};
      const datepipe: DatePipe = new DatePipe('en-CA');
      let formattedDate = datepipe.transform(currentTime, 'dd-MM-yyyy HH:mm:ss') as string;

      var html = '<div class="message-icon">' + '<img src= "avatar0.png" alt="Italian Trulli">' + '</div>' +
      '<div class="message-icon">' + '<img src= "avatar0.png" alt="Italian Trulli">' + '</div>'
      document.getElementById("message-icon")!.innerHTML += `${html}`;

      this.others.push(formattedDate + '\n' + this.socketService.nickname + '\n' + text.toString().trim().replace(/(\r\n|\n|\r)/gm, " ") + '\n');
      //this.others.push(this.socketService.nickname);
      //this.others.push(text.toString().trim().replace(/(\r\n|\n|\r)/gm, " "));
      //this.others.push("\n");
      this.message.push('\n\n\n');
      //this.message.push("");
      //this.message.push("");
      //this.message.push("\n");

      this.playAudio("msg.wav");

      this.socketService.getSocket().emit("MSG",JSON.stringify(msg));

      this.input.nativeElement.value = ' ';
    }

    if (text.trim().length == 0) {
      this.input.nativeElement.value = ' ';
    }
    this.input.nativeElement.focus();
  }

  public userDataCall() { 
    let link=this.BASE_URL + "userData/msg";

    this.http.post<any>(link,{ msg:"sjdakjsd",user:"admin" }).subscribe((data: any) => {
      console.log(data);
    });
  }

  logout() {
    /*let link = this.BASE_URL + "user/logoutUser";

    this.playAudio("ui1.wav");
    // this.socketService.disconnectSocket();

    this.leaveDrawing();

    this.http.post<any>(link,{ useremail: this.socketService.email }).pipe(
      catchError(async (err) => console.log("error catched" + err))
    ).subscribe((data: any) => {

      if (data.message == "success") {
        console.log("sayonara");
      }   
    });*/
    this.dialog.open(Logout2Component);
  }
}
