import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
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
  @ViewChild('roomname') input: any;
  @ViewChild('roomfilter') search: any;
  welcomeDialogRef: MatDialogRef<WelcomeDialogComponent>;
  welcomeDialogSub: Subscription;
  private readonly BASE_URL: string ="http://localhost:8080/";
  //"https://projet3-3990-207.herokuapp.com/";

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
      for(var i = 1; i <= length; i++) { 
        //this.list.push(data[i].roomName);
        // this.buttonsTexts = [...this.buttonsTexts, `${data[i].roomName}, (par ${data[i].creator})`];
        this.buttonsTexts = [...this.buttonsTexts, `${data[i].roomName}`];
      }
      
    });
  }

  room: string;

  changeRoom(element: any): void {
    this.socketService.joinRoom(element.textContent.trim().slice(8));
    this.socketService.currentRoom = element.textContent.trim().slice(8);
    console.log("LOOOK ATTT MEEEE" + element.textContent.trim().slice(8));
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

  find(text: string) {
    let link = this.BASE_URL+"room/getAllRooms";
    this.http.get<any>(link).subscribe((data: any) => {
      let length = Object.keys(data).length;
      this.numberOfRooms = length;
      console.log(text);
      this.buttonsTexts = [];
      for(var i = 1; i <= length; i++) { 
        console.log(data[i].roomName);
        if (data[i].roomName == text.trim() || data[i].creator == text.trim()) {
          console.log("GOT IN!");
          // this.buttonsTexts = [...this.buttonsTexts, `${data[i].roomName}, (par ${data[i].creator})`];
          this.buttonsTexts = [...this.buttonsTexts, `${data[i].roomName}`];
        }
      }
    });
  }

  create(text: string) {
    let link = this.BASE_URL+"room/createRoom";
    let link2 = this.BASE_URL+"room/getAllRooms";

    text.trim();
    if (text.trim() != '') {
      document.getElementById("error")!.style.visibility= "hidden";
      this.http.post<any>(link, { roomName: this.room, creator: this.socketService.email }).subscribe((data: any) => {
        if (data.message == "success") {
          this.http.get<any>(link2).subscribe((data: any) => {
            let length = Object.keys(data).length; 
            //this.list.push(data[length-1].roomName);
            // this.buttonsTexts = [...this.buttonsTexts, `${data[length-1].roomName}, (par ${data[length-1].creator})`];
            this.buttonsTexts = [...this.buttonsTexts, `${data[length-1].roomName}`];
          });
          this.input.nativeElement.value = ' ';
        }
      });
    }

    if (text.trim().length == 0) {
      this.input.nativeElement.value = ' ';
    }
    if (text.trim() == "" || text.trim() == null) {
      document.getElementById("error")!.style.visibility= "visible";
      document.getElementById("error")!.innerHTML = "Vous ne pouvez pas mettre des champs vides";
    }
    this.input.nativeElement.focus();
  }

  cancel() {
    this.router.navigate(['/', 'sidenav']);
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
