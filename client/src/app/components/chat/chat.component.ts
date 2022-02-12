import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SocketService } from '@app/services/socket/socket.service';
import { catchError } from 'rxjs/operators';


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
    private http: HttpClient,
    private socketService: SocketService,
    ) { }

  ngAfterViewInit(): void {   
    let link=this.BASE_URL+"message/getRoomMessages";  
    this.http.get<any>(link).subscribe((data: any) => {

      let length = Object.keys(data).length;
   
      for(var i = 0; i <= length; i++) {
        const datepipe: DatePipe = new DatePipe('en-US');
        let formattedDate = datepipe.transform(data[i].time, 'dd-MMM-YYYY HH:mm:ss') as string;

        if (this.socketService.useremail == data[i].useremail) {
          this.message.push(formattedDate);
          this.message.push(data[i].useremail);
          this.message.push(data[i].message.replace(/(\r\n|\n|\r)/gm, ""));
          this.message.push("\n");
          this.others.push("");
          this.others.push("");
          this.others.push("");
          this.others.push("\n");
        }

        if (this.socketService.useremail != data[i].useremail) {
          this.others.push(formattedDate);
          this.others.push(data[i].useremail);
          this.others.push(data[i].message.replace(/(\r\n|\n|\r)/gm, ""));
          this.others.push("\n");
          this.message.push("");
          this.message.push("");
          this.message.push("");
          this.message.push("\n");
        }
      }
    });

    this.socketService.getSocket().on("room1", (data)=>{   
      const datepipe: DatePipe = new DatePipe('en-US');
      let formattedDate = datepipe.transform(data.time, 'dd-MMM-YYYY HH:mm:ss') as string;
      this.others.push(formattedDate);
      this.others.push(data.useremail);
      this.others.push(data.message.replace(/(\r\n|\n|\r)/gm, ""));
      this.others.push("\n");
      this.message.push("");
      this.message.push("");
      this.message.push("");
      this.message.push("\n");
    });
  }

  ngAfterInit() {
    console.log("chat page !");
  }

  sendchatinput(text:String) {
    const currentTime = Date.now();

    if (text.trim().length != 0) {
      const msg = { time: currentTime, useremail: this.socketService.useremail, message: text.trim() }
      const datepipe: DatePipe = new DatePipe('en-US');
      let formattedDate = datepipe.transform(currentTime, 'dd-MMM-YYYY HH:mm:ss') as string;
      this.message.push(formattedDate);
      this.message.push(this.socketService.useremail);
      this.message.push(text.toString().trim().replace(/(\r\n|\n|\r)/gm, ""));
      this.message.push("\n");
      this.others.push("");
      this.others.push("");
      this.others.push("");
      this.others.push("\n");

      this.socketService.getSocket().emit("msg",JSON.stringify(msg));
      this.input.nativeElement.value = ' ';
    }

    if (text.trim().length == 0) {
      this.input.nativeElement.value = ' ';
    }
  }

  public userDataCall() {
    let link=this.BASE_URL + "userData/msg";

    this.http.post<any>(link,{ msg:"sjdakjsd",user:"admin" }).subscribe((data: any) => {
      console.log(data);
    });
  }

  logout() {
    let link = this.BASE_URL + "user/logoutUser";

    this.http.post<any>(link,{ useremail: this.socketService.useremail }).pipe(
      catchError(async (err) => console.log("error catched" + err))
    ).subscribe((data: any) => {

      if (data.message == "logout") {
        console.log("sayonara");
      }   
    });
  }
}
