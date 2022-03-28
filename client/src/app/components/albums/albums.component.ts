import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';
import { Subscription } from 'rxjs';
// import { NewDrawingComponent } from '../new-drawing/new-drawing.component';
import { WelcomeDialogComponent } from '../welcome-dialog/welcome-dialog/welcome-dialog.component';
import { SocketService } from '@app/services/socket/socket.service';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { PencilToolService } from '@app/services/tools/pencil-tool/pencil-tool.service';
import { ToolRectangleService } from '@app/services/tools/tool-rectangle/tool-rectangle.service';
import { ToolEllipseService } from '@app/services/tools/tool-ellipse/tool-ellipse.service';
import { URL } from '../../../../constants';
import { Router } from '@angular/router';
import { SelectionToolService } from '@app/services/tools/selection-tool/selection-tool.service';


@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.scss']
})

export class AlbumsComponent implements OnInit {

  private readonly BASE_URL: string = URL;
  public AlbumsPublic:Array<string> = [];
  public AlbumsPrivate:Array<string> = [];
  public compteur:number = 0;


  welcomeDialogRef: MatDialogRef<WelcomeDialogComponent>;
  welcomeDialogSub: Subscription;

  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    private router: Router,
    private socketService: SocketService,
    private hotkeyService: HotkeysService,
    private pencilService:PencilToolService,
    private rectangleService:ToolRectangleService,
    private ellipseService:ToolEllipseService,
    private selectionService: SelectionToolService,
  ) { this.hotkeyService.hotkeysListener();}

  ngOnInit(): void {
    this.pencilService.setUpPencil();
    this.rectangleService.setUpRectangle();
    this.ellipseService.setUpEllipse();
    this.selectionService.setUpSelection();
  }

//   newDrawing() {
//     this.dialog.open(NewDrawingComponent);
// }

  defaultRoom() {
    this.socketService.joinRoom('DEFAULT');
    this.socketService.currentRoom = 'DEFAULT';
    let link2 = this.BASE_URL + "room/joinRoom";

    const userObj={
      useremail:this.socketService.email,
      nickname:this.socketService.nickname,
    }

    this.http.post<any>(link2,{ newRoomName:this.socketService.currentRoom, user:userObj}).pipe(
      catchError(async (err) => console.log("error catched" + err))
    ).subscribe((data: any) => {
  
      if(data.message == "success") {
        this.socketService.currentRoom = 'DEFAULT';
        console.log("REGARDE MOI BIG:" + this.socketService.currentRoom);
      }
    });
  }

newPublicAlbum() {
    this.AlbumsPublic = [...this.AlbumsPublic, `${this.compteur}`];
    this.compteur++;
}

newPrivateAlbum() {
  this.AlbumsPrivate = [...this.AlbumsPrivate, `${"hello"}`];
}

openAlbum() {
  this.router.navigate(['/', 'dessins']);
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
