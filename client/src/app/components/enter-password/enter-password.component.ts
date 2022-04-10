import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SocketService } from '@app/services/socket/socket.service';
import { catchError } from 'rxjs/operators';
import { NewDrawingComponent } from '../new-drawing/new-drawing.component';
import { URL } from '../../../../constants';
import { Router } from '@angular/router';


@Component({
  selector: 'app-enter-password',
  templateUrl: './enter-password.component.html',
  styleUrls: ['./enter-password.component.scss']
})
export class EnterPasswordComponent implements OnInit {

  private readonly BASE_URL: string = URL;

  constructor(
    public dialogRef: MatDialogRef<EnterPasswordComponent>,
    private socketService: SocketService,
    private http: HttpClient,
    public dialog: MatDialog,
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  password2: string;

  enterPassword() {

    let link = this.BASE_URL + "drawing/joinDrawing";

    this.http.post<any>(link, {useremail: this.socketService.email, drawingName: this.socketService.clickedDrawing, password: this.password2.trim()}).subscribe((data:any) => {
      if(data.message == "success") {
        //console.log("CA MARCHE OPEN");
        //console.log("join dessins:" + element.textContent.trim().slice(7));
        this.dialog.open(NewDrawingComponent);
        this.router.navigate(['/', 'sidenav']);
        //console.log("CREATED CANVAS");

      let link2 = this.BASE_URL + "room/joinRoom";

        const userObj={
          useremail:this.socketService.email,
          nickname:this.socketService.nickname,
        }
    
        this.http.post<any>(link2,{ newRoomName:this.socketService.currentRoom, user:userObj}).pipe(
          catchError(async (err) => console.log("error catched" + err))
        ).subscribe((data: any) => {
      
          if(data.message == "success") {
            this.socketService.currentRoom = this.socketService.clickedDrawing;
            //console.log("current room;" + this.socketService.currentRoom);
          }
        });
      }
    });
    this.dialogRef.close();
  }

  cancelPass() {
    this.dialogRef.close();
  }

}
