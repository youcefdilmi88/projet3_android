import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';
import { SocketService } from '@app/services/socket/socket.service';
import { URL } from '../../../../constants';
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
  private readonly BASE_URL=URL;
  public list = new Array<string>(); 
  public numberOfRooms: number ;
  public buttonsTexts:Array<string> = [];
  //public buttonsTexts:Array<string> = ['DEFAULT'];

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
      for(var i = 0; i < length; i++) { 
        //this.list.push(data[i].roomName);
        // this.buttonsTexts = [...this.buttonsTexts, `${data[i].roomName}, (par ${data[i].creator})`];
        this.buttonsTexts = [...this.buttonsTexts, `${data[i].roomName}`];
      }
    });

    this.roomListener();
  }

  roomListener() {
    let link2 = this.BASE_URL+"room/getAllRooms";
    this.socketService.getSocket().on("ROOMDELETED",(data)=>{
      data=JSON.parse(data);
      console.log("ROOM DELETED"+data)
      this.buttonsTexts = [];
      this.http.get<any>(link2).subscribe((data: any) => {
        let length = Object.keys(data).length;
        this.numberOfRooms = length;
        for(var i = 0; i <= length; i++) { 
          //this.list.push(data[i].roomName);
          // this.buttonsTexts = [...this.buttonsTexts, `${data[i].roomName}, (par ${data[i].creator})`];
          this.buttonsTexts = [...this.buttonsTexts, `${data[i].roomName}`];
        }
      });
    });

    this.socketService.getSocket().on("CREATEROOM",(data)=>{
      data=JSON.parse(data);
      this.buttonsTexts = [];
      this.http.get<any>(link2).subscribe((data: any) => {
        let length = Object.keys(data).length;
        this.numberOfRooms = length;
        for(var i = 0; i <= length; i++) { 
          //this.list.push(data[i].roomName);
          // this.buttonsTexts = [...this.buttonsTexts, `${data[i].roomName}, (par ${data[i].creator})`];
          this.buttonsTexts = [...this.buttonsTexts, `${data[i].roomName}`];
        }
      });
      this.input.nativeElement.value = ' ';
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


  deleteRoom(element: any): void {
    this.socketService.roomDeleted(element.textContent.trim().slice(10));

    let link = this.BASE_URL + "room/deleteRoom";


      this.http.post<any>(link,{roomName: element.textContent.trim().slice(10) }).subscribe((data: any) => { 
        console.log(data);
        if (data == 404) {
          console.log("edwin" + data);
        }
        if (data.message == "success") {
          console.log("look at me " + data.message);
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

    /*
    this.socketService.getSocket().on("CREATEROOM",(data)=>{
       data=JSON.parse(data);
       this.http.get<any>(link2).subscribe((data: any) => {
        let length = Object.keys(data).length; 
        //this.list.push(data[length-1].roomName);
        // this.buttonsTexts = [...this.buttonsTexts, `${data[length-1].roomName}, (par ${data[length-1].creator})`];
        text = text.trim();
        this.buttonsTexts = [...this.buttonsTexts, text.trim()];
        console.log("REGARDE MOI" + text.trim());
        for(var i = 0; i < length; i++) { 
          console.log(data[i].roomName);
        }
      });
      this.input.nativeElement.value = ' ';
      
    });*/

    text.trim();
    if (text.trim() != '') {
      this.http.get<any>(link2).subscribe((data: any) => {
  
            document.getElementById("error")!.style.visibility= "hidden";
            this.http.post<any>(link, { roomName: this.room.trim(), creator: this.socketService.email }).subscribe((data: any) => {
              if (data.message == "success") {
                console.log(data.message);
              }
            },(error:HttpErrorResponse)=>{
              console.error(error);
              console.log(error.status);
              console.log(error.error.message);
              if( error.error.message == "404 (Not Found)" || data == 404 || error.error.message == "Http failure response for https://projet3-3990-207.herokuapp.com/room/createRoom: 404 Not Found" || error.error.message == "failed") {
                document.getElementById("error")!.style.visibility = "visible";
                document.getElementById("error")!.innerHTML = "La salle " + text.trim() + " existe déjà";
              }
            }
            );

      
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
