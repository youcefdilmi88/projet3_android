import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';
import { SocketService } from '@app/services/socket/socket.service';
import { Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WelcomeDialogComponent } from '../welcome-dialog/welcome-dialog/welcome-dialog.component';


@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})

export class RoomsComponent implements OnInit {

  welcomeDialogRef: MatDialogRef<WelcomeDialogComponent>;
  welcomeDialogSub: Subscription;
  private readonly BASE_URL: string =//"http://localhost:8080/";
  "https://projet3-3990-207.herokuapp.com/";

  public list = new Array<string>(); 
  public numberOfRooms: number ;
  public buttonsTexts:Array<string> = ['DEFAULT'];

  constructor(
    public dialog: MatDialog,
    private hotkeyService: HotkeysService,
    private socketService: SocketService,
    private http: HttpClient,
    private router: Router
  ) { this.hotkeyService.hotkeysListener();}

  ngOnInit(): void {
    let link = this.BASE_URL+"room/getAllRooms";
    this.http.get<any>(link).subscribe((data: any) => {
      let length = Object.keys(data).length;
      this.numberOfRooms = length;
      console.log(data , "CELUI LA");
      for(var i = 1; i <= length; i++) { 
        this.list.push(data[i].roomName);
        console.log(data[i].roomName);
        this.buttonsTexts = [...this.buttonsTexts, `${data[i].roomName}`];
      }
    });
  }

  room: string;

  changeRoom(element: any): void {
    if (this.socketService.currentRoom == element.textContent.trim()) {
      document.getElementById("error")!.style.visibility= "visible";
    }
    else {
      this.socketService.joinRoom(element.textContent.trim());
      this.socketService.currentRoom = element.textContent.trim();
      this.router.navigate(['/', 'sidenav']);

      let link = this.BASE_URL + "room/joinRoom";

      const userObj={
        useremail:this.socketService.email,
        nickname:this.socketService.nickname,
      }

      this.http.post<any>(link,{ newRoomName:this.socketService.currentRoom, user:userObj}).pipe(
        catchError(async (err) => console.log("error catched" + err))
      ).subscribe((data: any) => {
  
        if(data.message == "success") {
          this.socketService.currentRoom = element.textContent;
        }

      });

    }
  }

  create() {
    let link = this.BASE_URL+"room/createRoom";

    let link2 = this.BASE_URL+"room/getAllRooms";

    this.http.post<any>(link, { roomName: this.room, creator: this.socketService.email }).subscribe((data: any) => {
      if (data.message == "success") {
        console.log(data);
        console.log("created!");
        console.log(this.room);
        console.log(this.socketService.email);
        
        this.list = [];

        
        this.http.get<any>(link2).subscribe((data: any) => {
          let length = Object.keys(data).length;
    
          console.log(data);
          console.log("new room");
          for(var i = 1; i <= length; i++) { 
            this.list.push(data[i].roomName);
            console.log(data[i].roomName , "ICIIIIIIII");
            this.buttonsTexts = [...this.buttonsTexts, `${data[i].roomName}`];
          }
        });
      }
    });


  }

  cancel() {
    this.router.navigate(['/', 'sidenav']);
  }

}
