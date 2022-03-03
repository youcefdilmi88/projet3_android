import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SocketService } from '@app/services/socket/socket.service';
import { catchError } from 'rxjs/operators';
//import { RoomsComponent } from '../rooms/rooms.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent implements AfterViewInit {
  @ViewChild('chatinput') input: any;
  private readonly BASE_URL: string =//"http://localhost:8080/";
  "https://projet3-3990-207.herokuapp.com/";
  //"http://localhost:8080/";

  public message = new Array<string>();
  public others = new Array<string>();
  public time = new Array<string>();

  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    private socketService: SocketService,
    private router: Router
    ) { }

  ngAfterViewInit(): void {   
    let link=this.BASE_URL+"message/getRoomMessages/" + `${this.socketService.currentRoom}`;  
    this.http.get<any>(link).subscribe((data: any) => {

      let length = Object.keys(data).length;
   
      for(var i = 0; i <= length; i++) {
        const datepipe: DatePipe = new DatePipe('en-CA');
        let formattedDate = datepipe.transform(data[i].time, 'dd-MM-yyyy HH:mm:ss') as string;

        if (this.socketService.nickname == data[i].nickname) {
          this.others.push(formattedDate);
          this.others.push(data[i].nickname);
          this.others.push(data[i].message.replace(/(\r\n|\n|\r)/gm, " "));
          this.others.push("\n");
          this.message.push("");
          this.message.push("");
          this.message.push("");
          this.message.push("\n");

        }

        if (this.socketService.nickname != data[i].nickname) {
          this.message.push(formattedDate);
          this.message.push(data[i].nickname);
          this.message.push(data[i].message.replace(/(\r\n|\n|\r)/gm, " "));
          this.message.push("\n");
          this.others.push("");
          this.others.push("");
          this.others.push("");
          this.others.push("\n");
        }
      }
    });

    this.socketService.getSocket().on("MSG", (data)=>{   
      const datepipe: DatePipe = new DatePipe('en-CA');
      let formattedDate = datepipe.transform(data.time, 'dd-MM-yyyy HH:mm:ss') as string;
      this.message.push(formattedDate);
      this.message.push(data.nickname);
      this.message.push(data.message.replace(/(\r\n|\n|\r)/gm, " "));
      this.message.push("\n");
      this.others.push("");
      this.others.push("");
      this.others.push("");
      this.others.push("\n");
    });
  }

  ngAfterInit() {
    console.log("chat page !");
  }

  changeRoom(): void {
    //this.dialog.open(RoomsComponent, { disableClose: true });
    this.router.navigate(['/', 'rooms']);
  }

  sendchatinput(text:String) {
    const currentTime = Date.now();

    if (text.trim() != '') {
      console.log("lenght");
      console.log(text.length);
      const msg = { time: currentTime, nickname: this.socketService.nickname, message: text.trim() }
      const datepipe: DatePipe = new DatePipe('en-CA');
      let formattedDate = datepipe.transform(currentTime, 'dd-MM-yyyy HH:mm:ss') as string;
      this.others.push(formattedDate);
      this.others.push(this.socketService.nickname);
      this.others.push(text.toString().trim().replace(/(\r\n|\n|\r)/gm, " "));
      this.others.push("\n");
      this.message.push("");
      this.message.push("");
      this.message.push("");
      this.message.push("\n");

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
    let link = this.BASE_URL + "user/logoutUser";

    this.socketService.disconnectSocket();

    this.http.post<any>(link,{ useremail: this.socketService.email }).pipe(
      catchError(async (err) => console.log("error catched" + err))
    ).subscribe((data: any) => {

      if (data.message == "success") {
        console.log("sayonara");
      }   
    });
  }
}
