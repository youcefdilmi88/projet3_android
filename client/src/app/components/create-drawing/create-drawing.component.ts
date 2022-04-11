import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SocketService } from '@app/services/socket/socket.service';
import { catchError } from 'rxjs/operators';
import { URL } from '../../../../constants';
import { NewDrawingComponent } from '../new-drawing/new-drawing.component';


@Component({
  selector: 'app-create-drawing',
  templateUrl: './create-drawing.component.html',
  styleUrls: ['./create-drawing.component.scss']
})
export class CreateDrawingComponent implements OnInit {

  private readonly BASE_URL: string = URL;
  
  public visibi: string;
  public visibi2: string;

  constructor(
    public dialogRef: MatDialogRef<CreateDrawingComponent>,
    private socketService: SocketService,
    private http: HttpClient,
    private router: Router,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }

  chooseVisib(value: any) {
    console.log(value);
    this.visibi = value;
    this.visibi2 = value;
  }

  drawing: string;
  password: string;

  createDrawing(text: string) {
    let link = this.BASE_URL+"drawing/createDrawing";
    let link5 = this.BASE_URL + "drawing/joinDrawing";
    let link6 = this.BASE_URL + "album/addDrawing";

    console.log(this.drawing.trim());

    this.socketService.getSocket().on("CREATEROOM", (data)=> {
      data=JSON.parse(data);
      //console.log(data.message);
    });

    text.trim();
    if (text.trim() != '') {
      //console.log("cant create");
      if (this.visibi == "public") {
        this.http.post<any>(link,{drawingName: this.drawing.trim(), owner: this.socketService.email, visibility: "public"}).subscribe((data: any) => { 
          //console.log(data);
          if (data.message == "success") {
            //console.log("CREATE DRAWING: " + data.message);
            this.http.post<any>(link5, {useremail: this.socketService.email, drawingName: this.drawing.trim()}).subscribe((data:any) => {
              if(data.message == "success") {
                this.router.navigate(['/', 'sidenav']);
                this.dialog.open(NewDrawingComponent);
              }
            });
  
            this.http.post<any>(link6, {drawingName: this.drawing.trim(), useremail: this.socketService.email, albumName: "PUBLIC" }).subscribe((data:any) => {
              if (data.message == "success") {
                //console.log("dessin ajoute a album " + this.socketService.albumName);
              }
            });
  
            //------------ Pour join le nouveau room avec le dessin ---------
            this.socketService.joinRoom(this.drawing.trim());
            this.socketService.currentRoom = this.drawing.trim();
            let link2 = this.BASE_URL + "room/joinRoom";
  
            const userObj={
              useremail:this.socketService.email,
              nickname:this.socketService.nickname,
            }
        
            this.http.post<any>(link2,{ newRoomName:this.socketService.currentRoom, user:userObj}).pipe(
              catchError(async (err) => console.log("error catched" + err))
            ).subscribe((data: any) => {
          
              if(data.message == "success") {
                this.socketService.currentRoom = this.drawing.trim();
                //console.log("REGARDE MOI BIG:" + this.socketService.currentRoom);
              }
            });
            //------------------------------------------------------------
          }
        });
      }
      else if (this.visibi == "protected") {
        this.http.post<any>(link,{drawingName: this.drawing.trim(), owner: this.socketService.email, visibility: "protected", password: this.password.trim()}).subscribe((data: any) => { 
          //console.log(data);
          if (data.message == "success") {
            //console.log("CREATE DRAWING: " + data.message);
            this.http.post<any>(link5, { useremail: this.socketService.email, drawingName: this.drawing.trim(), password: this.password.trim()}).subscribe((data:any) => {
              if(data.message == "success") {
                this.router.navigate(['/', 'sidenav']);
                this.dialog.open(NewDrawingComponent);
              }
            });
  
            this.http.post<any>(link6, {drawingName: this.drawing.trim(), useremail: this.socketService.email, albumName: "PUBLIC" }).subscribe((data:any) => {
              if (data.message == "success") {
                //console.log("dessin ajoute a album " + this.socketService.albumName);
              }
            });
  
            //------------ Pour join le nouveau room avec le dessin ---------
            this.socketService.joinRoom(this.drawing.trim());
            this.socketService.currentRoom = this.drawing.trim();
            let link2 = this.BASE_URL + "room/joinRoom";
            
            console.log("HHHH", this.socketService.currentRoom);

            const userObj={
              useremail:this.socketService.email,
              nickname:this.socketService.nickname,
            }
        
            this.http.post<any>(link2,{ newRoomName:this.socketService.currentRoom, user:userObj}).pipe(
              catchError(async (err) => console.log("error catched" + err))
            ).subscribe((data: any) => {
          
              if(data.message == "success") {
                this.socketService.currentRoom = this.drawing.trim();
                //console.log("REGARDE MOI BIG:" + this.socketService.currentRoom);
              }
            });
            //------------------------------------------------------------
          }
        });
      }
      else if (this.visibi == "private") {
        this.http.post<any>(link,{drawingName: this.drawing.trim(), owner: this.socketService.email, visibility: "private"}).subscribe((data: any) => { 
          //console.log(data);
          if (data.message == "success") {
            //console.log("CREATE DRAWING: " + data.message);
            this.http.post<any>(link5, {useremail: this.socketService.email, drawingName: this.drawing.trim()}).subscribe((data:any) => {
              if(data.message == "success") {
                this.router.navigate(['/', 'sidenav']);
                this.dialog.open(NewDrawingComponent);
              }
            });
  
            this.http.post<any>(link6, {drawingName: this.drawing.trim(), useremail: this.socketService.email, albumName: this.socketService.albumName }).subscribe((data:any) => {
              if (data.message == "success") {
                //console.log("dessin ajoute a album " + this.socketService.albumName);
              }
            });
  
            //------------ Pour join le nouveau room avec le dessin ---------
            this.socketService.joinRoom(this.drawing.trim());
            this.socketService.currentRoom = this.drawing.trim();
            let link2 = this.BASE_URL + "room/joinRoom";
  
            const userObj={
              useremail:this.socketService.email,
              nickname:this.socketService.nickname,
            }
        
            this.http.post<any>(link2,{ newRoomName:this.socketService.currentRoom, user:userObj}).pipe(
              catchError(async (err) => console.log("error catched" + err))
            ).subscribe((data: any) => {
          
              if(data.message == "success") {
                this.socketService.currentRoom = this.drawing.trim();
                //console.log("REGARDE MOI BIG:" + this.socketService.currentRoom);
              }
            });
            //------------------------------------------------------------
          }
        });
      }

    }
    this.dialogRef.close();
  }




  cancelCreate() {
    this.dialogRef.close();
  }

}
